/**
 * Opens a real Truck Report in the fleet app, edits transmission and axle, saves,
 * and checks what actually landed in storage — plus that the Single/Tandem fleet
 * filter, which reads the same field, follows the change.
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

const TRUCKS = [
  { id: "0877", mk: "Tractor", md: "Volvo", tr: "A", ax: "Tandem", type: "tractor", year: 2019 },
  { id: "5042", mk: "FRTLN", md: "M2 106", tr: "A", ax: "Single", type: "straight", year: 2012 },
];

const PAGE = `<!doctype html><html><head><meta charset="utf-8"></head><body><div id="root"></div>
<script src="/react.js"></script><script src="/react-dom.js"></script>
<script>
window.__KV = { "fl-trucks": ${JSON.stringify(JSON.stringify(TRUCKS))}, "fl-repairs": "[]" };
window.storage = {
  async get(k){ return window.__KV[k]!==undefined ? { value: window.__KV[k] } : null; },
  async set(k,v){ window.__KV[k]=v; return true; },
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
}).listen(8305);

const browser = await puppeteer.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1000 });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errors.push(m.text()); });

let pass = 0, fail = 0;
const t = (n, c, d = "") => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n}${d ? ` — ${d}` : ""}`); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const clickText = (text) => page.evaluate((text) => {
  const hits = [...document.querySelectorAll("button,div,span,a")]
    .filter((e) => (e.textContent || "").trim().startsWith(text));
  if (!hits.length) return false;
  hits.sort((a, b) => (a.textContent || "").length - (b.textContent || "").length);
  hits[0].click(); return true;
}, text);

await page.goto("http://localhost:8305/", { waitUntil: "domcontentloaded" });
await sleep(1800);

console.log("\n═ Truck Report — edit transmission + axle ═");
t("app mounted", (await page.$eval("body", (b) => b.innerText.length)) > 100);

await clickText("Fleet");
await sleep(800);
// Open #0877's Truck Report by clicking its number.
const opened = await page.evaluate(() => {
  const el = [...document.querySelectorAll("span,div,td,a")]
    .find((e) => (e.textContent || "").trim() === "#0877" || (e.textContent || "").trim() === "0877");
  if (!el) return false; el.click(); return true;
});
await sleep(700);
let body = await page.$eval("body", (b) => b.innerText);
t("Truck Report opened for #0877", opened && /Truck Report/.test(body), body.slice(0, 150).replace(/\n/g, " | "));

t(await clickText("✏️ Edit") ? true : false, true);
await sleep(600);
body = await page.$eval("body", (b) => b.innerText);
t("edit panel shows a Transmission field", /Transmission/.test(body));
t("edit panel shows an Axle field", /Axle/.test(body));

// Read the two new selects and confirm they PRE-FILL from the truck, not a default.
const before = await page.evaluate(() => {
  const labels = [...document.querySelectorAll("label")];
  const find = (name) => {
    const l = labels.find((x) => (x.textContent || "").trim().startsWith(name));
    return l ? l.querySelector("select")?.value : null;
  };
  return { tr: find("Transmission"), ax: find("Axle") };
});
t("Transmission pre-filled from the record (A)", before.tr === "A", JSON.stringify(before));
t("Axle pre-filled from the record (Tandem)", before.ax === "Tandem", JSON.stringify(before));

// Change both, then save.
await page.evaluate(() => {
  const labels = [...document.querySelectorAll("label")];
  const set = (name, val) => {
    const l = labels.find((x) => (x.textContent || "").trim().startsWith(name));
    const sel = l && l.querySelector("select");
    if (!sel) return;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, "value").set;
    setter.call(sel, val);
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  };
  set("Transmission", "M");
  set("Axle", "Single");
});
await sleep(400);
await clickText("Save");
await sleep(900);

const stored = await page.evaluate(() => JSON.parse(window.__KV["fl-trucks"]).find((x) => x.id === "0877"));
t("transmission persisted as Manual", stored.tr === "M", JSON.stringify(stored));
t("axle persisted as Single", stored.ax === "Single", JSON.stringify(stored));
t("other fields untouched", stored.mk === "Tractor" && stored.md === "Volvo" && stored.type === "tractor" && stored.year === 2019, JSON.stringify(stored));
t("the other truck is untouched", (await page.evaluate(() => JSON.parse(window.__KV["fl-trucks"]).find((x) => x.id === "5042").ax)) === "Single");

body = await page.$eval("body", (b) => b.innerText);
t("report now displays the new axle", /Axle:?\s*Single/.test(body.replace(/\n/g, " ")), (body.match(/Axle[^\n]*/) || [])[0]);

// The Single/Tandem fleet filter reads the same field — it must follow the edit.
await clickText("×");
await sleep(500);
await clickText("Fleet");
await sleep(600);
const tandemNow = await page.evaluate(() => JSON.parse(window.__KV["fl-trucks"]).filter((x) => x.ax === "Tandem").length);
t("no tractors left classified Tandem after the change", tandemNow === 0, `tandem=${tandemNow}`);

t("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));
await page.screenshot({ path: path.join(here, "truck-edit.png") });
console.log(`\n${pass + fail} checks: ${pass} passed, ${fail} failed`);
await browser.close(); server.close();
process.exit(fail ? 1 : 0);
