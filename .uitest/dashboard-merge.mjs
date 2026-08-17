/**
 * Dispatch and Dashboard were two tabs showing one screen's worth of information —
 * four of the six live tiles restated counts the dispatch lists already showed, with
 * the unit and driver names attached. They are one tab now, named Dashboard.
 *
 * Asserts against the REAL rendered app: the Dispatch tab is gone, Dashboard is where
 * you land, and the merged screen carries BOTH halves — the stat tiles and the daily
 * assignment lists — in that order, summary before the detail it summarises.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
const PORT = 8413;

const KV = {
  "fl-trucks": JSON.stringify([
    { id: "0424", mk: "FRTLN", type: "straight", tr: "A", ax: "Single" },
    { id: "0451", mk: "HINO", type: "straight", tr: "M", ax: "Single" },
    { id: "1506", mk: "INTL", type: "tractor", tr: "A", ax: "Tandem" },
  ]),
  "fl-drivers": JSON.stringify(["Alvarez, R", "Boone, T", "Childs, M"]),
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
  if (req.url.startsWith("/App.jsx")) {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    return res.end(appSrc);
  }
  if (req.url.startsWith("/vendor/")) {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    return res.end(readFileSync(path.join(here, "vendor", path.basename(req.url))));
  }
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
await page.waitForFunction(
  () => { const r = document.getElementById("root"); return r && !r.querySelector("#loading"); },
  { timeout: 45000 }
).catch(() => {});

const r = await page.evaluate(() => {
  const tabs = [...document.querySelectorAll("button")]
    .map(b => (b.textContent || "").trim())
    .filter(t => ["Dashboard", "Dispatch", "Weekly Board", "Fleet", "Maintenance", "Costs", "Drivers", "Attendance"].includes(t));
  const body = document.getElementById("root").textContent || "";
  const at = (s) => body.indexOf(s);
  return {
    tabs,
    activeTabText: (document.querySelector("button[style*='rgb(30, 91, 146)']") || {}).textContent || "",
    hasTiles: /Total Fleet/.test(body),
    hasDispatchLists: /AVAILABLE TRUCKS|ON THE ROAD|NEEDS TRUCK|DOWN \/ OOS/.test(body),
    hasFleetByType: /Fleet by Type/.test(body),
    hasAdvisor: /AI Fleet Advisor/.test(body),
    // summary must come before the detail it summarises
    iTiles: at("Total Fleet"),
    iLists: Math.min(...["AVAILABLE TRUCKS", "ON THE ROAD", "DOWN / OOS"].map(at).filter(i => i >= 0).concat([1e9])),
    iByType: at("Fleet by Type"),
  };
});

let failed = 0;
const pass = (label, ok, extra = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? "  — " + extra : ""}`); };

console.log(`\npage errors: ${errs.length ? errs.slice(0, 3).join(" | ") : "none"}\n`);
pass("no page errors", errs.length === 0);
pass("Dispatch tab is gone", !r.tabs.includes("Dispatch"), r.tabs.join(" · "));
pass("Dashboard tab still exists", r.tabs.includes("Dashboard"));
pass("seven tabs, not eight", r.tabs.length === 7, `${r.tabs.length}`);
pass("lands on Dashboard by default", /Dashboard/.test(r.activeTabText), r.activeTabText.trim());
pass("merged screen shows the stat tiles", r.hasTiles);
pass("merged screen shows the daily assignment lists", r.hasDispatchLists);
pass("Fleet by Type survived the merge", r.hasFleetByType);
pass("AI Fleet Advisor survived the merge", r.hasAdvisor);
pass("tiles render before the lists they summarise", r.iTiles >= 0 && r.iTiles < r.iLists, `tiles@${r.iTiles} lists@${r.iLists}`);
pass("standing fleet breakdown comes after the daily lists", r.iByType > r.iLists, `byType@${r.iByType} lists@${r.iLists}`);

await browser.close();
server.close();
console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
process.exit(failed ? 1 : 0);
