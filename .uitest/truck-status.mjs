/**
 * A truck is Out of Service while it has an open repair ticket — nothing else (v2.31.0).
 *
 * #1287 read "In Repair" for three days with its last ticket closed weeks before: someone
 * picked "@ Shop" on the Weekly Board, and any board text mentioning shop, Interstate,
 * repair or mech made a truck "In Repair" (and "OOS"/"BD" made it Out of Service) with no
 * ticket behind it. The owner's rule: only Out of Service, and only with an open ticket.
 *
 * Four trucks, this week:
 *   1001  board "@ Shop"   no ticket     — the #1287 case
 *   1002  board "HERE"     OPEN ticket   — the only one that is down
 *   1003  board "OOS"      no ticket     — the #7792 case
 *   1004  blank            no ticket
 *
 * Checked where status is read — the Dashboard tiles, the Fleet List, the driver
 * dropdown — and where it is written: the Weekly Board picker only marks a cell Out of
 * Service once a ticket exists, and Cancel leaves the cell as it was. Also covers the
 * Shop dropdown on the app's repair screens.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { buildApp, patchHtml, serveAsset } from "./appbuild.mjs";
import http from "http";

const PORT = 8581;
const TRUCKS = ["1001", "1002", "1003", "1004"].map((id) => ({ id, mk: "Freightliner", md: "M2", type: "straight", tr: "A", ax: "Single" }));
const TEN_DAYS_AGO = new Date(Date.now() - 10 * 86400000).toISOString();
const REPAIRS = [{ id: 5001, truckId: "1002", reason: "Mechanical Repair", shop: "Yard", notes: "", notesLog: [],
  dateIn: TEN_DAYS_AGO, dateClosed: null, status: "open", cost: 0 }];

const STUB = `<script>
(function(){
  // The same week key the app uses (wK): the Monday of this week, YYYY-MM-DD.
  const d=new Date();const dy=d.getDay();d.setDate(d.getDate()-dy+(dy===0?-6:1));
  const wk=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
  const stat={};
  ["Mon","Tue","Wed","Thu","Fri"].forEach(day=>{ stat["1001-"+day]="@ Shop"; stat["1002-"+day]="HERE"; stat["1003-"+day]="OOS"; });
  window.__WK=wk;
  window.__KV={
    "fl-trucks":${JSON.stringify(JSON.stringify(TRUCKS))},
    "fl-drivers":${JSON.stringify(JSON.stringify([{ name: "Alvarez, R", role: "Davis Straight Driver", category: "Davis" }]))},
    "fl-repairs":${JSON.stringify(JSON.stringify(REPAIRS))},
    "fl-review-queue":"[]",
  };
  window.__KV["fl-stat-"+wk]=JSON.stringify(stat);
  window.__KV["fl-asgn-"+wk]="{}";
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
await page.waitForFunction(() => /Weekly Board/.test(window.__text()), { timeout: 60000 }).catch(() => {});

await page.evaluate(() => {
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const dy = new Date().getDay();
  window.__DAY = DAYS[dy === 0 || dy === 6 ? 0 : dy - 1];          // the app's todayDI()
  window.__stat = () => JSON.parse(window.__KV["fl-stat-" + window.__WK]);
  window.__repairs = () => JSON.parse(window.__KV["fl-repairs"]);
  window.__byText = (sel, text) => [...document.querySelectorAll(sel)].find((e) => (e.textContent || "").trim() === text);
  // Tab labels can carry a count badge ("Maintenance2"), so compare without it.
  window.__tab = (label) => [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim().replace(/\d+$/, "").trim() === label).click();
  window.__pick = (sel, val) => {
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(sel, val);
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  };
  window.__tile = (label) => { const t = document.querySelector(`div[title="View ${label}"]`); const m = t && t.textContent.match(/\d+/); return m ? Number(m[0]) : null; };
  // The cell under today's column in the row whose first cell is `first`, inside `root`.
  window.__dayCell = (root, first) => {
    const table = root && root.querySelector("table"); if (!table) return null;
    const col = [...table.querySelectorAll("thead th")].findIndex((th) => th.textContent.trim().startsWith(window.__DAY));
    // Driver rows open with an icon ("🚚  Alvarez, R"), so match anywhere in the cell.
    const row = [...table.querySelectorAll("tbody tr")].find((tr) => tr.children[0] && tr.children[0].textContent.includes(first));
    return row && col >= 0 ? row.children[col] : null;
  };
  window.__statusCell = (id) => window.__dayCell(document.getElementById("truck-status-board"), id);
  window.__repairModal = (id) => [...document.querySelectorAll("div")].find((d) => d.firstElementChild && d.firstElementChild.textContent.trim() === `Log Repair — Truck #${id}`);
});
const stat = (id) => page.evaluate((id) => window.__stat()[`${id}-${window.__DAY}`], id);
const tickets = (id) => page.evaluate((id) => window.__repairs().filter((r) => r.truckId === id), id);

console.log("\n═ the Dashboard counts only open tickets as down ═");
{
  await until(() => page.evaluate(() => window.__tile("OOS / Down") !== null));
  const oos = await page.evaluate(() => window.__tile("OOS / Down"));
  const avail = await page.evaluate(() => window.__tile("Available"));
  pass("OOS / Down is 1 — the truck with a ticket", oos === 1, `${oos}`);
  pass("Available is 3 — board text alone no longer takes a truck out", avail === 3, `${avail}`);
}

console.log("\n═ the Fleet List: Out of Service only with a ticket, and no In Repair ═");
{
  await page.evaluate(() => window.__tab("Fleet List"));
  await until(() => page.evaluate(() => /Out of Service/.test(document.getElementById("root").textContent)));
  const status = await page.evaluate(() => {
    const out = {};
    for (const table of document.querySelectorAll("table")) {
      const heads = [...table.querySelectorAll("thead th")].map((th) => th.textContent.trim());
      const col = heads.indexOf("Status"); if (col < 0 || !heads.includes("Deleted")) continue;
      for (const tr of table.querySelectorAll("tbody tr")) out[tr.children[0].textContent.trim()] = tr.children[col].textContent.trim();
    }
    return out;
  });
  pass("#1002, with an open ticket, is Out of Service", status["1002"] === "Out of Service", JSON.stringify(status));
  pass("#1001, '@ Shop' on the board with no ticket, is not down", status["1001"] && !/Repair|Out of Service/.test(status["1001"]), status["1001"]);
  pass("#1003, 'OOS' on the board with no ticket, is not down", status["1003"] && !/Repair|Out of Service/.test(status["1003"]), status["1003"]);
  pass("nothing reads In Repair", !/In Repair/.test(await page.evaluate(() => document.getElementById("root").textContent)));
}

console.log("\n═ the driver dropdown offers every truck without a ticket ═");
{
  await page.evaluate(() => window.__tab("Weekly Board"));
  await until(() => page.evaluate(() => !!document.getElementById("truck-status-board")));
  const legend = await page.evaluate(() => document.getElementById("truck-status-board").textContent);
  pass("the Truck Status Board key has no In Repair", !/In Repair/.test(legend));

  await page.evaluate(() => {
    const table = [...document.querySelectorAll("table")].find((t) => [...t.querySelectorAll("tbody tr")].some((tr) => tr.children[0] && /Alvarez/.test(tr.children[0].textContent)));
    window.__dayCell(table.parentElement, "Alvarez").click();
  });
  const offered = await until(() => page.evaluate(() => {
    const sel = [...document.querySelectorAll("select")].find((s) => s.options[0] && /Pick/.test(s.options[0].textContent));
    return sel ? [...sel.options].map((o) => o.value).filter(Boolean) : null;
  }));
  pass("#1001 and #1003 can be assigned — stale board text does not hide them", !!offered && offered.includes("1001") && offered.includes("1003"), JSON.stringify(offered));
  pass("#1002 cannot — its ticket is open", !!offered && !offered.includes("1002"), JSON.stringify(offered));
  await page.evaluate(() => window.__byText("button", "Done")?.click());
  await sleep(200);
}

console.log("\n═ the Weekly Board picker: Out of Service goes through a ticket ═");
{
  await page.evaluate(() => window.__statusCell("1001").click());
  const options = await until(() => page.evaluate(() => { const s = window.__statusCell("1001").querySelector("select"); return s ? [...s.options].map((o) => o.value) : null; }));
  pass("no '@ Shop' or '@ Interstate' to pick", !!options && !options.includes("@ Shop") && !options.includes("@ Interstate"), JSON.stringify(options));
  pass("Out of Service is there", !!options && options.includes("OOS"), JSON.stringify(options));

  await page.evaluate(() => window.__pick(window.__statusCell("1001").querySelector("select"), "OOS"));
  const opened = await until(() => page.evaluate(() => !!window.__repairModal("1001")));
  pass("picking it on a truck with no ticket opens the repair form", opened);
  pass("and the cell is not marked yet", (await stat("1001")) === "@ Shop", await stat("1001"));

  await page.evaluate(() => [...window.__repairModal("1001").parentElement.querySelectorAll("button")].find((b) => b.textContent.trim() === "Cancel").click());
  await until(() => page.evaluate(() => !window.__repairModal("1001")));
  await sleep(200);
  pass("Cancel leaves the cell as it was", (await stat("1001")) === "@ Shop", await stat("1001"));
  pass("and opens no ticket", (await tickets("1001")).length === 0);

  await page.evaluate(() => window.__statusCell("1001").click());
  await until(() => page.evaluate(() => !!window.__statusCell("1001").querySelector("select")));
  await page.evaluate(() => window.__pick(window.__statusCell("1001").querySelector("select"), "OOS"));
  await until(() => page.evaluate(() => !!window.__repairModal("1001")));
  const shopOpts = await page.evaluate(() => {
    const sel = [...window.__repairModal("1001").parentElement.querySelectorAll("select")].find((s) => s.title === "Shop");
    return sel ? [...sel.options].map((o) => o.value) : null;
  });
  pass("the repair form's Shop is the dropdown", JSON.stringify(shopOpts) === JSON.stringify(["", "Interstate Truck Sales", "Complete Fleet Services"]), JSON.stringify(shopOpts));
  await page.evaluate(() => {
    const box = window.__repairModal("1001").parentElement;
    window.__pick([...box.querySelectorAll("select")].find((s) => s.title === "Shop"), "Interstate Truck Sales");
  });
  await sleep(100);
  await page.evaluate(() => [...window.__repairModal("1001").parentElement.querySelectorAll("button")].find((b) => b.textContent.trim() === "Log & Set OOS").click());
  await until(async () => (await tickets("1001")).length === 1 && (await stat("1001")) === "OOS");
  const t1001 = await tickets("1001");
  pass("Log opens the ticket", t1001.length === 1 && t1001[0].status === "open", JSON.stringify(t1001));
  pass("with the shop picked", t1001[0] && t1001[0].shop === "Interstate Truck Sales", JSON.stringify(t1001[0] && t1001[0].shop));
  pass("and only then marks the cell Out of Service", (await stat("1001")) === "OOS", await stat("1001"));

  await page.evaluate(() => window.__statusCell("1002").click());
  await until(() => page.evaluate(() => !!window.__statusCell("1002").querySelector("select")));
  await page.evaluate(() => window.__pick(window.__statusCell("1002").querySelector("select"), "OOS"));
  await until(async () => (await stat("1002")) === "OOS");
  pass("with a ticket already open, the cell is marked at once", (await stat("1002")) === "OOS", await stat("1002"));
  pass("with no form and no second ticket", !(await page.evaluate(() => !!window.__repairModal("1002"))) && (await tickets("1002")).length === 1);

  await page.evaluate(() => window.__statusCell("1003").click());
  await until(() => page.evaluate(() => !!window.__statusCell("1003").querySelector("select")));
  await page.evaluate(() => window.__pick(window.__statusCell("1003").querySelector("select"), "__manual__"));
  await until(() => page.evaluate(() => !!window.__statusCell("1003").querySelector("input")));
  await page.type("input[placeholder='Type status...']", "@ shop");
  await page.evaluate(() => [...window.__statusCell("1003").querySelectorAll("button")].find((b) => b.textContent.trim() === "Save").click());
  const typed = await until(() => page.evaluate(() => !!window.__repairModal("1003")));
  pass("typing a down status by hand also asks for a ticket", typed);
  await page.evaluate(() => [...window.__repairModal("1003").parentElement.querySelectorAll("button")].find((b) => b.textContent.trim() === "Cancel").click());
  await sleep(300);
  pass("and Cancel leaves that cell alone too", (await stat("1003")) === "OOS" && (await tickets("1003")).length === 0, await stat("1003"));
}

console.log("\n═ Shop is a dropdown on the Maintenance tab ═");
{
  await page.evaluate(() => window.__tab("Maintenance"));
  const card = await until(() => page.evaluate(() => {
    const sel = [...document.querySelectorAll("select")].find((s) => s.title === "Shop" && s.value === "Yard");
    return sel ? [...sel.options].map((o) => o.value) : null;
  }));
  pass("a shop typed before the list is kept", !!card && card.includes("Yard"), JSON.stringify(card));
  pass("beside the two shops", !!card && card.includes("Interstate Truck Sales") && card.includes("Complete Fleet Services"), JSON.stringify(card));
  pass("and nothing was saved just by opening it", (await tickets("1002"))[0].shop === "Yard");
  await page.evaluate(() => window.__pick([...document.querySelectorAll("select")].find((s) => s.title === "Shop" && s.value === "Yard"), "Complete Fleet Services"));
  await until(async () => (await tickets("1002"))[0].shop === "Complete Fleet Services");
  pass("picking a shop saves it on that ticket", (await tickets("1002"))[0].shop === "Complete Fleet Services");

  await page.evaluate(() => [...document.querySelectorAll("summary")].find((s) => /Log New Repair/.test(s.textContent)).click());
  await until(() => page.evaluate(() => !!document.querySelector("input[placeholder^='🔍']")));
  await page.type("input[placeholder^='🔍']", "1004");
  const form = await until(() => page.evaluate(() => {
    const sel = [...document.querySelectorAll("select")].find((s) => s.title === "Shop" && s.options[0] && s.options[0].textContent === "Shop —" && s.closest("details"));
    return sel ? [...sel.options].map((o) => o.value) : null;
  }));
  pass("Log New Repair has the same dropdown", JSON.stringify(form) === JSON.stringify(["", "Interstate Truck Sales", "Complete Fleet Services"]), JSON.stringify(form));
  await page.evaluate(() => window.__pick([...document.querySelectorAll("select")].find((s) => s.title === "Shop" && s.closest("details")), "Complete Fleet Services"));
  await sleep(100);
  await page.evaluate(() => [...document.querySelectorAll("details button")].find((b) => b.textContent.trim() === "Log Repair").click());
  await until(async () => (await tickets("1004")).length === 1);
  const t1004 = await tickets("1004");
  pass("and logs the ticket with that shop", t1004.length === 1 && t1004[0].shop === "Complete Fleet Services", JSON.stringify(t1004.map((r) => r.shop)));
}

console.log("\n═ no errors ═");
pass("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));

console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
await browser.close(); server.close();
process.exit(failed ? 1 : 0);
