/**
 * Reported from a phone showing full bars and wifi: the app stops on "Can't reach the
 * database". The old screen blamed a weak signal. It was wrong, and this is why.
 *
 * The whole first load was ONE race:
 *
 *     withTimeout(Promise.all([ ...eight documents..., reviewQueue ]), 20s)
 *
 * a single ceiling over nine concurrent reads. Any one slow document — and this
 * install has documents near Firestore's 1 MB limit — burned the shared budget, threw
 * away the eight reads that had already ARRIVED, and put the whole app on the error
 * screen. Nothing was wrong with the connection; one document was just big.
 *
 * Two more failures behind the same line:
 *
 *   - The fallback `looksOffline()` only tripped when EVERY read failed. So a single
 *     failed fl-trucks read fell straight through to
 *     `setTrucks(Array.isArray(t)&&t.length ? t : [...ST,...TR])` — the built-in demo
 *     roster — and the first save wrote it over the real fleet. The check has to be per
 *     document, on the one that matters, not all-or-nothing.
 *
 *   - `await loadCostsFromShards(true)` ran AFTER the timeout guard and BEFORE the
 *     first render, with no ceiling of any kind. The ledger is the largest thing this
 *     app reads (a documentId() query plus every month's shard), so a slow ledger held
 *     the app on a bare spinner indefinitely — the other reported symptom.
 *
 * Drives the real app against a Firestore stub that can stall or fail individual
 * documents while the rest answer normally.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { buildApp, patchHtml, serveAsset } from "./appbuild.mjs";
import http from "http";

const PORT = 8473;
const REAL_TRUCK = "0424", REAL_DRIVER = "Alvarez, R";
const KV = {
  "fl-trucks": JSON.stringify([{ id: REAL_TRUCK, mk: "FRTLN", type: "straight", tr: "A", ax: "Single" }]),
  "fl-drivers": JSON.stringify([{ name: REAL_DRIVER, role: "Davis Straight Driver", category: "Davis" }]),
  "fl-repairs": "[]", "fl-review-queue": "[]",
  "fl-costs-2026-09": JSON.stringify([{ id: "c1", truckId: REAL_TRUCK, vendor: "Complete Fleet Services",
    date: "2026-09-04", total: 5755.63, category: "Repair", invoiceNum: "CFS-11016" }]),
};

// __STALL / __FAIL hold key prefixes. Everything not listed answers normally, which is
// the whole point: these are partial failures, not an outage.
const STUB = `<script>
window.__KV = ${JSON.stringify(KV)};
// Adopted from evaluateOnNewDocument, which runs before any page script — setting
// these afterwards let the app finish its reads first, so a 'stalled' document was
// never actually stalled and the test passed without testing anything.
window.__STALL = (window.__PRESET && window.__PRESET.s) || [];
window.__FAIL  = (window.__PRESET && window.__PRESET.f) || [];
window.__WROTE = [];
const hit = (list, id) => list.some(p => id === p || id.startsWith(p));
const never = () => new Promise(() => {});
const boom  = () => Promise.reject(new Error("Failed to get document because the client is offline."));
const gone  = () => Promise.reject(new Error("not found"));
function mq(lo, hi) {
  return { where(f, op, v) { return op === ">=" ? mq(v, hi) : op === "<" ? mq(lo, v) : mq(lo, hi); },
    async get() {
      const label = lo || "";
      if (hit(window.__STALL, label)) return never();
      if (hit(window.__FAIL, label)) return boom();
      const ids = Object.keys(window.__KV).filter(i => (lo === null || i >= lo) && (hi === null || i < hi));
      return { forEach(cb) { ids.forEach(i => cb({ id: i, data: () => ({ v: window.__KV[i] }) })); } };
    } };
}
const mk = (id) => ({
  get() {
    if (hit(window.__STALL, id)) return never();
    if (hit(window.__FAIL, id)) return boom();
    const v = window.__KV[id];
    if (v === undefined) return gone();
    return Promise.resolve({ exists: true, data: () => ({ v }) });
  },
  async set(o) { window.__WROTE.push(id); window.__KV[id] = o.v; return true; },
  async delete() { delete window.__KV[id]; },
  onSnapshot(cb) { setTimeout(() => cb({ forEach() {} }), 0); return () => {}; }
});
window.__DB = { collection() { const q = mq(null, null); return { doc: mk, where: q.where, get: q.get }; } };
window.__DB.settings=function(o){window.__SETTINGS=o;};
window.firebase = { initializeApp() {}, firestore() { return window.__DB; } };
window.firebase.firestore.FieldPath = { documentId: () => "__name__" };
window.storage = {
  async get(key) { const d = await window.__DB.collection("kv").doc(key).get(); if (!d.exists) throw new Error("not found"); return { key, value: d.data().v }; },
  async set(key, value) { await window.__DB.collection("kv").doc(key).set({ v: value }); return { key, value }; },
  async delete(key) { return { key, deleted: true }; },
  async list(prefix) {
    if (hit(window.__STALL, prefix || "")) return never();
    if (hit(window.__FAIL, prefix || "")) return { keys: [], error: "offline" };
    const snap = await window.__DB.collection("kv").get();
    const keys = [], values = {};
    snap.forEach(d => { if (!prefix || d.id.startsWith(prefix)) { keys.push(d.id); values[d.id] = d.data().v; } });
    return { keys, values };
  }
};
localStorage.setItem("fl-device-user", "Harness");
</script>`;

await ensureVendor();
const built = await buildApp();
const html = patchHtml(STUB);
const server = http.createServer((req, res) => {
  if (serveAsset(req, res, built)) return;
  res.writeHead(200, { "Content-Type": "text/html" }); res.end(html);
}).listen(PORT);

let failed = 0;
const pass = (l, ok, x = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${l}${x ? "  — " + x : ""}`); };
// #root carries an injected <style>; its rules are not something the user can read, and
// letting them into the haystack makes every assertion and diagnostic untrustworthy.
const TEXT_FN = `window.__text = function(){
  const r = document.getElementById("root"); if (!r) return "";
  const c = r.cloneNode(true);
  c.querySelectorAll("style").forEach(function(e){ e.remove(); });
  return c.textContent || "";
};`;

const browser = await launch();

// Boots the app with a given set of stalled/failed keys, waits for either the app or
// the error screen, and reports what the page ended up showing.
const boot = async ({ stall = [], fail = [], waitFor, timeout = 30000 }) => {
  const page = await browser.newPage();
  const errs = [];
  page.on("pageerror", e => errs.push(e.message));
  await page.evaluateOnNewDocument((s, f, fn) => { window.__PRESET = { s, f }; eval(fn); }, stall, fail, TEXT_FN);
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
  const t0 = Date.now();
  await page.waitForFunction(waitFor, { timeout, polling: 100 }).catch(() => {});
  const ms = Date.now() - t0;
  const out = await page.evaluate(() => ({
    text: window.__text(),
    wrote: window.__WROTE.slice(),
    kvTrucks: window.__KV["fl-trucks"],
  }));
  return { page, errs, ms, ...out };
};

// ══ 1. one slow document must not discard the eight that arrived ══════════════
console.log("\n═ the reported failure: one big document, full bars ═");
{
  // fl-miles stalls; everything else answers at once. Before, the shared 20s ceiling
  // meant this showed "Can't reach the database".
  const r = await boot({ stall: ["fl-miles"], waitFor: () => /Weekly Board/.test(window.__text()) });
  pass("the app opens instead of claiming the database is unreachable",
    /Weekly Board/.test(r.text) && !/Can.t reach the database/i.test(r.text), r.text.slice(0, 90));
  pass("the real roster is what loaded, not the built-in demo fleet",
    new RegExp(`(?<!\\\\d)${REAL_TRUCK}(?!\\\\d)`).test(r.text), r.text.slice(0, 120));
  pass("no page errors", r.errs.length === 0, r.errs.join(" | "));
  await r.page.close();
}

// ══ 2. a failed roster read must never seed the demo fleet ════════════════════
console.log("\n═ the dangerous one: a failed roster read ═");
{
  const r = await boot({ fail: ["fl-trucks"], waitFor: () => /Can.t reach the database/i.test(window.__text()) });
  pass("it stops rather than starting up on invented data", /Can.t reach the database/i.test(r.text), r.text.slice(0, 90));
  pass("nothing was written to storage", r.wrote.length === 0, r.wrote.join(","));
  pass("the stored roster is untouched", r.kvTrucks === KV["fl-trucks"]);
  pass("the screen names the read that failed, and does not blame the signal",
    /fl-trucks/.test(r.text) && !/weak signal/i.test(r.text), r.text.slice(0, 200));
  pass("it offers a way out", /Try again/.test(r.text));
  await r.page.close();
}

// ══ 3. the ledger must not hold the app shut ══════════════════════════════════
console.log("\n═ the bare spinner: a slow cost ledger ═");
{
  const r = await boot({ stall: ["fl-costs"], waitFor: () => /Weekly Board/.test(window.__text()), timeout: 15000 });
  pass("the app opens without waiting for the ledger", /Weekly Board/.test(r.text), r.text.slice(0, 90));
  pass("and opens promptly — not after a 20s timeout", r.ms < 10000, `${r.ms} ms`);

  const costs = await r.page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find(x => /^\s*(💰|Costs)/.test(x.textContent || ""));
    if (b) b.click();
    return new Promise(res => setTimeout(() => res(window.__text()), 600));
  });
  pass("the Costs tab says the ledger is still coming, rather than showing an empty one",
    /Loading the cost ledger/i.test(costs), costs.slice(0, 160));
  await r.page.close();
}

// ══ 4. a healthy load still behaves ═══════════════════════════════════════════
console.log("\n═ nothing stalled: the ordinary case still works ═");
{
  const r = await boot({ waitFor: () => /Weekly Board/.test(window.__text()) });
  pass("the app opens", /Weekly Board/.test(r.text));
  pass("promptly", r.ms < 8000, `${r.ms} ms`);
  pass("no page errors", r.errs.length === 0, r.errs.join(" | "));
  const ledger = await r.page.evaluate(() => new Promise(res => setTimeout(() => {
    const b = [...document.querySelectorAll("button")].find(x => /^\s*(💰|Costs)/.test(x.textContent || ""));
    if (b) b.click();
    setTimeout(() => res(window.__text()), 600);
  }, 1200)));
  pass("the ledger arrives behind it and the banner goes away",
    !/Loading the cost ledger/i.test(ledger), ledger.slice(0, 160));
  pass("and the invoice is there", /5,?755/.test(ledger), ledger.slice(0, 200));
  await r.page.close();
}

console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
await browser.close(); server.close();
process.exit(failed ? 1 : 0);
