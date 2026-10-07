/* v2.32.0 browser half: the Driver Board banner and the Dashboard line for a truck Motive saw
   driving with nobody on the board. Motive is stubbed in the page. */
/**
 * Every list that names a truck says what it is: "Box · Hino 338", "Tractor ·
 * Freightliner Cascadia" (v2.31.2).
 *
 * The owner's screenshot: the Dashboard's Available Trucks read "Hino · Auto · Single"
 * for a box truck and "Tractor · Man · Single" for a tractor — a box truck's make and a
 * tractor's type in the same slot. A box truck never said it was one, and since the
 * tractors are now recorded as Freightliners, "Freightliner" could mean either. The On
 * the Road table's TYPE column showed "FRTLN", the raw stored code.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { buildApp, patchHtml, serveAsset } from "./appbuild.mjs";
import http from "http";

const PORT = 8611;
const TRUCKS = [
  { id: "0805", mk: "Hino", md: "338", type: "straight", tr: "A", ax: "Single" },
  { id: "4114", mk: "FRTLN", md: "M2", type: "straight", tr: "A", ax: "Single" },      // the old stored code
  { id: "0186", mk: "Freightliner", md: "Cascadia", type: "tractor", tr: "M", ax: "Single" },
  { id: "8829", mk: "Tractor", md: "", type: "tractor", tr: "A", ax: "Tandem" },         // "Tractor" is a placeholder, not a make
];
const WANT = {
  "0805": "Box · Hino 338", "4114": "Box · Freightliner M2",
  "0186": "Tractor · Freightliner Cascadia", "8829": "Tractor",
};

const STUB = `<script>
(function(){
  const d=new Date();const dy=d.getDay();d.setDate(d.getDate()-dy+(dy===0?-6:1));
  const wk=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const day=["Mon","Tue","Wed","Thu","Fri"][dy===0||dy===6?0:dy-1];
  window.__KV={
    "fl-trucks":${JSON.stringify(JSON.stringify(TRUCKS))},
    "fl-drivers":${JSON.stringify(JSON.stringify([{ name: "Alvarez, R", role: "Davis Straight Driver", category: "Davis" }]))},
    "fl-repairs":"[]","fl-review-queue":"[]",
  };
  // 0805's driver is on the board EVERY day: Motive reports it driving each day of the
  // week so far, so assigning it for today alone made Mon and Tue look driverless on a
  // Wednesday — this check only passed when run on a Monday.
  window.__KV["fl-asgn-"+wk]=JSON.stringify(Object.fromEntries(["Mon","Tue","Wed","Thu","Fri"].map(x=>["Alvarez, R-"+x,"0805"])));
  window.__KV["fl-stat-"+wk]="{}";
  window.__DAY=day;
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
window.__MOTIVE_CALLS=0;
const __f=window.fetch;window.fetch=async(u,o)=>{ if(String(u).includes("/api/motive?action=days")){ window.__MOTIVE_CALLS++;
  const dates=new URL(String(u),location.href).searchParams.get("dates").split(",");
  return new Response(JSON.stringify({mode:"inclusive",days:dates.map(date=>({date,vehicles:[
    {vehicleId:1,number:"4114",miles:84,quality:"ok"},{vehicleId:2,number:"0805",miles:120,quality:"ok"}]}))}),{status:200}); }
  return __f(u,o); };
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
const until = async (fn, ms = 5000) => {
  const end = Date.now() + ms;
  for (;;) { const v = await fn(); if (v || Date.now() > end) return v; await sleep(50); }
};

const browser = await launch();
const page = await browser.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
page.on("dialog", (d) => d.accept());
await page.setViewport({ width: 1400, height: 1000 });

await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => /Driver Board/.test(window.__text()), { timeout: 60000 }).catch(() => {});
console.log("\n═ Dashboard ═");
const dash = await until(() => page.evaluate(() => document.querySelector('[data-testid="moved-no-driver-dash"]')?.textContent || null));
pass("Needs Attention names the truck that drove with nobody on it", !!dash && /#4114/.test(dash), JSON.stringify(dash));
pass("and not the one whose driver is on the board", !!dash && !/#0805/.test(dash));
console.log("\n═ Driver Board ═");
await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Driver Board").click());
const banner = await until(() => page.evaluate(() => document.querySelector('[data-testid="moved-no-driver"]')?.innerText || null));
pass("the banner lists it with Box/Tractor and its miles per day", !!banner && /#4114/.test(banner) && /Box · Freightliner M2/.test(banner) && /84 mi/.test(banner), JSON.stringify(banner));
pass("the banner leaves out the assigned truck", !!banner && !/#0805/.test(banner));
pass("Motive asked once for the week, not per tab switch", (await page.evaluate(() => window.__MOTIVE_CALLS)) === 1, String(await page.evaluate(() => window.__MOTIVE_CALLS)));
pass("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
await browser.close(); server.close();
process.exit(failed ? 1 : 0);
