/**
 * Drives the REAL /api/auto-sync handler against stubbed Gmail, Anthropic, Firestore
 * and Blobs, with state persisting between runs as the scheduled sync sees it. The
 * Firestore stub enforces the real 1,048,487-byte property limit; the Anthropic stub
 * models the thing that actually breaks these runs — generating every line of a huge
 * invoice takes longer than a run has, while a summary-only pass returns promptly.
 */
import * as esbuild from "esbuild";
import { fileURLToPath } from "url";
import path from "path";

const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..");

await esbuild.build({
  entryPoints: [path.join(repo, "netlify/functions/auto-sync.mts")],
  bundle: true, format: "esm", platform: "node", outfile: path.join(here, "bundle.mjs"),
  alias: {
    "@netlify/blobs": path.join(here, "stubs/blobs.mjs"),
    "firebase/app": path.join(here, "stubs/fb-app.mjs"),
    "firebase/firestore": path.join(here, "stubs/firestore.mjs"),
    "pdf-parse": path.join(here, "stubs/pdf-parse.mjs"),
  },
  logLevel: "silent",
});
const mod = await import(path.join(here, "bundle.mjs") + "?v=" + Date.now());
const handler = mod.default;
const TUNING = mod.TUNING;

globalThis.Netlify = { env: { get: (k) => ({ GOOGLE_CLIENT_ID: "cid", GOOGLE_CLIENT_SECRET: "cs", ANTHROPIC_API_KEY: "ak", URL: "http://self.test" })[k] } };

const NET = { listDelay: 2, getDelay: 4, attDelay: 3, aiDelay: {}, aiDefaultDelay: 15, aiFailTimes: {}, aiSlowFull: {} };
let GMAIL = [];
let COUNTS;
const resetCounts = () => { COUNTS = { list: 0, get: {}, att: {}, aiStart: {}, aiDone: {}, aiFull: {}, aiCompact: {}, token: 0, aidGen: 0, multiParse: 0 }; };
resetCounts();

const dstr = (d) => new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);
const mkMsg = (vk, i, daysAgo, o = {}) => ({
  id: o.id || `${vk}-m${i}`, vendorKey: vk, date: dstr(daysAgo),
  atts: [{ aid: "a1", filename: o.filename || `inv-${o.num || i}.pdf`, mime: "application/pdf",
    pdfText: o.image ? null : `INV|${o.num || `${vk.toUpperCase()}-${i}`}|${o.truck || "0154"}|${o.total || 100}|${dstr(daysAgo)}|${o.conf || "high"}|${o.pad || 0}`
      // A fuel service log: one PDF, every unit filled that day. `multi` is the
      // per-unit table the document prints.
      + (o.multi ? `|MULTI=${o.multi.map(([t, a]) => `${t}:${a}`).join(",")}` : "") }],
});

const abortErr = (s) => { const e = new Error("aborted"); e.name = s?.reason?.name || "AbortError"; return e; };
const wait = (ms, signal) => new Promise((res, rej) => {
  if (signal?.aborted) return rej(abortErr(signal));
  const t = setTimeout(res, ms);
  signal?.addEventListener("abort", () => { clearTimeout(t); rej(abortErr(signal)); }, { once: true });
});
const resp = (data, status = 200) => ({ ok: status < 300, status, json: async () => data });
const vkOf = (q) => q.includes("peachstatetrucks") ? "psf" : q.includes("FuelFox") ? "fuelfox" : q.includes("4flyers") ? "quickfuel" : null;

