import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, query, where, documentId } from "firebase/firestore";
import pdfParse from "pdf-parse";

/**
 * /api/auto-sync — server-side Gmail invoice sync.
 *
 * v2.17.0: rebuilt around a durable work queue so the ~22s time budget is spent
 * processing invoices instead of re-discovering them.
 * v2.17.1: lockstep batches of 3 → a rolling worker pool. A batch waited on its
 * slowest member, so most lanes idled and a run settled ~8 attachments — a
 * hundred-pass afternoon for an 800-deep backlog. Workers now pull the next item
 * the moment they free up, and rate-limit / server errors (Gmail or Anthropic
 * 429/5xx, network resets) are requeued as backpressure instead of counting
 * toward quarantine — with more lanes hitting the AI API, a 429 is routine and
 * says nothing about the attachment.
 *
 * v2.17.1 also makes the drain COMPLETELY AUTOMATIC: a run that ends with work
 * remaining fires the next run itself (fire-and-mostly-forget POST to this same
 * endpoint), so one trigger — the 3-hourly schedule or a single Catch Up Backlog
 * click — drains the entire backlog with no browser open. The chain is depth-
 * capped, halts on a `chain-stop` blob raised by the Stop button (its own key so
 * no state write can erase it mid-race), never overlaps thanks to the single-
 * flight lock, and if a link is ever dropped the next scheduled run restarts it.
 * Auth failures (Gmail token refresh, Anthropic 401/403) fail the RUN, not the
 * attachments, so a dead credential can't quarantine the whole queue.
 *
 * v2.17.2: durability. Runs were dying on
 *   "3 INVALID_ARGUMENT: The value of property "v" is longer than 1048487 bytes"
 * and the 767-deep queue stopped moving. `fl-review-queue` was a single unbounded
 * Firestore document with no size guard (the cost shards had one), and the
 * v2.17.0 fix that finally honored the parser's own low-confidence flag routed far
 * more work into it. Past ~1 MB the write threw, which escaped to the outer catch:
 * the run returned 500, so the auto-continue chain never fired and the drain
 * stopped dead. Worse, settle() had already removed those attachments from the
 * work queue and the catch persisted the queue — while `dedup-index` (written
 * after the failing line) never landed. The attachments were therefore gone from
 * the queue, absent from the ledger, absent from dedup, and their message still in
 * `seen-messages`, so nothing would ever re-enumerate them: silent permanent loss,
 * every failed run.
 *
 * Three structural changes, not another patch:
 *  1. NO unbounded document. Every growing list is a sharded list — `<base>`,
 *     `<base>_2`, `<base>_3`, … each packed under FS_MAX_BYTES, appended to the
 *     tail so earlier shards aren't rewritten. Sizing is UTF-8 byte-accurate
 *     (Buffer.byteLength), not JS string length, which undercounts any non-ASCII.
 *  2. NO Firestore write may throw the run. Writes go through guarded helpers that
 *     report failure; a failed write is a transient condition for the items it
 *     carried, never a strike against them.
 *  3. Two-phase settle. An attachment is removed from the queue and added to the
 *     dedup index ONLY after its data is durably in the ledger. A failed write
 *     leaves it queued for the next run. Duplicates and skips need no write and
 *     settle immediately. Combined with the error path now persisting state and
 *     still chaining, a bad write costs a retry instead of an invoice.
 *
 * MEMO_VERSION exists to recover what the old code already lost: bumping it clears
 * `seen-messages` at the next epoch, forcing a full re-enumeration. Dedup makes
 * that free for anything already imported, so only the genuinely missing come back.
 *
 * The old shape rebuilt its queue from scratch every run: re-list Gmail per vendor
 * (capped at 50 messages — anything older was unreachable), re-fetch the full payload
 * of EVERY message to enumerate attachments, and read every Firestore cost shard —
 * all before processing a single PDF. Most of the budget went to setup, so a run
 * managed ~6 attachments and a 160-deep backlog could never catch up.
 *
 * New shape, all state in Blobs:
 *  - `work-queue`   pending attachments + a resumable discovery cursor. Discovery
 *                   paginates the full window (no 50-message cap) and can span runs.
 *  - `seen-messages` every message ever enumerated — its payload is never fetched
 *                   again. Steady-state runs do 3 cheap list calls and stop.
 *  - `dedup-index`  rebuilt from the ACTUAL ledger at each discovery epoch (see
 *                   reconcile below), then maintained incrementally.
 *  - `failed-refs`  failure ledger; quarantine after MAX_ATTEMPTS (v2.16.19).
 *
 * A run: (0) refuse if another run is in flight; (1) start or resume discovery under
 * a small sub-budget — or, once discovery is done, a cheap freshness check for new
 * mail; (2) spend everything else processing the queue front with per-item deadlines
 * (AbortController) so a slow PDF can't blow past the function cap; (3) persist.
 *
 * Reconcile: the dedup index previously accumulated in Blobs forever and was never
 * checked against the ledger. That leaves it wrong in both directions: a browser
 * holding a stale copy of a month can full-write that shard (saveCosts diffs against
 * what it loaded at page-load) and silently drop entries the server imported since —
 * which the index then blocks from EVER re-importing; and the Purge-vendor buttons
 * promise a clean re-scan the index would silently refuse. At each discovery epoch
 * the index is rebuilt from what the ledger actually contains (active + archive
 * shards + review queue + fl-rejected-refs tombstones written by the app on reject/
 * delete), so lost entries are re-imported automatically and deliberate removals
 * stay removed. Shard writes also merge against a fresh read of the target shard,
 * which narrows the clobber window and drops the read-every-shard-every-run setup
 * cost to just the shards being written.
 *
 * v2.19.0: the ledger was wrong in two ways that only showed up once enough had
 * been imported to chart it — one truck, #0424, holding $498k of spend, ~10x the
 * next truck in a fleet where every unit does similar work.
 *
 *  1. WHOLE DOCUMENTS BOOKED TO ONE TRUCK. A fuel service log is one PDF listing
 *     every unit filled that day. The parser sometimes returned it as a single row
 *     carrying the delivery total, pinned on whichever unit was printed first —
 *     and 0424 is the lowest unit number in this fleet, so it was first on 104 of
 *     them. The row's own line items said otherwise ("Diesel - Truck 0451  73.15"),
 *     so splitMultiTruck now trusts those and splits the row back into one entry
 *     per unit. Deterministic, not another prompt tweak: the prompt is tightened
 *     too, but the split does not depend on the model getting it right.
 *
 *  2. THE SAME ATTACHMENT IMPORTED OVER AND OVER. Gmail attachment IDs are not
 *     stable — refetching a message hands back different ones for the same parts —
 *     so `gmail:<msg>:<attachmentId>`, the dedup key, never matched on a re-run.
 *     156 of 386 messages had accumulated several. The invoiceNum fallback couldn't
 *     catch it either: a service log prints no invoice number, so the parser
 *     invented a description ("Service Log 07/14/2026", "Davis Delivery -
 *     07/14/2026", ...) that differed every pass. One delivery was imported eight
 *     times. Fleet-wide that was 1,335 redundant rows and $468k of phantom spend,
 *     and it also explains why the backlog kept refilling itself.
 *     The ref is now `gmail:<msg>:<filename>`, which is stable, and a content
 *     fingerprint (vendor|date|truck|amount) is carried in the dedup index as a
 *     backstop — the vendor resends the same log under new message IDs, which no
 *     ref-based key can catch. Both are rebuilt from the ledger by reconcile, and
 *     the old volatile refs are recognised too, so this deploy re-imports nothing.
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCaaHZ0GuBoxl696-PzlgBQLPEad1xyiqw",
  authDomain: "davisfleetmanagement.firebaseapp.com",
  projectId: "davisfleetmanagement",
  storageBucket: "davisfleetmanagement.firebasestorage.app",
  messagingSenderId: "397276214754",
  appId: "1:397276214754:web:aa7bd4723c301fb876b5bb",
};

// Exported so the sync harness can assert against the REAL vendor list rather than a
// hardcoded count that breaks every time a vendor is added.
export const VENDOR_QUERIES: Record<string, string> = {
  "peach state freightliner": `((from:peachstatetrucks.com) OR ((from:ryan@davisdelivery.com OR from:ryan@davisdeliveryservice.com) AND subject:"Parts 20407")) has:attachment`,
  "fuelfox atlanta": `(from:quickbooks@notification.intuit.com subject:"FuelFox Atlanta") has:attachment`,
  "quick fuel": `from:ebilling@4flyers.com has:attachment`,
  "complete fleet services": `from:complete.fleet@outlook.com has:attachment`,
};

const DEFAULT_VENDORS = [
  { name: "FuelFox Atlanta", category: "Fuel" },
  { name: "Peach State Freightliner", category: "Parts" },
  { name: "Quick Fuel", category: "Fuel" },
  { name: "Complete Fleet Services", category: "Repair" },
];

function mergeVendors(stored: any, defaults: any[]): any[] {
  const list = Array.isArray(stored) ? stored.filter((v) => v && v.name) : [];
  const seen = new Set(list.map((v) => String(v.name).toLowerCase().trim()));
  for (const d of defaults) {
    if (!seen.has(String(d.name).toLowerCase().trim())) list.push(d);
  }
  return list.length ? list : defaults;
}

// Exported so the test harness can shrink the clocks; production never touches it.
export const TUNING = {
  BUDGET_MS: 22000,        // total run budget
  DISCOVERY_MS: 8000,      // sub-budget for mailbox crawling (elapsed, not duration)
  MIN_START_MS: 6000,      // don't start an item with less than this left
  ITEM_CAP_MS: 18000,      // hard per-item deadline
  FAIR_MS: 16000,          // a timeout only counts as a failure if the item had ≥ this
  WRITE_HEADROOM_MS: 2000, // reserved for the state writes at the end
  LIST_PAGE: 100,          // Gmail list page size (paginated — no more 50-message cap)
  GET_CONC: 8,             // parallel message-payload fetches during discovery
  PROC_CONC: 8,            // worker-pool lanes for attachment processing
  MAX_ATTEMPTS: 3,         // quarantine threshold (v2.16.19)
  RETRY_QUARANTINE_MS: 21600000, // 6h — a timeout-only quarantine cools off and retries (v2.23.0)
  FRESH_SLACK_DAYS: 3,     // freshness check re-lists this far back (dedup makes overlap free)
  LOCK_STALE_MS: 90000,    // a "running" flag older than this is a crashed run — ignore it
  EPOCH_MAX_AGE_DAYS: 1,   // reconcile at most daily, and only when the queue is empty
  CHAIN_MAX: 200,          // max self-fired links per origin trigger (~70 min of draining)
  CHAIN_HANDOFF_MS: 600,   // how long to hold the connection so the next link's request gets out
  PARSE_CONC: 2,           // concurrent pdfParse calls — CPU-bound, so more is slower not faster
  PDF_BIG_BYTES: 1_500_000,   // past this a PDF is treated as a big one on the FIRST pass
  PDF_BIG_MAX_PAGES: 60,      // pages parsed for a big PDF on the first pass
  PDF_MAX_PAGES: 15,          // pages parsed on the page-capped last attempt
};

/**
 * pdfParse is synchronous CPU work: eight concurrent calls do not run in parallel,
 * they queue on the one thread while all eight deadlines keep running down. This
 * gate lets network-bound lanes stay wide while keeping parsing to a couple at a
 * time, so a slow PDF costs its own deadline instead of everyone else's too.
 */
