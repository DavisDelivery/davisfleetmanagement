/**
 * Loads the real fleet app in Chromium with a ledger shaped like production's — a
 * service log booked entirely to #0424, imported several times over — clicks the
 * repair button, and reads back what actually landed in storage.
 *
 * The point of checking it in a browser rather than calling repairCostLedger()
 * directly: the button has to find its way through uiConfirm, saveCosts' month
 * sharding and the analytics memo, and the chart has to show the corrected number.
 */
import puppeteer from "puppeteer";
import * as esbuild from "esbuild";
import { readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");

const { code: appJs } = await esbuild.transform(readFileSync(path.join(REPO, "App.jsx"), "utf8"), {
  loader: "jsx", jsxFactory: "React.createElement", jsxFragment: "React.Fragment",
});

// Four trucks on one delivery; 0424 is simply the lowest unit number, which is the
// whole reason it collected the charges.
const LOG_LINES = [["0424", 368.46], ["0451", 73.15], ["0805", 178.62], ["1368", 313.26]];
const LOG_TOTAL = LOG_LINES.reduce((s, [, a]) => s + a, 0);
const mkCollapsed = (i, invoiceNum, addedAt) => ({
  id: 1000 + i, date: "2026-03-26", truckId: "0424", vendor: "FuelFox Atlanta", category: "Fuel",
  total: Math.round(LOG_TOTAL * 100) / 100, gallons: 208, pricePerGallon: 4.488,
  invoiceNum, lineItems: LOG_LINES.map(([t, a]) => ({ desc: `Diesel - Truck ${t}`, amount: a })),
  notes: "FuelFox Atlanta service log", gmailRef: `gmail:msg${i}:att${i}`, addedAt,
});
// The same delivery, five times, each under the invoice number the parser invented
// on that pass — exactly what the production ledger contains.
const COSTS = [
  mkCollapsed(1, "Davis Delivery - 03/26/2026", "2026-03-27T01:00:00.000Z"),
  mkCollapsed(2, "Service Log 03/26/2026", "2026-03-29T01:00:00.000Z"),
  mkCollapsed(3, "Davis Delivery Service Log 03/26/2026", "2026-04-01T01:00:00.000Z"),
  mkCollapsed(4, "Service Log - Davis Delivery 03/26/2026", "2026-04-03T01:00:00.000Z"),
  mkCollapsed(5, "323", "2026-04-06T01:00:00.000Z"),
  // An ordinary parts invoice that must come through untouched.
  { id: 2001, date: "2026-03-11", truckId: "0451", vendor: "Peach State Freightliner", category: "Parts",
    total: 412.5, invoiceNum: "PSF-88120", lineItems: [{ desc: "Air filter for truck 0451", amount: 412.5 }],
    notes: "", addedAt: "2026-03-12T01:00:00.000Z" },
];
const TRUCKS = LOG_LINES.map(([id]) => ({ id, mk: "FRTLN", md: "M2 106", tr: "A", ax: "Single", type: "straight", year: 2019 }));

const PAGE = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div>
<script src="/react.js"></script><script src="/react-dom.js"></script>
<script>
window.__KV = {
  "fl-trucks": ${JSON.stringify(JSON.stringify(TRUCKS))},
  "fl-repairs": "[]",
  "fl-costs-2026-03": ${JSON.stringify(JSON.stringify(COSTS))}
};
window.storage = {
  async get(k){ return window.__KV[k]!==undefined ? { value: window.__KV[k] } : null; },
  async set(k,v){ window.__KV[k]=v; return { key:k }; },
  async delete(k){ delete window.__KV[k]; return true; },
  async list(p){ return { keys: Object.keys(window.__KV).filter(k=>!p||k.startsWith(p)) }; }
};
window.db = { collection(){ return { doc(){ return { onSnapshot(){ return ()=>{}; } }; },
  where(){ return this; }, onSnapshot(){ return ()=>{}; } }; } };
const _f = window.fetch; window.fetch = async (u,o)=> String(u).startsWith("/api/")
  ? new Response("{}",{status:200,headers:{"Content-Type":"application/json"}}) : _f(u,o);
const { useState, useEffect, useCallback, useMemo, useRef } = React;
</script>
<script>__APP__</script>
<script>ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(App));</script>
</body></html>`;

const server = http.createServer((req, res) => {
  if (req.url === "/react.js" || req.url === "/react-dom.js") {
    const f = req.url === "/react-dom.js" ? "react-dom/umd/react-dom.production.min.js" : "react/umd/react.production.min.js";
    res.writeHead(200, { "Content-Type": "application/javascript" });
    return res.end(readFileSync(path.join(here, "node_modules", f)));
  }
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(PAGE.replace("__APP__", appJs));
}).listen(8307);

const browser = await puppeteer.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1100 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });
// The app uses its own promise-based modal, not window.confirm.
const confirmDialog = async () => page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "OK");
  if (!btn) return null;
  const msg = document.body.innerText;
  btn.click(); return msg;
});

let pass = 0, fail = 0;
const t = (n, c, d = "") => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n}${d ? ` — ${d}` : ""}`); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clickText = (text) => page.evaluate((text) => {
  const hits = [...document.querySelectorAll("button,div,span,a")].filter((e) => (e.textContent || "").trim().startsWith(text));
  if (!hits.length) return false;
  hits.sort((a, b) => (a.textContent || "").length - (b.textContent || "").length);
  hits[0].click(); return true;
}, text);
const ledger = () => page.evaluate(() => Object.entries(window.__KV).filter(([k]) => /^fl-costs/.test(k))
  .flatMap(([, v]) => JSON.parse(v)));
