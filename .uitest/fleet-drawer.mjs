/**
 * Fleet List: Make / Model / Year behind a drawer (v2.34.0).
 *
 * The owner, on a phone: put year, make and model behind a drawer, so that closing it
 * pulls the Status and day columns up beside the truck number, and the phone shows at
 * a glance whether a truck is actually available.
 *
 * Checked in the real app:
 *   - on a phone-width screen the drawer starts closed: no Make / Model / Year columns,
 *     and Status sits right beside Truck #, on screen without scrolling;
 *   - every row has exactly as many cells as the header (nothing shifts under the
 *     wrong heading), and the Box Trucks and Tractors tables still line up;
 *   - the button opens it, the columns come back with their dropdowns, and the
 *     choice is remembered after a reload;
 *   - on a wide screen with no saved choice it starts open.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { buildApp, patchHtml, serveAsset } from "./appbuild.mjs";
import http from "http";

const PORT = 8641;
const TRUCKS = [
  { id: "0805", mk: "Hino", md: "338", type: "straight", tr: "A", ax: "Single", year: 2018 },
  { id: "4114", mk: "Freightliner", md: "M2", type: "straight", tr: "A", ax: "Single", year: 2016 },
  { id: "0186", mk: "Freightliner", md: "Cascadia", type: "tractor", tr: "M", ax: "Single", year: 2012 },
  { id: "0877", mk: "Tractor", md: "Volvo", type: "tractor", tr: "A", ax: "Tandem", year: 1999 },
];
const STUB = `<script>
(function(){
  const d=new Date();const dy=d.getDay();d.setDate(d.getDate()-dy+(dy===0?-6:1));
  const wk=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  window.__KV={
    "fl-trucks":${JSON.stringify(JSON.stringify(TRUCKS))},
    "fl-drivers":${JSON.stringify(JSON.stringify([{ name: "Aaron Mitchell", role: "Davis Straight Driver", category: "Davis" }]))},
    "fl-repairs":"[]","fl-review-queue":"[]",
  };
  window.__KV["fl-asgn-"+wk]=JSON.stringify({"Aaron Mitchell-Mon":"0805"});
  window.__KV["fl-stat-"+wk]="{}";
})();
const mk=(id)=>({
  async get(){ const v=window.__KV[id]; if(v===undefined) throw new Error("not found"); return {exists:true,data:()=>({v})}; },
  async set(o){ window.__KV[id]=o.v; return true; },
  async delete(){ delete window.__KV[id]; },
  onSnapshot(cb){ setTimeout(()=>cb({forEach(){}}),0); return ()=>{}; }
});
function mq(lo,hi){ return { where(f,op,v){ return op===">="?mq(v,hi):op==="<"?mq(lo,v):mq(lo,hi); },
  async get(){ const ids=Object.keys(window.__KV).filter(i=>(lo===null||i>=lo)&&(hi===null||i<hi));
    return { forEach(cb){ ids.forEach(i=>cb({id:i,data:()=>({v:window.__KV[i]})})); } }; } }; }
window.__DB={collection(){const q=mq(null,null);return {doc:mk,where:q.where,get:q.get};},
  settings(){}, async disableNetwork(){}, async enableNetwork(){}};
window.firebase={initializeApp(){},firestore(){return window.__DB;}};
window.firebase.firestore.FieldPath={documentId:()=>"__name__"};
window.__text=function(){const r=document.getElementById("root");if(!r)return "";
  const c=r.cloneNode(true);c.querySelectorAll("style").forEach(e=>e.remove());return c.textContent||"";};
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
const pass = (l, ok, x = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${l}${x ? "  — " + x : ""}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, ms = 6000) => {
  const end = Date.now() + ms;
  for (;;) { const v = await fn(); if (v || Date.now() > end) return v; await sleep(50); }
};

const browser = await launch();
const errs = [];
const open = async (page, width) => {
  page.on("pageerror", (e) => errs.push(e.message));
  await page.setViewport({ width, height: 900, isMobile: width < 600, hasTouch: width < 600 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => /Driver Board/.test(window.__text()), { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "Fleet List").click());
  await until(() => page.evaluate(() => !!document.querySelector('[data-testid="specs-drawer"]')));
};
// The two Fleet List tables: headers with their x-extent, and cells per row.
const read = (page) => page.evaluate(() => {
  const tables = [...document.querySelectorAll("table")].filter((t) => [...t.querySelectorAll("thead th")].some((th) => th.textContent.trim() === "Deleted"));
  return tables.map((t) => ({
    heads: [...t.querySelectorAll("thead th")].map((th) => { const r = th.getBoundingClientRect(); return [th.textContent.trim(), Math.round(r.left), Math.round(r.right)]; }),
    rowCells: [...t.querySelectorAll("tbody tr")].map((tr) => tr.children.length),
    selects: t.querySelectorAll("tbody select:not([aria-label^='Driver for'])").length,
  }));
});
const names = (tb) => tb.heads.map((h) => h[0]);
const aligned = (tbs) => tbs.length === 2 && tbs[0].heads.every((h, i) => { const o = tbs[1].heads[i]; return o && o[0] === h[0] && Math.abs(o[1] - h[1]) <= 1; });

console.log("\n═ on a phone the drawer starts closed ═");
const phone = await browser.newPage();
await open(phone, 390);
let tb = await read(phone);
pass("two tables", tb.length === 2);
pass("no Make, Model or Year columns", tb.every((t) => !["Make", "Model", "Year"].some((h) => names(t).includes(h))), JSON.stringify(names(tb[0])));
const status = tb[0].heads.find((h) => h[0] === "Status");
pass("Status is on screen beside the truck number, no scrolling", !!status && status[2] <= 390, JSON.stringify(status));
pass("every row has as many cells as the header", tb.every((t) => t.rowCells.every((n) => n === t.heads.length)), JSON.stringify(tb.map((t) => [t.heads.length, t.rowCells])));
pass("box trucks and tractors still line up", aligned(tb));
pass("the button says what it opens", (await phone.evaluate(() => document.querySelector('[data-testid="specs-drawer"]').textContent)).includes("Make · Model · Year"));

console.log("\n═ opening it brings the columns back ═");
await phone.evaluate(() => document.querySelector('[data-testid="specs-drawer"]').click());
tb = await until(async () => { const x = await read(phone); return x.length && names(x[0]).includes("Make") ? x : null; });
pass("Make, Model and Year are back, in their place", !!tb && JSON.stringify(names(tb[0]).slice(0, 4)) === JSON.stringify(["Truck #", "Make", "Model", "Year"]), tb && JSON.stringify(names(tb[0])));
pass("with their Make dropdowns", !!tb && tb.every((t) => t.selects >= t.rowCells.length), tb && JSON.stringify(tb.map((t) => t.selects)));
pass("rows still match the header", !!tb && tb.every((t) => t.rowCells.every((n) => n === t.heads.length)));
pass("and the tables still line up", !!tb && aligned(tb));
pass("aria-expanded follows it", await phone.evaluate(() => document.querySelector('[data-testid="specs-drawer"]').getAttribute("aria-expanded")) === "true");

console.log("\n═ the choice is remembered ═");
await phone.reload({ waitUntil: "domcontentloaded" });
await phone.waitForFunction(() => /Driver Board/.test(window.__text()), { timeout: 60000 }).catch(() => {});
await phone.evaluate(() => [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "Fleet List").click());
tb = await until(async () => { const x = await read(phone); return x.length ? x : null; });
pass("still open after a reload", !!tb && names(tb[0]).includes("Make"));
await phone.evaluate(() => document.querySelector('[data-testid="specs-drawer"]').click());
await phone.reload({ waitUntil: "domcontentloaded" });
await phone.waitForFunction(() => /Driver Board/.test(window.__text()), { timeout: 60000 }).catch(() => {});
await phone.evaluate(() => [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "Fleet List").click());
tb = await until(async () => { const x = await read(phone); return x.length ? x : null; });
pass("and closed again after closing it", !!tb && !names(tb[0]).includes("Make"));
if (process.env.SHOT_DIR) await phone.screenshot({ path: `${process.env.SHOT_DIR}/fleet-drawer-phone.png`, fullPage: false });

console.log("\n═ on a wide screen it starts open ═");
const ctx = await browser.createBrowserContext();
const wide = await ctx.newPage();
await open(wide, 1400);
tb = await read(wide);
pass("Make, Model and Year are shown", tb.length === 2 && names(tb[0]).includes("Make") && names(tb[0]).includes("Year"), tb[0] && JSON.stringify(names(tb[0])));

pass("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
await browser.close(); server.close();
process.exit(failed ? 1 : 0);
