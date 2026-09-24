/**
 * The shop portal's Shop field is a dropdown (v2.31.0): Interstate Truck Sales and
 * Complete Fleet Services, the same list as the fleet app. On each repair card, and on
 * Log New Repair. A shop saved before there was a list stays as its own option, so
 * opening the portal changes no repair; only picking does.
 */
import { launch } from "./browser.mjs";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import http from "http";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
const PORT = 8591;
const SHOPS = ["Interstate Truck Sales", "Complete Fleet Services"];
const REPAIRS = [
  { id: 7001, truckId: "0424", reason: "Mechanical Repair", shop: "Yard", notesLog: [], notes: "", dateIn: "2026-09-21T13:00:00.000Z", dateClosed: null, status: "open", cost: 0 },
  { id: 7002, truckId: "0451", reason: "Tires", shop: "", notesLog: [], notes: "", dateIn: "2026-09-22T13:00:00.000Z", dateClosed: null, status: "open", cost: 0 },
];
const TRUCKS = [{ id: "0424", mk: "FRTLN", type: "straight", tr: "A", ax: "Single" }, { id: "0451", mk: "HINO", type: "straight", tr: "M", ax: "Single" }];

const STUB = `<script>
window.__KV=${JSON.stringify({ "fl-trucks": JSON.stringify(TRUCKS), "fl-repairs": JSON.stringify(REPAIRS) })};
window.__WRITES=[];window.__SUBS={};
const snapOf=(id)=>({exists:window.__KV[id]!==undefined,data:()=>({v:window.__KV[id]})});
const emit=(id)=>setTimeout(()=>(window.__SUBS[id]||[]).forEach(cb=>cb(snapOf(id))),0);
const mk=(id)=>({
  async get(){ return snapOf(id); },
  async set(o){ window.__WRITES.push(id); window.__KV[id]=o.v; emit(id); },
  async delete(){ window.__WRITES.push(id); delete window.__KV[id]; emit(id); },
  onSnapshot(cb){ (window.__SUBS[id]=window.__SUBS[id]||[]).push(cb); emit(id); return ()=>{}; }
});
window.__DB={collection(){return {doc:mk};}, settings(){}, async disableNetwork(){}, async enableNetwork(){}};
window.firebase={initializeApp(){},firestore(){return window.__DB;}};
window.firebase.firestore.FieldPath={documentId:()=>"__name__"};
localStorage.setItem("fl-device-user","Harness");
</script>`;

const html = readFileSync(path.join(REPO, "mechanic", "index.html"), "utf8")
  .replace(/<script src="https:\/\/www\.gstatic\.com\/firebasejs[^>]*><\/script>/g, "")
  .replace("</head>", STUB + "</head>");
const server = http.createServer((req, res) => { res.writeHead(200, { "Content-Type": "text/html" }); res.end(html); }).listen(PORT);

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
await page.goto(`http://localhost:${PORT}/mechanic/`, { waitUntil: "domcontentloaded" });
await page.waitForSelector("#card-7001", { timeout: 15000 }).catch(() => {});

const cardShop = (id) => page.evaluate((id) => {
  const el = document.querySelector(`#card-${id} .shop-row .shop-input`);
  return el ? { tag: el.tagName, value: el.value, options: el.tagName === "SELECT" ? [...el.options].map((o) => o.value) : null } : null;
}, id);
const stored = (id) => page.evaluate((id) => JSON.parse(window.__KV["fl-repairs"]).find((r) => r.id === id), id);
const pick = (selector, value) => page.evaluate((selector, value) => {
  const sel = document.querySelector(selector);
  sel.value = value; sel.dispatchEvent(new Event("change", { bubbles: true }));
}, selector, value);

console.log("\n═ each repair card's Shop is a dropdown ═");
{
  const a = await cardShop(7001), b = await cardShop(7002);
  pass("it is a dropdown", a && a.tag === "SELECT" && b && b.tag === "SELECT", JSON.stringify([a && a.tag, b && b.tag]));
  pass("offering the two shops", b && JSON.stringify(b.options) === JSON.stringify(["", ...SHOPS]), JSON.stringify(b && b.options));
  pass("a shop saved before the list stays, and is still selected", a && a.value === "Yard" && a.options.includes("Yard"), JSON.stringify(a));
  pass("an empty shop shows as —", b && b.value === "");
  await sleep(300);
  pass("opening the portal saved nothing", (await page.evaluate(() => window.__WRITES.length)) === 0);

  await pick("#card-7002 .shop-row .shop-input", "Complete Fleet Services");
  await until(async () => (await stored(7002)).shop === "Complete Fleet Services");
  pass("picking a shop saves it on that repair", (await stored(7002)).shop === "Complete Fleet Services");
  pass("and nothing else on it", (await stored(7002)).reason === "Tires" && (await stored(7002)).status === "open");
  pass("the other repair keeps its shop", (await stored(7001)).shop === "Yard");
}

console.log("\n═ Log New Repair's Shop is the same dropdown ═");
{
  await page.evaluate(() => switchTab("log"));
  const opts = await page.evaluate(() => { const s = document.getElementById("new-shop"); return s && s.tagName === "SELECT" ? [...s.options].map((o) => o.value) : null; });
  pass("it offers the two shops", JSON.stringify(opts) === JSON.stringify(["", ...SHOPS]), JSON.stringify(opts));
  await pick("#new-truck", "0424");
  await pick("#new-shop", "Interstate Truck Sales");
  await page.evaluate(() => document.querySelector(".btn-log").click());
  await until(async () => (await page.evaluate(() => JSON.parse(window.__KV["fl-repairs"]).length)) === 3);
  const logged = await page.evaluate(() => JSON.parse(window.__KV["fl-repairs"])[0]);
  pass("logging a repair stores the shop picked", logged.truckId === "0424" && logged.shop === "Interstate Truck Sales", JSON.stringify({ truck: logged.truckId, shop: logged.shop }));
  pass("and the form resets to no shop", (await page.evaluate(() => document.getElementById("new-shop").value)) === "");
}

console.log("\n═ no errors ═");
pass("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));

console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
await browser.close(); server.close();
process.exit(failed ? 1 : 0);