const spend = async (truck) => (await ledger()).filter((c) => c.truckId === truck).reduce((s, c) => s + (c.total || 0), 0);

await page.goto("http://localhost:8307/", { waitUntil: "domcontentloaded" });
await sleep(1800);

console.log("\n═ The ledger as imported ═");
t("app mounted", (await page.$eval("body", (b) => b.innerText.length)) > 100);
await clickText("Costs");
await sleep(900);
let body = await page.$eval("body", (b) => b.innerText);
t("the chart shows #0424 as the outlier it is", /Top 10 Trucks by Spend/.test(body) && /#0424/.test(body), body.slice(0, 120).replace(/\n/g, " | "));
const before = await spend("0424");
t(`#0424 starts at the full delivery x5 ($${before.toFixed(2)})`, Math.abs(before - LOG_TOTAL * 5) < 0.05, `$${before.toFixed(2)}`);

console.log("\n═ Pressing the repair button ═");
t("the repair button is on the Costs tab", await clickText("🧹 Fix duplicate"), body.slice(0, 200));
await sleep(500);
const prompt = await confirmDialog();
t("it shows what it is about to do before doing it", prompt !== null && /duplicate row/.test(prompt), String(prompt).slice(0, 200));
t("the prompt names the service logs", /service log/i.test(prompt || ""));
t("the prompt shows the fleet total moving", /Fleet total/.test(prompt || ""));
t("the prompt names #0424 as the biggest correction", /#0424/.test(prompt || ""), (String(prompt).match(/Biggest[\s\S]{0,120}/) || [])[0]);
await sleep(1200);

const after = await ledger();
t("the four duplicate imports are gone", after.filter((c) => c.vendor === "FuelFox Atlanta").length === 4,
  JSON.stringify(after.map((c) => `${c.truckId}:${c.total}`)));
t("#0424 now carries only its own fuel", Math.abs(await spend("0424") - 368.46) < 0.01, `$${(await spend("0424")).toFixed(2)}`);
t("the other three trucks got theirs", Math.abs(await spend("0451") - (73.15 + 412.5)) < 0.01 && Math.abs(await spend("1368") - 313.26) < 0.01,
  `0451=${(await spend("0451")).toFixed(2)} 1368=${(await spend("1368")).toFixed(2)}`);
t("the delivery total is intact", Math.abs(after.filter((c) => c.vendor === "FuelFox Atlanta").reduce((s, c) => s + c.total, 0) - LOG_TOTAL) < 0.02);
t("the unrelated parts invoice is untouched", after.some((c) => c.invoiceNum === "PSF-88120" && c.total === 412.5));
// Both March documents live in March's shard: the four split fuel rows and the parts invoice.
t("it persisted to the right month shard", await page.evaluate(() => JSON.parse(window.__KV["fl-costs-2026-03"] || "[]").length) === 5,
  await page.evaluate(() => Object.keys(window.__KV).filter((k) => /^fl-costs/.test(k))
    .map((k) => `${k}:${JSON.parse(window.__KV[k]).length}`).join(",")));

body = await page.$eval("body", (b) => b.innerText);
t("the chart redrew with the corrected numbers", !/\$1,676|\$4,669/.test(body), (body.match(/#0424[^\n]*\n?[^\n]*/) || [])[0]);

console.log("\n═ Pressing it again ═");
const snapshot = JSON.stringify(await ledger());
await clickText("🧹 Fix duplicate");
await sleep(700);
t("a second press asks for no confirmation — there is nothing to confirm", (await confirmDialog()) === null);
t("and says the ledger is clean", /nothing to fix|looks clean/i.test(await page.$eval("body", (b) => b.innerText)),
  (await page.$eval("body", (b) => b.innerText)).slice(0, 120).replace(/\n/g, " | "));
await sleep(400);
t("nothing changed", JSON.stringify(await ledger()) === snapshot);

t("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));
await page.screenshot({ path: path.join(here, "repair.png"), fullPage: false });
console.log(`\n${pass + fail} checks: ${pass} passed, ${fail} failed`);
await browser.close(); server.close();
process.exit(fail ? 1 : 0);
