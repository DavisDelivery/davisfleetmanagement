/**
 * Review Queue: a truck that was never added to the fleet roster sends the WHOLE
 * batch to review, even when every other split row is a truck the office already
 * knows — a 24-truck fuel log stalls over one unrecognized unit that fuels up with
 * the rest of the fleet on nearly every log. Reported directly: this needs one click,
 * not "add the truck on the Fleet tab, then hunt down every queue item it blocked."
 *
 * Drives the real "➕ Add #<truck> to fleet" action end to end: confirms the two real
 * dialogs, and checks it (a) adds the truck to the roster, (b) imports every queued
 * item whose ONLY problem was that missing truck, (c) does NOT touch an item that
 * mentions the same truck but ALSO has an independent problem (a per-truck gallons
 * figure over the physical tank limit — the one other check that genuinely varies
 * row-by-row within a single split document), (d) leaves a different missing-truck
 * item alone, and (e) never offers the button on an item flagged for an unrelated
 * reason.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
const PORT = 8431;

const row = (o) => ({ id: Math.random(), vendor: "FuelFox Atlanta", category: "Fuel", date: "2026-05-21", ...o });

const REVIEW_QUEUE = [
  { // A — clean, clearable: 0424 and 0608 known, 2651 the only problem
    id: "qa", vendor: "FuelFox Atlanta", filename: "log-A.pdf",
    confidenceReason: "Truck 2651 not in fleet roster",
    parsed: [
      row({ truckId: "0424", total: 353.09, gallons: 80, invoiceNum: "FF-A-0424" }),
      row({ truckId: "0608", total: 97.20, gallons: 22, invoiceNum: "FF-A-0608" }),
      row({ truckId: "2651", total: 210.00, gallons: 48, invoiceNum: "FF-A-2651" }),
    ],
  },
  { // A2 — same missing truck, also clean, also clearable
    id: "qa2", vendor: "FuelFox Atlanta", filename: "log-A2.pdf",
    confidenceReason: "Truck 2651 not in fleet roster",
    parsed: [
      row({ truckId: "0608", total: 88.40, gallons: 20, invoiceNum: "FF-A2-0608" }),
      row({ truckId: "2651", total: 199.50, gallons: 45, invoiceNum: "FF-A2-2651" }),
    ],
  },
  { // B — same missing truck, but a DIFFERENT row has an independent problem
    // (400 gal on one truck — over the 250-gal tank limit). Must NOT auto-clear.
    id: "qb", vendor: "FuelFox Atlanta", filename: "log-B.pdf",
    confidenceReason: "Truck 2651 not in fleet roster",
    parsed: [
      row({ truckId: "0424", total: 5000, gallons: 400, invoiceNum: "FF-B-0424" }),
      row({ truckId: "2651", total: 210.00, gallons: 48, invoiceNum: "FF-B-2651" }),
    ],
  },
  { // C — a DIFFERENT missing truck. Adding 2651 must not touch this one.
    id: "qc", vendor: "FuelFox Atlanta", filename: "log-C.pdf",
    confidenceReason: "Truck 9999 not in fleet roster",
    parsed: [
      row({ truckId: "0424", total: 100, gallons: 20, invoiceNum: "FF-C-0424" }),
      row({ truckId: "9999", total: 90, gallons: 18, invoiceNum: "FF-C-9999" }),
    ],
  },
  { // D — an unrelated reason. No quick-add button should render at all.
    id: "qd", vendor: "FuelFox Atlanta", filename: "log-D.pdf",
    confidenceReason: "Missing invoice number",
    parsed: [row({ truckId: "0424", total: 50, gallons: 10, invoiceNum: null })],
  },
];

const KV = {
  "fl-trucks": JSON.stringify([
    { id: "0424", mk: "FRTLN", type: "straight", tr: "A", ax: "Single" },
    { id: "0608", mk: "FRTLN", type: "straight", tr: "A", ax: "Single" },
  ]),
  "fl-drivers": "[]", "fl-repairs": "[]", "fl-costs": "[]",
  "fl-review-queue": JSON.stringify(REVIEW_QUEUE),
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

await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
await page.waitForFunction(() => { const r = document.getElementById("root"); return r && !r.querySelector("#loading"); }, { timeout: 45000 }).catch(() => {});

await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => (x.textContent || "").trim().replace(/\d+$/, "").trim() === "Costs");
  if (b) b.click();
});
await new Promise(r => setTimeout(r, 700));

const clickButtonWithText = async (text) => page.evaluate((t) => {
  const b = [...document.querySelectorAll("button")].find(x => (x.textContent || "").trim() === t);
  if (b) { b.click(); return true; }
  return false;
}, text);

let failed = 0;
const pass = (label, ok, extra = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? "  — " + extra : ""}`); };

// ── Before touching anything: check button visibility is correct per item ──
const buttonMap = await page.evaluate(() => {
  const cards = [...document.querySelectorAll("div")].filter(d => /not in fleet roster|Missing invoice number/.test(d.textContent || "") && d.querySelector("button"));
  // crude but effective: map filename -> whether an "Add #" button exists near it
  const out = {};
  document.querySelectorAll("div").forEach(d => {
    const txt = d.textContent || "";
    ["log-A.pdf", "log-A2.pdf", "log-B.pdf", "log-C.pdf", "log-D.pdf"].forEach(fn => {
      if (txt.includes(fn) && txt.length < 400 && d.querySelector('button')) {
        out[fn] = out[fn] || /➕ Add #/.test(txt);
      }
    });
  });
  return out;
});
pass("quick-add button offered on item A (2651 missing)", buttonMap["log-A.pdf"] === true);
pass("quick-add button offered on item C (9999 missing)", buttonMap["log-C.pdf"] === true);
pass("NO quick-add button on item D (unrelated reason)", buttonMap["log-D.pdf"] === false, JSON.stringify(buttonMap));

// ── Click the quick-add button on item A (also covers A2, B, C by truck id) ──
const clicked = await page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find(b => /➕ Add #2651 to fleet/.test(b.textContent || ""));
  if (btn) { btn.click(); return true; }
  return false;
});
pass("clicked the quick-add button for #2651", clicked);
await new Promise(r => setTimeout(r, 300));

const dialog1 = await page.evaluate(() => {
  const overlay = [...document.querySelectorAll("div")].find(d => d.style.zIndex === "10000");
  return (overlay && overlay.innerText) || "";
});
pass("confirm dialog mentions the truck number", /#2651/.test(dialog1));
pass("confirm dialog counts exactly 1 OTHER clearable item (A2) — excludes gallon-blocked B", /1 other queued invoice/.test(dialog1), dialog1.slice(0, 400));

pass("confirmed the add", await clickButtonWithText("OK"));
await new Promise(r => setTimeout(r, 300));
pass("chose Straight / Box truck on the type question", await clickButtonWithText("Straight / Box truck"));
await new Promise(r => setTimeout(r, 600));

const result = await page.evaluate(() => (document.body.innerText || ""));

pass("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
pass("success toast confirms truck #2651 was added", /Added truck #2651/.test(result));
pass("item A is gone from the queue", !/log-A\.pdf/.test(result));
pass("item A2 is gone from the queue", !/log-A2\.pdf/.test(result));
pass("item B (gallon-blocked) is STILL in the queue", /log-B\.pdf/.test(result));
pass("item C (different missing truck) is STILL in the queue", /log-C\.pdf/.test(result));
pass("item D (unrelated reason) is STILL in the queue", /log-D\.pdf/.test(result));
pass("review queue count dropped from 5 to 3", /Review Queue \(3\)/.test(result), (result.match(/Review Queue \(\d+\)/) || [""])[0]);

// ── item B's reason must refresh to the REAL remaining problem, not stay stale ──
// (2651 is now a real truck, so B's card should no longer say so, or offer a
// roster-fix button for a truck its rows don't even reference any more)
const bCard = await page.evaluate(() => {
  const d = [...document.querySelectorAll("div")].find(x => (x.textContent || "").includes("log-B.pdf") && (x.textContent || "").length < 400);
  return d ? d.textContent : "";
});
pass("item B's reason no longer blames the (now-real) truck 2651", !/Truck 2651 not in fleet roster/.test(bCard), bCard.slice(0, 200));
pass("item B's reason now names the actual remaining problem (400 gal on 0424)", /400 gallons on one truck.*truck 0424/.test(bCard), bCard.slice(0, 200));
pass("item B no longer offers a roster-fix button (its blocker isn't a roster issue)", !/➕ Add #|🔀 It's really/.test(bCard));

// ── truck 2651 must actually be a real fleet member now, not just a toast claim ──
// The default Fleet view is the list/table, which glues truck numbers directly onto
// the make name with no separator ("2651Freightliner") and no "#" prefix — \b would
// never fire at that boundary since both characters are \w. Match on digit-adjacency
// instead, and read past the toast (still on screen here) by excluding its wrapper.
await page.evaluate(() => {
  const b = [...document.querySelectorAll("button")].find(x => (x.textContent || "").trim().replace(/\d+$/, "").trim() === "Fleet");
  if (b) b.click();
});
await new Promise(r => setTimeout(r, 500));
const fleetBody = await page.evaluate(() => {
  const root = document.getElementById("root").cloneNode(true);
  const toastWrap = [...root.querySelectorAll("div")].find(d => d.style.zIndex === "9999");
  if (toastWrap) toastWrap.remove();
  return root.textContent || "";
});
pass("landed on the Fleet tab (Box Trucks table rendered)", /Box Trucks/.test(fleetBody));
pass("truck 2651 really is on the Fleet roster now, not just named in a toast", /(?<!\d)2651(?!\d)/.test(fleetBody));

await browser.close();
server.close();
console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
process.exit(failed ? 1 : 0);
