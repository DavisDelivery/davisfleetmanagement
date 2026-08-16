/**
 * Boots the REAL index.html + App.jsx in Chromium and checks the three things the
 * page-load work could have broken:
 *
 *   1. the app still mounts with data-presets="react" (App.jsx is a classic script
 *      that depends on the `const {useState,...} = React` prelude in a sibling
 *      babel block — that sharing has to survive dropping the `env` preset),
 *   2. the ErrorBoundary contains a throw instead of leaving the spinner up,
 *   3. storage.list() returns the same keys as the old full-scan filter, and stops
 *      reading the whole collection to do it.
 *
 * Firestore is stubbed with real documentId() range semantics so the query is
 * actually exercised rather than mocked away. React/Babel are served from
 * .uitest/vendor (fetched on first run) rather than unpkg — the script tags keep
 * their type and data-presets, only the origin changes.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
const PORT = 8407;

// Every key shape the app actually uses, plus decoys that must NOT match a prefix.
const KV = {
  "fl-trucks": JSON.stringify([{ id: "0424", mk: "FRTLN", type: "straight" }]),
  "fl-drivers": JSON.stringify(["Alvarez, R"]),
  "fl-repairs": "[]",
  "fl-costs": "[]",
  "fl-costs-2026-07": JSON.stringify([{ id: "c1", truckId: "0424", total: 120.5, date: "2026-07-02" }]),
  "fl-costs-2026-08": JSON.stringify([{ id: "c2", truckId: "0451", total: 80, date: "2026-08-02" }]),
  "fl-costs-2026-08_2": JSON.stringify([{ id: "c3", truckId: "0805", total: 12, date: "2026-08-03" }]),
  "fl-costume-decoy": JSON.stringify([{ id: "nope" }]),   // shares "fl-cost" but not "fl-costs"
  "fl-asgn-2026-08-10": "{}",
  "fl-review-queue": "[]",
  "zz-unrelated": "{}",
};

let html = readFileSync(path.join(REPO, "index.html"), "utf8");
html = html.replace(/<script src="https:\/\/www\.gstatic\.com\/firebasejs[^>]*><\/script>/g, "");
// Serve React/Babel from .uitest/vendor instead of unpkg: the sandbox reaches the
// network only through an HTTPS proxy the browser does not use, and a test that
// depends on a CDN is a test that fails for reasons that have nothing to do with the
// app. The script tags keep their type/data-presets — only the origin changes.
html = html
  .replace(/https:\/\/unpkg\.com\/react@18\/umd\/react\.production\.min\.js/g, "/vendor/react.js")
  .replace(/https:\/\/unpkg\.com\/react-dom@18\/umd\/react-dom\.production\.min\.js/g, "/vendor/react-dom.js")
  .replace(/https:\/\/unpkg\.com\/@babel\/standalone@7\.24\.0\/babel\.min\.js/g, "/vendor/babel.js");

const STUB = `<script>
window.__KV = ${JSON.stringify(KV)};
window.__FULL_SCANS = 0;   // how many times the whole collection was read
window.__RANGE_READS = 0;  // how many docs a range query actually touched

function makeQuery(lo, hi) {
  return {
    where(field, op, val) {
      if (op === ">=") return makeQuery(val, hi);
      if (op === "<")  return makeQuery(lo, val);
      return makeQuery(lo, hi);
    },
    async get() {
      const ids = Object.keys(window.__KV).filter(id => (lo === null || id >= lo) && (hi === null || id < hi));
      if (lo === null && hi === null) window.__FULL_SCANS++;
      else window.__RANGE_READS += ids.length;
      return { forEach(cb) { ids.forEach(id => cb({ id, data: () => ({ v: window.__KV[id] }) })); } };
    }
  };
}
const mkDoc = (id) => ({
  async get() { const v = window.__KV[id]; return { exists: v !== undefined, data: () => ({ v }) }; },
  async set(o) { window.__KV[id] = o.v; return true; },
  async delete() { delete window.__KV[id]; },
  onSnapshot(cb) { setTimeout(() => cb({ forEach() {} }), 0); return () => {}; }
});
window.__DB = { collection() { const q = makeQuery(null, null); return { doc: mkDoc, where: q.where, get: q.get }; } };
window.firebase = { initializeApp() {}, firestore() { return window.__DB; } };
window.firebase.firestore.FieldPath = { documentId: () => "__name__" };
localStorage.setItem("fl-device-user", "Harness");
window.__t0 = performance.now();
</script>`;
html = html.replace("</head>", STUB + "</head>");

await ensureVendor();

const appSrc = readFileSync(path.join(REPO, "App.jsx"), "utf8");
const server = http.createServer((req, res) => {
  if (req.url.startsWith("/App.jsx")) {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    return res.end(appSrc);
  }
  if (req.url.startsWith("/vendor/")) {
    const f = path.join(here, "vendor", path.basename(req.url));
    res.writeHead(200, { "Content-Type": "application/javascript" });
    return res.end(readFileSync(f));
  }
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
}).listen(PORT);

const browser = await launch();
const page = await browser.newPage();
const errs = [];
page.on("pageerror", e => errs.push(e.message));
page.on("console", m => {
  const t = m.text();
  // The "[BABEL] Note: ... deoptimised the styling" line is emitted at error level but
  // is only a pretty-printing notice about a >500KB file. It is not a failure.
  if (m.type() === "error" && !/Failed to load resource|net::ERR|\[BABEL\] Note:/.test(t)) errs.push(t);
});

const started = Date.now();
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
await page.waitForFunction(
  () => { const r = document.getElementById("root"); return r && !r.querySelector("#loading"); },
  { timeout: 45000 }
).catch(() => {});
const bootMs = Date.now() - started;

const r = await page.evaluate(async () => {
  const root = document.getElementById("root");
  const list = await window.storage.list("fl-costs");
  const listAsgn = await window.storage.list("fl-asgn-");
  // Snapshot the counter BEFORE the empty-prefix call, which is *supposed* to scan.
  const scansAfterPrefixed = window.__FULL_SCANS;
  const listAll = await window.storage.list("");
  return {
    scansAfterPrefixed,
    mounted: !!root && !root.querySelector("#loading") && root.textContent.trim().length > 0,
    text: (root ? root.textContent : "").slice(0, 90).replace(/\s+/g, " "),
    costKeys: list.keys.sort(),
    costHasValues: !!(list.values && list.values["fl-costs-2026-07"]),
    asgnKeys: listAsgn.keys,
    allKeys: listAll.keys.length,
    fullScans: window.__FULL_SCANS,
    rangeReads: window.__RANGE_READS,
  };
});

const EXPECT_COSTS = ["fl-costs", "fl-costs-2026-07", "fl-costs-2026-08", "fl-costs-2026-08_2"];
let failed = 0;
const pass = (label, ok, extra = "") => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? "  — " + extra : ""}`);
};

console.log(`\nboot: ${bootMs} ms, page errors: ${errs.length ? errs.slice(0, 3).join(" | ") : "none"}\n`);
pass("app mounts (data-presets=react did not break the React prelude)", r.mounted, r.text);
pass("no page errors", errs.length === 0);
pass("list('fl-costs') returns exactly the cost shards",
  JSON.stringify(r.costKeys) === JSON.stringify(EXPECT_COSTS), r.costKeys.join(","));
pass("decoy key sharing a shorter prefix is excluded", !r.costKeys.includes("fl-costume-decoy"));
pass("list returns values so callers skip a second read", r.costHasValues);
pass("prefixed list never scans the whole collection", r.scansAfterPrefixed === 0,
  `full scans during prefixed lists=${r.scansAfterPrefixed}, docs actually read=${r.rangeReads}`);
pass("empty prefix still returns everything (admin dump)", r.allKeys === Object.keys(KV).length, `${r.allKeys} keys`);

// ErrorBoundary: force a throw during render and confirm containment.
const boundary = await page.evaluate(() => {
  const host = document.createElement("div");
  document.body.appendChild(host);
  const Boom = () => { throw new Error("boom from harness"); };
  try {
    const root = ReactDOM.createRoot(host);
    root.render(React.createElement(ErrorBoundary, null, React.createElement(Boom)));
  } catch (e) { return { crashed: true }; }
  return new Promise(res => setTimeout(() => res({
    crashed: false,
    shows: /hit an error and stopped/i.test(host.textContent),
    hasReload: !!host.querySelector("button"),
  }), 300));
});
pass("ErrorBoundary catches a render throw and offers Reload",
  !boundary.crashed && boundary.shows && boundary.hasReload, JSON.stringify(boundary));

await browser.close();
server.close();
console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
process.exit(failed ? 1 : 0);
