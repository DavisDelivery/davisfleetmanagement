/**
 * Assign drivers from the Fleet List, and see it on the Driver Board — and the other
 * way round (v2.33.0).
 *
 * The owner: "I want to be able to assign drivers from the fleet list. So if I assign
 * a driver from fleet list it reflects on drivers board and vice versa."
 *
 * The Fleet List already showed each truck's driver for Mon–Fri, read off the Driver
 * Board's week document (driver+day → truck). Each of those day cells is now a driver
 * picker that writes the same document, so there is nothing to keep in sync. Checked
 * here, in the real app, against what lands in storage:
 *   - picking a driver for a truck's day writes driver+day → truck, takes the truck off
 *     whoever had it that day, and the Driver Board shows it;
 *   - a driver moved off another truck leaves that truck without a driver that day, and
 *     the app says so;
 *   - "— No driver —" clears the day; a driver marked off can still be picked, with a
 *     note;
 *   - a truck with an open repair ticket gets the board's Out of Service warning, and
 *     Cancel writes nothing;
 *   - a change made on the Driver Board shows in the Fleet List;
 *   - the 📅 week view of the Fleet List is a picker too;
 *   - a week whose read failed cannot be written from here either.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { buildApp, patchHtml, serveAsset } from "./appbuild.mjs";
import http from "http";

const PORT = 8621;
const TRUCKS = [
  { id: "0805", mk: "Hino", md: "338", type: "straight", tr: "A", ax: "Single" },
  { id: "4114", mk: "Freightliner", md: "M2", type: "straight", tr: "A", ax: "Single" },
  { id: "0186", mk: "Freightliner", md: "Cascadia", type: "tractor", tr: "M", ax: "Single" },
  { id: "7750", mk: "Freightliner", md: "Cascadia", type: "tractor", tr: "M", ax: "Tandem" },
];
const DRIVERS = [
  { name: "Aaron Mitchell", role: "Davis Straight Driver", category: "Davis" },
  { name: "Bob Jones", role: "Davis Straight Driver", category: "Davis" },
  { name: "Carl Lee", role: "Davis Tractor Driver", category: "Davis" },
  { name: "Dana Price", role: "Uline Shuttle Driver", category: "Uline" },
];
const WEEK = { "Aaron Mitchell-Mon": "0805", "Bob Jones-Mon": "4114", "Bob Jones-Tue": "4114", "Aaron Mitchell-Wed": "VAC" };

const STUB = `<script>
(function(){
  const d=new Date();const dy=d.getDay();d.setDate(d.getDate()-dy+(dy===0?-6:1));
  const ymd=x=>x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0");
  const wk=ymd(d);
  const lastWeek=new Date(d);lastWeek.setDate(lastWeek.getDate()-7);lastWeek.setHours(9);
  window.__WK=wk;
  window.__KV={
    "fl-trucks":${JSON.stringify(JSON.stringify(TRUCKS))},
    "fl-drivers":${JSON.stringify(JSON.stringify(DRIVERS))},
    "fl-repairs":JSON.stringify([{id:1,truckId:"7750",reason:"Clutch",notes:"",shop:"Complete Fleet Services",dateIn:lastWeek.toISOString(),estReturn:null,cost:0,dateClosed:null,status:"open"}]),
    "fl-review-queue":"[]",
  };
  window.__KV["fl-asgn-"+wk]=${JSON.stringify(JSON.stringify(WEEK))};
  window.__KV["fl-stat-"+wk]="{}";
  window.__FAILKEYS=(window.__PREFAIL||[]).slice();
  window.__WRITES=[];
})();
const failing=(id)=>window.__FAILKEYS.some(p=>id.startsWith(p));
const mk=(id)=>({
  async get(){ if(failing(id)) throw new Error("Failed to get document because the client is offline.");
    const v=window.__KV[id]; if(v===undefined) throw new Error("not found"); return {exists:true,data:()=>({v})}; },
  async set(o){ window.__WRITES.push(id); window.__KV[id]=o.v; return true; },
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
const boot = async (failWeek) => {
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(e.message));
  page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
  await page.evaluateOnNewDocument((fail) => { window.__PREFAIL = fail ? ["fl-asgn-", "fl-stat-"] : []; }, failWeek);
  await page.setViewport({ width: 1400, height: 1000 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => /Driver Board/.test(window.__text()), { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => {
    window.__tab = (label) => [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim().replace(/\d+$/, "").trim() === label).click();
    window.__pick = (sel, val) => {
      Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(sel, val);
      sel.dispatchEvent(new Event("change", { bubbles: true }));
    };
    // The Fleet List picker for one truck's day (the first one, when two views exist).
    window.__fleetSel = (truck, day) => document.querySelector(`select[aria-label="Driver for #${truck} on ${day}"]`);
    // What the cell shows: its visible labels, not the hidden picker's option list.
    window.__fleetText = (truck, day) => { const s = window.__fleetSel(truck, day);
      return s ? [...s.parentElement.querySelectorAll(":scope > span")].map((x) => x.textContent.trim()).join(" ") : null; };
    window.__week = () => JSON.parse(window.__KV["fl-asgn-" + window.__WK] || "{}");
    // The Driver Board's cell for one driver's day.
    window.__boardCell = (name, day) => {
      const table = [...document.querySelectorAll("table")].find((t) => [...t.querySelectorAll("thead th")].some((th) => th.textContent.trim() === "Driver"));
      if (!table) return null;
      const col = [...table.querySelectorAll("thead th")].findIndex((th) => th.textContent.trim().startsWith(day));
      const row = [...table.querySelectorAll("tbody tr")].find((tr) => tr.children[0] && tr.children[0].textContent.includes(name));
      return row && col >= 0 ? row.children[col] : null;
    };
    window.__dialog = () => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Cancel"); return b ? document.body.innerText : null; };
    window.__answer = (label) => [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === label)?.click();
  });
  return { page, errs };
};

const { page, errs } = await boot(false);

console.log("\n═ the Fleet List: every day is a driver picker ═");
{
  await page.evaluate(() => window.__tab("Fleet List"));
  await until(() => page.evaluate(() => !!window.__fleetSel("0805", "Mon")));
  const shape = await page.evaluate(() => ({
    pickers: ["0805", "4114", "0186", "7750"].every((t) => ["Mon", "Tue", "Wed", "Thu", "Fri"].every((d) => !!window.__fleetSel(t, d))),
    hint: /Click a day to assign a driver/.test(window.__text()),
  }));
  pass("each truck has a picker for each day, Mon–Fri", shape.pickers);
  pass("and the page says what clicking does", shape.hint);
  pass("today's board shows through: #0805 Mon is Aaron", await page.evaluate(() => window.__fleetText("0805", "Mon")) === "Aaron"
    && await page.evaluate(() => window.__fleetSel("0805", "Mon").value) === "Aaron Mitchell");

  const groups = await page.evaluate(() => [...window.__fleetSel("0805", "Mon").querySelectorAll("optgroup")]
    .map((g) => [g.label, [...g.querySelectorAll("option")].map((o) => o.textContent)]));
  const G = Object.fromEntries(groups);
  pass("box-truck drivers who are free (or on it) come first", JSON.stringify(G["Free Mon"]) === JSON.stringify(["Aaron Mitchell"]), JSON.stringify(groups));
  pass("a driver on another truck says which", JSON.stringify(G["On another truck Mon"]) === JSON.stringify(["Bob Jones · on 4114"]), JSON.stringify(G["On another truck Mon"]));
  pass("tractor and shuttle drivers are under Other drivers", JSON.stringify(G["Other drivers"]) === JSON.stringify(["Carl Lee", "Dana Price"]), JSON.stringify(G["Other drivers"]));
  const wed = Object.fromEntries(await page.evaluate(() => [...window.__fleetSel("4114", "Wed").querySelectorAll("optgroup")]
    .map((g) => [g.label, [...g.querySelectorAll("option")].map((o) => o.textContent)])));
  pass("a driver marked off says so", JSON.stringify(wed["Off Wed"]) === JSON.stringify(["Aaron Mitchell · VAC"]), JSON.stringify(wed));
  pass("the first choice clears the day", await page.evaluate(() => window.__fleetSel("0805", "Mon").options[0].textContent) === "— No driver —");
}

console.log("\n═ picking a driver writes the Driver Board's week ═");
{
  // Bob is on 4114 Monday. Put him on 0805 instead — Aaron comes off 0805, 4114 is left empty.
  await page.evaluate(() => window.__pick(window.__fleetSel("0805", "Mon"), "Bob Jones"));
  const wk = await until(() => page.evaluate(() => { const w = window.__week(); return w["Bob Jones-Mon"] === "0805" ? w : null; }));
  pass("Bob Jones-Mon is now 0805 in storage", !!wk, JSON.stringify(await page.evaluate(() => window.__week())));
  pass("Aaron came off 0805 Monday", !!wk && wk["Aaron Mitchell-Mon"] === "", JSON.stringify(wk));
  pass("nothing else in the week moved", !!wk && wk["Bob Jones-Tue"] === "4114" && wk["Aaron Mitchell-Wed"] === "VAC");
  pass("the app says 4114 is left without a driver", await until(() => page.evaluate(() => /Bob Jones moved from 4114 to 0805 on Mon\. 4114 has no driver Mon\./.test(window.__text()))));
  pass("the cells redraw: 0805 Mon reads Bob, 4114 Mon reads —", await until(() => page.evaluate(() =>
    window.__fleetText("0805", "Mon") === "Bob" && window.__fleetText("4114", "Mon") === "—")));

  await page.evaluate(() => window.__tab("Driver Board"));
  await until(() => page.evaluate(() => !!window.__boardCell("Bob Jones", "Mon")));
  const board = await page.evaluate(() => ({ bob: window.__boardCell("Bob Jones", "Mon").innerText, aaron: window.__boardCell("Aaron Mitchell", "Mon").innerText }));
  pass("the Driver Board shows Bob on 0805 Monday", /0805/.test(board.bob), JSON.stringify(board));
  pass("and Aaron with nothing Monday", board.aaron.trim() === "—", JSON.stringify(board));
}

console.log("\n═ and the Driver Board's changes show in the Fleet List ═");
{
  // Carl gets tractor 0186 on Tuesday, picked the board's own way.
  await page.evaluate(() => window.__boardCell("Carl Lee", "Tue").click());
  const sel = await until(() => page.evaluate(() => {
    const s = [...document.querySelectorAll("select")].find((x) => x.options[0] && /Pick Tractor/.test(x.options[0].textContent));
    if (!s) return false; window.__pick(s, "0186"); return true;
  }));
  pass("assigned on the board", !!sel && await until(() => page.evaluate(() => window.__week()["Carl Lee-Tue"] === "0186")));
  await page.evaluate(() => window.__tab("Fleet List"));
  pass("the Fleet List shows Carl on 0186 Tuesday", await until(() => page.evaluate(() => window.__fleetText("0186", "Tue") === "Carl")),
    JSON.stringify(await page.evaluate(() => window.__fleetText("0186", "Tue"))));
}

console.log("\n═ clearing a day, and picking a driver who is off ═");
{
  await page.evaluate(() => window.__pick(window.__fleetSel("4114", "Tue"), ""));
  pass("— No driver — clears Bob off 4114 Tuesday", await until(() => page.evaluate(() => window.__week()["Bob Jones-Tue"] === "")));
  pass("and the cell reads —", await until(() => page.evaluate(() => window.__fleetText("4114", "Tue") === "—")));

  await page.evaluate(() => window.__pick(window.__fleetSel("4114", "Wed"), "Aaron Mitchell"));
  pass("Aaron, marked VAC Wednesday, can still be put on 4114", await until(() => page.evaluate(() => window.__week()["Aaron Mitchell-Wed"] === "4114")));
  pass("and the app says he was marked VAC", await until(() => page.evaluate(() => /Aaron Mitchell was marked VAC on Wed\. Now on 4114\./.test(window.__text()))));
}

console.log("\n═ a truck with an open repair ticket ═");
{
  pass("#7750 reads OOS every day", await page.evaluate(() => ["Mon", "Tue", "Wed", "Thu", "Fri"].every((d) => window.__fleetText("7750", d) === "OOS")));
  await page.evaluate(() => window.__pick(window.__fleetSel("7750", "Thu"), "Carl Lee"));
  const msg = await until(() => page.evaluate(() => window.__dialog()));
  pass("picking a driver gets the board's Out of Service warning", !!msg && /Truck 7750 is OUT OF SERVICE \(open repair: Clutch\)/.test(msg), String(msg).slice(0, 160));
  const writes = await page.evaluate(() => window.__WRITES.length);
  await page.evaluate(() => window.__answer("Cancel"));
  await sleep(300);
  pass("Cancel writes nothing", await page.evaluate(() => window.__week()["Carl Lee-Thu"] === undefined) && await page.evaluate(() => window.__WRITES.length) === writes);
  pass("and the cell still reads OOS, with no driver", await page.evaluate(() => window.__fleetText("7750", "Thu") === "OOS" && window.__fleetSel("7750", "Thu").value === ""));

  await page.evaluate(() => window.__pick(window.__fleetSel("7750", "Thu"), "Carl Lee"));
  await until(() => page.evaluate(() => window.__dialog()));
  await page.evaluate(() => window.__answer("OK"));
  pass("OK assigns it anyway", await until(() => page.evaluate(() => window.__week()["Carl Lee-Thu"] === "7750")));
  pass("and the cell shows both: OOS, and Carl", await until(() => page.evaluate(() => window.__fleetText("7750", "Thu") === "OOS Carl")),
    JSON.stringify(await page.evaluate(() => window.__fleetText("7750", "Thu"))));
}

console.log("\n═ the 📅 week view is a picker too ═");
{
  await page.evaluate(() => document.querySelector('button[title="Truck Weekly Board"]').click());
  await until(() => page.evaluate(() => /Click a day to assign a driver/.test(window.__text()) && !!window.__fleetSel("0186", "Fri")));
  await page.evaluate(() => window.__pick(window.__fleetSel("0186", "Fri"), "Dana Price"));
  pass("assigning there writes the same week", await until(() => page.evaluate(() => window.__week()["Dana Price-Fri"] === "0186")));
  pass("and it reads Dana", await until(() => page.evaluate(() => window.__fleetText("0186", "Fri") === "Dana")));
  await page.evaluate(() => document.querySelector('button[title="Truck Weekly Board"]').previousElementSibling.click());
}

console.log("\n═ nothing spills out of the list's columns ═");
{
  await until(() => page.evaluate(() => !!window.__fleetSel("0805", "Mon")));
  // Set SHOT_DIR to keep a picture of the list for a human to look at.
  if (process.env.SHOT_DIR) await page.screenshot({ path: `${process.env.SHOT_DIR}/fleet-assign.png`, fullPage: true });
  const spill = await page.evaluate(() => [...document.querySelectorAll("td.fl-drv")]
    .filter((td) => td.scrollWidth > td.clientWidth + 1 || td.querySelector("select").getBoundingClientRect().width > td.getBoundingClientRect().width + 1)
    .map((td) => td.querySelector("select").getAttribute("aria-label")));
  pass("each picker sits inside its own day cell", spill.length === 0, spill.slice(0, 3).join(" ; "));
}

pass("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));

console.log("\n═ a week whose read failed cannot be written from the Fleet List ═");
{
  const { page: p2, errs: e2 } = await boot(true);
  await p2.evaluate(() => window.__tab("Fleet List"));
  await until(() => p2.evaluate(() => !!window.__fleetSel("4114", "Thu")));
  await p2.evaluate(() => window.__pick(window.__fleetSel("4114", "Thu"), "Bob Jones"));
  pass("the app says the week hasn't loaded", await until(() => p2.evaluate(() => /This week hasn't finished loading/.test(window.__text()))));
  await sleep(300);
  pass("and nothing was written to the week", await p2.evaluate(() => !window.__WRITES.some((k) => k.startsWith("fl-asgn-"))),
    JSON.stringify(await p2.evaluate(() => window.__WRITES)));
  pass("no misleading 'moved' note either", await p2.evaluate(() => !/moved from/.test(window.__text())));
  pass("no page errors there either", e2.length === 0, e2.slice(0, 3).join(" | "));
}

console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
await browser.close(); server.close();
process.exit(failed ? 1 : 0);
