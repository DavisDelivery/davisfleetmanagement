/**
 * The New Maintenance view's Shop board: box trucks and tractors in separate tables
 * (v2.33.0).
 *
 * The owner: "I want this new view to separate the tractors and boxes in separate
 * tables." The board was one table with box trucks and tractors mixed in it. It is now
 * a Box Trucks table and a Tractors table. A ticket on a truck that is no longer on the
 * Fleet List has no type to go by, so it gets a third table rather than being dropped.
 * Checked in the real app:
 *   - every ticket lands in its own kind's table, and none goes missing;
 *   - the sort buttons order each table on its own;
 *   - the tables line up column for column, and nothing spills out of its column,
 *     because the owner has asked for that on stacked tables before (Fleet List v2.30.2);
 *   - on a narrow screen they scroll sideways rather than squeezing;
 *   - a row still opens the Truck Report;
 *   - Recently closed is split the same way.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { buildApp, patchHtml, serveAsset } from "./appbuild.mjs";
import http from "http";

const PORT = 8631;
const TRUCKS = [
  { id: "6892", mk: "Hino", md: "268", type: "straight", tr: "A", ax: "Single" },
  { id: "4960", mk: "International", md: "", type: "straight", tr: "A", ax: "Single" },
  { id: "0186", mk: "Freightliner", md: "Cascadia", type: "tractor", tr: "M", ax: "Single" },
  { id: "0877", mk: "Volvo", md: "", type: "tractor", tr: "A", ax: "Tandem" },
];
const ago = (d) => new Date(Date.now() - d * 86400000).toISOString();
const ticket = (id, truckId, daysIn, cost, extra = {}) => ({
  id, truckId, reason: "Mechanical Repair", notes: "", shop: "", dateIn: ago(daysIn), estReturn: null,
  cost, dateClosed: null, status: "open", notesLog: [{ text: `work on ${truckId}` }], ...extra,
});
const REPAIRS = [
  ticket(1, "6892", 47, 0),
  // Long text in ONE table only — the real board has it ("ROAD CALL - OFF LOAD ...").
  // Tables sized by their own contents would come out with different columns.
  ticket(2, "4960", 9, 1800, { shop: "Titanium American Trucking in Oakwood", notesLog: [{ text: "ROAD CALL - OFF LOAD. Engine seized per Greg H. Smoke from engine compartment and pounding noise per driver William Kidd." }] }),
  ticket(3, "0186", 8, 250),
  ticket(4, "0877", 42, 0, { notesLog: [{ text: "CLUTCH" }], shop: "Complete Fleet Services" }),
  ticket(5, "9999", 3, 0),   // a truck no longer on the Fleet List
  ticket(6, "0186", 60, 980, { status: "closed", dateClosed: ago(50) }),
];

const STUB = `<script>
window.__KV={
  "fl-trucks":${JSON.stringify(JSON.stringify(TRUCKS))},
  "fl-drivers":"[]","fl-repairs":${JSON.stringify(JSON.stringify(REPAIRS))},"fl-review-queue":"[]",
};
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
localStorage.setItem("fl-view-mode","new");
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
await page.setViewport({ width: 1400, height: 1000 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => /Driver Board/.test(window.__text()), { timeout: 60000 }).catch(() => {});
await page.evaluate(() => {
  window.__tab = (label) => [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim().replace(/\d+$/, "").trim() === label).click();
  window.__press = (label) => [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === label).click();
  // Each Shop board table: its heading and the truck number on each row, in order.
  window.__groups = () => [...document.querySelectorAll("[data-shop-group]")].map((g) => ({
    key: g.dataset.shopGroup,
    head: g.firstElementChild.textContent.trim(),
    trucks: [...g.querySelectorAll("tbody tr")].map((tr) => (tr.children[0].textContent.match(/#(\w+)/) || [])[1] || tr.textContent.trim()),
  }));
  window.__measure = () => {
    const tables = [...document.querySelectorAll("[data-shop-group] table")];
    return {
      cols: tables.map((t) => [...t.querySelectorAll("thead th")].map((th) => { const r = th.getBoundingClientRect(); return [th.textContent.trim(), Math.round(r.left), Math.round(r.right)]; })),
      spill: tables.flatMap((t) => [...t.querySelectorAll("tbody td")].filter((td) => td.scrollWidth > td.clientWidth + 1)
        .map((td) => td.textContent.trim().slice(0, 30))),
      scrolls: tables.map((t) => t.parentElement.scrollWidth > t.parentElement.clientWidth),
    };
  };
});
const lined = (cols) => cols.length < 2 ? ["fewer than two tables"] : cols.slice(1).flatMap((c) => c.map((x, i) => {
  const o = cols[0][i] || ["?", NaN, NaN];
  return x[0] !== o[0] || Math.abs(x[1] - o[1]) > 1 || Math.abs(x[2] - o[2]) > 1 ? `${x[0]} ${x[1]}-${x[2]} vs ${o[1]}-${o[2]}` : null;
}).filter(Boolean));

console.log("\n═ the Shop board is split by kind of truck ═");
{
  await page.evaluate(() => window.__tab("Maintenance"));
  const g = await until(() => page.evaluate(() => { const x = window.__groups(); return x.length ? x : null; }));
  const by = Object.fromEntries((g || []).map((x) => [x.key, x]));
  pass("a Box Trucks table, then a Tractors table", !!g && g[0].key === "straight" && g[1].key === "tractor"
    && /^📦 Box Trucks \(2\)$/.test(g[0].head) && /^🚛 Tractors \(2\)$/.test(g[1].head), JSON.stringify(g && g.map((x) => x.head)));
  pass("box trucks only in the box table", !!by.straight && JSON.stringify([...by.straight.trucks].sort()) === JSON.stringify(["4960", "6892"]), JSON.stringify(by.straight));
  pass("tractors only in the tractor table", !!by.tractor && JSON.stringify([...by.tractor.trucks].sort()) === JSON.stringify(["0186", "0877"]), JSON.stringify(by.tractor));
  pass("a truck not on the Fleet List gets its own table, not dropped", !!by.other && JSON.stringify(by.other.trucks) === JSON.stringify(["9999"])
    && /Not on the Fleet List \(1\)/.test(by.other.head), JSON.stringify(by.other));
  pass("every open ticket is shown exactly once", g && g.flatMap((x) => x.trucks).length === 5);
  pass("each table keeps the board's columns", await page.evaluate(() => [...document.querySelectorAll("[data-shop-group] table")]
    .every((t) => [...t.querySelectorAll("thead th")].map((th) => th.textContent.trim()).join("|") === "Truck|Reason|What's wrong|Shop|Days down|Cost")));
}

// Set SHOT_DIR to keep a picture of the board for a human to look at.
if (process.env.SHOT_DIR) await page.screenshot({ path: `${process.env.SHOT_DIR}/shop-board.png`, fullPage: true });

console.log("\n═ the sort buttons order each table ═");
{
  let g = await page.evaluate(() => window.__groups());
  pass("Longest first: 6892 (47 d) above 4960 (9 d)", JSON.stringify(g[0].trucks) === JSON.stringify(["6892", "4960"]), JSON.stringify(g[0].trucks));
  pass("and 0877 (42 d) above 0186 (8 d)", JSON.stringify(g[1].trucks) === JSON.stringify(["0877", "0186"]), JSON.stringify(g[1].trucks));
  await page.evaluate(() => window.__press("Most expensive"));
  g = await until(() => page.evaluate(() => { const x = window.__groups(); return x[0].trucks[0] === "4960" ? x : null; }));
  pass("Most expensive: 4960 ($1,800) to the top of the box table", !!g && JSON.stringify(g[0].trucks) === JSON.stringify(["4960", "6892"]), JSON.stringify(g && g[0].trucks));
  pass("and 0186 ($250) to the top of the tractor table", !!g && JSON.stringify(g[1].trucks) === JSON.stringify(["0186", "0877"]), JSON.stringify(g && g[1].trucks));
  await page.evaluate(() => window.__press("Longest first"));
}

console.log("\n═ the tables line up ═");
{
  await sleep(200);
  const wide = await page.evaluate(() => window.__measure());
  pass("at a desktop width, every column starts and ends at the same x in all three", lined(wide.cols).length === 0, lined(wide.cols).join(" ; "));
  pass("and nothing spills out of its column", wide.spill.length === 0, wide.spill.slice(0, 3).join(" ; "));
  await page.setViewport({ width: 700, height: 1000 });
  await sleep(300);
  const narrow = await page.evaluate(() => window.__measure());
  pass("on a narrow screen they still line up", lined(narrow.cols).length === 0, lined(narrow.cols).join(" ; "));
  pass("and scroll sideways instead of squeezing", narrow.scrolls.every(Boolean), JSON.stringify(narrow.scrolls));
  pass("with nothing spilling there either", narrow.spill.length === 0, narrow.spill.slice(0, 3).join(" ; "));
  await page.setViewport({ width: 1400, height: 1000 });
  await sleep(300);
}

console.log("\n═ a row still opens the truck ═");
{
  await page.evaluate(() => [...document.querySelectorAll("[data-shop-group=tractor] tbody tr")].find((tr) => /#0877/.test(tr.textContent)).click());
  pass("clicking #0877 opens its Truck Report", await until(() => page.evaluate(() => /Truck Report/.test(window.__text()) && /0877/.test(window.__text()))));
  await page.keyboard.press("Escape");
  await page.evaluate(() => { const x = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "×" || b.textContent.trim() === "✕"); if (x) x.click(); });
  await sleep(300);
}

console.log("\n═ Recently closed is split the same way ═");
{
  await page.evaluate(() => window.__press("Recently closed"));
  const g = await until(() => page.evaluate(() => { const x = window.__groups(); return x[1] && x[1].trucks[0] === "0186" ? x : null; }));
  pass("the closed 0186 ticket is in the Tractors table", !!g && JSON.stringify(g[1].trucks) === JSON.stringify(["0186"]), JSON.stringify(g));
  pass("the empty Box Trucks table says so", !!g && /None recently closed/.test(JSON.stringify(g[0].trucks)), JSON.stringify(g && g[0]));
  pass("and the third table goes away when nothing needs it", !!g && g.length === 2);
}

pass("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
await browser.close(); server.close();
process.exit(failed ? 1 : 0);
