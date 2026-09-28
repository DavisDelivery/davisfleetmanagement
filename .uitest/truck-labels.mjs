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

const PORT = 8601;
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
  window.__KV["fl-asgn-"+wk]=JSON.stringify({["Alvarez, R-"+day]:"0805"});
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
await page.evaluate(() => {
  window.__tab = (label) => [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim().replace(/\d+$/, "").trim() === label).click();
  // The text in a table's `header` column for the row that mentions `first`.
  window.__col = (header, first) => {
    for (const t of document.querySelectorAll("table")) {
      const heads = [...t.querySelectorAll("thead th")].map((th) => th.textContent.trim().toLowerCase());
      const i = heads.indexOf(header.toLowerCase()); if (i < 0) continue;
      const row = [...t.querySelectorAll("tbody tr")].find((tr) => tr.children[0] && tr.children[0].textContent.includes(first) || tr.children[1] && tr.children[1].textContent.includes(first));
      if (row && row.children[i]) return row.children[i].textContent.trim();
    }
    return null;
  };
});

console.log("\n═ the Dashboard's Available Trucks say Box or Tractor ═");
{
  await until(() => page.evaluate(() => !!document.querySelector('div[title="View Available"]')));
  await page.evaluate(() => document.querySelector('div[title="View Available"]').click());
  const modal = await until(() => page.evaluate(() => {
    const h = [...document.querySelectorAll("div")].find((d) => /^Available Trucks \(\d+\)$/.test((d.textContent || "").trim()));
    let box = h; for (let i = 0; box && i < 4 && !/#4114/.test(box.textContent); i++) box = box.parentElement;
    return box && /#4114/.test(box.textContent) ? box.innerText : null;
  }));
  pass("a box truck says Box, with its make and model", !!modal && modal.includes(`${WANT["4114"]} · Auto · Single`), JSON.stringify(modal && modal.slice(0, 200)));
  pass("a tractor says Tractor, with its make and model", !!modal && modal.includes(`${WANT["0186"]} · Man · Single`));
  pass("an old placeholder make is not printed as one", !!modal && modal.includes("Tractor · Auto · Tandem") && !/Tractor · Tractor/.test(modal));
  pass("the stored code FRTLN is never shown", !!modal && !/FRTLN/.test(modal));
  await page.keyboard.press("Escape");
  await page.evaluate(() => { const x = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "×" && !b.title); if (x) x.click(); });
  await sleep(200);
}

console.log("\n═ On the Road's Type column ═");
{
  const type = await until(() => page.evaluate(() => window.__col("Type", "Alvarez")));
  pass("reads Box · Hino 338, not the make alone", type === WANT["0805"], JSON.stringify(type));
}

console.log("\n═ the Driver Board ═");
{
  await page.evaluate(() => window.__tab("Driver Board"));
  await until(() => page.evaluate(() => !!document.getElementById("truck-status-board")));
  const tag = await page.evaluate(() => {
    const row = [...document.querySelectorAll("tbody tr")].find((tr) => tr.children[0] && /Alvarez/.test(tr.children[0].textContent));
    const cell = row && [...row.children].find((td) => /0805/.test(td.textContent));
    return cell ? cell.innerText.replace(/\s+/g, " ").trim() : null;
  });
  pass("the tag under an assigned truck says Box", !!tag && /Box · A/.test(tag), JSON.stringify(tag));

  const types = await page.evaluate(() => {
    const out = {}; const board = document.getElementById("truck-status-board");
    for (const tr of board.querySelectorAll("tbody tr")) if (tr.children.length > 4) out[tr.children[0].textContent.trim()] = tr.children[1].textContent.trim();
    return out;
  });
  pass("the Truck Status Board's Type column names each kind", Object.keys(WANT).every((id) => types[id] === WANT[id]), JSON.stringify(types));

  await page.evaluate(() => {
    const row = [...document.querySelectorAll("tbody tr")].find((tr) => tr.children[0] && /Alvarez/.test(tr.children[0].textContent));
    [...row.children].find((td) => /0805/.test(td.textContent)).click();
  });
  const options = await until(() => page.evaluate(() => {
    const sel = [...document.querySelectorAll("select")].find((s) => s.options[0] && /Pick/.test(s.options[0].textContent));
    return sel ? [...sel.options].slice(1).map((o) => o.textContent) : null;
  }));
  pass("the truck dropdown says Box for each choice", !!options && options.some((o) => o.startsWith(`4114 · ${WANT["4114"]} · Auto`)), JSON.stringify(options));
  await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "Done")?.click());
  await sleep(200);
}

console.log("\n═ the Maintenance truck picker ═");
{
  await page.evaluate(() => window.__tab("Maintenance"));
  await page.evaluate(() => [...document.querySelectorAll("summary")].find((s) => /Log New Repair/.test(s.textContent)).click());
  const picks = await until(() => page.evaluate(() => {
    const b = [...document.querySelectorAll("details button")].map((x) => x.textContent.trim()).filter((t) => /^#\d+ — /.test(t));
    return b.length ? b : null;
  }));
  pass("each truck to pick from says what it is", !!picks && picks.includes(`#0186 — ${WANT["0186"]}`) && picks.includes(`#0805 — ${WANT["0805"]}`), JSON.stringify(picks));
}

console.log("\n═ no errors ═");
pass("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));

console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
await browser.close(); server.close();
process.exit(failed ? 1 : 0);