let parseActive = 0;
const parseWaiters: (() => void)[] = [];
async function parseGate<T>(fn: () => Promise<T>): Promise<T> {
  if (parseActive >= TUNING.PARSE_CONC) await new Promise<void>((r) => parseWaiters.push(r));
  parseActive++;
  try { return await fn(); }
  finally { parseActive--; const next = parseWaiters.shift(); if (next) next(); }
}

// Firestore caps one property value at 1,048,487 bytes. Pack shards well under it:
// the doc also carries `ts` + field names, and a shard read/modify/write races a
// client doing the same, so headroom is cheaper than a rejected write.
const FS_MAX_BYTES = 800_000;
// The real ceiling, minus a little for the `ts` field and field names.
const FS_HARD_BYTES = 1_040_000;

// Bump to force a one-time full re-enumeration at the next discovery epoch. v2 is
// the recovery sweep for attachments the pre-v2.17.2 write path dropped silently.
const MEMO_VERSION = 2;

// Bump to release attachments quarantined by a rule that has since changed. v2 frees
// the ones struck out purely on timeouts: they were never bad PDFs, they were invoices
// too large to render in full inside one run, and compact mode now handles them.
const QUARANTINE_RULES_VERSION = 3;

const utf8Len = (s: string) => Buffer.byteLength(s, "utf8");

