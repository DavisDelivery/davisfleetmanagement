/**
 * The Settings screen embeds the real mechanic portal so the owner can use it the way
 * the shop does. That portal writes live data: closing a repair closes it for everyone
 * and puts the truck back on the Weekly Board. Everything here is about making sure the
 * test view cannot do either.
 *
 * "The database" is this server, not a variable in the page: the portal's Firestore
 * stub reports every read, listen and write to /__db. A write that escaped test mode by
 * ANY route would show up here, whichever window or client it came from.
 *
 *   1. Nothing loads until Settings is opened — the frame is a second Firestore client
 *      and must never ride along on a cold start.
 *   2. Inside Settings the portal reads live data, every button works, and not one
 *      write, of any document, reaches the database.
 *   3. A name tried out in the test view does not become the office's name.
 *   4. The ?test link opened on its own refuses to run at all.
 *   5. The real portal still saves — which is also what proves (2) is not vacuous.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { buildApp, patchHtml, serveAsset } from "./appbuild.mjs";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
const PORT = 8541;
const REPAIR_ID = 1723000000000;

const REPAIRS = JSON.stringify([{
  id: REPAIR_ID, truckId: "0424", reason: "Mechanical Repair", shop: "Yard",
  notesLog: [{ ts: "2026-09-21T13:00:00.000Z", text: "Air leak at rear axle" }], notes: "",
  dateIn: "2026-09-21T13:00:00.000Z", dateClosed: null, status: "open", cost: 0,
}]);
const TRUCKS = JSON.stringify([{ id: "0424", mk: "FRTLN", type: "straight", tr: "A", ax: "Single" }]);

// ── the fleet app ──
const APP_STUB = `<script>
window.__KV=${JSON.stringify({
  "fl-trucks": TRUCKS,
  "fl-drivers": JSON.stringify([{ name: "Alvarez, R", role: "Davis Straight Driver", category: "Davis" }]),
  "fl-repairs": REPAIRS, "fl-review-queue": "[]",
})};
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

// ── the shop portal ── (its own window, its own Firestore client, same as production)
const PORTAL_STUB = `<script>
window.__KV=${JSON.stringify({ "fl-trucks": TRUCKS, "fl-repairs": REPAIRS })};
// Today's week, with the truck down every day: closing the repair must then want to
// put it back to HERE on the Weekly Board, so there IS a second write to hold back.
(function(){
  function gMon(d){const x=new Date(d);const day=x.getDay();const diff=x.getDate()-day+(day===0?-6:1);return new Date(x.setDate(diff));}
  const m=gMon(new Date());
  const wk=m.getFullYear()+"-"+String(m.getMonth()+1).padStart(2,"0")+"-"+String(m.getDate()).padStart(2,"0");
  const s={}; ["Mon","Tue","Wed","Thu","Fri"].forEach(d=>{s["0424-"+d]="OOS";});
  window.__STATKEY="fl-stat-"+wk; window.__KV[window.__STATKEY]=JSON.stringify(s);
})();
window.__SUBS={};
const report=(kind,id)=>{ try{ fetch("/__db",{method:"POST",keepalive:true,
  body:JSON.stringify({kind,id,framed:window.self!==window.top,url:location.pathname+location.search})}); }catch(e){} };
const snapOf=(id)=>({exists:window.__KV[id]!==undefined,data:()=>({v:window.__KV[id]})});
const emit=(id)=>setTimeout(()=>(window.__SUBS[id]||[]).forEach(cb=>cb(snapOf(id))),0);
const mk=(id)=>({
  async get(){ report("read",id); return snapOf(id); },
  // Like Firestore: a local write is echoed to this client's own listeners.
  async set(o){ report("write",id); window.__KV[id]=o.v; emit(id); },
  async delete(){ report("delete",id); delete window.__KV[id]; emit(id); },
  onSnapshot(cb){ report("listen",id); (window.__SUBS[id]=window.__SUBS[id]||[]).push(cb); emit(id);
    return ()=>{ window.__SUBS[id]=(window.__SUBS[id]||[]).filter(f=>f!==cb); }; }
});
// Another device saving: the database pushes its current copy to every listener.
window.__pushRemote=(id)=>emit(id);
window.__DB={collection(){return {doc:mk};}, settings(){}, async disableNetwork(){}, async enableNetwork(){}};
window.firebase={initializeApp(){},firestore(){return window.__DB;}};
window.firebase.firestore.FieldPath={documentId:()=>"__name__"};
</script>`;

await ensureVendor();
const built = await buildApp();
const appHtml = patchHtml(APP_STUB);
const portalHtml = readFileSync(path.join(REPO, "mechanic", "index.html"), "utf8")
  .replace(/<script src="https:\/\/www\.gstatic\.com\/firebasejs[^>]*><\/script>/g, "")
  .replace("</head>", PORTAL_STUB + "</head>");

const db = [];              // everything the portal asked of "the database"
let portalLoads = 0;        // GETs for the portal page itself
const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/__db") {
    let body = ""; req.on("data", (c) => (body += c));
    req.on("end", () => { try { db.push(JSON.parse(body)); } catch (e) {} res.writeHead(204); res.end(); });
    return;
  }
  if (serveAsset(req, res, built)) return;
  if (req.url.startsWith("/mechanic/")) {
    portalLoads++;
    res.writeHead(200, { "Content-Type": "text/html" }); res.end(portalHtml); return;
  }
  if (req.url === "/" || req.url.startsWith("/?") || req.url.startsWith("/index.html")) {
    res.writeHead(200, { "Content-Type": "text/html" }); res.end(appHtml); return;
  }
  res.writeHead(404); res.end();
}).listen(PORT);

let failed = 0;
const pass = (l, ok, x = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${l}${x ? "  — " + x : ""}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const writesSince = (n) => db.slice(n).filter((e) => e.kind === "write" || e.kind === "delete");

const browser = await launch();
const errs = [];
const watch = (p) => {
  p.on("pageerror", (e) => errs.push(e.message));
  p.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
};
// confirm() is always yes; prompt() answers with whatever the step set.
let promptAnswer = "";
const dialogs = [];
const answer = (p) => p.on("dialog", async (d) => {
  dialogs.push(d.type());
  if (d.type() === "prompt") await d.accept(promptAnswer); else await d.accept();
});

const page = await browser.newPage();
watch(page); answer(page);
await page.setViewport({ width: 1200, height: 1000 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => /Weekly Board/.test(window.__text()), { timeout: 60000 }).catch(() => {});

const heldText = () => page.evaluate(() => document.querySelector('[data-testid="held-summary"]')?.textContent || "");
const portalFrame = async () => {
  for (let i = 0; i < 100; i++) {
    const f = page.frames().find((fr) => fr.url().includes("/mechanic/"));
    if (f) return f;
    await sleep(100);
  }
  return null;
};

console.log("\n═ nothing loads until Settings is opened ═");
{
  await sleep(500);
  pass("the fleet app is up", /Weekly Board/.test(await page.evaluate(() => window.__text())));
  pass("the portal page was never requested", portalLoads === 0, `${portalLoads} load(s)`);
  pass("and there is no frame for it in the page",
    (await page.evaluate(() => document.querySelectorAll("iframe").length)) === 0);
}

console.log("\n═ inside Settings: live data, working buttons ═");
let frame = null;
{
  const clicked = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Settings");
    if (b) b.click(); return !!b;
  });
  pass("there is a Settings tab", clicked);
  frame = await portalFrame();
  pass("opening it loads the portal", !!frame);
  pass("in test mode", !!frame && /[?&]test=1\b/.test(frame.url()), frame && frame.url());
  if (frame) await frame.waitForSelector(`#card-${REPAIR_ID}`, { timeout: 15000 }).catch(() => {});
  pass("the real open repair is on screen", !!frame && !!(await frame.$(`#card-${REPAIR_ID}`)));
  pass("with its real note", !!frame && /Air leak at rear axle/.test(await frame.evaluate(() => document.body.textContent)));
  const banner = frame && await frame.evaluate(() => {
    const b = document.getElementById("test-mode-banner");
    return b ? { text: b.textContent, shown: b.getBoundingClientRect().height > 0 } : null;
  });
  pass("a TEST MODE banner says nothing is saved", !!banner && banner.shown && /TEST MODE/.test(banner.text) && /not saved|nothing .* saved/i.test(banner.text), banner && banner.text);
  const listened = db.filter((e) => e.kind === "listen" && e.framed).map((e) => e.id);
  pass("reads come from the live database", listened.includes("fl-repairs") && listened.includes("fl-trucks"), listened.join(","));
  pass("before anything is done, the summary says nothing changed", /Nothing changed yet/.test(await heldText()), await heldText());
}

console.log("\n═ a name tried out in the test view stays there ═");
{
  promptAnswer = "Test Mechanic";
  await frame.click("#who-bar");
  await sleep(300);
  const chip = await frame.evaluate(() => document.getElementById("who-bar").textContent);
  pass("the test view uses the new name", /Test Mechanic/.test(chip), chip.trim());
  const stored = await page.evaluate(() => localStorage.getItem("fl-device-user"));
  pass("the fleet app's own name is untouched", stored === "Harness", JSON.stringify(stored));
}

console.log("\n═ every save is held back ═");
const before = db.length;
{
  await frame.type(`#ni-${REPAIR_ID}`, "Replace brake chamber");
  await frame.click(`#card-${REPAIR_ID} .btn-add`);
  await frame.waitForFunction(() => /Replace brake chamber/.test(document.getElementById("open-list").textContent), { timeout: 5000 }).catch(() => {});
  pass("adding a note shows it, as a mechanic would see it",
    /Replace brake chamber/.test(await frame.evaluate(() => document.getElementById("open-list").textContent)));
  const by = await frame.evaluate((id) => { const r = repairs.find((x) => x.id == id); const e = r && (r.notesLog || []).slice(-1)[0]; return e && e.by; }, REPAIR_ID);
  pass("and signs it with the test name", by === "Test Mechanic", JSON.stringify(by));

  // Another device saves while the test is running. The live copy must not snap the
  // test edit away — the owner would see their change vanish and think it broke.
  await frame.evaluate(() => window.__pushRemote("fl-repairs"));
  await sleep(300);
  pass("a live update does not wipe the test edit",
    /Replace brake chamber/.test(await frame.evaluate(() => document.getElementById("open-list").textContent)));

  await frame.click(`#card-${REPAIR_ID} .btn-complete`);
  await frame.waitForFunction((id) => !document.getElementById(`card-${id}`), { timeout: 5000 }, REPAIR_ID).catch(() => {});
  pass("closing the repair takes it off the open list", !(await frame.$(`#card-${REPAIR_ID}`)));
  pass("and it shows in history", (await frame.evaluate(() => document.getElementById("count-history").textContent.trim())) === "1");
  pass("closing went on to look at the Weekly Board, so it DID try to write there",
    db.slice(before).some((e) => e.kind === "read" && /^fl-stat-/.test(e.id)),
    db.slice(before).map((e) => `${e.kind}:${e.id}`).join(" "));

  const t = await heldText();
  pass("the Settings screen counts what was held back", /3 saves held back/.test(t), t);
  pass("and names both things a close would have changed", /repair tickets/.test(t) && /Weekly Board status/.test(t), t);

  // No button deletes a document today, and nothing calls update(), batch() or a
  // transaction. Probe them directly so a future portal change cannot quietly add a
  // route around test mode: delete is held like set, and anything test mode does not
  // know about has to fail rather than fall through to the live client.
  const probe = await frame.evaluate(async () => {
    const out = {};
    try { await db.collection("kv").doc("fl-probe").delete(); out.del = "ok"; } catch (e) { out.del = "threw"; }
    try { await db.collection("kv").doc("fl-probe").update({ v: "[]" }); out.update = "ok"; } catch (e) { out.update = "threw"; }
    try { db.batch().commit(); out.batch = "ok"; } catch (e) { out.batch = "threw"; }
    try { await db.runTransaction(async () => {}); out.txn = "ok"; } catch (e) { out.txn = "threw"; }
    return out;
  });
  pass("a delete is held like a save", probe.del === "ok", JSON.stringify(probe));
  pass("update, batch and transactions fail instead of reaching the database",
    probe.update === "threw" && probe.batch === "threw" && probe.txn === "threw", JSON.stringify(probe));

  await sleep(800);   // same window the live-portal check below proves is long enough
  const leaked = writesSince(0);
  pass("NOT ONE write reached the database", leaked.length === 0, leaked.map((e) => `${e.kind}:${e.id}`).join(" "));
  pass("the stored repair is still open", await frame.evaluate(() => JSON.parse(window.__KV["fl-repairs"])[0].status === "open"));
  pass("the stored Weekly Board still has the truck down",
    await frame.evaluate(() => Object.values(JSON.parse(window.__KV[window.__STATKEY])).every((v) => v === "OOS")));
}

console.log("\n═ Reset goes back to live data ═");
{
  const old = frame;
  await page.evaluate(() => [...document.querySelectorAll("button")].find((x) => /Reset/.test(x.textContent)).click());
  let fresh = null;
  for (let i = 0; i < 100 && !fresh; i++) {
    await sleep(100);
    fresh = page.frames().find((fr) => fr.url().includes("/mechanic/") && fr !== old && !fr.isDetached());
  }
  if (fresh) await fresh.waitForSelector(`#card-${REPAIR_ID}`, { timeout: 15000 }).catch(() => {});
  pass("the repair is open again, because it never closed", !!fresh && !!(await fresh.$(`#card-${REPAIR_ID}`)));
  pass("the test note is gone", !!fresh && !/Replace brake chamber/.test(await fresh.evaluate(() => document.body.textContent)));
  pass("the test name is gone", !!fresh && /Harness/.test(await fresh.evaluate(() => document.getElementById("who-bar").textContent)));
  pass("the summary starts over", /Nothing changed yet/.test(await heldText()), await heldText());
  frame = fresh;
}

console.log("\n═ the ?test link on its own refuses to run ═");
{
  const mark = db.length;
  const p2 = await browser.newPage(); watch(p2); answer(p2);
  await p2.goto(`http://localhost:${PORT}/mechanic/?test=1`, { waitUntil: "domcontentloaded" });
  await sleep(800);
  const body = await p2.evaluate(() => document.body.textContent);
  pass("it says it is the test view", /This is the test view/.test(body));
  pass("it did not start: no repairs on screen", !(await p2.$(`#card-${REPAIR_ID}`)) && !/Air leak/.test(body));
  const touched = db.slice(mark);
  pass("it did not touch the database at all", touched.length === 0, touched.map((e) => `${e.kind}:${e.id}`).join(" "));
  pass("no TEST MODE banner, since nothing is running", !(await p2.$("#test-mode-banner")));
  const href = await p2.evaluate(() => document.querySelector("a")?.getAttribute("href"));
  pass("it points the mechanic at the real portal", href === "/mechanic/", JSON.stringify(href));
  await p2.close();
}

console.log("\n═ the real portal still saves ═");
{
  const mark = db.length;
  const p3 = await browser.newPage(); watch(p3); answer(p3);
  await p3.goto(`http://localhost:${PORT}/mechanic/`, { waitUntil: "domcontentloaded" });
  await p3.waitForSelector(`#card-${REPAIR_ID}`, { timeout: 15000 }).catch(() => {});
  pass("no banner on the real portal", !(await p3.$("#test-mode-banner")));
  await p3.type(`#ni-${REPAIR_ID}`, "Live note");
  await p3.click(`#card-${REPAIR_ID} .btn-add`);
  await sleep(800);   // the same wait as above: if this sees a write, that one would have
  const wrote = writesSince(mark);
  pass("adding a note writes the repair to the database",
    wrote.some((e) => e.kind === "write" && e.id === "fl-repairs" && !e.framed), wrote.map((e) => `${e.kind}:${e.id}`).join(" "));
  pass("signed with the device's real name",
    (await p3.evaluate((id) => repairs.find((x) => x.id == id).notesLog.slice(-1)[0].by, REPAIR_ID)) === "Harness");
  await p3.close();
}

console.log("\n═ no errors anywhere ═");
pass("no page errors in the app or the portal", errs.length === 0, errs.slice(0, 3).join(" | "));
pass("only the dialogs the steps expected", dialogs.join(",") === "prompt,confirm", dialogs.join(","));

console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
await browser.close(); server.close();
process.exit(failed ? 1 : 0);
