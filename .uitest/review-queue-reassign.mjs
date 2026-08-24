/**
 * Review Queue: "Truck 2651 not in fleet roster" isn't always a missing truck — it can
 * be a vendor typo or an OCR digit-transposition on a truck that's already in the
 * fleet (2651 for 2561). Reported directly, right after the "add missing truck" button
 * shipped: blindly adding "2651" as a phantom truck would have been actively wrong
 * here, since the real fix is correcting the invoices to point at the truck that
 * actually exists.
 *
 * Drives the real "🔀 It's really a different truck" action end to end: (a) refuses a
 * target that isn't a real fleet truck either, without touching anything, (b) on a
 * valid target, rewrites the truck ID on every queued row that had the missing one and
 * imports whichever items are now fully clean, (c) leaves an item with an independent
 * problem (an over-limit gallons row on a KNOWN truck) in the queue, but with the
 * truck ID corrected and the displayed reason refreshed to the REAL remaining problem
 * — not a stale "not in fleet roster" for a truck its rows no longer even mention, (d)
 * leaves a different missing-truck item alone, (e) never adds a new truck as a side
 * effect — a reassignment must not silently create the very phantom it's meant to
 * avoid, and (f) never offers the button on an item flagged for an unrelated reason.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
const PORT = 8432;

const row = (o) => ({ id: Math.random(), vendor: "FuelFox Atlanta", category: "Fuel", date: "2026-05-21", ...o });

const REVIEW_QUEUE = [
  { // E — clean, clearable once 2651 is corrected to 2561
    id: "qe", vendor: "FuelFox Atlanta", filename: "log-E.pdf",
    confidenceReason: "Truck 2651 not in fleet roster",
    parsed: [
      row({ truckId: "0424", total: 353.09, gallons: 80, invoiceNum: "FF-E-0424" }),
      row({ truckId: "0608", total: 97.20, gallons: 22, invoiceNum: "FF-E-0608" }),
      row({ truckId: "2651", total: 210.00, gallons: 48, invoiceNum: "FF-E-2651" }),
    ],
  },
  { // E2 — same missing truck, also clean, also clearable
    id: "qe2", vendor: "FuelFox Atlanta", filename: "log-E2.pdf",
    confidenceReason: "Truck 2651 not in fleet roster",
    parsed: [
      row({ truckId: "0608", total: 88.40, gallons: 20, invoiceNum: "FF-E2-0608" }),
      row({ truckId: "2651", total: 199.50, gallons: 45, invoiceNum: "FF-E2-2651" }),
    ],
  },
  { // F — same missing truck, but a DIFFERENT row has an independent problem
    // (400 gal on 0424 — over the 250-gal tank limit). Must NOT auto-clear, but the
    // 2651 row must still become 2561, and the reason must stop blaming 2651.
    id: "qf", vendor: "FuelFox Atlanta", filename: "log-F.pdf",
    confidenceReason: "Truck 2651 not in fleet roster",
    parsed: [
      row({ truckId: "0424", total: 5000, gallons: 400, invoiceNum: "FF-F-0424" }),
      row({ truckId: "2651", total: 210.00, gallons: 48, invoiceNum: "FF-F-2651" }),
    ],
  },
  { // G — a DIFFERENT missing truck. Reassigning 2651 must not touch this one.
    id: "qg", vendor: "FuelFox Atlanta", filename: "log-G.pdf",
    confidenceReason: "Truck 9999 not in fleet roster",
    parsed: [
      row({ truckId: "0424", total: 100, gallons: 20, invoiceNum: "FF-G-0424" }),
      row({ truckId: "9999", total: 90, gallons: 18, invoiceNum: "FF-G-9999" }),
    ],
  },
  { // H — an unrelated reason. No roster-fix buttons should render at all.
    id: "qh", vendor: "FuelFox Atlanta", filename: "log-H.pdf",
    confidenceReason: "Missing invoice number",
    parsed: [row({ truckId: "0424", total: 50, gallons: 10, invoiceNum: null })],
  },
];

const KV = {
  "fl-trucks": JSON.stringify([
    { id: "0424", mk: "FRTLN", type: "straight", tr: "A", ax: "Single" },
    { id: "0608", mk: "FRTLN", type: "straight", tr: "A", ax: "Single" },
    { id: "2561", mk: "FRTLN", type: "straight", tr: "A", ax: "Single" }, // the REAL truck 2651 was a typo for
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

const dialogText = () => page.evaluate(() => {
  const overlay = [...document.querySelectorAll("div")].find(d => d.style.zIndex === "10000");
  return (overlay && overlay.innerText) || "";
});
const toastText = () => page.evaluate(() => {
  const wrap = [...document.querySelectorAll("div")].find(d => d.style.zIndex === "9999");
  return (wrap && wrap.innerText) || "";
});
const cardText = (filename) => page.evaluate((fn) => {
  const d = [...document.querySelectorAll("div")].find(x => (x.textContent || "").includes(fn) && (x.textContent || "").length < 400);
  return d ? d.textContent : "";
}, filename);

let failed = 0;
const pass = (label, ok, extra = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? "  — " + extra : ""}`); };

// ── Before touching anything: both roster-fix buttons appear together, only where relevant ──
const buttonMap = await page.evaluate(() => {
  const out = {};
  document.querySelectorAll("div").forEach(d => {
    const txt = d.textContent || "";
    ["log-E.pdf", "log-E2.pdf", "log-F.pdf", "log-G.pdf", "log-H.pdf"].forEach(fn => {
      if (txt.includes(fn) && txt.length < 400 && d.querySelector("button")) {
        out[fn] = out[fn] || { add: /➕ Add #/.test(txt), reassign: /🔀 It's really/.test(txt) };
      }
    });
  });
  return out;
});
pass("reassign button offered on item E (2651 missing)", buttonMap["log-E.pdf"]?.reassign === true);
pass("reassign button offered on item G (9999 missing)", buttonMap["log-G.pdf"]?.reassign === true);
pass("add button ALSO offered alongside it on item E", buttonMap["log-E.pdf"]?.add === true);
pass("NO roster-fix buttons on item H (unrelated reason)", buttonMap["log-H.pdf"]?.add !== true && buttonMap["log-H.pdf"]?.reassign !== true, JSON.stringify(buttonMap));

// ── Click reassign on #2651, but enter a target that isn't a real truck either ──
const clickReassign2651 = () => page.evaluate(() => {
  const btn = [...document.querySelectorAll("button")].find(b => /🔀 It's really a different truck/.test(b.textContent || "") && b.closest("div")?.parentElement?.textContent?.includes("log-E.pdf"));
  const anyBtn = btn || [...document.querySelectorAll("button")].find(b => /🔀 It's really a different truck/.test(b.textContent || ""));
  if (anyBtn) { anyBtn.click(); return true; }
  return false;
});
pass("clicked the reassign button for #2651", await clickReassign2651());
await new Promise(r => setTimeout(r, 300));

let promptText = await dialogText();
pass("reassign prompt names the missing truck", /#2651/.test(promptText));

let inputHandle = await page.evaluateHandle(() => {
  const overlay = [...document.querySelectorAll("div")].find(d => d.style.zIndex === "10000");
  return overlay ? overlay.querySelector("input") : null;
});
await inputHandle.type("9999"); // not a real fleet truck either
pass("submitted the (invalid) target", await clickButtonWithText("OK"));
await new Promise(r => setTimeout(r, 400));

const errToast = await toastText();
pass("rejected: target isn't a real truck either", /isn't a truck in the fleet either/.test(errToast), errToast.slice(0, 200));

let afterReject = await page.evaluate(() => document.body.innerText || "");
pass("nothing changed yet — item E still queued", /log-E\.pdf/.test(afterReject));
pass("nothing changed yet — item F still queued", /log-F\.pdf/.test(afterReject));
pass("nothing changed yet — queue is still 5 items", /Review Queue \(5\)/.test(afterReject), (afterReject.match(/Review Queue \(\d+\)/) || [""])[0]);

// ── Now do it for real, with the correct existing truck ──
pass("clicked the reassign button for #2651 again", await clickReassign2651());
await new Promise(r => setTimeout(r, 300));

inputHandle = await page.evaluateHandle(() => {
  const overlay = [...document.querySelectorAll("div")].find(d => d.style.zIndex === "10000");
  return overlay ? overlay.querySelector("input") : null;
});
await inputHandle.type("2561");
pass("submitted the (valid) target", await clickButtonWithText("OK"));
await new Promise(r => setTimeout(r, 300));

const confirmText = await dialogText();
pass("confirm dialog names both truck numbers", /#2651/.test(confirmText) && /#2561/.test(confirmText));
pass("confirm dialog counts all 3 queued invoices referencing 2651 (E, E2, F)", /3 queued invoice/.test(confirmText), confirmText.slice(0, 300));

pass("confirmed the reassignment", await clickButtonWithText("OK"));
await new Promise(r => setTimeout(r, 600));

const result = await page.evaluate(() => document.body.innerText || "");

pass("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));
pass("item E is gone from the queue (imported)", !/log-E\.pdf/.test(result));
pass("item E2 is gone from the queue (imported)", !/log-E2\.pdf/.test(result));
pass("item F (gallon-blocked) is STILL in the queue", /log-F\.pdf/.test(result));
pass("item G (different missing truck) is STILL in the queue", /log-G\.pdf/.test(result));
pass("item H (unrelated reason) is STILL in the queue", /log-H\.pdf/.test(result));
pass("review queue count dropped from 5 to 3", /Review Queue \(3\)/.test(result), (result.match(/Review Queue \(\d+\)/) || [""])[0]);

const fCard = await cardText("log-F.pdf");
pass("item F's truck ID actually changed from 2651 to 2561", !/Truck #2651/.test(fCard) && /Truck #2561/.test(fCard), fCard.slice(0, 250));
pass("item F's reason no longer blames 2651", !/Truck 2651 not in fleet roster/.test(fCard));
pass("item F's reason now names the real remaining problem (400 gal on 0424)", /400 gallons on one truck.*truck 0424/.test(fCard));
pass("item F no longer offers a roster-fix button", !/➕ Add #|🔀 It's really/.test(fCard));

// The default Fleet view is the list/table, which renders bare truck numbers with NO
// "#" prefix (only the tile view does that) — and the success toast's own text
// ("Reassigned #2651 → #2561…") can still be on screen here (5s auto-dismiss) and
// would contain "2651" too, so exclude it explicitly and match the real column format.
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
pass("landed on the Fleet tab (Box Trucks table rendered)", /Box Trucks/.test(fleetBody), fleetBody.slice(0, 120));
// digit-only boundary, not \b: the table's flattened textContent glues "2561" directly
// onto "Freightliner" with no separator, and both "1" and "F" are \w — \b would never
// fire there. Only reject a match glued to ANOTHER digit (e.g. inside "12561" or "25610").
const numberAppears = (n, text) => new RegExp(`(?<!\\d)${n}(?!\\d)`).test(text);
pass("reassigning did NOT create a new phantom truck 2651", !numberAppears(2651, fleetBody), numberAppears(2651, fleetBody) ? "found 2651 on the Fleet tab" : "");
pass("truck 2561 (the real target) is still there", numberAppears(2561, fleetBody));

await browser.close();
server.close();
console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
process.exit(failed ? 1 : 0);
