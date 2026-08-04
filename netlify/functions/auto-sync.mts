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
 */

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCaaHZ0GuBoxl696-PzlgBQLPEad1xyiqw",
  authDomain: "davisfleetmanagement.firebaseapp.com",
  projectId: "davisfleetmanagement",
  storageBucket: "davisfleetmanagement.firebasestorage.app",
  messagingSenderId: "397276214754",
  appId: "1:397276214754:web:aa7bd4723c301fb876b5bb",
};

const VENDOR_QUERIES: Record<string, string> = {
  "peach state freightliner": `((from:peachstatetrucks.com) OR ((from:ryan@davisdelivery.com OR from:ryan@davisdeliveryservice.com) AND subject:"Parts 20407")) has:attachment`,
  "fuelfox atlanta": `(from:quickbooks@notification.intuit.com subject:"FuelFox Atlanta") has:attachment`,
  "quick fuel": `from:ebilling@4flyers.com has:attachment`,
};

const DEFAULT_VENDORS = [
  { name: "FuelFox Atlanta", category: "Fuel" },
  { name: "Peach State Freightliner", category: "Parts" },
  { name: "Quick Fuel", category: "Fuel" },
];

// Exported so the test harness can shrink the clocks; production never touches it.
export const TUNING = {
  BUDGET_MS: 22000,        // total run budget
  DISCOVERY_MS: 8000,      // sub-budget for mailbox crawling (elapsed, not duration)
  MIN_START_MS: 6000,      // don't start a batch with less than this left
  ITEM_CAP_MS: 15000,      // hard per-item deadline
  FAIR_MS: 10000,          // a timeout only counts as a failure if the item had ≥ this
  WRITE_HEADROOM_MS: 2000, // reserved for the state writes at the end
  LIST_PAGE: 100,          // Gmail list page size (paginated — no more 50-message cap)
  GET_CONC: 8,             // parallel message-payload fetches during discovery
  PROC_CONC: 3,            // parallel attachment processing
  MAX_ATTEMPTS: 3,         // quarantine threshold (v2.16.19)
  FRESH_SLACK_DAYS: 3,     // freshness check re-lists this far back (dedup makes overlap free)
  LOCK_STALE_MS: 90000,    // a "running" flag older than this is a crashed run — ignore it
  EPOCH_MAX_AGE_DAYS: 1,   // reconcile at most daily, and only when the queue is empty
};