// v2.24.5: mirror of newId() in App.jsx — change one, change both. `Date.now() +
// Math.random()` is NOT unique: at a 2026-era epoch (~1.79e12) a double has only
// ~4096 distinct fractional slots left below the integer part, so a batch of rows
// built in one synchronous pass — which is exactly what parsing one multi-row
// invoice and splitting one service log both do — collides constantly. The browser
// dedups the ledger BY id on load, so a collision there deletes a real invoice.
let __idSeq = 0;
const newId = () => `e${Date.now().toString(36)}-${(__idSeq++).toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

// Sharded list: index 0 keeps the original key (so existing data and every client
// that reads only the base key still work), overflow goes to `<base>_2`, `_3`, …
const shardName = (base: string, i: number) => (i === 0 ? base : `${base}_${i + 1}`);
function shardIndexOf(base: string, id: string): number | null {
  if (id === base) return 0;
  if (!id.startsWith(base + "_")) return null;
  // Strict: Number() would coerce " 2", "+2", "2\n" and friends onto a real shard
  // index, so two different documents could claim the same slot and one would be
  // rewritten with the other's contents.
  const s = id.slice(base.length + 1);
  if (!/^[1-9][0-9]*$/.test(s)) return null;
  const n = Number(s);
  return n >= 2 ? n - 1 : null;
}
// Every doc id starting with `p`. Firestore has no prefix operator; the idiom is a
// range up to the prefix with its last character incremented.
const prefixRange = (kv: any, p: string) =>
  query(kv, where(documentId(), ">=", p),
    where(documentId(), "<", p.slice(0, -1) + String.fromCharCode(p.charCodeAt(p.length - 1) + 1)));

/** Read every shard of a sharded list, in shard order. */
async function readShardedList(db: any, base: string): Promise<{ idx: number; arr: any[] }[]> {
  const snap = await getDocs(prefixRange(collection(db, "kv"), base));
  const out: { idx: number; arr: any[] }[] = [];
  snap.forEach((d: any) => {
    const idx = shardIndexOf(base, d.id);
    if (idx == null) return;
    let arr: any[] = [];
    try { const a = JSON.parse(d.data().v); if (Array.isArray(a)) arr = a; } catch {}
    out.push({ idx, arr });
  });
  out.sort((a, b) => a.idx - b.idx);
  return out;
}

/**
 * Append to a sharded list, topping up the tail shard and opening new ones as
 * needed. Never throws: a rejected write is reported and the caller requeues only
 * the work that did NOT land.
 *
 * Two rules earn their keep here:
 *  - Never rewrite a shard this call did not modify. A tail written by an older
 *    build can already exceed our budget — production's `fl-review-queue` is
 *    exactly that, the ~1 MB document the outage left behind. Re-flushing it would
 *    fail its own size guard on every run, so the list could never be appended to
 *    again: the queue would livelock, re-fetching and re-billing the same
 *    attachments forever while the chain ran to its cap all day. Roll past it.
 *  - Report what was durably committed, not just pass/fail. If shard 3 lands and
 *    shard 4 is rejected, the items in shard 3 are in the ledger; telling the
 *    caller "everything failed" would requeue them and duplicate the invoice.
 */
async function appendSharded(
  db: any, base: string, existing: { idx: number; arr: any[] }[], adds: any[], errors: string[]
): Promise<{ ok: boolean; committed: number }> {
  if (adds.length === 0) return { ok: true, committed: 0 };
  let idx = existing.length ? existing[existing.length - 1].idx : 0;
  let arr = existing.length ? [...existing[existing.length - 1].arr] : [];
  let bytes = utf8Len(JSON.stringify(arr));
  // An over-budget legacy tail is treated as full, not as something to rewrite.
  if (arr.length > 0 && bytes > FS_MAX_BYTES) { idx++; arr = []; bytes = 2; }
  let dirty = false, committed = 0, inShard = 0;
  const flush = async () => {
    await setDoc(doc(db, "kv", shardName(base, idx)), { v: JSON.stringify(arr), ts: new Date().toISOString() });
    committed += inShard; inShard = 0;
    return true;
  };
  try {
    for (const it of adds) {
      const b = utf8Len(JSON.stringify(it)) + 1;
      // A record too big to ever store alone would otherwise requeue forever and
      // spin the chain. Count it as handled and name it loudly instead.
      if (b + 2 > FS_HARD_BYTES) {
        errors.push(`${base}: one record is ${Math.round(b / 1024)} KB — too large for a document; skipped.`);
        committed++;
        continue;
      }
      if (arr.length > 0 && bytes + b > FS_MAX_BYTES) {
        if (dirty && !(await flush())) return { ok: false, committed };
        idx++; arr = []; bytes = 2; dirty = false;
      }
      arr.push(it); bytes += b; dirty = true; inShard++;
    }
    if (dirty && !(await flush())) return { ok: false, committed };
    return { ok: true, committed };
  } catch (e: any) {
    errors.push(`${base}: ${(e?.message || "write failed").substring(0, 160)}`);
    return { ok: false, committed };
  }
}

export default async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  const startedAt = Date.now();
  const elapsed = () => Date.now() - startedAt;
  const store = getStore("gmail-sync");

  // Parse options from request (manual sync may pass { daysBack: 7 } etc.)
  let daysBack = 7;
  let chainDepth = 0;
  let triggeredBy = "";
  let stopChainReq = false;
  try {
    if (req.method === "POST") {
      const body = await req.json();
      // v2.16.13: cap raised from 90 → 1095 days so the one-click "Catch Up Backlog"
      // sweep can reach historical invoices.
      if (typeof body?.daysBack === "number") daysBack = Math.max(1, Math.min(1095, body.daysBack));
      if (typeof body?.chain === "number") chainDepth = Math.max(0, Math.floor(body.chain));
      triggeredBy = String(body?.triggeredBy || "");
      stopChainReq = body?.stopChain === true;
    }
  } catch {}

  // v2.17.1: the Stop button. Raise the flag in its own blob (a sync-state write can
  // never erase it) and let the in-flight pass finish; no further links fire until a
  // human or the schedule starts a fresh run.
  if (stopChainReq) {
    await store.setJSON("chain-stop", { stopped: true, at: new Date().toISOString() });
    return json({ success: true, stopped: true, message: "Auto-continue stopped — the current pass finishes, then it pauses." });
  }

  // ── 0. Single-flight lock. A scheduled run and a browser-driven sweep pass can
  // land at the same time; both mutating the work queue loses updates. The loser
  // backs off (the sweep retries in a few seconds).
  const prevState = (await store.get("sync-state", { type: "json" }) as any) || {};
  if (prevState.running && prevState.startedAt && (Date.now() - Date.parse(prevState.startedAt)) < TUNING.LOCK_STALE_MS) {
    return json({ success: true, busy: true, message: "A sync is already running — try again in a moment." });
  }

  // A chain link arriving after Stop was pressed dies quietly. Fresh triggers
  // (button, schedule, Sync Now) clear the flag below and re-arm auto-continue.
  if (triggeredBy === "chain") {
    const cs = (await store.get("chain-stop", { type: "json" }) as any);
    if (cs?.stopped) return json({ success: true, stopped: true, message: "Auto-continue is stopped." });
  }

  // ── 1. Read prerequisites
  const tokenObj = await store.get("token", { type: "json" }) as any;
  if (!tokenObj?.refresh_token) {
    return json({ error: "No Gmail token stored. Connect Gmail in the app first." }, 400);
  }
  const clientId = Netlify.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Netlify.env.get("GOOGLE_CLIENT_SECRET");
  const anthropicKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!clientId || !clientSecret || !anthropicKey) {
    return json({ error: "Server env vars missing" }, 500);
  }

  // v2.23.0: this used to be `stored || DEFAULT_VENDORS`, so DEFAULT_VENDORS only applied
  // to an install that had never pushed a vendor list. Every real install has — the app
  // POSTs its list to /api/save-sync-config whenever vendors or trucks change — so adding
  // a built-in vendor here did nothing: the crawler never iterated it and its invoices
  // were never fetched, silently, with no error anywhere. Merge instead, keyed by name,
  // with the stored entry winning so a category the office edited in the UI is preserved.
  const vendors = mergeVendors((await store.get("vendors", { type: "json" }) as any), DEFAULT_VENDORS);
  const truckIds = ((await store.get("truck-ids", { type: "json" }) as any) || []) as string[];

  const dedup = (await store.get("dedup-index", { type: "json" }) as any) || { gmailRefs: [], invoiceNums: [], fingerprints: [] };
  let dedupGmailRefs = new Set<string>(dedup.gmailRefs);
  let dedupInvoiceNums = new Set<string>((dedup.invoiceNums as string[]).map((s) => s.toUpperCase()));
  // v2.19.0: content-level dedup. The vendor resends the same service log from new
  // messages under new filenames, so no key derived from the email can catch it —
  // only what the row actually says can. Empty until the next reconcile rebuilds it
  // from the ledger, which is safe: the ref check still runs first.
  let dedupFingerprints = new Set<string>((dedup.fingerprints as string[]) || []);

  // v2.16.19 failure ledger — gmailRef -> { count, error, filename, vendor, lastAt }.
  const failures = ((await store.get("failed-refs", { type: "json" }) as any) || {}) as Record<string, any>;
  // v2.18.1: release everything struck out purely on timeouts. Those were real
  // invoices — too large to render in full inside one run — repeating an attempt
  // that could never fit until the ledger gave up on them. Compact mode gives them
  // a path that fits, so they go back in the queue exactly once, on the run after
  // this deploys. Attachments that failed for any other reason (an image-only PDF,
  // a parser that returned nothing) keep their strikes.
  const qRulesSeen = ((await store.get("quarantine-rules", { type: "json" }) as any)?.v || 1);
  const releasedItems: any[] = [];
  if (qRulesSeen < QUARANTINE_RULES_VERSION) {
    for (const [ref, f] of Object.entries(failures)) {
      const rec = f as any;
      if ((rec?.count || 0) >= TUNING.MAX_ATTEMPTS && /timed out/i.test(String(rec?.error || ""))) {
        // Clear the strikes but KEEP the knowledge that this one times out, so the
        // retry goes straight to compact. Deleting the record outright would send it
        // back through full detail — the attempt that already failed three times —
        // and it would simply be re-quarantined. Records written before v2.18.1 have
        // no `timeouts` field, but the filter above already proved every strike was
        // a timeout, so the old count carries over.
        // timeouts:1 restarts the ladder one rung up — compact, but still reading the
        // WHOLE document. Carrying the old strike count over would jump straight to
        // the page-capped rung, degrading the invoice to a possibly-short total before
        // it ever got a fair full-document retry under the new pipeline.
        failures[ref] = { count: 0, timeouts: 1, filename: rec.filename, vendor: rec.vendor, messageId: rec.messageId, attachmentId: rec.attachmentId, releasedAt: new Date().toISOString() };
        // Quarantining also dropped it from the work queue, and its message is
        // memoized as seen, so discovery will never offer it again. The ref encodes
        // everything needed to rebuild the queue entry, so put it back directly
        // rather than forcing a full re-crawl of the mailbox to find it.
        // v2.19.0: the ref no longer carries the attachment ID (it was never stable
        // enough to be a key), so the record does. Older records predate that field
        // and still have the ID inside the ref.
        const m = /^gmail:(.+):([^:]+)$/.exec(ref);
        const messageId = rec.messageId || (m ? m[1] : "");
        const attachmentId = rec.attachmentId || (m ? m[2] : "");
        if (!messageId || !attachmentId) continue;
        const vendorName = rec.vendor || "";
        const v = vendors.find((x: any) => x.name === vendorName);
        releasedItems.push({
          gmailRef: ref, messageId, attachmentId,
          filename: rec.filename || "invoice.pdf", mimeType: "application/pdf",
          vendorName, vendorCategory: v?.category || "Other",
        });
      }
    }
    await store.setJSON("quarantine-rules", { v: QUARANTINE_RULES_VERSION, freed: releasedItems.length, at: new Date().toISOString() });
    await store.setJSON("failed-refs", failures);
  }

  // v2.23.0: a timeout is not a verdict on the attachment, it is one run's luck with API
  // latency. The same 24-truck service log that overran the 18s cap at 09:00 often fits
  // at noon. Striking those out permanently means real invoices nobody will ever import
  // unless a person notices a line in a status panel — which is exactly how two August
  // FuelFox logs ended up invisible while the sync reported "All caught up".
  //
  // So a quarantine whose every strike was a timeout cools off and goes back in the
  // queue. `timeouts` is preserved, so the retry resumes at the highest rung of the
  // ladder rather than repeating the full-detail attempt that already failed. Anything
  // that failed for a real reason — an image-only PDF, a parser that returned nothing —
  // keeps its strikes and stays put.
  let cooled = 0;
  for (const [ref, f] of Object.entries(failures)) {
    const rec = f as any;
    if ((rec?.count || 0) < TUNING.MAX_ATTEMPTS) continue;
    if (!/timed out/i.test(String(rec?.error || ""))) continue;
    const last = Date.parse(rec?.lastAt || rec?.releasedAt || "");
    if (!Number.isFinite(last) || Date.now() - last < TUNING.RETRY_QUARANTINE_MS) continue;
    const m = /^gmail:(.+):([^:]+)$/.exec(ref);
    const messageId = rec.messageId || (m ? m[1] : "");
    const attachmentId = rec.attachmentId || (m ? m[2] : "");
    if (!messageId || !attachmentId) continue;
    const v = vendors.find((x: any) => x.name === (rec.vendor || ""));
    // One attempt per cooling period: back to the queue at MAX-1, so a still-too-slow
    // invoice re-quarantines after that single try and waits another 6h instead of
    // burning the whole run budget on it every time.
    failures[ref] = { ...rec, count: TUNING.MAX_ATTEMPTS - 1, cooledAt: new Date().toISOString() };
    releasedItems.push({
      gmailRef: ref, messageId, attachmentId,
      filename: rec.filename || "invoice.pdf", mimeType: "application/pdf",
      vendorName: rec.vendor || "", vendorCategory: v?.category || "Other",
    });
    cooled++;
  }
  if (cooled) await store.setJSON("failed-refs", failures);
  const isQuarantined = (ref: string) => ((failures[ref]?.count || 0) >= TUNING.MAX_ATTEMPTS);
  const stuckCount = () => Object.values(failures).filter((f: any) => (f?.count || 0) >= TUNING.MAX_ATTEMPTS).length;

  // Durable work queue + discovery cursor + message memo
  const wq = ((await store.get("work-queue", { type: "json" }) as any) || { items: [], discovery: null }) as {
    items: any[];
    discovery: { coveredDays: number; done: boolean; vendorIdx: number; pageToken: string | null; epochAt: string; freshAfter: string | null } | null;
  };
  const seen = ((await store.get("seen-messages", { type: "json" }) as any) || {}) as Record<string, 1>;
  // v2.24.1: per-message failure strikes, so one message Gmail will not serve cannot
  // stall the whole pipeline forever. Same ladder as the attachment quarantine.
  const msgFailures = ((await store.get("failed-messages", { type: "json" }) as any) || {}) as Record<string, { count: number; error: string }>;

  // Mark running (after the lock check, so a busy bounce never stamps the lock)
  await store.setJSON("sync-state", {
    ...prevState,
    running: true,
    startedAt: new Date().toISOString(),
    message: "Syncing…",
  });
  // A human or the schedule starting a run is fresh intent — re-arm auto-continue.
  if (triggeredBy !== "chain") await store.setJSON("chain-stop", { stopped: false });

  let imported = 0;
  let queued = 0;
  let processed = 0;
  let discovered = 0;
  let errors: string[] = [];
  let timedOut = false;
  let fbApp: any = null;
  let db: any = null;
  const getDb = () => {
    if (!db) { fbApp = initializeApp(FIREBASE_CONFIG, `auto-sync-${Date.now()}`); db = getFirestore(fbApp); }
    return db;
  };

  try {
    // ── 2. Gmail access token
    const accessToken = await refreshAccessToken(tokenObj.refresh_token, clientId, clientSecret);

    // ── 3. Discovery epoch. A new epoch starts when the requested window is wider
    // than what the current one covered, or (cheaply, at an empty-queue moment) at
    // most daily so client-side ledger changes fold back into the dedup index.
    let disco = wq.discovery;
    const epochAgeDays = disco ? (Date.now() - Date.parse(disco.epochAt)) / 86400000 : Infinity;
    // v2.17.2: a memo-version bump forces one recovery epoch. Wait for the queue to
    // drain first — re-enumerating on top of a full queue would just delay the work
    // already discovered, and anything lost has waited this long already.
    const memoStale = ((await store.get("memo-version", { type: "json" }) as any)?.v || 1) < MEMO_VERSION;
    const idleAtDone = wq.items.length === 0 && !!disco?.done;
    const needEpoch = !disco || daysBack > disco.coveredDays ||
      (idleAtDone && (memoStale || epochAgeDays >= TUNING.EPOCH_MAX_AGE_DAYS));
    // Running totals across the whole drain — chain links each import a slice, and
    // the UI should report the sum, not the last link's. Reset at each epoch.
    const epochBaseImported = needEpoch ? 0 : (prevState.epochImported || 0);
    const epochBaseQueued = needEpoch ? 0 : (prevState.epochQueued || 0);
    if (needEpoch) {
      const truth = await reconcileFromLedger(getDb());
      // Any ref the old index called settled but the ledger has no trace of was lost
      // (the shard-wipe bug's signature). Un-see its message so the crawl below
      // re-enumerates and re-imports it — with the memo intact it would never return.
      for (const ref of dedupGmailRefs) {
        if (!truth.gmailRefs.has(ref)) { const mid = ref.split(":")[1]; if (mid) delete seen[mid]; }
      }
      // v2.17.2 recovery: the old write path could drop an attachment without ever
      // recording its ref, so the un-see pass above cannot find it — its message is
      // simply memoized as done. Clearing the memo re-enumerates everything once;
      // dedup keeps that free for the invoices already imported.
      if (memoStale && idleAtDone) {
        for (const k of Object.keys(seen)) delete seen[k];
        await store.setJSON("memo-version", { v: MEMO_VERSION, at: new Date().toISOString() });
      }
      dedupGmailRefs = truth.gmailRefs;
      dedupInvoiceNums = truth.invoiceNums;
      dedupFingerprints = truth.fingerprints;
      disco = {
        // v2.23.0: never NARROW the horizon. The scheduled run asks for 30 days, so a
        // fresh epoch used to reset coveredDays to 30 and quietly undo a 365-day or
        // 2-year Catch Up sweep — which is why a manual wide scan kept turning up
        // hundreds of "new" emails that the unattended sync had never once looked for.
        // Widening is cheap: the full crawl runs at most once per epoch (daily), it is
        // resumable across runs via pageToken, and once complete freshAfter drops every
        // later run back to a 3-day list. Dedup happens before the paid AI call, so
        // re-seeing an old invoice costs nothing.
        coveredDays: Math.max(daysBack, disco?.coveredDays || 0, 0),
        done: false,
        vendorIdx: 0,
        pageToken: null,
        epochAt: new Date().toISOString(),
        freshAfter: null,
      };
      // Queue items that the rebuilt index now recognizes as settled drop out here.
      wq.items = wq.items.filter((it) => !dedupGmailRefs.has(it.gmailRef) && !isQuarantined(it.gmailRef));
    }
    disco = disco!;

    const queuedRefs = new Set<string>(wq.items.map((it) => it.gmailRef));
    const enqueue = (item: any, front = false) => {
      if (queuedRefs.has(item.gmailRef)) return;
      queuedRefs.add(item.gmailRef);
      if (front) wq.items.unshift(item); else wq.items.push(item);
      discovered++;
    };
    // v2.18.1: attachments freed from a timeout quarantine, put back at the front so
    // they are retried in compact mode before the run spends its budget elsewhere.
    // Skipped if the invoice has since been imported some other way.
    for (const it of releasedItems) if (!dedupGmailRefs.has(it.gmailRef)) enqueue(it, true);

    // ── 4. Crawl (resumable) or freshness check.
    if (!disco.done) {
      await crawlMailbox(accessToken, vendors, disco, seen, dedupGmailRefs, isQuarantined, enqueue, startedAt, msgFailures, errors);
    } else {
      await freshCheck(accessToken, vendors, disco, seen, dedupGmailRefs, isQuarantined, enqueue, startedAt, msgFailures, errors);
    }

    // ── 5. Process the queue front under the remaining budget.
    const newCostsAdds: any[] = [];
    const newReviewAdds: any[] = [];
    if (wq.items.length > 0) getDb();

    /* v2.17.1: rolling worker pool instead of lockstep batches. A batch waited on
       its slowest member, so most lanes idled and a run settled ~8 attachments.
       Each worker now pulls the next pending item the moment it frees up, keeping
       every lane busy for the whole budget. Still one attempt per attachment per
       run (a failure goes to the back of the queue for the NEXT run), so a bad
       stretch can't burn all of an attachment's quarantine attempts in one
       22-second window. */
    const attempted = new Set<string>();
    const inFlight = new Set<string>();
    // Refs whose data is parsed and awaiting a durable ledger write (step 6).
    const pendingRefs = new Map<string, "cost" | "review">();
    const pendingQueued = new Map<string, number>();
    const pendingNums = new Map<string, string[]>();
    const pendingFps = new Map<string, string[]>();
    const settle = (r: any, fairAttempt: boolean, deadlineMs: number) => {
      const idx = wq.items.findIndex((it) => it.gmailRef === r.gmailRef);
      // A timeout against a squeezed end-of-run deadline says nothing about the
      // item — it stays queued, unpenalized, and the run wraps up.
      if (r.aborted && !fairAttempt) { timedOut = true; return; }
      processed++;
      if (r.transient) {
        // Rate limits and server-side hiccups (Gmail/Anthropic 429/5xx, network
        // resets) say nothing about the attachment either. With PROC_CONC lanes
        // hammering the AI API a 429 is routine backpressure — requeue behind
        // fresh work for the next run, never counted toward quarantine.
        if (idx >= 0) { wq.items.push(wq.items.splice(idx, 1)[0]); }
        return;
      }
      if (r.error || r.aborted) {
        const prev = failures[r.gmailRef] || {};
        // Name the stage and the size. "timed out in parse (12.4s) — 41 pages, 6.2 MB"
        // is a diagnosis; "timed out after 18s" was a dead end.
        const where = r.stage ? ` in ${r.stage}` : "";
        const detail = [r.timing, r.pages ? `${r.pages} pages` : "", r.bytes ? `${(r.bytes / 1048576).toFixed(1)} MB` : ""].filter(Boolean).join(", ");
        const errText = (r.aborted ? `timed out${where} after ${Math.round(deadlineMs / 1000)}s` : r.error)
          + (detail ? ` [${detail}]` : "");
        const count = (prev.count || 0) + 1;
        // v2.18.1: count timeouts separately. A timeout is not "this PDF is broken",
        // it is "this invoice needs more output than one run can generate" — the next
        // attempt drops to compact mode instead of repeating an attempt that cannot
        // fit. Only a genuine parse/fetch error means the attachment itself is bad.
        const timeouts = (prev.timeouts || 0) + (r.aborted ? 1 : 0);
        failures[r.gmailRef] = { count, timeouts, error: errText, filename: r.filename, vendor: r.vendor, messageId: r.messageId, attachmentId: r.attachmentId, lastAt: new Date().toISOString() };
        const quarantined = count >= TUNING.MAX_ATTEMPTS;
        errors.push(`${r.gmailRef}: ${errText}${quarantined ? ` — quarantined after ${count} attempts` : ""}`);
        if (idx >= 0) {
          if (quarantined) { wq.items.splice(idx, 1); queuedRefs.delete(r.gmailRef); }
          else { wq.items.push(wq.items.splice(idx, 1)[0]); } // retry later, behind fresh work
        }
        return;
      }
      // v2.17.2: a duplicate or a skip needs no ledger write, so it is settled here
      // and now. Anything carrying data is only PARSED at this point — it is not
      // removed from the queue and not added to the dedup index until step 6 has
      // durably written it. Marking it settled first is exactly how the pre-v2.17.2
      // path lost invoices when the review-queue write threw.
      if (r.skipReason) {
        delete failures[r.gmailRef];
        dedupGmailRefs.add(r.gmailRef);
        if (idx >= 0) { wq.items.splice(idx, 1); queuedRefs.delete(r.gmailRef); }
        return;
      }
      // The invoiceNum side of the index is deferred for the same reason as the ref
      // side: recording it before the write is durable makes the retry treat its own
      // un-written invoice as an already-imported duplicate and skip it forever.
      const nums = (r.entries || []).map((e: any) => e.invoiceNum).filter(Boolean).map((n: any) => String(n).toUpperCase());
      if (nums.length) pendingNums.set(r.gmailRef, nums);
      const fps = (r.entries || []).map((e: any) => entryFingerprint(e));
      if (fps.length) pendingFps.set(r.gmailRef, fps);
      if (r.confidence === "high") {
        newCostsAdds.push(...r.entries);
        pendingRefs.set(r.gmailRef, "cost");
      } else {
        newReviewAdds.push({
          id: newId(),
          gmailRef: r.gmailRef,
          vendor: r.vendor,
          filename: r.filename,
          confidence: r.confidence,
          confidenceReason: r.confidenceReason,
          parsed: r.entries,
          fileUrl: r.fileUrl,
          addedAt: new Date().toISOString(),
          status: "pending",
        });
        pendingRefs.set(r.gmailRef, "review");
        pendingQueued.set(r.gmailRef, r.entries.length);
      }
    };
    const worker = async () => {
      while (true) {
        const remainMs = TUNING.BUDGET_MS - elapsed();
        if (remainMs < TUNING.MIN_START_MS) {
          if (wq.items.some((it) => !attempted.has(it.gmailRef))) timedOut = true;
          return;
        }
        const item = wq.items.find((it) => !attempted.has(it.gmailRef) && !inFlight.has(it.gmailRef));
        if (!item) return;
        attempted.add(item.gmailRef);
        inFlight.add(item.gmailRef);
        const deadlineMs = Math.min(remainMs - TUNING.WRITE_HEADROOM_MS, TUNING.ITEM_CAP_MS);
        const fairAttempt = deadlineMs >= TUNING.FAIR_MS;
        // v2.18.4: an escalation ladder, because "ask for less" has two independent
        // dials and the first fix only turned one. Attempt 1 reads the whole PDF and
        // asks for full detail; attempt 2 keeps the whole PDF but asks for summary
        // rows only; attempt 3 also stops reading after PDF_MAX_PAGES, which is the
        // dial that matters when the time is going into parsing rather than the AI.
        const priorTimeouts = failures[item.gmailRef]?.timeouts || 0;
        const compact = priorTimeouts >= 1;
        const pageCap = priorTimeouts >= 2;
        const r = await processOne(item, accessToken, anthropicKey, truckIds, vendors, dedupInvoiceNums, dedupFingerprints, AbortSignal.timeout(deadlineMs), compact, pageCap);
        inFlight.delete(item.gmailRef);
        settle(r, fairAttempt, deadlineMs);
      }
    };
    await Promise.all(Array.from({ length: TUNING.PROC_CONC }, () => worker()));

    // ── 6. Write imports — merge each month shard against a FRESH read of that shard,
    // taken at write time rather than at run start. The old upfront read of EVERY shard
    // cost seconds of every run's budget and left a whole run's width for a concurrent
    // client write to slip between read and write; now only the target months are read,
    // moments before writing. Entries whose id or invoiceNum is already present in the
    // shard are dropped rather than duplicated.
    const writeFailedRefs = new Set<string>();
    if (newCostsAdds.length > 0) {
      const byShard: Record<string, any[]> = {};
      for (const e of newCostsAdds) { const k = costShardKey(e); (byShard[k] ||= []).push(e); }
      // v2.17.1: with parallel lanes, two attachments carrying the SAME invoice can
      // both finish parsing before either settles, so both arrive here. First
      // attachment to claim an invoiceNum this run keeps it; entries from a
      // different gmailRef with the same number are dropped. Entries of the SAME
      // attachment share a number on purpose (multi-line invoices) and always pass.
      const runNumOwner = new Map<string, string>();
      for (const k of Object.keys(byShard)) {
        // v2.17.2: a month is a sharded list now, so read every shard of it — the
        // dedup check has to see entries that spilled past the first shard, or a
        // re-run would append duplicates behind its back.
        const base = `fl-costs-${k}`;
        const shards = await readShardedList(getDb(), base);
        const existing = shards.flatMap((s) => s.arr);
        const haveIds = new Set(existing.map((e) => e.id));
        const haveNums = new Set(existing.map((e) => String(e.invoiceNum || "").toUpperCase()).filter(Boolean));
        /* v2.19.0: the last line of defence, and the only one that holds for a document
           with no invoice number on it. Checked against a fresh read of the shard being
           written, so it catches a re-import no in-memory index knows about.

           Judged per DOCUMENT, not per row: a document counts as already imported only
           when EVERY row of it is already there. Dropping individual matching rows
           would silently delete 23 real rows of a 24-truck log because the vendor
           corrected one amount — losing invoices is the failure this whole path exists
           to prevent, and it is worse than importing one twice. */
        const docs = new Map<string, any[]>();
        for (const e of byShard[k]) {
          const ref = e.gmailRef || String(e.id);
          if (!docs.has(ref)) docs.set(ref, []);
          docs.get(ref)!.push(e);
        }
        // Grows as documents are accepted, so two lanes parsing the same resent log in
        // one run don't both write it.
        const claimed = new Set<string>(existing.map((e) => entryFingerprint(e)));
        const fullDup = new Set<string>();
        for (const [ref, rows] of docs) {
          if (rows.every((e) => claimed.has(entryFingerprint(e)))) { fullDup.add(ref); continue; }
          for (const e of rows) claimed.add(entryFingerprint(e));
        }
        const adds = byShard[k].filter((e) => {
          if (haveIds.has(e.id)) return false;
          if (fullDup.has(e.gmailRef || String(e.id))) return false;
          const num = e.invoiceNum ? String(e.invoiceNum).toUpperCase() : "";
          if (!num) return true;
          if (haveNums.has(num)) return false;
          const owner = runNumOwner.get(num);
          if (owner && owner !== e.gmailRef) return false;
          runNumOwner.set(num, e.gmailRef);
          return true;
        });
        if (adds.length === 0) continue;
        const res = await appendSharded(getDb(), base, shards, adds, errors);
        imported += res.committed;
        // Requeue only the entries that did NOT land. Anything already filtered out
        // as a duplicate, or written before the failure, is in the ledger — treating
        // it as failed would re-import the invoice on the next run.
        if (!res.ok) for (const e of adds.slice(res.committed)) if (e.gmailRef) writeFailedRefs.add(e.gmailRef);
      }
    }
    if (newReviewAdds.length > 0) {
      const shards = await readShardedList(getDb(), "fl-review-queue");
      // Idempotency, same as the cost path: a retry after a partial write must not
      // append a second copy of an item that already made it in.
      const haveRefs = new Set(shards.flatMap((s) => s.arr).map((it: any) => it && it.gmailRef).filter(Boolean));
      const revAdds = newReviewAdds.filter((it) => !haveRefs.has(it.gmailRef));
      const res = await appendSharded(getDb(), "fl-review-queue", shards, revAdds, errors);
      if (!res.ok) for (const it of revAdds.slice(res.committed)) if (it.gmailRef) writeFailedRefs.add(it.gmailRef);
    }

    // ── 6b. Commit the two-phase settle: an attachment counts as done only now
    // that its data is durably in the ledger. Anything whose write failed stays
    // queued for the next run and takes no quarantine strike — the failure was
    // ours, not the attachment's.
    for (const [ref, kind] of pendingRefs) {
      const idx = wq.items.findIndex((it) => it.gmailRef === ref);
      if (writeFailedRefs.has(ref)) {
        if (idx >= 0) wq.items.push(wq.items.splice(idx, 1)[0]);
        continue;
      }
      delete failures[ref];
      dedupGmailRefs.add(ref);
      for (const n of pendingNums.get(ref) || []) dedupInvoiceNums.add(n);
      for (const f of pendingFps.get(ref) || []) dedupFingerprints.add(f);
      if (idx >= 0) { wq.items.splice(idx, 1); queuedRefs.delete(ref); }
      if (kind === "review") queued += pendingQueued.get(ref) || 0;
    }

    // ── 7. Persist queue, memo, dedup, failures, state.
    wq.discovery = disco;
    await store.setJSON("work-queue", wq);
    await store.setJSON("seen-messages", seen);
    await store.setJSON("failed-messages", msgFailures);
    await store.setJSON("dedup-index", {
      gmailRefs: Array.from(dedupGmailRefs),
      invoiceNums: Array.from(dedupInvoiceNums),
      fingerprints: Array.from(dedupFingerprints),
    });
    await store.setJSON("failed-refs", failures);

    const elapsedSec = Math.round(elapsed() / 1000);
    const remaining = wq.items.length;
    const done = disco.done && remaining === 0;
    // Old clients break their sweep on processed:0 && !timedOut — keep timedOut
    // meaning "there is more to do" so they never false-stop mid-drain.
    timedOut = timedOut || remaining > 0 || !disco.done;
    const stuck = stuckCount();
    const stuckNote = stuck ? ` ${stuck} attachment(s) skipped after failing ${TUNING.MAX_ATTEMPTS} times — see errors.` : "";
    const epochImported = epochBaseImported + imported;
    const epochQueued = epochBaseQueued + queued;
    // Honor a Stop pressed while this pass ran — read fresh, from its own blob, so
    // nothing this run wrote can have erased it.
    const chainStopped = !!((await store.get("chain-stop", { type: "json" }) as any)?.stopped);
    const willChain = !done && !chainStopped && chainDepth < TUNING.CHAIN_MAX;
    const bits: string[] = [];
    if (processed) bits.push(`processed ${processed}`);
    if (discovered) bits.push(`found ${discovered} new`);
    const message = done
      ? `✓ All caught up — imported ${epochImported}${epochQueued ? `, ${epochQueued} queued for review` : ""} this sweep. Nothing new in the last ${disco.coveredDays} days.${stuckNote}`
      : `⏳ ${bits.join(" · ") || "No progress this run"} — imported ${epochImported} so far, ${remaining} in queue${!disco.done ? ", still scanning mailbox" : ""}. ${willChain ? "Continuing automatically…" : chainStopped ? "Stopped — resumes on the next scheduled sync or Catch Up Backlog." : "Resumes on the next scheduled sync."}${stuckNote}`;

    await store.setJSON("sync-state", {
      lastRun: new Date().toISOString(),
      lastSuccess: errors.length === 0 ? new Date().toISOString() : prevState.lastSuccess,
      running: false,
      imported,
      queued,
      epochImported,
      epochQueued,
      errors: [...errors.slice(0, 3), ...stuckList(failures)].slice(0, 5),
      message,
      elapsedSec,
      processed,
      discovered,
      remaining,
      total: remaining + processed,
      timedOut,
      done,
      stuck,
      chained: chainDepth,
    });

    // v2.17.1: auto-continue. While work remains, fire the next link ourselves —
    // one trigger (schedule or button) drains the whole backlog, no browser needed.
    // Fire-and-mostly-forget: hold the connection just long enough for the request
    // to get out; if a link is ever dropped, the next scheduled run restarts the
    // chain. Depth-capped, halted by chain-stop, serialized by the run lock.
    if (willChain) {
      const base = Netlify.env.get("URL") || "";
      if (base) {
        const next = fetch(`${base}/api/auto-sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ daysBack: disco.coveredDays, chain: chainDepth + 1, triggeredBy: "chain" }),
        }).then((r) => r.json()).catch(() => {});
        await Promise.race([next, new Promise((r) => setTimeout(r, TUNING.CHAIN_HANDOFF_MS))]);
      }
    }

    return json({ success: true, imported, queued, epochImported, epochQueued, processed, discovered, remaining, discoveryDone: disco.done, done, timedOut, stuck, chaining: willChain, message });
  } catch (err: any) {
    const errMsg = err?.message || "Unknown error";
    // Keep whatever discovery/settlement survived — it's all idempotent. The dedup
    // index MUST be persisted here too (v2.17.2): before, a throw left refs settled
    // in the persisted work queue but absent from the persisted index, so nothing
    // would ever re-enumerate them.
    try {
      await store.setJSON("work-queue", wq);
      await store.setJSON("seen-messages", seen);
      await store.setJSON("failed-messages", msgFailures);
      await store.setJSON("dedup-index", {
        gmailRefs: Array.from(dedupGmailRefs),
        invoiceNums: Array.from(dedupInvoiceNums),
        fingerprints: Array.from(dedupFingerprints),
      });
      await store.setJSON("failed-refs", failures);
    } catch {}
    const remaining = wq.items.length;
    await store.setJSON("sync-state", {
      ...prevState,
      running: false,
      lastRun: new Date().toISOString(),
      remaining,
      message: `✗ Sync failed: ${errMsg}${remaining ? ` — ${remaining} still queued, will retry.` : ""}`,
      errors: [errMsg],
    });
    // v2.17.2: a failed link must not end the drain. Chain on only when the run got
    // real work done first — a run that dies before processing anything would
    // otherwise hot-loop through the whole chain budget, so leave that to the
    // 3-hourly schedule.
    if (processed > 0 && remaining > 0 && chainDepth < TUNING.CHAIN_MAX) {
      try {
        const stopped = !!((await store.get("chain-stop", { type: "json" }) as any)?.stopped);
        const base = Netlify.env.get("URL") || "";
        if (!stopped && base) {
          const next = fetch(`${base}/api/auto-sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ daysBack, chain: chainDepth + 1, triggeredBy: "chain" }),
          }).then((r) => r.json()).catch(() => {});
          await Promise.race([next, new Promise((r) => setTimeout(r, TUNING.CHAIN_HANDOFF_MS))]);
        }
      } catch {}
    }
    return json({ error: errMsg, imported, queued, processed, remaining }, 500);
  }
};

// ──────────────────────────────────────────────────────────────────────────

/**
 * Rebuild the dedup index from what the ledger ACTUALLY contains: active month
 * shards, archive shards, the pending review queue, and human tombstones
 * (fl-rejected-refs — written by the app when a review item is rejected or an
 * imported invoice is deleted, so a human "no" doesn't boomerang back on the next
 * sweep). Any gmailRef the old index claimed was settled but that has no trace
 * here gets dropped — re-queued and re-imported. That heals entries lost to a
 * stale client's shard write, and it is what lets the Purge-vendor buttons
 * actually re-scan: purged refs lose their trace on purpose.
 */
async function reconcileFromLedger(db: any): Promise<{ gmailRefs: Set<string>; invoiceNums: Set<string>; fingerprints: Set<string> }> {
  const kv = collection(db, "kv");
  // Note: the fl-costs- / fl-arch-costs- ranges already cover overflow shards
  // (`fl-costs-2026-05_2` sorts inside the same prefix range).
  const [shardSnap, archSnap, legacyDoc, reviewShards, rejectedDoc] = await Promise.all([
    getDocs(prefixRange(kv, "fl-costs-")),
    getDocs(prefixRange(kv, "fl-arch-costs-")),
    getDoc(doc(db, "kv", "fl-costs")),
    readShardedList(db, "fl-review-queue"),
    getDoc(doc(db, "kv", "fl-rejected-refs")),
  ]);
  const gmailRefs = new Set<string>();
  const invoiceNums = new Set<string>();
  const fingerprints = new Set<string>();
  /* v2.19.0: an entry stored before this version carries the old volatile ref, which
     nothing will ever produce again. Its Blobs file key is the attachment's filename
     behind a timestamp, so the stable ref can be rebuilt from it — without that, the
     first crawl after this deploy would treat every attachment ever imported as new. */
  const addRefs = (e: any) => {
    if (!e?.gmailRef) return;
    gmailRefs.add(e.gmailRef);
    const messageId = String(e.gmailRef).split(":")[1];
    if (!messageId) return;
    let key = e.fileKey ? String(e.fileKey) : "";
    if (!key && e.fileUrl) {
      const m = /[?&]key=([^&]+)/.exec(String(e.fileUrl));
      if (m) { try { key = decodeURIComponent(m[1]); } catch { key = m[1]; } }
    }
    const name = key.replace(/^\d+-/, "");
    if (name) gmailRefs.add(`gmail:${messageId}:${name}`);
  };
  const eat = (arr: any) => {
    if (!Array.isArray(arr)) return;
    for (const e of arr) {
      addRefs(e);
      if (e?.invoiceNum) invoiceNums.add(String(e.invoiceNum).toUpperCase());
      fingerprints.add(entryFingerprint(e));
    }
  };
  const eatDoc = (d: any) => { try { eat(JSON.parse(d.data().v)); } catch {} };
  shardSnap.forEach(eatDoc);
  archSnap.forEach(eatDoc);
  if (legacyDoc.exists()) eatDoc(legacyDoc);
  // A review item is not in the ledger yet, so its rows must NOT seed fingerprints —
  // approving it would then look like a duplicate of itself. Its ref is enough.
  for (const s of reviewShards) for (const it of s.arr) addRefs(it);
  if (rejectedDoc.exists()) {
    try {
      const refs = JSON.parse(rejectedDoc.data().v);
      if (Array.isArray(refs)) for (const r of refs) if (typeof r === "string") gmailRefs.add(r);
    } catch {}
  }
  return { gmailRefs, invoiceNums, fingerprints };
}

/**
 * Resumable mailbox crawl. Pages through each vendor's full window (LIST_PAGE at a
 * time), fetches payloads ONLY for messages never enumerated before, enqueues their
 * un-settled PDF attachments, and records the cursor so the next run continues where
 * this one stopped. The cursor only advances past a page once every unseen message
 * on it has been enumerated, so a mid-page deadline loses nothing.
 */
async function crawlMailbox(
  accessToken: string, vendors: any[], disco: any, seen: Record<string, 1>,
  dedupGmailRefs: Set<string>, isQuarantined: (r: string) => boolean,
  enqueue: (item: any, front?: boolean) => void, startedAt: number,
  msgFailures: Record<string, { count: number; error: string }>, errors: string[]
) {
  const deadlineAt = startedAt + TUNING.DISCOVERY_MS;
  while (!disco.done && Date.now() < deadlineAt) {
    const vendor = vendors[disco.vendorIdx];
    if (!vendor) { finishCrawl(disco); break; }
    const q = buildVendorQuery(vendor.name, afterDateStr(disco.coveredDays));
    let page;
    try {
      page = await gmailList(accessToken, q, disco.pageToken, TUNING.LIST_PAGE);
    } catch (e) {
      if (disco.pageToken) { disco.pageToken = null; continue; } // stale cursor — restart vendor (seen-memo keeps it cheap)
      throw e;
    }
    const unseen = page.ids.filter((id) => !seen[id]);
    let finishedPage = true;
    for (let i = 0; i < unseen.length; i += TUNING.GET_CONC) {
      if (Date.now() >= deadlineAt) { finishedPage = false; break; }
      const metas = await gmailGetMessages(accessToken, unseen.slice(i, i + TUNING.GET_CONC), msgFailures, seen, errors);
      for (const m of metas) {
        enqueueMessagePdfs(m, vendor, dedupGmailRefs, isQuarantined, enqueue, false);
        seen[m.emailId] = 1;
      }
    }
    if (!finishedPage) break; // same pageToken next run; already-fetched ids skip via seen
    if (page.nextPageToken) { disco.pageToken = page.nextPageToken; }
    else {
      disco.vendorIdx++;
      disco.pageToken = null;
      if (disco.vendorIdx >= vendors.length) finishCrawl(disco);
    }
  }
}

function finishCrawl(disco: any) {
  disco.done = true;
  disco.freshAfter = afterDateStr(TUNING.FRESH_SLACK_DAYS);
}

/**
 * Once the crawl is done, each run only looks for NEW mail bounded by the last
 * check (minus slack — dedup and the seen-memo make overlap free). Steady state is
 * 3 list calls, zero payload fetches, zero AI calls. Paginated (v2.17.1): a burst
 * bigger than one list page keeps listing rather than silently waiting for the
 * next daily epoch — and if the discovery deadline cuts a vendor off mid-page,
 * the cursor does NOT advance, so the overflow is re-listed next run.
 */
async function freshCheck(
  accessToken: string, vendors: any[], disco: any, seen: Record<string, 1>,
  dedupGmailRefs: Set<string>, isQuarantined: (r: string) => boolean,
  enqueue: (item: any, front?: boolean) => void, startedAt: number,
  msgFailures: Record<string, { count: number; error: string }>, errors: string[]
) {
  const after = disco.freshAfter || afterDateStr(TUNING.FRESH_SLACK_DAYS);
  const deadlineAt = startedAt + TUNING.DISCOVERY_MS;
  let complete = true;
  await Promise.all(vendors.map(async (vendor: any) => {
    let pageToken: string | null = null;
    do {
      const page = await gmailList(accessToken, buildVendorQuery(vendor.name, after), pageToken, TUNING.LIST_PAGE);
      const unseen = page.ids.filter((id: string) => !seen[id]);
      for (let i = 0; i < unseen.length; i += TUNING.GET_CONC) {
        const metas = await gmailGetMessages(accessToken, unseen.slice(i, i + TUNING.GET_CONC), msgFailures, seen, errors);
        for (const m of metas) {
          enqueueMessagePdfs(m, vendor, dedupGmailRefs, isQuarantined, enqueue, true); // front: newest first
          seen[m.emailId] = 1;
        }
      }
      pageToken = page.nextPageToken;
      if (pageToken && Date.now() >= deadlineAt) { complete = false; break; }
    } while (pageToken);
  }));
  if (complete) disco.freshAfter = afterDateStr(TUNING.FRESH_SLACK_DAYS);
}

function enqueueMessagePdfs(
  m: any, vendor: any, dedupGmailRefs: Set<string>, isQuarantined: (r: string) => boolean,
  enqueue: (item: any, front?: boolean) => void, front: boolean
) {
  for (const a of m.attachments || []) {
    if (!a.attachmentId) continue; // inline-data parts can't be fetched via the attachments endpoint
    const isPdf = (a.mimeType || "").includes("pdf") || (a.filename || "").toLowerCase().endsWith(".pdf");
    if (!isPdf) continue;
    // v2.19.0: keyed on the filename, not the attachment ID. Gmail hands back a new
    // attachment ID every time a message is fetched, so the old key matched nothing
    // on a re-crawl and every attachment was imported again on every pass.
    const gmailRef = stableGmailRef(m.emailId, a.filename);
    // The volatile form is still checked so work settled before this deploy isn't
    // re-imported when the ledger happens to carry a matching ID.
    const legacyRef = `gmail:${m.emailId}:${a.attachmentId}`;
    if (dedupGmailRefs.has(gmailRef) || dedupGmailRefs.has(legacyRef)) continue;
    if (isQuarantined(gmailRef) || isQuarantined(legacyRef)) continue;
    enqueue({
      gmailRef,
      messageId: m.emailId,
      attachmentId: a.attachmentId,
      filename: a.filename,
      mimeType: a.mimeType,
      vendorName: vendor.name,
      vendorCategory: vendor.category,
    }, front);
  }
}

// v2.16.19: name the attachments that hit MAX_ATTEMPTS so the status panel reports what
// is stuck and why, rather than only counting them. Capped to keep sync-state small.
function stuckList(failures: Record<string, any>): string[] {
  return Object.entries(failures)
    .filter(([, f]) => ((f as any)?.count || 0) >= TUNING.MAX_ATTEMPTS)
    .slice(0, 5)
    .map(([ref, f]) => {
      const x = f as any;
      return `${x.filename || ref}${x.vendor ? ` (${x.vendor})` : ""}: ${x.error || "failed"}`;
    });
}

// v2.16.7: per-month shard key for a cost entry — must match costShardKey() in App.jsx.
function costShardKey(e: any): string {
  const m = String(e?.date || "").slice(0, 7);
  return /^\d{4}-\d{2}$/.test(m) ? m : "unknown";
}

/* ── v2.19.0 dedup + multi-truck split. Mirrored in App.jsx (splitMultiTruck /
   entryFingerprint) so an invoice imported by the browser and one imported by the
   server produce the same rows and the same keys. Change one, change both. ── */

// Gmail attachment IDs are regenerated per messages.get, so they cannot identify an
// attachment across runs. The filename can. Matches the safeName transform used for
// the Blobs file key, so a stable ref can be recovered from an already-stored entry.
function attachmentSlug(filename: string): string {
  return (filename || "invoice.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
}
function stableGmailRef(messageId: string, filename: string): string {
  return `gmail:${messageId}:${attachmentSlug(filename)}`;
}

// What the ledger actually sums on. Deliberately excludes invoiceNum: for documents
// that print no invoice number the parser invents one, and it invents a different
// one every pass — that field is the reason the duplicates got through.
function entryFingerprint(e: any): string {
  return [
    String(e?.vendor || "").trim().toLowerCase(),
    String(e?.date || "").slice(0, 10),
    String(e?.truckId || ""),
    (Number(e?.total) || 0).toFixed(2),
  ].join("|");
}

const TRUCK_IN_DESC = /\b(?:truck|unit)\s*#?\s*(\d{3,5})\b/i;

// v2.22.0: mirror of normalizeTruckId() in App.jsx. Some vendors print the unit with a
// yard prefix — Complete Fleet Services bills "BX0424"/"GP2883" in the Customer PO /
// Unit # cell. The fleet knows those as 0424 and 2883. Strip it deterministically
// rather than leaning on the model, and only when the bare digits are a REAL fleet
// number, so an unknown unit still surfaces as unknown instead of being coerced.
function normalizeTruckId(raw: any, fleetIds: string[] | Set<string>): string {
  const id = String(raw == null ? "" : raw).trim();
  if (!id) return id;
  const known = fleetIds instanceof Set ? fleetIds : new Set(fleetIds || []);
  if (known.has(id)) return id;
  const m = /^[A-Za-z]{1,3}[-\s]?(\d{3,5})$/.exec(id);
  if (m && known.has(m[1])) return m[1];
  if (m) {
    const n = m[1].replace(/^0+/, "");
    for (const k of known) if (String(k).replace(/^0+/, "") === n) return k;
  }
  return id;
}
// Generous ceiling on one fill: the largest tank here is ~150 gal, and the collapsed
// service logs carried 700–1,500. Anything between is ambiguous, so it passes.
const TANK_GALLONS = 250;

/**
 * One row whose line items name several trucks is a DOCUMENT total, not a truck's
 * cost — a fuel service log collapsed onto whichever unit was printed first. Split
 * it back out, one entry per unit, using the amounts the document itself gives.
 *
 * Whatever the lines don't account for — tax, delivery, or trucks the parser dropped
 * — becomes one INVENTORY row rather than being spread across the trucks that ARE
 * named: inflating a real truck's fuel to make the total balance is the same class of
 * error as the bug being fixed. INVENTORY is where this app already parks unallocated
 * fuel cost, and the Redistribute Overhead button already knows how to hand it out.
 */
function splitMultiTruckEntry(e: any): any[] {
  const lines = Array.isArray(e?.lineItems) ? e.lineItems : [];
  const per = new Map<string, number>();
  for (const l of lines) {
    const m = TRUCK_IN_DESC.exec(String(l?.desc || ""));
    if (!m) continue;
    per.set(m[1], (per.get(m[1]) || 0) + (Number(l?.amount) || 0));
  }
  if (per.size < 2) return [e];
  const lineSum = [...per.values()].reduce((s, v) => s + v, 0);
  const stated = Number(e.total) || 0;
  const gallons = Number(e.gallons) || 0;
  const baseNum = e.invoiceNum ? String(e.invoiceNum) : "";
  const stamp = `Split from a ${per.size}-truck service log (document total $${stated.toFixed(2)}).`;
  const out = [...per.entries()].map(([truckId, amt]) => ({
    ...e,
    // Distinct id and invoiceNum per truck: siblings sharing either would be culled
    // by the shard-level dedup on the way in.
    id: newId(),
    truckId,
    total: Math.round(amt * 100) / 100,
    gallons: gallons && lineSum > 0 ? Math.round((gallons * amt / lineSum) * 10) / 10 : null,
    invoiceNum: baseNum ? `${baseNum}-${truckId}` : null,
    lineItems: [{ desc: `Diesel - Truck ${truckId}`, amount: Math.round(amt * 100) / 100 }],
    notes: [String(e.notes || "").trim(), stamp].filter(Boolean).join(" "),
  }));
  const rest = Math.round((stated - lineSum) * 100) / 100;
  if (rest > 0.5) out.push({
    ...e,
    id: newId(),
    truckId: "INVENTORY",
    total: rest,
    gallons: null,
    invoiceNum: baseNum ? `${baseNum}-UNALLOCATED` : null,
    lineItems: [{ desc: "Not itemized by truck on the document", amount: rest }],
    notes: [String(e.notes || "").trim(), stamp, "This part of the document was not broken out per truck — allocate it from the Inventory view."]
      .filter(Boolean).join(" "),
  });
  return out;
}
// v2.22.0: mirror of coalesceRepairInvoice() in App.jsx. A repair invoice belongs to ONE
// truck in full — labour, parts, shop supplies and tax on a single job for a single unit.
// If the model still splits it across the truck and an INVENTORY/UNKNOWN bucket, fold the
// strays back on. Narrow on purpose: only rows sharing one invoiceNum, only when exactly
// one real truck appears among them; a repair naming two trucks is left for a human.
function coalesceRepairInvoice(entries: any[]): any[] {
  const rows = Array.isArray(entries) ? entries : [];
  const isRepair = (e: any) => String(e?.category || "").toLowerCase() === "repair";
  const isBucket = (t: any) => { const v = String(t == null ? "" : t).toUpperCase(); return v === "" || v === "INVENTORY" || v === "UNKNOWN"; };
  const byInv = new Map<string, any[]>();
  for (const e of rows) {
    if (!isRepair(e) || !e?.invoiceNum) continue;
    const k = String(e.invoiceNum);
    if (!byInv.has(k)) byInv.set(k, []);
    byInv.get(k)!.push(e);
  }
  const absorbed = new Set<any>();
  const merged = new Map<any, any>();
  for (const [, group] of byInv) {
    if (group.length < 2) continue;
    const trucks = [...new Set(group.filter((e) => !isBucket(e.truckId)).map((e) => String(e.truckId)))];
    if (trucks.length !== 1) continue;
    const keep = group.find((e) => String(e.truckId) === trucks[0]);
    const strays = group.filter((e) => e !== keep);
    if (!keep || !strays.length) continue;
    const total = group.reduce((sum, e) => sum + (Number(e.total) || 0), 0);
    const lines = group.flatMap((e) => (Array.isArray(e.lineItems) ? e.lineItems : []));
    merged.set(keep, { ...keep, total: Math.round(total * 100) / 100, lineItems: lines.length ? lines : keep.lineItems,
      notes: [String(keep.notes || "").trim(), `Whole repair invoice booked to #${trucks[0]} (${strays.length} unassigned row${strays.length === 1 ? "" : "s"} folded in).`].filter(Boolean).join(" ") });
    strays.forEach((e) => absorbed.add(e));
  }
  if (!absorbed.size) return rows;
  return rows.filter((e) => !absorbed.has(e)).map((e) => merged.get(e) || e);
}

function splitMultiTruck(entries: any[]): any[] {
  return entries.flatMap((e) => splitMultiTruckEntry(e));
}

function afterDateStr(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

async function refreshAccessToken(refreshToken: string, clientId: string, clientSecret: string) {
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  const data = await resp.json();
  if (!resp.ok || !data.access_token) {
    throw new Error("Token refresh failed: " + JSON.stringify(data).substring(0, 200));
  }
  return data.access_token as string;
}

function buildVendorQuery(vendorName: string, afterDate: string): string {
  const key = vendorName.toLowerCase().trim();
  const dateFilter = afterDate ? ` after:${afterDate}` : "";
  if (VENDOR_QUERIES[key]) return VENDOR_QUERIES[key] + dateFilter;
  return `"${vendorName}" has:attachment` + dateFilter;
}

async function gmailList(accessToken: string, q: string, pageToken: string | null, max: number): Promise<{ ids: string[]; nextPageToken: string | null }> {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=${max}${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await resp.json();
  if (!resp.ok) throw new Error("Gmail search failed: " + JSON.stringify(data).substring(0, 200));
  return { ids: (data.messages || []).map((m: any) => m.id), nextPageToken: data.nextPageToken || null };
}

/**
 * v2.24.1: fetch a batch of message payloads WITHOUT letting one bad message kill the run.
 *
 * Both crawlers used to do Promise.all(ids.map(gmailGetMessage)). Gmail answered one
 * message with 400 FAILED_PRECONDITION, that rejection took down the whole Promise.all,
 * the run aborted — and because the fetch never completed, the id was never written to
 * the seen-memo. So the next run re-listed the same message, hit the same error, and died
 * the same way. A single message Google will not serve stalled the entire pipeline
 * permanently, with 12 items sitting queued behind it.
 *
 * Now each message stands on its own. A failure is counted, not fatal. A message that
 * fails MAX_ATTEMPTS times is memoized as seen so it stops blocking everything behind it,
 * and is reported — the same shape as the attachment strike ladder. Below that threshold
 * it is simply skipped and retried on a later run, so a transient 429 or 503 costs
 * nothing.
 */
async function gmailGetMessages(
  accessToken: string, ids: string[],
  msgFailures: Record<string, { count: number; error: string }>,
  seen: Record<string, 1>, errors: string[],
): Promise<any[]> {
  const settled = await Promise.all(ids.map(async (id) => {
    try {
      const m = await gmailGetMessage(accessToken, id);
      if (msgFailures[id]) delete msgFailures[id];
      return m;
    } catch (e: any) {
      const msg = String(e?.message || e);
      const count = (msgFailures[id]?.count || 0) + 1;
      msgFailures[id] = { count, error: msg };
      if (count >= TUNING.MAX_ATTEMPTS) {
        seen[id] = 1;   // stop it re-blocking every future run
        errors.push(`message ${id}: ${msg.substring(0, 160)} — skipped after ${count} attempts`);
      }
      return null;
    }
  }));
  return settled.filter(Boolean);
}

async function gmailGetMessage(accessToken: string, id: string) {
  const r = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const full = await r.json();
  if (!r.ok) throw new Error("Gmail message fetch failed: " + JSON.stringify(full).substring(0, 200));
  const headers = full.payload?.headers || [];
  const getHeader = (n: string) => headers.find((h: any) => h.name.toLowerCase() === n.toLowerCase())?.value || "";
  const attachments: any[] = [];
  const walk = (part: any) => {
    if (part.filename) attachments.push({
      filename: part.filename,
      size: part.body?.size || 0,
      attachmentId: part.body?.attachmentId || null,
      mimeType: part.mimeType || "",
    });
    if (part.parts) part.parts.forEach(walk);
  };
  if (full.payload) walk(full.payload);
  return {
    emailId: id,
    emailDate: getHeader("Date"),
    emailSubject: getHeader("Subject"),
    from: getHeader("From"),
    attachments,
  };
}

async function processOne(
  item: { gmailRef: string; messageId: string; attachmentId: string; filename: string; vendorName: string; vendorCategory: string },
  accessToken: string,
  anthropicKey: string,
  truckIds: string[],
  vendors: any[],
  dedupInvoiceNums: Set<string>,
  dedupFingerprints: Set<string>,
  signal: AbortSignal,
  compact = false,
  pageCap = false
) {
  const { gmailRef, messageId, attachmentId, filename } = item;
  const vendor = vendors.find((v: any) => v.name === item.vendorName) || { name: item.vendorName, category: item.vendorCategory || "Other" };
  // messageId/attachmentId ride on the result so the failure ledger can rebuild a
  // queue item for a released quarantine — the ref no longer encodes them.
  const result: any = { gmailRef, messageId, attachmentId, vendor: vendor.name, filename };

  // v2.18.4: which stage the clock was in. Previously every failure read "timed out
  // after 18s" with no hint where the time went, which sent the last fix at the AI
  // call when the AI call was not the problem.
  let stage = "start";
  let lastAt = Date.now();
  const marks: Record<string, number> = {};
  const mark = (next: string) => { marks[stage] = (marks[stage] || 0) + (Date.now() - lastAt); lastAt = Date.now(); stage = next; };
  // pdfParse and the Blobs upload are NOT abortable — the signal only reaches fetch —
  // so check it at each boundary instead of discovering it three stages later.
  const checkpoint = () => { if (signal.aborted) { const e: any = new Error("deadline"); e.name = "AbortError"; throw e; } };

  try {
    stage = "download";
    const attResp = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
      { headers: { Authorization: `Bearer ${accessToken}` }, signal }
    );
    if (!attResp.ok && (attResp.status === 429 || attResp.status >= 500)) {
      const e: any = new Error(`Gmail attachment fetch ${attResp.status}`);
      e.transient = true; // rate limit / server hiccup — retry next run, no quarantine strike
      throw e;
    }
    const attData = await attResp.json();
    if (!attData.data) throw new Error("No attachment data");
    const base64 = attData.data.replace(/-/g, "+").replace(/_/g, "/");
    const pdfBuffer = Buffer.from(base64, "base64");
    result.bytes = pdfBuffer.length;
    mark("parse");
    checkpoint();

    /* Parse BEFORE uploading. The upload only exists so a human can open the original
       from the Review Queue; paying for it on an attachment that cannot be read is
       pure waste on exactly the items that are already short of time.

       pdfParse is synchronous CPU work on the single Node thread, so running it in
       all PROC_CONC lanes at once does not parallelise — the parses queue behind each
       other while every one of their deadlines keeps ticking. Raising concurrency to 8
       therefore made large PDFs fail MORE. parseGate caps how many run at once; the
       other lanes stay free for network work, which does overlap. */
    const pdfText = await parseGate(async () => {
      checkpoint();
      const big = pdfBuffer.length > TUNING.PDF_BIG_BYTES;
      // A monthly fleet service log runs to hundreds of pages. Past a point the extra
      // pages cost seconds and add nothing a summary needs, so cap the retry.
      const maxPages = pageCap ? TUNING.PDF_MAX_PAGES : (big ? TUNING.PDF_BIG_MAX_PAGES : 0);
      const d = await pdfParse(pdfBuffer, maxPages ? ({ max: maxPages } as any) : undefined);
      result.pages = d?.numpages;
      result.pagesParsed = maxPages || d?.numpages;
      return (d?.text || "").trim();
    });
    if (!pdfText) throw new Error("PDF has no extractable text (image-only PDF — needs OCR)");
    mark("upload");
    checkpoint();

    const fileStore = getStore("invoice-files");
    const safeName = (filename || "invoice.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileKey = `${Date.now()}-${safeName}`;
    await fileStore.set(fileKey, pdfBuffer, {
      metadata: { contentType: "application/pdf", filename },
    });
    const fileUrl = `/api/invoice-file?key=${encodeURIComponent(fileKey)}`;
    result.fileUrl = fileUrl;
    mark("ai");
    checkpoint();

    // Call Anthropic with strict prompt
    const parsed = await callAnthropicScan(anthropicKey, pdfText, truckIds, vendor, signal, compact);
    if (!parsed || (Array.isArray(parsed) && parsed.length === 0)) {
      throw new Error("Parser returned no rows");
    }

    // Normalize: parsed is an array of entries
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    const built = rows.map((r: any) => ({
      id: newId(),
      date: r.date || new Date().toISOString().split("T")[0],
      truckId: normalizeTruckId(r.truckId || "INVENTORY", truckIds),
      vendor: r.vendor || vendor.name,
      category: r.category || vendor.category || "Other",
      total: Number(r.total) || 0,
      gallons: r.gallons || null,
      pricePerGallon: r.pricePerGallon || null,
      invoiceNum: r.invoiceNum || null,
      lineItems: r.lineItems || [],
      // Say so on the record rather than letting a thinner import look like a full one.
      notes: (r.notes || "")
        + (compact ? " [Large invoice — imported without per-line detail; see the original PDF.]" : "")
        + (pageCap ? ` [Only the first ${TUNING.PDF_MAX_PAGES} pages were read — check the original PDF before trusting the total.]` : ""),
      gmailRef,
      fileUrl,
      fileKey,
      addedAt: new Date().toISOString(),
    }));
    // v2.19.0: a row whose own line items name several trucks is the whole document,
    // not one truck's cost. Split before anything downstream — confidence, dedup and
    // the shard key all have to see the per-truck rows.
    const entries = splitMultiTruck(coalesceRepairInvoice(built));
    result.split = entries.length - built.length;
    // v2.17.0: carry the AI's own confidence flag through — the explicit field list
    // above dropped it, so evaluateConfidence never saw "low" and the AI's uncertainty
    // was silently ignored (only the independent field gate ever routed to review).
    // evaluateConfidence strips these before the entries are saved.
    if (rows[0]?._confidence) {
      (entries[0] as any)._confidence = rows[0]._confidence;
      (entries[0] as any)._confidenceReason = rows[0]._confidenceReason;
    }

    // Evaluate confidence on the BATCH (group)
    const verdict = evaluateConfidence(entries, vendor, truckIds, vendors);
    result.entries = entries;
    // A page-capped read may have missed pages, so its total can be short. That must
    // never post straight to the ledger as though it were complete — send it to the
    // Review Queue where a human sees the note and the original PDF. (Compact mode
    // still reads the whole document, so its totals stand on their own.)
    result.confidence = pageCap ? "low" : verdict.level;
    result.confidenceReason = pageCap
      ? `Only the first ${TUNING.PDF_MAX_PAGES} pages were read (large PDF) — verify the total against the original.`
      : verdict.reason;
    result.invoiceNum = entries[0]?.invoiceNum;

    // Skip if already imported via invoiceNum dedup
    if (entries.every((e) => e.invoiceNum && dedupInvoiceNums.has(String(e.invoiceNum).toUpperCase()))) {
      result.skipReason = "duplicate invoiceNum";
    } else if (dedupFingerprints.size > 0 && entries.every((e) => dedupFingerprints.has(entryFingerprint(e)))) {
      // v2.19.0: same vendor, date, truck and amount as something already in the
      // ledger. This is what catches the vendor resending a service log from a new
      // message under a new name, which no ref or invoice number can.
      result.skipReason = "already imported (same vendor/date/truck/amount)";
    }

    return result;
  } catch (err: any) {
    // Capture the stage BEFORE flushing its timing — mark() advances `stage`, so
    // reading it afterwards would report where we stopped, not where we failed.
    const failedAt = stage;
    mark("done");
    // On a deadline, the boundary where we noticed is not the interesting part — the
    // stage that actually consumed the budget is. Blame that one.
    const worst = Object.entries(marks).sort((a, b) => b[1] - a[1])[0];
    const aborted = err?.name === "AbortError" || err?.name === "TimeoutError";
    result.stage = aborted && worst && worst[1] > 0 ? worst[0] : failedAt;
    result.timing = Object.entries(marks).filter(([, ms]) => ms > 0).map(([k, ms]) => `${k} ${Math.round(ms / 100) / 10}s`).join(", ");
    if (err?.name === "AbortError" || err?.name === "TimeoutError") {
      result.aborted = true;
      return result;
    }
    if (err?.fatal) throw err; // run-level failure (dead credential) — never pinned on the attachment
    if (err?.transient || err?.name === "TypeError") result.transient = true; // TypeError = network-level fetch failure
    result.error = (err?.message || "process failed").substring(0, 300);
    return result;
  }
}

/**
 * v2.18.1: `compact` exists because of how these runs actually fail. A month of fuel
 * for a whole fleet is one invoice with hundreds of rows, and asking for every row
 * back means generating tens of thousands of output tokens — which cannot finish
 * inside a ~26s function no matter how many times it is retried. Those invoices
 * failed identically three times and were quarantined as if the PDF were unreadable.
 * Compact mode keeps every field the ledger actually sums on — truck, total, date,
 * invoice number — and drops only the per-line breakdown, so the output is short
 * enough to finish. The invoice gets imported and its entry says the detail was
 * skipped; the original PDF stays one click away.
 */
async function callAnthropicScan(apiKey: string, pdfText: string, truckIds: string[], vendor: any, signal?: AbortSignal, compact = false) {
  // Same general schema as the existing client-side prompt, but slimmed for text input.
  const truckList = truckIds.length > 0 ? truckIds.join(", ") : "(unknown)";
  const prompt = compact ? `You are extracting invoice TOTALS for ${vendor.name} (category: ${vendor.category || "Other"}).
This invoice is very large, so return ONLY summary rows — one row per truck. Be brief.
Return a JSON array. Each element MUST have:
- truckId: 4-digit truck number from the fleet (${truckList}), or "INVENTORY" if not assigned to a truck, or "UNKNOWN" if you can't tell
- vendor: "${vendor.name}"
- category: "Fuel", "Parts", "Labor", "Repair", "Maintenance", or "Other"
- total: number (that truck's total INCLUDING tax)
- gallons: number (Fuel only, that truck's total gallons) or null
- pricePerGallon: number (Fuel only, average) or null
- invoiceNum: invoice or document number as printed
- date: YYYY-MM-DD format
- lineItems: [] (ALWAYS an empty array — do not list individual lines)
- notes: "" (leave empty)

The total is ALWAYS one truck's own charge. A fuel service log lists every unit
filled that day — return one row per unit, never the document total on a single unit.


COMPLETE FLEET SERVICES L.L.C. (complete.fleet@outlook.com): the truck is the last cell of the
"Service Order | Terms | Due Date | Authorizer | Customer PO | Unit #" row and carries a yard
prefix — "BX0424", "GP2883". truckId is THE TRAILING 4 DIGITS ONLY ("BX0424" -> "0424").
One row for the whole invoice — the several "Complaint:"/"Subtotal" blocks are jobs on the SAME
truck. total = the "Total" line after the GEORGIA/HALL COUNTY tax lines, not "Pre-Charge
Subtotal" and not "Balance Due". invoiceNum "CFS-<number>". category "Repair".
The ENTIRE total goes to that ONE truck — never "INVENTORY", never a second row for parts or tax.

ALSO add ONE meta field on the FIRST element only:
- _confidence: "high" or "low"
- _confidenceReason: why low

INVOICE TEXT:
${pdfText.substring(0, 30000)}

Return ONLY the JSON array, no preamble.` : `You are extracting line items from an invoice for ${vendor.name} (category: ${vendor.category || "Other"}).
Return a JSON array. Each element MUST have:
- truckId: 4-digit truck number from the fleet (${truckList}), or "INVENTORY" if not assigned to a truck, or "UNKNOWN" if you can't tell
- vendor: "${vendor.name}"
- category: "Fuel", "Parts", "Labor", "Repair", "Maintenance", or "Other"
- total: number (final total INCLUDING tax)
- gallons: number (Fuel only) or null
- pricePerGallon: number (Fuel only) or null
- invoiceNum: invoice or document number as printed
- date: YYYY-MM-DD format
- lineItems: array of {desc, amount}
- notes: brief context

CRITICAL — a fuel service log lists EVERY unit filled that day, one row per unit
(columns: Unit Number, Gallons, Price Per Gallon, Total Charge). Return ONE OBJECT
PER UNIT, and set total to that unit's own Total Charge — NEVER the document total,
and never the whole delivery pinned on the first unit listed. Skip the "Total" row.


SPECIAL RULE FOR COMPLETE FLEET SERVICES L.L.C. (Oakwood GA, complete.fleet@outlook.com):
- A repair-shop invoice, usually 2 pages. Header shows "Invoice: <number>" and "Date: M/D/YYYY".
- THE TRUCK comes from the row under the header "Service Order | Terms | Due Date | Authorizer | Customer PO | Unit #".
  That value carries a yard prefix — e.g. "BX0424", "GP2883" — and repeats further down as
  "Unit: <X>", "Fleet #: <X>", and as the last six characters of the VIN.
  truckId = THE TRAILING 4 DIGITS ONLY: "BX0424" -> "0424", "GP2883" -> "2883". Never return the prefixed form.
  If the parenthetical after "Unit:" disagrees with the Unit # cell — one real invoice reads
  "Unit: GP2883 (GO2883)" — trust the Unit # cell.
- Return EXACTLY ONE object for the whole invoice. These invoices bill ONE truck. Several
  "Complaint:" blocks each ending in their own "Subtotal" are separate jobs on the SAME truck.
  Never split them into separate rows or separate trucks.
- total: the "Total" line near the bottom, AFTER the "GEORGIA" and "HALL COUNTY" tax lines.
  NOT "Pre-Charge Subtotal", NOT any "Subtotal", and NOT "Balance Due" (that is net of payments).
- invoiceNum: "CFS-<invoice number>" — e.g. "CFS-10785".
- vendor: "Complete Fleet Services"
- category: "Repair"
- THE ENTIRE INVOICE TOTAL GOES TO THAT ONE TRUCK. This is a repair, not a parts purchase for
  the shelf. Never route any part of it to "INVENTORY", never emit a second row for parts,
  shop supplies or tax, and never use category "Inventory". One row, one truck, the full Total.
- date: the "Date:" at the top, as YYYY-MM-DD.
- lineItems: one per "Parts ..." row and per Labor line — desc = the description as printed, amount = the Amount column.
- notes: one short line summarising the "Complaint:" text.

ALSO add ONE meta field on the FIRST element only:
- _confidence: "high" or "low"
- _confidenceReason: why low (e.g. "ambiguous truck assignment", "totals don't sum", "vendor unclear")

INVOICE TEXT:
${pdfText.substring(0, 30000)}

Return ONLY the JSON array, no preamble.`;

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      // Output length is what blows the deadline, so the compact pass caps it hard.
      max_tokens: compact ? 4096 : 16384,
      messages: [{ role: "user", content: prompt }],
    }),
    signal,
  });
  const data = await resp.json();
  if (!resp.ok) {
    const e: any = new Error(`Anthropic ${resp.status}: ${JSON.stringify(data).substring(0, 200)}`);
    if (resp.status === 401 || resp.status === 403) e.fatal = true;        // bad key — fail the RUN, not the attachment
    else if (resp.status === 429 || resp.status >= 500) e.transient = true; // backpressure — retry next run
    throw e;
  }
  const text = data.content?.[0]?.text || "";
  // Extract JSON array from the response
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON array found in response");
  return JSON.parse(match[0]);
}

function evaluateConfidence(entries: any[], vendor: any, truckIds: string[], vendors: any[]) {
  // Trust the AI's own confidence flag if present
  const aiVerdict = entries[0]?._confidence;
  const aiReason = entries[0]?._confidenceReason || "";
  // Strip meta from entries before saving
  entries.forEach((e) => {
    delete e._confidence;
    delete e._confidenceReason;
  });
  if (aiVerdict === "low") return { level: "low", reason: aiReason || "AI flagged uncertain" };

  // Independent gate: missing critical fields → low
  const knownVendors = new Set(vendors.map((v: any) => v.name.toLowerCase()));
  const knownTruckIds = new Set(truckIds);
  for (const e of entries) {
    if (!e.invoiceNum) return { level: "low", reason: "Missing invoice number" };
    if (!e.total || e.total <= 0) return { level: "low", reason: "Missing or zero total" };
    if (!e.date || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) return { level: "low", reason: "Bad date format" };
    if (e.truckId === "UNKNOWN") return { level: "low", reason: "Could not determine truck" };
    if (e.truckId !== "INVENTORY" && knownTruckIds.size > 0 && !knownTruckIds.has(e.truckId)) {
      return { level: "low", reason: `Truck ${e.truckId} not in fleet roster` };
    }
    if (!knownVendors.has((e.vendor || "").toLowerCase())) {
      return { level: "low", reason: `Unknown vendor: ${e.vendor}` };
    }
    // v2.19.0: physical sanity. The biggest tank in this fleet is nowhere near
    // TANK_GALLONS, so a single truck row carrying more than that is a whole
    // delivery collapsed onto one unit. splitMultiTruck fixes those it can see, but
    // a compact-mode row has no line items to split by — so it goes to a human
    // rather than silently landing another four-figure charge on one truck.
    if (e.truckId !== "INVENTORY" && Number(e.gallons) > TANK_GALLONS) {
      return { level: "low", reason: `${e.gallons} gallons on one truck — likely a whole service log booked to truck ${e.truckId}` };
    }
  }
  return { level: "high", reason: "All fields valid" };
}

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config: Config = {
  path: "/api/auto-sync",
};
