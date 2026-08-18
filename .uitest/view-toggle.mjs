/**
 * Classic / New switch on the Maintenance and Costs tabs.
 *
 * The property that matters most is the boring one: CLASSIC IS THE DEFAULT. Nobody in
 * the yard or the office should see anything change until they press New themselves.
 * The second is that New actually renders — those views compute over costEntries,
 * repairs and the Motive mileage, so a bad divide or a missing field would white-screen
 * a money tab, and the ErrorBoundary would be the only thing between that and a driver.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
const PORT = 8421;

const MONTH = new Date().toISOString().slice(0, 7);
const KV = {
  "fl-trucks": JSON.stringify([
    { id: "0424", mk: "FRTLN", type: "straight", tr: "A", ax: "Single" },
    { id: "7608", mk: "HINO", type: "straight", tr: "M", ax: "Single" },
  ]),
  "fl-drivers": JSON.stringify(["Alvarez, R"]),
  "fl-repairs": JSON.stringify([
    { id: "r1", truckId: "0424", reason: "Mechanical Repair", status: "open", dateIn: "2026-08-17T11:15:00.000Z", openedBy: "Big papa" },
    { id: "r2", truckId: "7608", reason: "Planned Maintenance", status: "closed", dateIn: "2026-08-14T12:00:00.000Z", dateClosed: "2026-08-17T19:42:00.000Z", closedBy: "Bill Tillery" },
  ]),
  "fl-costs": "[]",
  [`fl-costs-${MONTH}`]: JSON.stringify([
    { id: "c1", truckId: "0424", vendor: "Complete Fleet Services", category: "Repair", date: `${MONTH}-12`, invoiceNum: "CFS-10785", total: 5415.48 },
    { id: "c2", truckId: "7608", vendor: "FuelFox Atlanta", category: "Fuel", date: `${MONTH}-02`, invoiceNum: "FF-1", total: 900, gallons: 200 },
  ]),
  "fl-review-queue": "[]",
  // The app reads fl-miles → { byTruck: { truckId: { "YYYY-MM": miles } } }. Seeding it
  // exercises the path that matters: cost PER MILE, where a zero or missing denominator
  // is exactly the kind of thing that renders NaN or Infinity into a money screen.
  "fl-miles": JSON.stringify({
    byTruck: { "0424": { [MONTH]: 4200 }, "7608": { [MONTH]: 56000 } },
    updatedAt: new Date("2026-08-18T09:00:00.000Z").toISOString(), gaps: [], source: "motive",
  }),
};

let html = readFileSync(path.join(REPO, "index.html"), "utf8");
html = html.replace(/<script src="https:\/\/www\.gstatic\.com\/firebasejs[^>]*><\/script>/g, "");
html = html
  .replace(/https:\/\/unpkg\.com\/react@18\/umd\/react\.production\.min\.js/g, "/vendor/react.js")
  .replace(/https:\/\/unpkg\.com\/react-dom@18\/umd\/react-dom\.production\.min\.js/g, "/vendor/react-dom.js")
  .replace(/https:\/\/unpkg\.com\/@babel\/standalone@7\.24\.0\/babel\.min\.js/g, "/vendor/babel.js");

const STUB = `<script>
window.__KV = ${JSON.stringify(KV)};
function mq(lo, hi) {
  return { where(f, op, v) { return op === ">=" ? mq(v, hi) : op === "<" ? mq(lo, v) : mq(lo, hi); },
    async get() { const ids = Object.keys(window.__KV).filter(i => (lo === null || i >= lo) && (hi === null || i < hi));
      return { forEach(cb) { ids.forEach(i => cb({ id: i, data: () => ({ v: window.__KV[i] }) })); } }; } };
}
const mk = (id) => ({
  async get() { const v = window.__KV[id]; return { exists: v !== undefined, data: () => ({ v }) }; },
  async set(o) { window.__KV[id] = o.v; return true; },
  async delete() { delete window.__KV[id]; },
  onSnapshot(cb) { setTimeout(() => cb({ forEach() {} }), 0); return () => {}; }
});
window.__DB = { collection() { const q = mq(null, null); return { doc: mk, where: q.where, get: q.get }; } };
window.firebase = { initializeApp() {}, firestore() { return window.__DB; } };
window.firebase.firestore.FieldPath = { documentId: () => "__name__" };
localStorage.setItem("fl-device-user", "Harness");
</script>`;
html = html.replace("</head>", STUB + "</head>");

await ensureVendor();
const appSrc = readFileSync(path.join(REPO, "App.jsx"), "utf8");
const server = http.createServer((req, res) => {
  if (req.url.startsWith("/App.jsx")) { res.writeHead(200, { "Content-Type": "application/javascript" }); return res.end(appSrc); }
  if (req.url.startsWith("/vendor/")) { res.writeHead(200, { "Content-Type": "application/javascript" }); return res.end(readFileSync(path.join(here, "vendor", path.basename(req.url)))); }
  res.writeHead(200, { "Content-Type": "text/html" }); res.end(html);
}).listen(PORT);

const browser = await launch();
const page = await browser.newPage();
const errs = [];
page.on("pageerror", e => errs.push("pageerror: " + e.message));
page.on("console", m => {
  const t = m.text();
  if (m.type() === "error" && !/Failed to load resource|net::ERR|\[BABEL\] Note:/.test(t)) errs.push(t);
});

const boot = async () => {
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  await page.waitForFunction(() => { const r = document.getElementById("root"); return r && !r.querySelector("#loading"); }, { timeout: 45000 }).catch(() => {});
};
const goTab = async (label) => {
  // The tab buttons carry a count badge (Maintenance shows open repairs, Costs shows
  // outstanding cores), so the label is a PREFIX of the button text, not the whole of it.
  const clicked = await page.evaluate((l) => {
    const b = [...document.querySelectorAll("button")].find(x => (x.textContent || "").trim().replace(/\d+$/, "").trim() === l);
    if (b) { b.click(); return true; }
    return false;
  }, label);
  if (!clicked) throw new Error(`tab not found: ${label}`);
  await new Promise(r => setTimeout(r, 700));
};
const press = async (label) => {
  await page.evaluate((l) => { const b = [...document.querySelectorAll("button")].find(x => (x.textContent || "").trim() === l); if (b) b.click(); }, label);
  await new Promise(r => setTimeout(r, 800));
};
const body = () => page.evaluate(() => document.getElementById("root").textContent || "");
const mode = () => page.evaluate(() => localStorage.getItem("fl-view-mode"));

let failed = 0;
const pass = (l, ok, extra = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${l}${extra ? "  — " + extra : ""}`); };

await boot();

console.log("\n─ Maintenance ─");
await goTab("Maintenance");
let t = await body();
pass("the switch is offered", /Maintenance view/.test(t) && /Classic/.test(t) && /New/.test(t));
pass("CLASSIC is what you get without touching anything", /The page as you know it/.test(t));
pass("nothing is stored until you choose", (await mode()) === null, String(await mode()));

await press("New");
t = await body();
pass("New renders", /Everything you had is still under Classic/.test(t));
pass("and it is remembered", (await mode()) === "new", String(await mode()));
pass("no errors in the New maintenance view", errs.length === 0, errs.slice(0, 2).join(" | "));

console.log("\n─ Costs ─");
await goTab("Costs");
t = await body();
pass("the Costs switch is offered", /Cost view/.test(t));
pass("New costs renders", /Everything you had is still under Classic/.test(t));
pass("no errors in the New costs view", errs.length === 0, errs.slice(0, 2).join(" | "));
// $6,315 of cost over 60,200 seeded miles — the tiles must show real money, not "—".
const tiles = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll("div").forEach(d => {
    const x = (d.textContent || "").trim().replace(/\s+/g, " ");
    if (/^(Total cost \/ mile|Fuel \/ mile|Miles driven)\$?\S/.test(x) && x.length < 80) out.push(x);
  });
  return [...new Set(out)];
});
pass("total cost per mile is computed from the miles", tiles.some(x => /^Total cost \/ mile\$0\.10/.test(x)), tiles.join(" | "));
pass("fuel per mile is computed", tiles.some(x => /^Fuel \/ mile\$0\.01/.test(x)), tiles.join(" | "));
pass("the miles themselves are shown", tiles.some(x => /^Miles driven60,200/.test(x)), tiles.join(" | "));
pass("no tile fell back to \"needs mileage\" once mileage exists", !/needs mileage/.test(t));
pass("no NaN, Infinity or undefined leaked into the money view",
  !/NaN|Infinity|undefined/.test(t), (t.match(/.{0,40}(NaN|Infinity|undefined).{0,40}/) || [""])[0]);

console.log("\n─ the preference survives a reload ─");
await boot();
await goTab("Costs");
t = await body();
pass("still on New after reload", /Everything you had is still under Classic/.test(t));

await press("Classic");
t = await body();
pass("Classic comes back", /The page as you know it/.test(t));
pass("the classic Costs page is intact", /Invoice Scanner/.test(t) && /Bulk Import Historical Data/.test(t));
pass("and the choice is remembered", (await mode()) === "classic", String(await mode()));

await goTab("Maintenance");
t = await body();
pass("Maintenance is classic too — one preference, both tabs", /The page as you know it/.test(t));

pass("no page errors anywhere in this run", errs.length === 0, errs.slice(0, 3).join(" | "));

await browser.close();
server.close();
console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
process.exit(failed ? 1 : 0);
