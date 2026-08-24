/**
 * Weekly Board → Driver / Truck Assignments table.
 *
 * A day cell with an assignment renders two lines (the truck # badge, then its
 * type — e.g. "7608" / "Tractor M"). An empty cell renders one line (a dash). Every
 * <td> in the table shares the same dayCol style, which has no minHeight, so a row
 * with even ONE assignment somewhere in its five days is taller than a fully-empty
 * row — the table's row rhythm jumps up and down as you scroll past whichever
 * drivers happen to be scheduled, which is what was reported as a formatting bug.
 *
 * This drives the real table with a realistic driver list (mirroring the reported
 * screenshot: two assigned drivers inside an otherwise-unassigned group) and measures
 * actual rendered row heights — not just markup — so the assertion is the thing a
 * person actually sees.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
const PORT = 8425;

// Mirrors gM()/wK() in App.jsx exactly, so the seeded assignment lands under the
// same key the app looks it up with for "this week".
function gM(d) { const dt = new Date(d); const dy = dt.getDay(); dt.setDate(dt.getDate() - dy + (dy === 0 ? -6 : 1)); dt.setHours(0, 0, 0, 0); return dt; }
function wK(d) { const m = gM(d); return `${m.getFullYear()}-${String(m.getMonth() + 1).padStart(2, "0")}-${String(m.getDate()).padStart(2, "0")}`; }
const thisWeekKey = wK(new Date());

const DRIVERS = [
  "Allen Council", "Anthony Kostner", "Brent Bryd", "Brian Worley", "Che Roberts",
  "Chris Head", "Darvin Cepeda", "Denis Salkic", "Garry Pitts", "Jim Pallette",
  "Marcus Young",
].map(name => ({ name, role: "Davis Tractor Driver", category: "Davis" }));

const KV = {
  "fl-trucks": JSON.stringify([{ id: "7608", mk: "Tractor", tr: "M", ax: "Single", type: "tractor" }]),
  "fl-drivers": JSON.stringify(DRIVERS),
  "fl-repairs": "[]",
  "fl-costs": "[]",
  "fl-review-queue": "[]",
  // Only ONE driver, in the middle of the list, has a Monday assignment — same shape
  // as the reported screenshot (most rows blank, one or two rows with a truck).
  [`fl-asgn-${thisWeekKey}`]: JSON.stringify({ "Garry Pitts-Mon": "7608" }),
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
  const b = [...document.querySelectorAll("button")].find(x => (x.textContent || "").trim().replace(/\d+$/, "").trim() === "Weekly Board");
  if (b) b.click();
});
await new Promise(r => setTimeout(r, 700));

const info = await page.evaluate(() => {
  const table = document.querySelector("table");
  if (!table) return { found: false };
  // Data rows have 6 <td>s (driver name + Mon..Fri); the role-divider rows use a
  // single colSpan=6 <td> and are excluded.
  const rows = [...table.querySelectorAll("tbody tr")].filter(tr => tr.children.length === 6);
  const heights = rows.map(tr => Math.round(tr.getBoundingClientRect().height));
  const heightOf = (namePart) => {
    const tr = rows.find(r => (r.children[0].textContent || "").includes(namePart));
    return tr ? Math.round(tr.getBoundingClientRect().height) : undefined;
  };
  return {
    found: true,
    rowCount: rows.length,
    heights,
    garryHeight: heightOf("Garry Pitts"),
    plainHeight: heightOf("Anthony Kostner"),
    bodyText: (document.getElementById("root").textContent || ""),
  };
});

let failed = 0;
const pass = (label, ok, extra = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? "  — " + extra : ""}`); };

console.log(`\npage errors: ${errs.length ? errs.slice(0, 3).join(" | ") : "none"}\n`);
pass("no page errors", errs.length === 0);
pass("the Driver → Truck table rendered", info.found);
pass("all 11 driver rows present", info.rowCount === 11, `rowCount=${info.rowCount}`);
pass("the truck badge still shows", /7608/.test(info.bodyText));
pass("the truck type still shows", /Tractor M/.test(info.bodyText));
pass("empty cells still show a dash", /—/.test(info.bodyText));

const distinct = new Set(info.heights);
pass("EVERY row in the table is the same height", distinct.size === 1,
  `heights seen: ${[...distinct].join(", ")}px across ${info.heights.length} rows`);
pass("the assigned row (Garry Pitts) is not taller than a plain row",
  info.garryHeight === info.plainHeight, `Garry Pitts=${info.garryHeight}px, Anthony Kostner=${info.plainHeight}px`);

await browser.close();
server.close();
console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
process.exit(failed ? 1 : 0);