globalThis.fetch = async (url, init = {}) => {
  const u = String(url); const signal = init.signal;
  if (u.startsWith("http://self.test/api/auto-sync")) {
    return handler(new Request(u, { method: init.method || "POST", headers: init.headers, body: init.body }));
  }
  if (u.includes("oauth2.googleapis.com/token")) { COUNTS.token++; return resp({ access_token: "at" }); }
  if (u.includes("/gmail/v1/users/me/messages?")) {
    await wait(NET.listDelay, signal); COUNTS.list++;
    const p = new URL(u).searchParams; const q = p.get("q") || "";
    const vk = vkOf(q); const max = Number(p.get("maxResults") || 100);
    const off = Number(p.get("pageToken") || 0);
    const am = q.match(/after:(\d{4})\/(\d{1,2})\/(\d{1,2})/);
    const after = am ? new Date(Number(am[1]), Number(am[2]) - 1, Number(am[3])) : new Date(0);
    const msgs = GMAIL.filter((m) => m.vendorKey === vk && new Date(m.date) >= after).sort((a, b) => b.date.localeCompare(a.date));
    const page = msgs.slice(off, off + max);
    const out = { messages: page.map((m) => ({ id: m.id })) };
    if (off + max < msgs.length) out.nextPageToken = String(off + max);
    return resp(out);
  }
  const attM = u.match(/\/gmail\/v1\/users\/me\/messages\/([^/]+)\/attachments\/([^/?]+)/);
  if (attM) {
    await wait(NET.attDelay, signal);
    const m = GMAIL.find((x) => x.id === attM[1]);
    // Real Gmail hands back a fresh attachmentId on every messages.get; the bytes
    // behind it are the same. The stub mirrors that by matching on the stable stem.
    const a = m?.atts.find((x) => x.aid === String(attM[2]).split("~")[0]);
    if (!a) return resp({ error: "not found" }, 404);
    COUNTS.att[`gmail:${m.id}:${a.aid}`] = (COUNTS.att[`gmail:${m.id}:${a.aid}`] || 0) + 1;
    const raw = a.pdfText == null ? "IMGONLY" : `PDF::${a.pdfText}`;
    return resp({ data: Buffer.from(raw, "utf8").toString("base64").replace(/\+/g, "-").replace(/\//g, "_") });
  }
  const getM = u.match(/\/gmail\/v1\/users\/me\/messages\/([^/?]+)$/);
  if (getM) {
    await wait(NET.getDelay, signal);
    const m = GMAIL.find((x) => x.id === getM[1]);
    if (!m) return resp({ error: "not found" }, 404);
    COUNTS.get[m.id] = (COUNTS.get[m.id] || 0) + 1;
    return resp({ payload: { headers: [{ name: "Date", value: m.date }, { name: "Subject", value: "inv" }, { name: "From", value: "v" }],
      parts: m.atts.map((a) => ({ filename: a.filename, mimeType: a.mime,
        body: { attachmentId: NET.rotateAids ? `${a.aid}~${++COUNTS.aidGen}` : a.aid, size: 100 } })) } });
  }
  if (u.includes("api.anthropic.com")) {
    const body = JSON.parse(init.body); const prompt = body.messages[0].content;
    const line = (prompt.split("INVOICE TEXT:")[1] || "").trim().split("\n")[0].trim();
    const [, num, truck, total, date, conf, pad] = line.split("|");
    const vendor = (prompt.match(/(?:invoice for|TOTALS for) (.+?) \(category/) || [])[1] || "?";
    COUNTS.aiStart[num] = (COUNTS.aiStart[num] || 0) + 1;
    const isCompact = /ONLY summary rows/.test(prompt);
    if (isCompact) COUNTS.aiCompact[num] = (COUNTS.aiCompact[num] || 0) + 1;
    else COUNTS.aiFull[num] = (COUNTS.aiFull[num] || 0) + 1;
    if ((NET.aiFailTimes[num] || 0) > 0) { NET.aiFailTimes[num]--; return resp({ error: { type: "rate_limit_error" } }, 429); }
    // An oversized invoice: rendering every line outlasts any run; summary is quick.
    const slow = (!isCompact && NET.aiSlowFull[num]) ? NET.aiSlowFull[num] : (NET.aiDelay[num] ?? NET.aiDefaultDelay);
    await wait(slow, signal);
    COUNTS.aiDone[num] = (COUNTS.aiDone[num] || 0) + 1;
    const npad = Number(pad) || 0;
    const multiM = /MULTI=([^|]+)/.exec(line);
    if (multiM) {
      // What the parser actually did with a service log: collapse the whole delivery
      // into ONE row and pin it on the first unit in the table, while still listing
      // every unit in lineItems. Also invent a different invoiceNum each pass, the
      // way it does for a document that prints no invoice number.
      const rows = multiM[1].split(",").map((s) => s.split(":"));
      const sum = rows.reduce((s, [, a]) => s + Number(a), 0);
      COUNTS.multiParse = (COUNTS.multiParse || 0) + 1;
      return resp({ content: [{ text: JSON.stringify([{
        truckId: rows[0][0], vendor, category: "Fuel", total: Math.round(sum * 100) / 100,
        gallons: rows.length * 120, pricePerGallon: 4.4,
        invoiceNum: `Service Log ${date} #${COUNTS.multiParse}`, date,
        lineItems: rows.map(([tr, a]) => ({ desc: `Diesel - Truck ${tr}`, amount: Number(a) })),
        notes: "", _confidence: "high", _confidenceReason: "",
      }]) }] });
    }
    return resp({ content: [{ text: JSON.stringify([{
      truckId: truck, vendor, category: "Fuel", total: Number(total), gallons: null, pricePerGallon: null,
      invoiceNum: num, date, lineItems: (!isCompact && npad) ? [{ desc: "x".repeat(npad), amount: 1 }] : [], notes: "",
      _confidence: conf || "high", _confidenceReason: conf === "low" ? "low" : "",
    }]) }] });
  }
  throw new Error("unstubbed fetch: " + u);
};

const blobs = () => { globalThis.__BLOBS ||= new Map(); if (!globalThis.__BLOBS.has("gmail-sync")) globalThis.__BLOBS.set("gmail-sync", new Map()); return globalThis.__BLOBS.get("gmail-sync"); };
const blobGet = (k) => { const v = blobs().get(k); return v == null ? null : JSON.parse(v); };
const blobSet = (k, o) => blobs().set(k, JSON.stringify(o));
const fs = () => (globalThis.__FIRESTORE ||= new Map());
const listShards = (base) => [...fs().keys()].filter((p) => p === `kv/${base}` || p.startsWith(`kv/${base}_`));
const readList = (base) => listShards(base).map((p) => ({ i: p === `kv/${base}` ? 0 : Number(p.split("_").pop()) - 1, a: JSON.parse(fs().get(p).v) }))
  .sort((x, y) => x.i - y.i).flatMap((r) => (Array.isArray(r.a) ? r.a : []));
const allShardEntries = () => { const out = []; for (const [p, d] of fs()) if (/^kv\/fl-costs-/.test(p)) { const a = JSON.parse(d.v); if (Array.isArray(a)) out.push(...a); } return out; };
const maxPropBytes = () => { let mx = 0; for (const [, d] of fs()) mx = Math.max(mx, Buffer.byteLength(d.v || "", "utf8")); return mx; };
const resetWorld = () => {
  globalThis.__BLOBS = new Map(); globalThis.__FIRESTORE = new Map(); GMAIL = []; resetCounts();
  NET.aiDelay = {}; NET.aiFailTimes = {}; NET.aiSlowFull = {}; NET.getDelay = 4; NET.rotateAids = false;
  blobSet("token", { refresh_token: "rt" }); blobSet("truck-ids", ["0154", "0200"]);
  blobSet("memo-version", { v: 2 }); blobSet("quarantine-rules", { v: 3 });
};
const runOnce = async (daysBack, extra = {}) =>
  (await (await handler(new Request("http://localhost/api/auto-sync", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ daysBack, ...extra }) }))).json());
const drain = async (daysBack, maxRuns = 60) => {
  const runs = [];
  for (let i = 0; i < maxRuns; i++) {
    const d = await runOnce(daysBack);
    if (d.busy) { await new Promise((r) => setTimeout(r, 20)); continue; }
    runs.push(d);
    if (d.done) return runs;
  }
  throw new Error(`no convergence in ${maxRuns}; last: ${JSON.stringify(runs[runs.length - 1])}`);
};

let pass = 0, fail = 0;
const t = (n, c, d = "") => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n}${d ? ` — ${d}` : ""}`); } };

const FAST = { BUDGET_MS: 1200, DISCOVERY_MS: 450, MIN_START_MS: 120, ITEM_CAP_MS: 500, FAIR_MS: 400,
  WRITE_HEADROOM_MS: 60, LIST_PAGE: 25, GET_CONC: 10, PROC_CONC: 4, MAX_ATTEMPTS: 3,
  FRESH_SLACK_DAYS: 3, LOCK_STALE_MS: 90000, EPOCH_MAX_AGE_DAYS: 1, CHAIN_MAX: 0, CHAIN_HANDOFF_MS: 30 };

// ══ S1 — the invoice that can't be rendered in full ═══════════════════════
console.log("\n═ S1 oversized invoice: imported compact instead of quarantined ═");
resetWorld();
Object.assign(TUNING, { ...FAST, PROC_CONC: 2, BUDGET_MS: 900, ITEM_CAP_MS: 300, FAIR_MS: 250, MIN_START_MS: 120, DISCOVERY_MS: 250, WRITE_HEADROOM_MS: 50 });
NET.getDelay = 5;
GMAIL.push(mkMsg("psf", 0, 1, { num: "HUGE" }));
GMAIL.push(mkMsg("psf", 1, 2, { num: "NORMAL" }));
NET.aiSlowFull = { HUGE: 5000 }; // full detail can never finish inside a run
{
  const runs = await drain(30, 30);
  const last = runs[runs.length - 1];
  t("drains to done", last.done === true, JSON.stringify(last).slice(0, 180));
  t("the oversized invoice IS imported", allShardEntries().some((e) => e.invoiceNum === "HUGE"),
    JSON.stringify(allShardEntries().map((e) => e.invoiceNum)));
  t("nothing quarantined", last.stuck === 0, `stuck=${last.stuck}`);
  const huge = allShardEntries().find((e) => e.invoiceNum === "HUGE");
  t("its entry says the per-line detail was skipped", /without per-line detail/.test(huge?.notes || ""), huge?.notes);
  t("full detail was attempted first", (COUNTS.aiFull["HUGE"] || 0) >= 1);
  t("compact only after the timeout", (COUNTS.aiCompact["HUGE"] || 0) >= 1,
    JSON.stringify({ full: COUNTS.aiFull["HUGE"], compact: COUNTS.aiCompact["HUGE"] }));
  t("a normal invoice never goes compact", !COUNTS.aiCompact["NORMAL"]);
  t("normal invoice keeps full detail", !/without per-line detail/.test(allShardEntries().find((e) => e.invoiceNum === "NORMAL")?.notes || ""));
}

// ══ S2 — releasing the ones already quarantined on timeouts ══════════════
console.log("\n═ S2 already-quarantined timeouts released once, retried compact ═");
resetWorld();
Object.assign(TUNING, { ...FAST, PROC_CONC: 2, BUDGET_MS: 900, ITEM_CAP_MS: 300, FAIR_MS: 250, MIN_START_MS: 120, DISCOVERY_MS: 250, WRITE_HEADROOM_MS: 50 });
NET.getDelay = 5;
GMAIL.push(mkMsg("psf", 0, 1, { num: "OLDBIG" }));
GMAIL.push(mkMsg("psf", 1, 2, { num: "TRULYBAD", image: true }));
{
  // Production's shape: one struck out on timeouts, one on a genuinely unreadable
  // PDF. Both already out of the queue, both memoized as seen, rules version behind.
  blobSet("work-queue", { items: [], discovery: { coveredDays: 365, done: true, vendorIdx: 3, pageToken: null, epochAt: new Date().toISOString(), freshAfter: "2026/1/1" } });
  blobSet("seen-messages", { "psf-m0": 1, "psf-m1": 1 });
  blobSet("failed-refs", {
    "gmail:psf-m0:a1": { count: 3, timeouts: 3, error: "timed out after 18s", filename: "inv-OLDBIG.pdf", vendor: "Peach State Freightliner" },
    "gmail:psf-m1:a1": { count: 3, error: "PDF has no extractable text (image-only PDF — needs OCR)", filename: "inv-1.pdf", vendor: "Peach State Freightliner" },
  });
  blobSet("quarantine-rules", { v: 1 });

  const runs = await drain(365, 30);
  const last = runs[runs.length - 1];
  t("run completes", last.done === true, JSON.stringify(last).slice(0, 180));
  t("the timed-out invoice was released and imported", allShardEntries().some((e) => e.invoiceNum === "OLDBIG"),
    JSON.stringify(allShardEntries().map((e) => e.invoiceNum)));
  t("it was retried in compact mode", (COUNTS.aiCompact["OLDBIG"] || 0) >= 1);
  t("no mailbox re-crawl was needed to find it", (COUNTS.get["psf-m0"] || 0) === 0, `msg fetches=${COUNTS.get["psf-m0"] || 0}`);
  t("the genuinely unreadable PDF keeps its strikes", blobGet("failed-refs")["gmail:psf-m1:a1"]?.count === 3);
  t("the unreadable PDF was not re-fetched", !COUNTS.att["gmail:psf-m1:a1"]);
  t("reports 1 stuck, not 2", last.stuck === 1, `stuck=${last.stuck}`);
  t("the release is recorded so it happens once", blobGet("quarantine-rules").v === 3 && blobGet("quarantine-rules").freed === 1);
  const before = allShardEntries().length;
  await drain(365, 20);
  t("a later run does not release again", allShardEntries().length === before);
}

// ══ S3 — a genuinely broken PDF still quarantines ════════════════════════
console.log("\n═ S3 an unreadable PDF still stops after 3 tries ═");
resetWorld();
Object.assign(TUNING, FAST);
GMAIL.push(mkMsg("psf", 0, 1, { num: "OK1" }));
GMAIL.push(mkMsg("psf", 1, 2, { image: true }));
{
  const runs = await drain(30, 30);
  const last = runs[runs.length - 1];
  t("good invoice imported", allShardEntries().some((e) => e.invoiceNum === "OK1"));
  t("image-only PDF fetched exactly 3 times then quarantined", COUNTS.att["gmail:psf-m1:a1"] === 3, `att=${COUNTS.att["gmail:psf-m1:a1"]}`);
  t("reported as stuck", last.stuck === 1);
  t("never retried in compact mode (it isn't a size problem)", !COUNTS.aiCompact["PSF-1"]);
}

// ══ S4 — core regressions still hold ═════════════════════════════════════
console.log("\n═ S4 regression: backlog, dedup, review queue, 1 MB sharding ═");
resetWorld();
Object.assign(TUNING, FAST);
NET.getDelay = 30;
for (let i = 0; i < 40; i++) { const o = {}; if (i >= 30 && i <= 32) o.num = "DUP1"; if (i === 35) o.conf = "low"; GMAIL.push(mkMsg("psf", i, 2 + i * 3, o)); }
for (let i = 0; i < 24; i++) GMAIL.push(mkMsg("fuelfox", i, 3 + i * 6, { conf: "low", pad: 40000 }));
{
  const runs = await drain(365, 60);
  const last = runs[runs.length - 1];
  t("drains to done", last.done === true && last.remaining === 0);
  const gets = Object.values(COUNTS.get);
  t("every message payload fetched exactly once", gets.length === 64 && gets.every((c) => c === 1), `n=${gets.length} max=${Math.max(...gets)}`);
  t("duplicate invoice numbers imported once", allShardEntries().filter((e) => e.invoiceNum === "DUP1").length === 1);
  t("low-confidence items went to review, not the ledger", readList("fl-review-queue").length === 25, `review=${readList("fl-review-queue").length}`);
  t("review queue spilled past one document", listShards("fl-review-queue").length >= 2, `shards=${listShards("fl-review-queue").length}`);
  t("no document exceeds Firestore's ceiling", maxPropBytes() <= 1048487, `max=${maxPropBytes()}`);
  t("37 invoices in the ledger (40 psf − 2 dups − 1 to review)", allShardEntries().length === 37, `n=${allShardEntries().length}`);
  const before = JSON.parse(JSON.stringify(COUNTS));
  const d = await runOnce(30);
  // One Gmail list call per configured vendor, and no AI at all. Derived from the real
  // VENDOR_QUERIES so adding a vendor does not fail this check for the wrong reason.
  const nVendors = Object.keys(mod.VENDOR_QUERIES || {}).length;
  t(`steady state: ${nVendors} list calls (one per vendor), zero AI`,
    d.done === true && COUNTS.list - before.list === nVendors && JSON.stringify(COUNTS.aiStart) === JSON.stringify(before.aiStart),
    `list=${COUNTS.list - before.list} vendors=${nVendors}`);
}

// ══ S5 — the $498k truck ═════════════════════════════════════════════════
// Reproduces both halves of it: a whole service log booked to the first unit in
// the table, and the same log imported again and again because the attachment ID
// it was keyed on is regenerated on every fetch.
console.log("\n═ S5 service logs: split per truck, imported once ═");
resetWorld();
Object.assign(TUNING, FAST);
blobSet("truck-ids", ["0424", "0451", "0805", "1368"]);
NET.rotateAids = true; // Gmail's real behaviour, and the reason dedup never matched
const LOG = [["0424", 368.46], ["0451", 73.15], ["0805", 178.62], ["1368", 313.26]];
const LOG_TOTAL = LOG.reduce((s, [, a]) => s + a, 0);
GMAIL.push(mkMsg("fuelfox", 0, 2, { filename: "FuelFox ServiceLog 07-21.pdf", multi: LOG }));
{
  await drain(30, 20);
  const led = () => allShardEntries();
  const of = (t) => led().filter((e) => e.truckId === t).reduce((s, e) => s + e.total, 0);
  t("the log became one entry per truck", led().length === 4, `n=${led().length}`);
  t("the first-listed truck carries only its own line, not the delivery",
    Math.abs(of("0424") - 368.46) < 0.01, `0424=$${of("0424").toFixed(2)} (delivery was $${LOG_TOTAL.toFixed(2)})`);
  t("every other truck on the log got its fuel", Math.abs(of("0451") - 73.15) < 0.01 && Math.abs(of("1368") - 313.26) < 0.01,
    `0451=${of("0451")} 1368=${of("1368")}`);
  t("the document total still reconciles",
    Math.abs(led().reduce((s, e) => s + e.total, 0) - LOG_TOTAL) < 0.02, `sum=${led().reduce((s, e) => s + e.total, 0)}`);
  t("each split row says where it came from", led().every((e) => /Split from a 4-truck service log/.test(e.notes || "")), led()[0]?.notes);
  t("split rows get distinct invoice numbers", new Set(led().map((e) => e.invoiceNum)).size === 4);

  // Re-crawl. Gmail returns new attachment IDs; nothing about the mail has changed.
  const aiBefore = COUNTS.multiParse;
  blobSet("work-queue", { ...blobGet("work-queue"), discovery: null }); // force a fresh crawl
  await drain(30, 20);
  t("a re-crawl with rotated attachment IDs re-imports nothing", led().length === 4, `n=${led().length}`);
  t("and does not pay to parse it again", COUNTS.multiParse === aiBefore, `parses ${aiBefore} -> ${COUNTS.multiParse}`);

  // The vendor resends the same log from a new email — a different message, a
  // different filename, so no key derived from the mail can catch it. Only the
  // content fingerprint can.
  // Same service date — it is the same delivery, just mailed again.
  GMAIL.push(mkMsg("fuelfox", 9, 2, { id: "fuelfox-resend", filename: "Davis Delivery Service Log.pdf", multi: LOG }));
  blobSet("work-queue", { ...blobGet("work-queue"), discovery: null });
  await drain(30, 20);
  t("a resend of the same log under a new message imports nothing", led().length === 4,
    `n=${led().length}: ${JSON.stringify(led().map((e) => `${e.truckId}:${e.total}`))}`);
  t("0424 is still $368.46, not $736.92", Math.abs(of("0424") - 368.46) < 0.01, `0424=$${of("0424").toFixed(2)}`);

  // A genuinely new delivery must still get in — dedup that swallows real work is
  // the failure mode this replaces.
  GMAIL.push(mkMsg("fuelfox", 10, 0, { filename: "FuelFox ServiceLog 07-28.pdf", multi: [["0424", 401.1], ["0451", 88.2]] }));
  blobSet("work-queue", { ...blobGet("work-queue"), discovery: null });
  await drain(30, 20);
  t("the next week's delivery still imports", led().length === 6, `n=${led().length}`);
  t("and adds to the right trucks", Math.abs(of("0424") - (368.46 + 401.1)) < 0.01, `0424=$${of("0424").toFixed(2)}`);

  // A corrected reissue of an existing log: same date, same trucks, one amount
  // changed. Dropping the rows that match individually would silently lose the three
  // that didn't change — a document only counts as a duplicate if ALL of it matches.
  const CORRECTED = [["0424", 368.46], ["0451", 73.15], ["0805", 178.62], ["1368", 350.00]];
  GMAIL.push(mkMsg("fuelfox", 11, 2, { id: "fuelfox-corrected", filename: "FuelFox ServiceLog 07-21 CORRECTED.pdf", multi: CORRECTED }));
  blobSet("work-queue", { ...blobGet("work-queue"), discovery: null });
  await drain(30, 20);
  t("a corrected reissue imports in full, not just the row that changed", led().length === 10, `n=${led().length}`);
  t("including the rows identical to the original", led().filter((e) => e.truckId === "0451" && Math.abs(e.total - 73.15) < 0.01).length === 2,
    JSON.stringify(led().filter((e) => e.truckId === "0451").map((e) => e.total)));
}

// ══ S6 — compact mode has no line items to split by ══════════════════════
// ══ S7 — a timeout quarantine cools off instead of being a life sentence ══
// Production had two August FuelFox service logs struck out on AI timeouts while the
// status line read "✓ All caught up". Nothing would ever have retried them: the only
// release was gated on a one-shot rules-version bump. A timeout is one run's luck with
// API latency, not a verdict on the attachment, so it now gets another go after a
// cooling period — while a genuinely broken PDF still stays put.
console.log("\n═ S7 a timeout quarantine cools off and retries ═");
resetWorld();
Object.assign(TUNING, { ...FAST, PROC_CONC: 2, BUDGET_MS: 900, ITEM_CAP_MS: 300, FAIR_MS: 250, MIN_START_MS: 120, DISCOVERY_MS: 250, WRITE_HEADROOM_MS: 50 });
NET.getDelay = 5;
GMAIL.push(mkMsg("psf", 0, 1, { num: "COOLED" }));
GMAIL.push(mkMsg("psf", 1, 2, { num: "STILLBAD", image: true }));
{
  const OLD = new Date(Date.now() - 7 * 3600 * 1000).toISOString();   // 7h ago, past the 6h cool-off
  const NEW = new Date(Date.now() - 60 * 1000).toISOString();         // a minute ago
  blobSet("work-queue", { items: [], discovery: { coveredDays: 365, done: true, vendorIdx: 9, pageToken: null, epochAt: new Date().toISOString(), freshAfter: "2020/01/01" } });
  blobSet("seen-messages", { "psf-m0": 1, "psf-m1": 1 });
  blobSet("failed-refs", {
    "gmail:psf-m0:a1": { count: 3, timeouts: 3, lastAt: OLD, error: "timed out in ai after 18s", filename: "sl-COOLED.pdf", vendor: "Peach State Freightliner", messageId: "psf-m0", attachmentId: "a1" },
    "gmail:psf-m1:a1": { count: 3, lastAt: OLD, error: "PDF has no extractable text (image-only PDF — needs OCR)", filename: "sl-STILLBAD.pdf", vendor: "Peach State Freightliner", messageId: "psf-m1", attachmentId: "a1" },
  });
  blobSet("quarantine-rules", { v: 99 });   // one-shot release already spent — only the cool-off can save it

  const runs = await drain(365, 30);
  const last = runs[runs.length - 1];
  t("run completes", last.done === true);
  // Released, re-fetched and parsed. It lands in the REVIEW QUEUE rather than the
  // ledger, and that is right: the retry runs at the top of the ladder (compact +
  // page-capped), so it returns a summary without per-line detail, and a summary is
  // not something to book into the money silently. The point is that it reached a
  // human at all instead of sitting quarantined forever behind a status line.
  t("the timed-out invoice was retried, not abandoned",
    !blobGet("failed-refs")["gmail:psf-m0:a1"], JSON.stringify(Object.keys(blobGet("failed-refs"))));
  t("and it reached a human or the ledger",
    readList("fl-review-queue").length + allShardEntries().length === 1,
    `review=${readList("fl-review-queue").length} ledger=${allShardEntries().length}`);
  t("it is no longer counted as stuck", last.stuck === 1, `stuck=${last.stuck}`);
  t("no mailbox re-crawl was needed", (COUNTS.get["psf-m0"] || 0) === 0);
  t("the image-only PDF is NOT released by the cool-off", blobGet("failed-refs")["gmail:psf-m1:a1"]?.count === 3);
  t("it was never re-fetched", !COUNTS.att["gmail:psf-m1:a1"]);
}
{
  // A quarantine that only just happened must NOT be retried on the very next run,
  // or a permanently-too-slow invoice would eat the budget of every single sweep.
  resetWorld();
  Object.assign(TUNING, { ...FAST, PROC_CONC: 2, BUDGET_MS: 900, ITEM_CAP_MS: 300, FAIR_MS: 250, MIN_START_MS: 120, DISCOVERY_MS: 250, WRITE_HEADROOM_MS: 50 });
  GMAIL.push(mkMsg("psf", 0, 1, { num: "TOOSOON" }));
  blobSet("work-queue", { items: [], discovery: { coveredDays: 365, done: true, vendorIdx: 9, pageToken: null, epochAt: new Date().toISOString(), freshAfter: "2020/01/01" } });
  blobSet("seen-messages", { "psf-m0": 1 });
  blobSet("failed-refs", {
    "gmail:psf-m0:a1": { count: 3, timeouts: 3, lastAt: new Date(Date.now() - 60 * 1000).toISOString(), error: "timed out in ai after 18s", filename: "x.pdf", vendor: "Peach State Freightliner", messageId: "psf-m0", attachmentId: "a1" },
  });
  blobSet("quarantine-rules", { v: 99 });
  await drain(365, 20);
  t("a fresh quarantine waits out its cooling period", !allShardEntries().some((e) => e.invoiceNum === "TOOSOON"));
}

// ══ S8 — the nightly 30-day run must not undo a wide Catch Up sweep ══════
// The scheduled function asks for 30 days. A new epoch used to reset coveredDays to
// exactly that, so the day after someone ran a 2-year backlog sweep the unattended sync
// silently went back to looking at only the last month — which is why a manual wide scan
// kept finding hundreds of emails it had never once looked for.
console.log("\n═ S8 a scheduled 30-day run does not narrow the horizon ═");
resetWorld();
Object.assign(TUNING, FAST);
blobSet("truck-ids", ["0424"]);
{
  blobSet("work-queue", { items: [], discovery: { coveredDays: 730, done: true, vendorIdx: 9, pageToken: null, epochAt: new Date(Date.now() - 3 * 86400000).toISOString(), freshAfter: null } });
  await drain(30, 20);                       // exactly what scheduled-sync.mts sends
  const cov = blobGet("work-queue").discovery.coveredDays;
  t("a 2-year horizon survives a 30-day scheduled run", cov === 730, `coveredDays=${cov}`);
}
{
  resetWorld();
  Object.assign(TUNING, FAST);
  blobSet("work-queue", { items: [], discovery: { coveredDays: 30, done: true, vendorIdx: 9, pageToken: null, epochAt: new Date(Date.now() - 3 * 86400000).toISOString(), freshAfter: null } });
  await drain(365, 20);
  const cov = blobGet("work-queue").discovery.coveredDays;
  t("asking for MORE still widens it", cov === 365, `coveredDays=${cov}`);
}

console.log("\n═ S6 a collapsed log with no detail goes to a human ═");
resetWorld();
Object.assign(TUNING, FAST);
blobSet("truck-ids", ["0424", "0451"]);
GMAIL.push(mkMsg("fuelfox", 0, 1, { num: "SL-NODETAIL", truck: "0424", total: 6801.56 }));
{
  // Same shape a compact pass returns: one row, one truck, no lineItems — but
  // carrying a whole tanker's worth of fuel.
  const orig = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const r = await orig(url, init);
    if (!String(url).includes("api.anthropic.com")) return r;
    const d = await r.json();
    const rows = JSON.parse(d.content[0].text);
    if (rows[0].invoiceNum === "SL-NODETAIL") { rows[0].gallons = 1515.5; rows[0].lineItems = []; }
    return resp({ content: [{ text: JSON.stringify(rows) }] });
  };
  await drain(30, 20);
  globalThis.fetch = orig;
  t("1,515 gallons on one truck never reaches the ledger", allShardEntries().length === 0,
    JSON.stringify(allShardEntries().map((e) => `${e.truckId}:${e.total}`)));
  const rq = readList("fl-review-queue");
  t("it is queued for review instead", rq.length === 1, `review=${rq.length}`);
  t("with a reason that names the problem", /gallons on one truck/.test(rq[0]?.confidenceReason || ""), rq[0]?.confidenceReason);
}

console.log(`\n${pass + fail} checks: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
