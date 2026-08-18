/**
 * The two upload boxes on the Costs tab used to be bare <input type="file">. They now
 * accept a dragged file as well as a click, and a file dropped ANYWHERE else no longer
 * makes the browser navigate away and discard whatever was half-entered.
 *
 * This drives a real DataTransfer drop through Chromium rather than asserting on markup:
 * a drop zone that renders but does not accept a drop is the failure worth catching.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
const PORT = 8417;

const KV = {
  "fl-trucks": JSON.stringify([{ id: "0424", mk: "FRTLN", type: "straight", tr: "A" }]),
  "fl-drivers": JSON.stringify(["Alvarez, R"]),
  "fl-repairs": "[]",
  "fl-costs": "[]",
  "fl-review-queue": "[]",
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
  return {
    where(f, op, v) { return op === ">=" ? mq(v, hi) : op === "<" ? mq(lo, v) : mq(lo, hi); },
    async get() {
      const ids = Object.keys(window.__KV).filter(i => (lo === null || i >= lo) && (hi === null || i < hi));
      return { forEach(cb) { ids.forEach(i => cb({ id: i, data: () => ({ v: window.__KV[i] }) })); } };
    }
  };
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
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(html);
}).listen(PORT);

const browser = await launch();
const page = await browser.newPage();
const errs = [];
page.on("pageerror", e => errs.push(e.message));
page.on("console", m => {
  const t = m.text();
  if (m.type() === "error" && !/Failed to load resource|net::ERR|\[BABEL\] Note:/.test(t)) errs.push(t);
});

await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
await page.waitForFunction(() => { const r = document.getElementById("root"); return r && !r.querySelector("#loading"); }, { timeout: 45000 }).catch(() => {});

// Costs tab holds both upload boxes.
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => (x.textContent || "").trim() === "Costs");
  if (b) b.click();
});
await new Promise(r => setTimeout(r, 700));

const found = await page.evaluate(() => {
  const zones = [...document.querySelectorAll('[role="button"]')]
    .filter(el => /Drop .*here|Drop invoices|Drop a JSON/i.test(el.getAttribute("aria-label") || el.textContent || ""));
  return {
    count: zones.length,
    labels: zones.map(z => (z.getAttribute("aria-label") || "").trim()),
    inputs: zones.map(z => { const i = z.querySelector('input[type="file"]'); return i ? { accept: i.accept, multiple: i.multiple, hidden: getComputedStyle(i).display === "none" } : null; }),
  };
});

// Highlight on dragover, then a real drop carrying a JSON file.
const dropped = await page.evaluate(async () => {
  const zone = [...document.querySelectorAll('[role="button"]')]
    .find(el => /JSON/i.test(el.getAttribute("aria-label") || ""));
  if (!zone) return { ok: false, why: "no json zone" };
  const before = getComputedStyle(zone).borderColor;
  zone.dispatchEvent(new DragEvent("dragenter", { bubbles: true, dataTransfer: new DataTransfer() }));
  await new Promise(r => setTimeout(r, 150));   // let React flush the state update
  const during = getComputedStyle(zone).borderColor;

  const dt = new DataTransfer();
  const payload = [{ truckId: "0424", vendor: "Complete Fleet Services", date: "2026-08-12", invoiceNum: "CFS-10785", total: 5415.48, category: "Labor" }];
  dt.items.add(new File([JSON.stringify(payload)], "history.json", { type: "application/json" }));
  zone.dispatchEvent(new DragEvent("drop", { bubbles: true, dataTransfer: dt }));
  await new Promise(r => setTimeout(r, 1200));
  return { ok: true, before, during, changed: before !== during, body: document.body.innerText };
});

// A drop that MISSES the zones must not navigate the browser to the file.
const strayHandled = await page.evaluate(() => {
  const dt = new DataTransfer();
  dt.items.add(new File(["x"], "stray.pdf", { type: "application/pdf" }));
  const ev = new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt });
  document.body.dispatchEvent(ev);
  return ev.defaultPrevented;
});

let failed = 0;
const pass = (label, ok, extra = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? "  — " + extra : ""}`); };

console.log(`\npage errors: ${errs.length ? errs.slice(0, 3).join(" | ") : "none"}\n`);
pass("no page errors", errs.length === 0);
pass("both upload boxes are drop zones", found.count === 2, found.labels.join(" | "));
pass("scanner accepts pdf + images, multiple", !!found.inputs.find(i => i && i.multiple && /pdf/.test(i.accept)));
pass("bulk import accepts json, single", !!found.inputs.find(i => i && !i.multiple && /json/.test(i.accept)));
pass("the file inputs are hidden behind the zone", found.inputs.every(i => i && i.hidden));
pass("dragging over highlights the zone", dropped.ok && dropped.changed, `${dropped.before} → ${dropped.during}`);
pass("a dropped JSON file actually imports", dropped.ok && /Imported 1 invoice/i.test(dropped.body || ""),
  (dropped.body || "").split("\n").find(l => /Imported|failed|must be/i.test(l)) || "no toast");
pass("a stray drop is swallowed, not navigated to", strayHandled === true);

await browser.close();
server.close();
console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
process.exit(failed ? 1 : 0);
