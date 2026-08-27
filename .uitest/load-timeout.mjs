/**
 * Reported twice from the yard, both times on a weak LTE signal: the app sits on a
 * bare spinner and never comes up.
 *
 * The initial load had no time limit and no way to fail. Every read is written
 * `.catch(()=>null)`, which handles a read that REJECTS — but a Firestore read on a
 * stalled connection does not reject, it never settles. Promise.all then never
 * resolves, setLoaded(true) never runs, and the app renders its bare spinner forever
 * with nothing to act on and no way to retry short of killing the tab.
 *
 * Worse than the hang: had it simply fallen through on failure, the roster fallbacks
 * (`Array.isArray(t)&&t.length ? t : [...ST,...TR]`) would seed the BUILT-IN truck and
 * driver lists, and the first save afterwards would write those over a real fleet. So
 * a failed load must stop, not proceed on invented data.
 *
 * Drives the real app against a Firestore stub that hangs, one that errors, and one
 * that reports every document simply missing (an ordinary first run, which must still
 * start up normally).
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
const PORT = 8461;

const KV = {
  "fl-trucks": JSON.stringify([{ id: "0424", mk: "FRTLN", type: "straight", tr: "A", ax: "Single" }]),
  "fl-drivers": JSON.stringify([{ name: "Alvarez, R", role: "Davis Straight Driver", category: "Davis" }]),
  "fl-repairs": "[]", "fl-costs": "[]", "fl-review-queue": "[]",
};

// mode: "ok" | "hang" | "error" | "missing"
const makeHtml = (mode) => {
  let html = readFileSync(path.join(REPO, "index.html"), "utf8")
    .replace(/<script src="https:\/\/www\.gstatic\.com\/firebasejs[^>]*><\/script>/g, "")
    .replace(/https:\/\/unpkg\.com\/react@18\/umd\/react\.production\.min\.js/g, "/vendor/react.js")
    .replace(/https:\/\/unpkg\.com\/react-dom@18\/umd\/react-dom\.production\.min\.js/g, "/vendor/react-dom.js")
    .replace(/https:\/\/unpkg\.com\/@babel\/standalone@7\.24\.0\/babel\.min\.js/g, "/vendor/babel.js");
  const STUB = `<script>
window.__KV = ${JSON.stringify(KV)};
window.__MODE = ${JSON.stringify(mode)};
const never = () => new Promise(() => {});                 // never settles — a stalled read
const boom  = () => Promise.reject(new Error("Failed to get document because the client is offline."));
const gone  = () => Promise.reject(new Error("not found"));
function mq(lo, hi) {
  return { where(f, op, v) { return op === ">=" ? mq(v, hi) : op === "<" ? mq(lo, v) : mq(lo, hi); },
    async get() {
      if (window.__MODE === "hang") return never();
      if (window.__MODE === "error") return boom();
      const ids = Object.keys(window.__KV).filter(i => (lo === null || i >= lo) && (hi === null || i < hi));
      return { forEach(cb) { ids.forEach(i => cb({ id: i, data: () => ({ v: window.__KV[i] }) })); } };
    } };
}
const mk = (id) => ({
  get() {
    if (window.__MODE === "hang") return never();
    if (window.__MODE === "error") return boom();
    if (window.__MODE === "missing") return gone();
    const v = window.__KV[id];
    if (v === undefined) return gone();
    return Promise.resolve({ exists: true, data: () => ({ v }) });
  },
  async set(o) { window.__KV[id] = o.v; return true; },
  async delete() { delete window.__KV[id]; },
  onSnapshot(cb) { setTimeout(() => cb({ forEach() {} }), 0); return () => {}; }
});
window.__DB = { collection() { const q = mq(null, null); return { doc: mk, where: q.where, get: q.get }; } };
window.firebase = { initializeApp() {}, firestore() { return window.__DB; } };
window.firebase.firestore.FieldPath = { documentId: () => "__name__" };
window.storage = {
  async get(key) { const d = await window.__DB.collection("kv").doc(key).get(); if (!d.exists) throw new Error("not found"); return { key, value: d.data().v }; },
  async set(key, value) { await window.__DB.collection("kv").doc(key).set({ v: value }); return { key, value }; },
  async delete(key) { return { key, deleted: true }; },
  async list(prefix) {
    const snap = await window.__DB.collection("kv").get();
    const keys = [], values = {};
    snap.forEach(d => { if (!prefix || d.id.startsWith(prefix)) { keys.push(d.id); values[d.id] = d.data().v; } });
    return { keys, values };
  }
};
localStorage.setItem("fl-device-user", "Harness");
</script>`;
  return html.replace("</head>", STUB + "</head>");
};

await ensureVendor();
const appSrc = readFileSync(path.join(REPO, "App.jsx"), "utf8");
let MODE = "ok";
const server = http.createServer((req, res) => {
  if (req.url.startsWith("/App.jsx")) { res.writeHead(200, { "Content-Type": "application/javascript" }); return res.end(appSrc); }
  if (req.url.startsWith("/vendor/")) { res.writeHead(200, { "Content-Type": "application/javascript" }); return res.end(readFileSync(path.join(here, "vendor", path.basename(req.url)))); }
  res.writeHead(200, { "Content-Type": "text/html" }); res.end(makeHtml(MODE));
}).listen(PORT);

let failed = 0;
const pass = (label, ok, extra = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? "  — " + extra : ""}`); };

const browser = await launch();

const boot = async (mode, waitMs) => {
  MODE = mode;
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, waitMs));
  const state = await page.evaluate(() => {
    const root = document.getElementById("root");
    const txt = (root && root.textContent) || "";
    const btn = [...document.querySelectorAll("button")].find(b => /Try again/i.test(b.textContent || ""));
    return {
      txt: txt.replace(/\s+/g, " "),
      offline: /Can.t reach the database/i.test(txt),
      // "still spinning" = neither errored nor mounted. Matching the spinner's own
      // text would also match the error copy, which says "loading your fleet" too.
      stuck: !/Can.t reach the database/i.test(txt) && !/Weekly Board/.test(txt),
      mounted: /Weekly Board/.test(txt),
      hasRetry: !!btn,
    };
  });
  return { page, state, errs };
};

// LOAD_TIMEOUT_MS is 20s; wait past it.
console.log("\n═ a stalled connection: the exact symptom from the yard ═");
{
  const { page, state, errs } = await boot("hang", 26000);
  pass("no page errors", errs.length === 0, errs.slice(0, 2).join(" | "));
  pass("does NOT sit on a spinner forever", !state.stuck);
  pass("says it cannot reach the database", state.offline, state.txt.slice(0, 120));
  pass("offers a Try again button", state.hasRetry);
  pass("reassures that nothing was lost", /Nothing has been changed or lost/i.test(state.txt));
  pass("does NOT enter the app on invented data", !state.mounted);
  await page.close();
}

console.log("\n═ a database that errors outright ═");
{
  const { page, state } = await boot("error", 6000);
  pass("also stops with the same screen", state.offline, state.txt.slice(0, 120));
  pass("does NOT seed the built-in roster and carry on", !state.mounted);
  await page.close();
}

console.log("\n═ Try again actually recovers ═");
{
  MODE = "hang";
  const page = await browser.newPage();
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  await new Promise(r => setTimeout(r, 26000));
  const stuck = await page.evaluate(() => /Can.t reach the database/i.test(document.getElementById("root").textContent || ""));
  pass("starts on the error screen", stuck);
  // The signal comes back, then the operator taps the button.
  await page.evaluate(() => { window.__MODE = "ok"; });
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find(x => /Try again/i.test(x.textContent || ""));
    if (b) b.click();
  });
  await page.waitForFunction(() => /Weekly Board/.test(document.getElementById("root").textContent || ""), { timeout: 30000 }).catch(() => {});
  const after = await page.evaluate(() => {
    const t = document.getElementById("root").textContent || "";
    return { mounted: /Weekly Board/.test(t), stillError: /Can.t reach the database/i.test(t), hasTruck: /0424/.test(t) };
  });
  pass("the app comes up on retry, no reload needed", after.mounted);
  pass("the error screen is gone", !after.stillError);
  pass("and it has the REAL roster, not the built-in defaults", after.hasTruck);
  await page.close();
}

console.log("\n═ a genuine first run still starts up ═");
{
  // Every document legitimately absent. This must NOT be mistaken for being offline,
  // or a brand-new install could never get past the error screen.
  const { page, state } = await boot("missing", 8000);
  pass("does not show the offline screen", !state.offline, state.txt.slice(0, 120));
  pass("boots into the app on seeded defaults", state.mounted);
  await page.close();
}

await browser.close();
server.close();
console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
process.exit(failed ? 1 : 0);
