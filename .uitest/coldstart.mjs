/**
 * Cold start is the thing the yard actually feels: a phone, an empty cache, and a
 * signal that is often one bar. The app used to ship @babel/standalone — 604 KB
 * gzipped, 2.87 MB unpacked, larger than everything else on the page combined — and
 * then run that compiler over 609 KB of source ON THE DEVICE before the first pixel.
 *
 * Measured here at 4x CPU throttle with the cache disabled:
 *
 *     in-browser Babel   12,410 ms
 *     pre-built bundle      683 ms      18.2x
 *
 * This guards the property rather than the number, because the number depends on the
 * machine: no compiler in the page, no JSX left for the browser to parse, and a cold
 * start that completes well inside a budget a phone can actually meet.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { buildApp, patchHtml, serveAsset } from "./appbuild.mjs";
import { readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
const PORT = 8472;
const CPU = Number(process.env.CPU || 4);
const BUDGET_MS = Number(process.env.BUDGET || 6000);

const KV = { "fl-trucks": JSON.stringify([{ id: "0424", mk: "FRTLN", type: "straight", tr: "A", ax: "Single" }]),
  "fl-drivers": "[]", "fl-repairs": "[]", "fl-costs": "[]", "fl-review-queue": "[]" };

const STUB = `<script>
window.__KV = ${JSON.stringify(KV)};
const mk = (id) => ({ async get(){const v=window.__KV[id];if(v===undefined)throw new Error("not found");return {exists:true,data:()=>({v})};},
  async set(o){window.__KV[id]=o.v;return true;}, async delete(){}, onSnapshot(cb){setTimeout(()=>cb({forEach(){}}),0);return()=>{};} });
window.__DB={collection(){return{doc:mk};}};
window.__DB.settings=function(o){window.__SETTINGS=o;};
window.firebase={initializeApp(){},firestore(){return window.__DB;}};
window.firebase.firestore.FieldPath={documentId:()=>"__name__"};
window.storage={async get(k){const d=await mk(k).get();return {key:k,value:d.data().v};},
 async set(k,v){window.__KV[k]=v;return{key:k,value:v};},async delete(){},
 async list(p){const keys=[],values={};Object.keys(window.__KV).forEach(k=>{if(!p||k.startsWith(p)){keys.push(k);values[k]=window.__KV[k];}});return{keys,values};}};
localStorage.setItem("fl-device-user","Harness");
</script>`;

await ensureVendor();
const built = await buildApp();
const html = patchHtml(STUB);
const server = http.createServer((req, res) => {
  if (serveAsset(req, res, built)) return;
  res.writeHead(200, { "Content-Type": "text/html" }); res.end(html);
}).listen(PORT);

let failed = 0;
const pass = (l, ok, extra = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${l}${extra ? "  — " + extra : ""}`); };

// The two properties that made cold start slow, asserted against the real index.html.
// Strip HTML comments first: the comment explaining WHY the compiler is gone names
// it, and matching prose would make this pass or fail on the wording of a comment.
const indexSrc = readFileSync(path.join(REPO, "index.html"), "utf8")
  .replace(/<!--[\s\S]*?-->/g, "");
pass("index.html pulls in no compiler", !/@babel\/standalone|babel\.min\.js/.test(indexSrc));
pass("no script is left for the browser to transpile", !/type="text\/babel"/.test(indexSrc));
pass("the built bundle is what gets loaded", /src="app\.build\.js"/.test(indexSrc));
pass("the JSX really was compiled ahead of time", /React\.createElement/.test(built.app));

const browser = await launch();
const page = await browser.newPage();
const errs = [];
page.on("pageerror", e => errs.push(e.message.slice(0, 160)));
const client = await page.createCDPSession();
await client.send("Emulation.setCPUThrottlingRate", { rate: CPU });
await client.send("Network.setCacheDisabled", { cacheDisabled: true });

const t0 = Date.now();
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => {
  const r = document.getElementById("root");
  return r && /Driver Board/.test(r.textContent || "");
}, { timeout: 90000 }).catch(() => {});
const ms = Date.now() - t0;

const up = await page.evaluate(() => /Driver Board/.test(document.getElementById("root").textContent || ""));
pass("the app reaches interactive", up);
pass("no page errors", errs.length === 0, errs.slice(0, 2).join(" | "));
pass(`cold start within ${BUDGET_MS} ms at ${CPU}x CPU throttle`, ms < BUDGET_MS, `${ms} ms`);
console.log(`\n  cold start: ${ms} ms  (${CPU}x throttle, cache disabled)\n`);

await browser.close(); server.close();
console.log(`${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
process.exit(failed ? 1 : 0);