export default async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  const startedAt = Date.now();
  const elapsed = () => Date.now() - startedAt;
  const store = getStore("gmail-sync");

  // Parse options from request (manual sync may pass { daysBack: 7 } etc.)
  let daysBack = 7;
  try {
    if (req.method === "POST") {
      const body = await req.json();
      // v2.16.13: cap raised from 90 → 1095 days so the one-click "Catch Up Backlog"
      // sweep can reach historical invoices.
      if (typeof body?.daysBack === "number") daysBack = Math.max(1, Math.min(1095, body.daysBack));
    }
  } catch {}

  // ── 0. Single-flight lock. A scheduled run and a browser-driven sweep pass can
  // land at the same time; both mutating the work queue loses updates. The loser
  // backs off (the sweep retries in a few seconds).
  const prevState = (await store.get("sync-state", { type: "json" }) as any) || {};
  if (prevState.running && prevState.startedAt && (Date.now() - Date.parse(prevState.startedAt)) < TUNING.LOCK_STALE_MS) {
    return json({ success: true, busy: true, message: "A sync is already running — try again in a moment." });
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

  const vendors = (await store.get("vendors", { type: "json" }) as any) || DEFAULT_VENDORS;
  const truckIds = ((await store.get("truck-ids", { type: "json" }) as any) || []) as string[];

  const dedup = (await store.get("dedup-index", { type: "json" }) as any) || { gmailRefs: [], invoiceNums: [] };
  let dedupGmailRefs = new Set<string>(dedup.gmailRefs);
  let dedupInvoiceNums = new Set<string>((dedup.invoiceNums as string[]).map((s) => s.toUpperCase()));

  // v2.16.19 failure ledger — gmailRef -> { count, error, filename, vendor, lastAt }.
  const failures = ((await store.get("failed-refs", { type: "json" }) as any) || {}) as Record<string, any>;
  const isQuarantined = (ref: string) => ((failures[ref]?.count || 0) >= TUNING.MAX_ATTEMPTS);
  const stuckCount = () => Object.values(failures).filter((f: any) => (f?.count || 0) >= TUNING.MAX_ATTEMPTS).length;

  // Durable work queue + discovery cursor + message memo
  const wq = ((await store.get("work-queue", { type: "json" }) as any) || { items: [], discovery: null }) as {
    items: any[];
    discovery: { coveredDays: number; done: boolean; vendorIdx: number; pageToken: string | null; epochAt: string; freshAfter: string | null } | null;
  };
  const seen = ((await store.get("seen-messages", { type: "json" }) as any) || {}) as Record<string, 1>;

  // Mark running (after the lock check, so a busy bounce never stamps the lock)
  await store.setJSON("sync-state", {
    ...prevState,
    running: true,
    startedAt: new Date().toISOString(),
    message: "Syncing…",
  });

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
    const needEpoch = !disco || daysBack > disco.coveredDays ||
      (wq.items.length === 0 && disco.done && epochAgeDays >= TUNING.EPOCH_MAX_AGE_DAYS);
    if (needEpoch) {
      const truth = await reconcileFromLedger(getDb());
      // Any ref the old index called settled but the ledger has no trace of was lost
      // (the shard-wipe bug's signature). Un-see its message so the crawl below
      // re-enumerates and re-imports it — with the memo intact it would never return.
      for (const ref of dedupGmailRefs) {
        if (!truth.gmailRefs.has(ref)) { const mid = ref.split(":")[1]; if (mid) delete seen[mid]; }
      }
      dedupGmailRefs = truth.gmailRefs;
      dedupInvoiceNums = truth.invoiceNums;
      disco = {
        coveredDays: Math.max(daysBack, 0),
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

    // ── 4. Crawl (resumable) or freshness check.
    if (!disco.done) {
      await crawlMailbox(accessToken, vendors, disco, seen, dedupGmailRefs, isQuarantined, enqueue, startedAt);
    } else {
      await freshCheck(accessToken, vendors, disco, seen, dedupGmailRefs, isQuarantined, enqueue);
    }

    // ── 5. Process the queue front under the remaining budget.
    const newCostsAdds: any[] = [];
    const newReviewAdds: any[] = [];
    if (wq.items.length > 0) getDb();

    // One attempt per attachment per run: a failure goes to the back of the queue for
    // the NEXT run, so a transient blip can't burn all its quarantine attempts in one
    // 22-second window (and a queue of only-failing items can't spin).
    const attempted = new Set<string>();
    while (wq.items.length > 0) {
      const remainMs = TUNING.BUDGET_MS - elapsed();
      if (remainMs < TUNING.MIN_START_MS) { timedOut = true; break; }
      const deadlineMs = Math.min(remainMs - TUNING.WRITE_HEADROOM_MS, TUNING.ITEM_CAP_MS);
      // A timeout with a squeezed end-of-run deadline says nothing about the item;
      // only a full-length attempt counts toward quarantine.
      const fairAttempt = deadlineMs >= TUNING.FAIR_MS;
      const batch = wq.items.filter((it) => !attempted.has(it.gmailRef)).slice(0, TUNING.PROC_CONC);
      if (batch.length === 0) break;
      for (const it of batch) attempted.add(it.gmailRef);
      const signal = AbortSignal.timeout(deadlineMs);
      const batchResults = await Promise.all(
        batch.map((item) => processOne(item, accessToken, anthropicKey, truckIds, vendors, dedupInvoiceNums, signal))
      );
      let sawSqueeze = false;
      for (const r of batchResults) {
        const idx = wq.items.findIndex((it) => it.gmailRef === r.gmailRef);
        if (r.aborted && !fairAttempt) { sawSqueeze = true; continue; } // stays queued, no penalty
        processed++;
        if (r.error || r.aborted) {
          const errText = r.aborted ? `timed out after ${Math.round(deadlineMs / 1000)}s` : r.error;
          const count = (failures[r.gmailRef]?.count || 0) + 1;
          failures[r.gmailRef] = { count, error: errText, filename: r.filename, vendor: r.vendor, lastAt: new Date().toISOString() };
          const quarantined = count >= TUNING.MAX_ATTEMPTS;
          errors.push(`${r.gmailRef}: ${errText}${quarantined ? ` — quarantined after ${count} attempts` : ""}`);
          if (idx >= 0) {
            if (quarantined) { wq.items.splice(idx, 1); queuedRefs.delete(r.gmailRef); }
            else { wq.items.push(wq.items.splice(idx, 1)[0]); } // retry later, behind fresh work
          }
          continue;
        }
        // Settled one way or the other — never fetch or parse it again (covers
        // duplicates too, v2.16.19).
        delete failures[r.gmailRef];
        dedupGmailRefs.add(r.gmailRef);
        if (idx >= 0) { wq.items.splice(idx, 1); queuedRefs.delete(r.gmailRef); }
        if (r.skipReason) continue;
        if (r.invoiceNum) dedupInvoiceNums.add(r.invoiceNum.toUpperCase());
        if (r.confidence === "high") {
          newCostsAdds.push(...r.entries);
        } else {
          newReviewAdds.push({
            id: Date.now() + Math.random(),
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
          queued += r.entries.length;
        }
      }
      if (sawSqueeze) { timedOut = true; break; }
    }

    // ── 6. Write imports — merge each month shard against a FRESH read of that shard,
    // taken at write time rather than at run start. The old upfront read of EVERY shard
    // cost seconds of every run's budget and left a whole run's width for a concurrent
    // client write to slip between read and write; now only the target months are read,
    // moments before writing. Entries whose id or invoiceNum is already present in the
    // shard are dropped rather than duplicated.
    if (newCostsAdds.length > 0) {
      const SHARD_LIMIT = 1_000_000;
      const byShard: Record<string, any[]> = {};
      for (const e of newCostsAdds) { const k = costShardKey(e); (byShard[k] ||= []).push(e); }
      for (const k of Object.keys(byShard)) {
        const ref = doc(getDb(), "kv", `fl-costs-${k}`);
        const snap = await getDoc(ref);
        let existing: any[] = [];
        if (snap.exists()) { try { const a = JSON.parse(snap.data().v); if (Array.isArray(a)) existing = a; } catch {} }
        const haveIds = new Set(existing.map((e) => e.id));
        const haveNums = new Set(existing.map((e) => String(e.invoiceNum || "").toUpperCase()).filter(Boolean));
        const adds = byShard[k].filter((e) => !haveIds.has(e.id) && !(e.invoiceNum && haveNums.has(String(e.invoiceNum).toUpperCase())));
        if (adds.length === 0) continue;
        const merged = [...existing, ...adds];
        const shardJson = JSON.stringify(merged);
        if (shardJson.length > SHARD_LIMIT) {
          errors.push(`fl-costs-${k} would exceed 1 MB (${Math.round(shardJson.length / 1024)} KB) — ${adds.length} invoice(s) not saved; archive older invoices.`);
          continue;
        }
        await setDoc(ref, { v: shardJson, ts: new Date().toISOString() });
        imported += adds.length;
      }
    }
    if (newReviewAdds.length > 0) {
      const ref = doc(getDb(), "kv", "fl-review-queue");
      const snap = await getDoc(ref);
      let existingReview: any[] = [];
      if (snap.exists()) { try { const a = JSON.parse(snap.data().v); if (Array.isArray(a)) existingReview = a; } catch {} }
      await setDoc(ref, { v: JSON.stringify([...existingReview, ...newReviewAdds]), ts: new Date().toISOString() });
    }

    // ── 7. Persist queue, memo, dedup, failures, state.
    wq.discovery = disco;
    await store.setJSON("work-queue", wq);
    await store.setJSON("seen-messages", seen);
    await store.setJSON("dedup-index", {
      gmailRefs: Array.from(dedupGmailRefs),
      invoiceNums: Array.from(dedupInvoiceNums),
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
    const bits: string[] = [];
    if (processed) bits.push(`processed ${processed} (imported ${imported}${queued ? `, ${queued} to review` : ""})`);
    if (discovered) bits.push(`found ${discovered} new`);
    const message = done
      ? `✓ All caught up. No new invoices in the last ${disco.coveredDays} days.${stuckNote}`
      : `⏳ ${bits.join(" · ") || "No progress this run"} — ${remaining} in queue${!disco.done ? ", still scanning mailbox" : ""}. Continues automatically every ~3h, or run Catch Up Backlog.${stuckNote}`;

    await store.setJSON("sync-state", {
      lastRun: new Date().toISOString(),
      lastSuccess: errors.length === 0 ? new Date().toISOString() : prevState.lastSuccess,
      running: false,
      imported,
      queued,
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
    });

    return json({ success: true, imported, queued, processed, discovered, remaining, discoveryDone: disco.done, done, timedOut, stuck, message });
  } catch (err: any) {
    const errMsg = err?.message || "Unknown error";
    // Keep whatever discovery/settlement survived — it's all idempotent.
    try {
      await store.setJSON("work-queue", wq);
      await store.setJSON("seen-messages", seen);
      await store.setJSON("failed-refs", failures);
    } catch {}
    await store.setJSON("sync-state", {
      ...prevState,
      running: false,
      lastRun: new Date().toISOString(),
      message: `✗ Sync failed: ${errMsg}`,
      errors: [errMsg],
    });
    return json({ error: errMsg, imported, queued, processed }, 500);
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
async function reconcileFromLedger(db: any): Promise<{ gmailRefs: Set<string>; invoiceNums: Set<string> }> {
  const kv = collection(db, "kv");
  const prefixRange = (p: string) => query(kv, where(documentId(), ">=", p), where(documentId(), "<", p.slice(0, -1) + String.fromCharCode(p.charCodeAt(p.length - 1) + 1)));
  const [shardSnap, archSnap, legacyDoc, reviewDoc, rejectedDoc] = await Promise.all([
    getDocs(prefixRange("fl-costs-")),
    getDocs(prefixRange("fl-arch-costs-")),
    getDoc(doc(db, "kv", "fl-costs")),
    getDoc(doc(db, "kv", "fl-review-queue")),
    getDoc(doc(db, "kv", "fl-rejected-refs")),
  ]);
  const gmailRefs = new Set<string>();
  const invoiceNums = new Set<string>();
  const eat = (arr: any) => {
    if (!Array.isArray(arr)) return;
    for (const e of arr) {
      if (e?.gmailRef) gmailRefs.add(e.gmailRef);
      if (e?.invoiceNum) invoiceNums.add(String(e.invoiceNum).toUpperCase());
    }
  };
  const eatDoc = (d: any) => { try { eat(JSON.parse(d.data().v)); } catch {} };
  shardSnap.forEach(eatDoc);
  archSnap.forEach(eatDoc);
  if (legacyDoc.exists()) eatDoc(legacyDoc);
  if (reviewDoc.exists()) {
    try {
      const items = JSON.parse(reviewDoc.data().v);
      if (Array.isArray(items)) for (const it of items) if (it?.gmailRef) gmailRefs.add(it.gmailRef);
    } catch {}
  }
  if (rejectedDoc.exists()) {
    try {
      const refs = JSON.parse(rejectedDoc.data().v);
      if (Array.isArray(refs)) for (const r of refs) if (typeof r === "string") gmailRefs.add(r);
    } catch {}
  }
  return { gmailRefs, invoiceNums };
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
  enqueue: (item: any, front?: boolean) => void, startedAt: number
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
      const metas = await Promise.all(unseen.slice(i, i + TUNING.GET_CONC).map((id) => gmailGetMessage(accessToken, id)));
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
 * Once the crawl is done, each run only looks for NEW mail: one list call per vendor
 * bounded by the last check (minus slack — dedup and the seen-memo make overlap free).
 * Steady state is 3 list calls, zero payload fetches, zero AI calls.
 */
async function freshCheck(
  accessToken: string, vendors: any[], disco: any, seen: Record<string, 1>,
  dedupGmailRefs: Set<string>, isQuarantined: (r: string) => boolean,
  enqueue: (item: any, front?: boolean) => void
) {
  const after = disco.freshAfter || afterDateStr(TUNING.FRESH_SLACK_DAYS);
  const pages = await Promise.all(
    vendors.map(async (v: any) => ({
      vendor: v,
      page: await gmailList(accessToken, buildVendorQuery(v.name, after), null, TUNING.LIST_PAGE),
    }))
  );
  for (const { vendor, page } of pages) {
    const unseen = page.ids.filter((id: string) => !seen[id]);
    for (let i = 0; i < unseen.length; i += TUNING.GET_CONC) {
      const metas = await Promise.all(unseen.slice(i, i + TUNING.GET_CONC).map((id: string) => gmailGetMessage(accessToken, id)));
      for (const m of metas) {
        enqueueMessagePdfs(m, vendor, dedupGmailRefs, isQuarantined, enqueue, true); // front: newest first
        seen[m.emailId] = 1;
      }
    }
  }
  disco.freshAfter = afterDateStr(TUNING.FRESH_SLACK_DAYS);
}

function enqueueMessagePdfs(
  m: any, vendor: any, dedupGmailRefs: Set<string>, isQuarantined: (r: string) => boolean,
  enqueue: (item: any, front?: boolean) => void, front: boolean
) {
  for (const a of m.attachments || []) {
    if (!a.attachmentId) continue; // inline-data parts can't be fetched via the attachments endpoint
    const isPdf = (a.mimeType || "").includes("pdf") || (a.filename || "").toLowerCase().endsWith(".pdf");
    if (!isPdf) continue;
    const gmailRef = `gmail:${m.emailId}:${a.attachmentId}`;
    if (dedupGmailRefs.has(gmailRef) || isQuarantined(gmailRef)) continue;
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
  signal: AbortSignal
) {
  const { gmailRef, messageId, attachmentId, filename } = item;
  const vendor = vendors.find((v: any) => v.name === item.vendorName) || { name: item.vendorName, category: item.vendorCategory || "Other" };
  const result: any = { gmailRef, vendor: vendor.name, filename };

  try {
    // Fetch attachment bytes
    const attResp = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
      { headers: { Authorization: `Bearer ${accessToken}` }, signal }
    );
    const attData = await attResp.json();
    if (!attData.data) throw new Error("No attachment data");
    const base64 = attData.data.replace(/-/g, "+").replace(/_/g, "/");
    const pdfBuffer = Buffer.from(base64, "base64");

    // Upload to invoice-file blobs for later retrieval
    const fileStore = getStore("invoice-files");
    const safeName = (filename || "invoice.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileKey = `${Date.now()}-${safeName}`;
    await fileStore.set(fileKey, pdfBuffer, {
      metadata: { contentType: "application/pdf", filename },
    });
    const fileUrl = `/api/invoice-file?key=${encodeURIComponent(fileKey)}`;
    result.fileUrl = fileUrl;

    // Extract PDF text
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = (pdfData.text || "").trim();
    if (!pdfText) throw new Error("PDF has no extractable text (image-only PDF — needs OCR)");

    // Call Anthropic with strict prompt
    const parsed = await callAnthropicScan(anthropicKey, pdfText, truckIds, vendor, signal);
    if (!parsed || (Array.isArray(parsed) && parsed.length === 0)) {
      throw new Error("Parser returned no rows");
    }

    // Normalize: parsed is an array of entries
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    const entries = rows.map((r: any) => ({
      id: Date.now() + Math.random(),
      date: r.date || new Date().toISOString().split("T")[0],
      truckId: r.truckId || "INVENTORY",
      vendor: r.vendor || vendor.name,
      category: r.category || vendor.category || "Other",
      total: Number(r.total) || 0,
      gallons: r.gallons || null,
      pricePerGallon: r.pricePerGallon || null,
      invoiceNum: r.invoiceNum || null,
      lineItems: r.lineItems || [],
      notes: r.notes || "",
      gmailRef,
      fileUrl,
      fileKey,
      addedAt: new Date().toISOString(),
    }));
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
    result.confidence = verdict.level;
    result.confidenceReason = verdict.reason;
    result.invoiceNum = entries[0]?.invoiceNum;

    // Skip if already imported via invoiceNum dedup
    if (entries.every((e) => e.invoiceNum && dedupInvoiceNums.has(e.invoiceNum.toUpperCase()))) {
      result.skipReason = "duplicate invoiceNum";
    }

    return result;
  } catch (err: any) {
    if (err?.name === "AbortError" || err?.name === "TimeoutError") {
      result.aborted = true;
      return result;
    }
    result.error = (err?.message || "process failed").substring(0, 300);
    return result;
  }
}

async function callAnthropicScan(apiKey: string, pdfText: string, truckIds: string[], vendor: any, signal?: AbortSignal) {
  // Same general schema as the existing client-side prompt, but slimmed for text input.
  const truckList = truckIds.length > 0 ? truckIds.join(", ") : "(unknown)";
  const prompt = `You are extracting line items from an invoice for ${vendor.name} (category: ${vendor.category || "Other"}).
Return a JSON array. Each element MUST have:
- truckId: 4-digit truck number from the fleet (${truckList}), or "INVENTORY" if not assigned to a truck, or "UNKNOWN" if you can't tell
- vendor: "${vendor.name}"
- category: "Fuel", "Parts", "Labor", "Maintenance", or "Other"
- total: number (final total INCLUDING tax)
- gallons: number (Fuel only) or null
- pricePerGallon: number (Fuel only) or null
- invoiceNum: invoice or document number as printed
- date: YYYY-MM-DD format
- lineItems: array of {desc, amount}
- notes: brief context

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
      max_tokens: 16384,
      messages: [{ role: "user", content: prompt }],
    }),
    signal,
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(`Anthropic ${resp.status}: ${JSON.stringify(data).substring(0, 200)}`);
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
