// stubs/blobs.mjs
function getStore(name) {
  globalThis.__BLOBS ||= /* @__PURE__ */ new Map();
  if (!globalThis.__BLOBS.has(name)) globalThis.__BLOBS.set(name, /* @__PURE__ */ new Map());
  const m = globalThis.__BLOBS.get(name);
  return {
    async get(key, opts) {
      if (!m.has(key)) return null;
      const v = m.get(key);
      if (opts?.type === "json") return typeof v === "string" ? JSON.parse(v) : JSON.parse(JSON.stringify(v));
      return v;
    },
    async set(key, value) {
      m.set(key, value);
    },
    async setJSON(key, obj) {
      m.set(key, JSON.stringify(obj));
    }
  };
}

// stubs/fb-app.mjs
function initializeApp() {
  return {};
}

// stubs/firestore.mjs
var DOC_ID = Symbol("documentId");
var FS_PROPERTY_LIMIT = 1048487;
function fs() {
  return globalThis.__FIRESTORE ||= /* @__PURE__ */ new Map();
}
function getFirestore() {
  return {};
}
function doc(_db, col, id) {
  return { __path: `${col}/${id}`, __id: id };
}
async function getDoc(ref) {
  const data = fs().get(ref.__path);
  return { exists: () => data !== void 0, data: () => data, id: ref.__id };
}
async function setDoc(ref, data) {
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === "string" && Buffer.byteLength(v, "utf8") > FS_PROPERTY_LIMIT) {
      throw new Error(`3 INVALID_ARGUMENT: The value of property "${k}" is longer than ${FS_PROPERTY_LIMIT} bytes.`);
    }
  }
  fs().set(ref.__path, data);
}
function collection(_db, name) {
  return { __col: name };
}
function documentId() {
  return DOC_ID;
}
function where(field, op, value) {
  return { field, op, value };
}
function query(col, ...wheres) {
  return { __col: col.__col, wheres };
}
async function getDocs(q) {
  const docs = [];
  for (const [path, data] of fs()) {
    const [col, ...rest] = path.split("/");
    if (col !== q.__col) continue;
    const id = rest.join("/");
    let ok = true;
    for (const w of q.wheres) {
      if (w.op === ">=" && !(id >= w.value)) ok = false;
      else if (w.op === "<" && !(id < w.value)) ok = false;
    }
    if (ok) docs.push({ id, data: () => data, exists: () => true });
  }
  return { forEach: (cb) => docs.forEach(cb), docs, size: docs.length };
}

// stubs/pdf-parse.mjs
async function pdfParse(buffer, opts) {
  const s = buffer.toString("utf8");
  if (!s.startsWith("PDF::")) return { text: "", numpages: 0 };
  const body = s.slice(5);
  const m = /#PAGES=(\d+)/.exec(body);
  const pages = m ? Number(m[1]) : 1;
  const max = opts && opts.max ? opts.max : 0;
  globalThis.__PARSE_CALLS = globalThis.__PARSE_CALLS || [];
  globalThis.__PARSE_CALLS.push({ max, pages });
  const n = max ? Math.min(max, pages) : pages;
  const perPage = globalThis.__PARSE_MS_PER_PAGE || 0;
  for (let done = 0; done < n && perPage; done += 10) {
    const end = Date.now() + perPage * Math.min(10, n - done);
    while (Date.now() < end) {
    }
    await new Promise((r) => setTimeout(r, 0));
  }
  return { text: body, numpages: pages };
}

// ../netlify/functions/auto-sync.mts
var FIREBASE_CONFIG = {
  apiKey: "AIzaSyCaaHZ0GuBoxl696-PzlgBQLPEad1xyiqw",
  authDomain: "davisfleetmanagement.firebaseapp.com",
  projectId: "davisfleetmanagement",
  storageBucket: "davisfleetmanagement.firebasestorage.app",
  messagingSenderId: "397276214754",
  appId: "1:397276214754:web:aa7bd4723c301fb876b5bb"
};
var VENDOR_QUERIES = {
  "peach state freightliner": `((from:peachstatetrucks.com) OR ((from:ryan@davisdelivery.com OR from:ryan@davisdeliveryservice.com) AND subject:"Parts 20407")) has:attachment`,
  "fuelfox atlanta": `(from:quickbooks@notification.intuit.com subject:"FuelFox Atlanta") has:attachment`,
  "quick fuel": `from:ebilling@4flyers.com has:attachment`,
  "complete fleet services": `from:complete.fleet@outlook.com has:attachment`
};
var DEFAULT_VENDORS = [
  { name: "FuelFox Atlanta", category: "Fuel" },
  { name: "Peach State Freightliner", category: "Parts" },
  { name: "Quick Fuel", category: "Fuel" },
  { name: "Complete Fleet Services", category: "Repair" }
];
function mergeVendors(stored, defaults) {
  const list = Array.isArray(stored) ? stored.filter((v) => v && v.name) : [];
  const seen = new Set(list.map((v) => String(v.name).toLowerCase().trim()));
  for (const d of defaults) {
    if (!seen.has(String(d.name).toLowerCase().trim())) list.push(d);
  }
  return list.length ? list : defaults;
}
var TUNING = {
  BUDGET_MS: 22e3,
  // total run budget
  DISCOVERY_MS: 8e3,
  // sub-budget for mailbox crawling (elapsed, not duration)
  MIN_START_MS: 6e3,
  // don't start an item with less than this left
  ITEM_CAP_MS: 18e3,
  // hard per-item deadline
  FAIR_MS: 16e3,
  // a timeout only counts as a failure if the item had ≥ this
  WRITE_HEADROOM_MS: 2e3,
  // reserved for the state writes at the end
  LIST_PAGE: 100,
  // Gmail list page size (paginated — no more 50-message cap)
  GET_CONC: 8,
  // parallel message-payload fetches during discovery
  PROC_CONC: 8,
  // worker-pool lanes for attachment processing
  MAX_ATTEMPTS: 3,
  // quarantine threshold (v2.16.19)
  RETRY_QUARANTINE_MS: 216e5,
  // 6h — a timeout-only quarantine cools off and retries (v2.23.0)
  FRESH_SLACK_DAYS: 3,
  // freshness check re-lists this far back (dedup makes overlap free)
  LOCK_STALE_MS: 9e4,
  // a "running" flag older than this is a crashed run — ignore it
  EPOCH_MAX_AGE_DAYS: 1,
  // reconcile at most daily, and only when the queue is empty
  CHAIN_MAX: 200,
  // max self-fired links per origin trigger (~70 min of draining)
  CHAIN_HANDOFF_MS: 600,
  // how long to hold the connection so the next link's request gets out
  PARSE_CONC: 2,
  // concurrent pdfParse calls — CPU-bound, so more is slower not faster
  PDF_BIG_BYTES: 15e5,
  // past this a PDF is treated as a big one on the FIRST pass
  PDF_BIG_MAX_PAGES: 60,
  // pages parsed for a big PDF on the first pass
  PDF_MAX_PAGES: 15
  // pages parsed on the page-capped last attempt
};
var parseActive = 0;
var parseWaiters = [];
async function parseGate(fn) {
  if (parseActive >= TUNING.PARSE_CONC) await new Promise((r) => parseWaiters.push(r));
  parseActive++;
  try {
    return await fn();
  } finally {
    parseActive--;
    const next = parseWaiters.shift();
    if (next) next();
  }
}
var FS_MAX_BYTES = 8e5;
var FS_HARD_BYTES = 104e4;
var MEMO_VERSION = 2;
var QUARANTINE_RULES_VERSION = 3;
var utf8Len = (s) => Buffer.byteLength(s, "utf8");
var __idSeq = 0;
var newId = () => `e${Date.now().toString(36)}-${(__idSeq++).toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
var shardName = (base, i) => i === 0 ? base : `${base}_${i + 1}`;
function shardIndexOf(base, id) {
  if (id === base) return 0;
  if (!id.startsWith(base + "_")) return null;
  const s = id.slice(base.length + 1);
  if (!/^[1-9][0-9]*$/.test(s)) return null;
  const n = Number(s);
  return n >= 2 ? n - 1 : null;
}
var prefixRange = (kv, p) => query(
  kv,
  where(documentId(), ">=", p),
  where(documentId(), "<", p.slice(0, -1) + String.fromCharCode(p.charCodeAt(p.length - 1) + 1))
);
async function readShardedList(db, base) {
  const snap = await getDocs(prefixRange(collection(db, "kv"), base));
  const out = [];
  snap.forEach((d) => {
    const idx = shardIndexOf(base, d.id);
    if (idx == null) return;
    let arr = [];
    try {
      const a = JSON.parse(d.data().v);
      if (Array.isArray(a)) arr = a;
    } catch {
    }
    out.push({ idx, arr });
  });
  out.sort((a, b) => a.idx - b.idx);
  return out;
}
async function appendSharded(db, base, existing, adds, errors) {
  if (adds.length === 0) return { ok: true, committed: 0 };
  let idx = existing.length ? existing[existing.length - 1].idx : 0;
  let arr = existing.length ? [...existing[existing.length - 1].arr] : [];
  let bytes = utf8Len(JSON.stringify(arr));
  if (arr.length > 0 && bytes > FS_MAX_BYTES) {
    idx++;
    arr = [];
    bytes = 2;
  }
  let dirty = false, committed = 0, inShard = 0;
  const flush = async () => {
    await setDoc(doc(db, "kv", shardName(base, idx)), { v: JSON.stringify(arr), ts: (/* @__PURE__ */ new Date()).toISOString() });
    committed += inShard;
    inShard = 0;
    return true;
  };
  try {
    for (const it of adds) {
      const b = utf8Len(JSON.stringify(it)) + 1;
      if (b + 2 > FS_HARD_BYTES) {
        errors.push(`${base}: one record is ${Math.round(b / 1024)} KB \u2014 too large for a document; skipped.`);
        committed++;
        continue;
      }
      if (arr.length > 0 && bytes + b > FS_MAX_BYTES) {
        if (dirty && !await flush()) return { ok: false, committed };
        idx++;
        arr = [];
        bytes = 2;
        dirty = false;
      }
      arr.push(it);
      bytes += b;
      dirty = true;
      inShard++;
    }
    if (dirty && !await flush()) return { ok: false, committed };
    return { ok: true, committed };
  } catch (e) {
    errors.push(`${base}: ${(e?.message || "write failed").substring(0, 160)}`);
    return { ok: false, committed };
  }
}
var auto_sync_default = async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  const startedAt = Date.now();
  const elapsed = () => Date.now() - startedAt;
  const store = getStore("gmail-sync");
  let daysBack = 7;
  let chainDepth = 0;
  let triggeredBy = "";
  let stopChainReq = false;
  try {
    if (req.method === "POST") {
      const body = await req.json();
      if (typeof body?.daysBack === "number") daysBack = Math.max(1, Math.min(1095, body.daysBack));
      if (typeof body?.chain === "number") chainDepth = Math.max(0, Math.floor(body.chain));
      triggeredBy = String(body?.triggeredBy || "");
      stopChainReq = body?.stopChain === true;
    }
  } catch {
  }
  if (stopChainReq) {
    await store.setJSON("chain-stop", { stopped: true, at: (/* @__PURE__ */ new Date()).toISOString() });
    return json({ success: true, stopped: true, message: "Auto-continue stopped \u2014 the current pass finishes, then it pauses." });
  }
  const prevState = await store.get("sync-state", { type: "json" }) || {};
  if (prevState.running && prevState.startedAt && Date.now() - Date.parse(prevState.startedAt) < TUNING.LOCK_STALE_MS) {
    return json({ success: true, busy: true, message: "A sync is already running \u2014 try again in a moment." });
  }
  if (triggeredBy === "chain") {
    const cs = await store.get("chain-stop", { type: "json" });
    if (cs?.stopped) return json({ success: true, stopped: true, message: "Auto-continue is stopped." });
  }
  const tokenObj = await store.get("token", { type: "json" });
  if (!tokenObj?.refresh_token) {
    return json({ error: "No Gmail token stored. Connect Gmail in the app first." }, 400);
  }
  const clientId = Netlify.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Netlify.env.get("GOOGLE_CLIENT_SECRET");
  const anthropicKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!clientId || !clientSecret || !anthropicKey) {
    return json({ error: "Server env vars missing" }, 500);
  }
  const vendors = mergeVendors(await store.get("vendors", { type: "json" }), DEFAULT_VENDORS);
  const truckIds = await store.get("truck-ids", { type: "json" }) || [];
  const dedup = await store.get("dedup-index", { type: "json" }) || { gmailRefs: [], invoiceNums: [], fingerprints: [] };
  let dedupGmailRefs = new Set(dedup.gmailRefs);
  let dedupInvoiceNums = new Set(dedup.invoiceNums.map((s) => s.toUpperCase()));
  let dedupFingerprints = new Set(dedup.fingerprints || []);
  const failures = await store.get("failed-refs", { type: "json" }) || {};
  const qRulesSeen = (await store.get("quarantine-rules", { type: "json" }))?.v || 1;
  const releasedItems = [];
  if (qRulesSeen < QUARANTINE_RULES_VERSION) {
    for (const [ref, f] of Object.entries(failures)) {
      const rec = f;
      if ((rec?.count || 0) >= TUNING.MAX_ATTEMPTS && /timed out/i.test(String(rec?.error || ""))) {
        failures[ref] = { count: 0, timeouts: 1, filename: rec.filename, vendor: rec.vendor, messageId: rec.messageId, attachmentId: rec.attachmentId, releasedAt: (/* @__PURE__ */ new Date()).toISOString() };
        const m = /^gmail:(.+):([^:]+)$/.exec(ref);
        const messageId = rec.messageId || (m ? m[1] : "");
        const attachmentId = rec.attachmentId || (m ? m[2] : "");
        if (!messageId || !attachmentId) continue;
        const vendorName = rec.vendor || "";
        const v = vendors.find((x) => x.name === vendorName);
        releasedItems.push({
          gmailRef: ref,
          messageId,
          attachmentId,
          filename: rec.filename || "invoice.pdf",
          mimeType: "application/pdf",
          vendorName,
          vendorCategory: v?.category || "Other"
        });
      }
    }
    await store.setJSON("quarantine-rules", { v: QUARANTINE_RULES_VERSION, freed: releasedItems.length, at: (/* @__PURE__ */ new Date()).toISOString() });
    await store.setJSON("failed-refs", failures);
  }
  let cooled = 0;
  for (const [ref, f] of Object.entries(failures)) {
    const rec = f;
    if ((rec?.count || 0) < TUNING.MAX_ATTEMPTS) continue;
    if (!/timed out/i.test(String(rec?.error || ""))) continue;
    const last = Date.parse(rec?.lastAt || rec?.releasedAt || "");
    if (!Number.isFinite(last) || Date.now() - last < TUNING.RETRY_QUARANTINE_MS) continue;
    const m = /^gmail:(.+):([^:]+)$/.exec(ref);
    const messageId = rec.messageId || (m ? m[1] : "");
    const attachmentId = rec.attachmentId || (m ? m[2] : "");
    if (!messageId || !attachmentId) continue;
    const v = vendors.find((x) => x.name === (rec.vendor || ""));
    failures[ref] = { ...rec, count: TUNING.MAX_ATTEMPTS - 1, cooledAt: (/* @__PURE__ */ new Date()).toISOString() };
    releasedItems.push({
      gmailRef: ref,
      messageId,
      attachmentId,
      filename: rec.filename || "invoice.pdf",
      mimeType: "application/pdf",
      vendorName: rec.vendor || "",
      vendorCategory: v?.category || "Other"
    });
    cooled++;
  }
  if (cooled) await store.setJSON("failed-refs", failures);
  const isQuarantined = (ref) => (failures[ref]?.count || 0) >= TUNING.MAX_ATTEMPTS;
  const stuckCount = () => Object.values(failures).filter((f) => (f?.count || 0) >= TUNING.MAX_ATTEMPTS).length;
  const wq = await store.get("work-queue", { type: "json" }) || { items: [], discovery: null };
  const seen = await store.get("seen-messages", { type: "json" }) || {};
  const msgFailures = await store.get("failed-messages", { type: "json" }) || {};
  await store.setJSON("sync-state", {
    ...prevState,
    running: true,
    startedAt: (/* @__PURE__ */ new Date()).toISOString(),
    message: "Syncing\u2026"
  });
  if (triggeredBy !== "chain") await store.setJSON("chain-stop", { stopped: false });
  let imported = 0;
  let queued = 0;
  let processed = 0;
  let discovered = 0;
  let errors = [];
  let timedOut = false;
  let fbApp = null;
  let db = null;
  const getDb = () => {
    if (!db) {
      fbApp = initializeApp(FIREBASE_CONFIG, `auto-sync-${Date.now()}`);
      db = getFirestore(fbApp);
    }
    return db;
  };
  try {
    const accessToken = await refreshAccessToken(tokenObj.refresh_token, clientId, clientSecret);
    let disco = wq.discovery;
    const epochAgeDays = disco ? (Date.now() - Date.parse(disco.epochAt)) / 864e5 : Infinity;
    const memoStale = ((await store.get("memo-version", { type: "json" }))?.v || 1) < MEMO_VERSION;
    const idleAtDone = wq.items.length === 0 && !!disco?.done;
    const needEpoch = !disco || daysBack > disco.coveredDays || idleAtDone && (memoStale || epochAgeDays >= TUNING.EPOCH_MAX_AGE_DAYS);
    const epochBaseImported = needEpoch ? 0 : prevState.epochImported || 0;
    const epochBaseQueued = needEpoch ? 0 : prevState.epochQueued || 0;
    if (needEpoch) {
      const truth = await reconcileFromLedger(getDb());
      for (const ref of dedupGmailRefs) {
        if (!truth.gmailRefs.has(ref)) {
          const mid = ref.split(":")[1];
          if (mid) delete seen[mid];
        }
      }
      if (memoStale && idleAtDone) {
        for (const k of Object.keys(seen)) delete seen[k];
        await store.setJSON("memo-version", { v: MEMO_VERSION, at: (/* @__PURE__ */ new Date()).toISOString() });
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
        epochAt: (/* @__PURE__ */ new Date()).toISOString(),
        freshAfter: null
      };
      wq.items = wq.items.filter((it) => !dedupGmailRefs.has(it.gmailRef) && !isQuarantined(it.gmailRef));
    }
    disco = disco;
    const queuedRefs = new Set(wq.items.map((it) => it.gmailRef));
    const enqueue = (item, front = false) => {
      if (queuedRefs.has(item.gmailRef)) return;
      queuedRefs.add(item.gmailRef);
      if (front) wq.items.unshift(item);
      else wq.items.push(item);
      discovered++;
    };
    for (const it of releasedItems) if (!dedupGmailRefs.has(it.gmailRef)) enqueue(it, true);
    if (!disco.done) {
      await crawlMailbox(accessToken, vendors, disco, seen, dedupGmailRefs, isQuarantined, enqueue, startedAt, msgFailures, errors);
    } else {
      await freshCheck(accessToken, vendors, disco, seen, dedupGmailRefs, isQuarantined, enqueue, startedAt, msgFailures, errors);
    }
    const newCostsAdds = [];
    const newReviewAdds = [];
    if (wq.items.length > 0) getDb();
    const attempted = /* @__PURE__ */ new Set();
    const inFlight = /* @__PURE__ */ new Set();
    const pendingRefs = /* @__PURE__ */ new Map();
    const pendingQueued = /* @__PURE__ */ new Map();
    const pendingNums = /* @__PURE__ */ new Map();
    const pendingFps = /* @__PURE__ */ new Map();
    const settle = (r, fairAttempt, deadlineMs) => {
      const idx = wq.items.findIndex((it) => it.gmailRef === r.gmailRef);
      if (r.aborted && !fairAttempt) {
        timedOut = true;
        return;
      }
      processed++;
      if (r.transient) {
        if (idx >= 0) {
          wq.items.push(wq.items.splice(idx, 1)[0]);
        }
        return;
      }
      if (r.error || r.aborted) {
        const prev = failures[r.gmailRef] || {};
        const where2 = r.stage ? ` in ${r.stage}` : "";
        const detail = [r.timing, r.pages ? `${r.pages} pages` : "", r.bytes ? `${(r.bytes / 1048576).toFixed(1)} MB` : ""].filter(Boolean).join(", ");
        const errText = (r.aborted ? `timed out${where2} after ${Math.round(deadlineMs / 1e3)}s` : r.error) + (detail ? ` [${detail}]` : "");
        const count = (prev.count || 0) + 1;
        const timeouts = (prev.timeouts || 0) + (r.aborted ? 1 : 0);
        failures[r.gmailRef] = { count, timeouts, error: errText, filename: r.filename, vendor: r.vendor, messageId: r.messageId, attachmentId: r.attachmentId, lastAt: (/* @__PURE__ */ new Date()).toISOString() };
        const quarantined = count >= TUNING.MAX_ATTEMPTS;
        errors.push(`${r.gmailRef}: ${errText}${quarantined ? ` \u2014 quarantined after ${count} attempts` : ""}`);
        if (idx >= 0) {
          if (quarantined) {
            wq.items.splice(idx, 1);
            queuedRefs.delete(r.gmailRef);
          } else {
            wq.items.push(wq.items.splice(idx, 1)[0]);
          }
        }
        return;
      }
      if (r.skipReason) {
        delete failures[r.gmailRef];
        dedupGmailRefs.add(r.gmailRef);
        if (idx >= 0) {
          wq.items.splice(idx, 1);
          queuedRefs.delete(r.gmailRef);
        }
        return;
      }
      const nums = (r.entries || []).map((e) => e.invoiceNum).filter(Boolean).map((n) => String(n).toUpperCase());
      if (nums.length) pendingNums.set(r.gmailRef, nums);
      const fps = (r.entries || []).map((e) => entryFingerprint(e));
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
          addedAt: (/* @__PURE__ */ new Date()).toISOString(),
          status: "pending"
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
        const priorTimeouts = failures[item.gmailRef]?.timeouts || 0;
        const compact = priorTimeouts >= 1;
        const pageCap = priorTimeouts >= 2;
        const r = await processOne(item, accessToken, anthropicKey, truckIds, vendors, dedupInvoiceNums, dedupFingerprints, AbortSignal.timeout(deadlineMs), compact, pageCap);
        inFlight.delete(item.gmailRef);
        settle(r, fairAttempt, deadlineMs);
      }
    };
    await Promise.all(Array.from({ length: TUNING.PROC_CONC }, () => worker()));
    const writeFailedRefs = /* @__PURE__ */ new Set();
    if (newCostsAdds.length > 0) {
      const byShard = {};
      for (const e of newCostsAdds) {
        const k = costShardKey(e);
        (byShard[k] ||= []).push(e);
      }
      const runNumOwner = /* @__PURE__ */ new Map();
      for (const k of Object.keys(byShard)) {
        const base = `fl-costs-${k}`;
        const shards = await readShardedList(getDb(), base);
        const existing = shards.flatMap((s) => s.arr);
        const haveIds = new Set(existing.map((e) => e.id));
        const haveNums = new Set(existing.map((e) => String(e.invoiceNum || "").toUpperCase()).filter(Boolean));
        const docs = /* @__PURE__ */ new Map();
        for (const e of byShard[k]) {
          const ref = e.gmailRef || String(e.id);
          if (!docs.has(ref)) docs.set(ref, []);
          docs.get(ref).push(e);
        }
        const claimed = new Set(existing.map((e) => entryFingerprint(e)));
        const fullDup = /* @__PURE__ */ new Set();
        for (const [ref, rows] of docs) {
          if (rows.every((e) => claimed.has(entryFingerprint(e)))) {
            fullDup.add(ref);
            continue;
          }
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
        if (!res.ok) {
          for (const e of adds.slice(res.committed)) if (e.gmailRef) writeFailedRefs.add(e.gmailRef);
        }
      }
    }
    if (newReviewAdds.length > 0) {
      const shards = await readShardedList(getDb(), "fl-review-queue");
      const haveRefs = new Set(shards.flatMap((s) => s.arr).map((it) => it && it.gmailRef).filter(Boolean));
      const revAdds = newReviewAdds.filter((it) => !haveRefs.has(it.gmailRef));
      const res = await appendSharded(getDb(), "fl-review-queue", shards, revAdds, errors);
      if (!res.ok) {
        for (const it of revAdds.slice(res.committed)) if (it.gmailRef) writeFailedRefs.add(it.gmailRef);
      }
    }
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
      if (idx >= 0) {
        wq.items.splice(idx, 1);
        queuedRefs.delete(ref);
      }
      if (kind === "review") queued += pendingQueued.get(ref) || 0;
    }
    wq.discovery = disco;
    await store.setJSON("work-queue", wq);
    await store.setJSON("seen-messages", seen);
    await store.setJSON("failed-messages", msgFailures);
    await store.setJSON("dedup-index", {
      gmailRefs: Array.from(dedupGmailRefs),
      invoiceNums: Array.from(dedupInvoiceNums),
      fingerprints: Array.from(dedupFingerprints)
    });
    await store.setJSON("failed-refs", failures);
    const elapsedSec = Math.round(elapsed() / 1e3);
    const remaining = wq.items.length;
    const done = disco.done && remaining === 0;
    timedOut = timedOut || remaining > 0 || !disco.done;
    const stuck = stuckCount();
    const stuckNote = stuck ? ` ${stuck} attachment(s) skipped after failing ${TUNING.MAX_ATTEMPTS} times \u2014 see errors.` : "";
    const epochImported = epochBaseImported + imported;
    const epochQueued = epochBaseQueued + queued;
    const chainStopped = !!(await store.get("chain-stop", { type: "json" }))?.stopped;
    const willChain = !done && !chainStopped && chainDepth < TUNING.CHAIN_MAX;
    const bits = [];
    if (processed) bits.push(`processed ${processed}`);
    if (discovered) bits.push(`found ${discovered} new`);
    const message = done ? `\u2713 All caught up \u2014 imported ${epochImported}${epochQueued ? `, ${epochQueued} queued for review` : ""} this sweep. Nothing new in the last ${disco.coveredDays} days.${stuckNote}` : `\u23F3 ${bits.join(" \xB7 ") || "No progress this run"} \u2014 imported ${epochImported} so far, ${remaining} in queue${!disco.done ? ", still scanning mailbox" : ""}. ${willChain ? "Continuing automatically\u2026" : chainStopped ? "Stopped \u2014 resumes on the next scheduled sync or Catch Up Backlog." : "Resumes on the next scheduled sync."}${stuckNote}`;
    await store.setJSON("sync-state", {
      lastRun: (/* @__PURE__ */ new Date()).toISOString(),
      lastSuccess: errors.length === 0 ? (/* @__PURE__ */ new Date()).toISOString() : prevState.lastSuccess,
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
      chained: chainDepth
    });
    if (willChain) {
      const base = Netlify.env.get("URL") || "";
      if (base) {
        const next = fetch(`${base}/api/auto-sync`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ daysBack: disco.coveredDays, chain: chainDepth + 1, triggeredBy: "chain" })
        }).then((r) => r.json()).catch(() => {
        });
        await Promise.race([next, new Promise((r) => setTimeout(r, TUNING.CHAIN_HANDOFF_MS))]);
      }
    }
    return json({ success: true, imported, queued, epochImported, epochQueued, processed, discovered, remaining, discoveryDone: disco.done, done, timedOut, stuck, chaining: willChain, message });
  } catch (err) {
    const errMsg = err?.message || "Unknown error";
    try {
      await store.setJSON("work-queue", wq);
      await store.setJSON("seen-messages", seen);
      await store.setJSON("failed-messages", msgFailures);
      await store.setJSON("dedup-index", {
        gmailRefs: Array.from(dedupGmailRefs),
        invoiceNums: Array.from(dedupInvoiceNums),
        fingerprints: Array.from(dedupFingerprints)
      });
      await store.setJSON("failed-refs", failures);
    } catch {
    }
    const remaining = wq.items.length;
    await store.setJSON("sync-state", {
      ...prevState,
      running: false,
      lastRun: (/* @__PURE__ */ new Date()).toISOString(),
      remaining,
      message: `\u2717 Sync failed: ${errMsg}${remaining ? ` \u2014 ${remaining} still queued, will retry.` : ""}`,
      errors: [errMsg]
    });
    if (processed > 0 && remaining > 0 && chainDepth < TUNING.CHAIN_MAX) {
      try {
        const stopped = !!(await store.get("chain-stop", { type: "json" }))?.stopped;
        const base = Netlify.env.get("URL") || "";
        if (!stopped && base) {
          const next = fetch(`${base}/api/auto-sync`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ daysBack, chain: chainDepth + 1, triggeredBy: "chain" })
          }).then((r) => r.json()).catch(() => {
          });
          await Promise.race([next, new Promise((r) => setTimeout(r, TUNING.CHAIN_HANDOFF_MS))]);
        }
      } catch {
      }
    }
    return json({ error: errMsg, imported, queued, processed, remaining }, 500);
  }
};
async function reconcileFromLedger(db) {
  const kv = collection(db, "kv");
  const [shardSnap, archSnap, legacyDoc, reviewShards, rejectedDoc] = await Promise.all([
    getDocs(prefixRange(kv, "fl-costs-")),
    getDocs(prefixRange(kv, "fl-arch-costs-")),
    getDoc(doc(db, "kv", "fl-costs")),
    readShardedList(db, "fl-review-queue"),
    getDoc(doc(db, "kv", "fl-rejected-refs"))
  ]);
  const gmailRefs = /* @__PURE__ */ new Set();
  const invoiceNums = /* @__PURE__ */ new Set();
  const fingerprints = /* @__PURE__ */ new Set();
  const addRefs = (e) => {
    if (!e?.gmailRef) return;
    gmailRefs.add(e.gmailRef);
    const messageId = String(e.gmailRef).split(":")[1];
    if (!messageId) return;
    let key = e.fileKey ? String(e.fileKey) : "";
    if (!key && e.fileUrl) {
      const m = /[?&]key=([^&]+)/.exec(String(e.fileUrl));
      if (m) {
        try {
          key = decodeURIComponent(m[1]);
        } catch {
          key = m[1];
        }
      }
    }
    const name = key.replace(/^\d+-/, "");
    if (name) gmailRefs.add(`gmail:${messageId}:${name}`);
  };
  const eat = (arr) => {
    if (!Array.isArray(arr)) return;
    for (const e of arr) {
      addRefs(e);
      if (e?.invoiceNum) invoiceNums.add(String(e.invoiceNum).toUpperCase());
      fingerprints.add(entryFingerprint(e));
    }
  };
  const eatDoc = (d) => {
    try {
      eat(JSON.parse(d.data().v));
    } catch {
    }
  };
  shardSnap.forEach(eatDoc);
  archSnap.forEach(eatDoc);
  if (legacyDoc.exists()) eatDoc(legacyDoc);
  for (const s of reviewShards) for (const it of s.arr) addRefs(it);
  if (rejectedDoc.exists()) {
    try {
      const refs = JSON.parse(rejectedDoc.data().v);
      if (Array.isArray(refs)) {
        for (const r of refs) if (typeof r === "string") gmailRefs.add(r);
      }
    } catch {
    }
  }
  return { gmailRefs, invoiceNums, fingerprints };
}
async function crawlMailbox(accessToken, vendors, disco, seen, dedupGmailRefs, isQuarantined, enqueue, startedAt, msgFailures, errors) {
  const deadlineAt = startedAt + TUNING.DISCOVERY_MS;
  while (!disco.done && Date.now() < deadlineAt) {
    const vendor = vendors[disco.vendorIdx];
    if (!vendor) {
      finishCrawl(disco);
      break;
    }
    const q = buildVendorQuery(vendor.name, afterDateStr(disco.coveredDays));
    let page;
    try {
      page = await gmailList(accessToken, q, disco.pageToken, TUNING.LIST_PAGE);
    } catch (e) {
      if (disco.pageToken) {
        disco.pageToken = null;
        continue;
      }
      throw e;
    }
    const unseen = page.ids.filter((id) => !seen[id]);
    let finishedPage = true;
    for (let i = 0; i < unseen.length; i += TUNING.GET_CONC) {
      if (Date.now() >= deadlineAt) {
        finishedPage = false;
        break;
      }
      const metas = await gmailGetMessages(accessToken, unseen.slice(i, i + TUNING.GET_CONC), msgFailures, seen, errors);
      for (const m of metas) {
        enqueueMessagePdfs(m, vendor, dedupGmailRefs, isQuarantined, enqueue, false);
        seen[m.emailId] = 1;
      }
    }
    if (!finishedPage) break;
    if (page.nextPageToken) {
      disco.pageToken = page.nextPageToken;
    } else {
      disco.vendorIdx++;
      disco.pageToken = null;
      if (disco.vendorIdx >= vendors.length) finishCrawl(disco);
    }
  }
}
function finishCrawl(disco) {
  disco.done = true;
  disco.freshAfter = afterDateStr(TUNING.FRESH_SLACK_DAYS);
}
async function freshCheck(accessToken, vendors, disco, seen, dedupGmailRefs, isQuarantined, enqueue, startedAt, msgFailures, errors) {
  const after = disco.freshAfter || afterDateStr(TUNING.FRESH_SLACK_DAYS);
  const deadlineAt = startedAt + TUNING.DISCOVERY_MS;
  let complete = true;
  await Promise.all(vendors.map(async (vendor) => {
    let pageToken = null;
    do {
      const page = await gmailList(accessToken, buildVendorQuery(vendor.name, after), pageToken, TUNING.LIST_PAGE);
      const unseen = page.ids.filter((id) => !seen[id]);
      for (let i = 0; i < unseen.length; i += TUNING.GET_CONC) {
        const metas = await gmailGetMessages(accessToken, unseen.slice(i, i + TUNING.GET_CONC), msgFailures, seen, errors);
        for (const m of metas) {
          enqueueMessagePdfs(m, vendor, dedupGmailRefs, isQuarantined, enqueue, true);
          seen[m.emailId] = 1;
        }
      }
      pageToken = page.nextPageToken;
      if (pageToken && Date.now() >= deadlineAt) {
        complete = false;
        break;
      }
    } while (pageToken);
  }));
  if (complete) disco.freshAfter = afterDateStr(TUNING.FRESH_SLACK_DAYS);
}
function enqueueMessagePdfs(m, vendor, dedupGmailRefs, isQuarantined, enqueue, front) {
  for (const a of m.attachments || []) {
    if (!a.attachmentId) continue;
    const isPdf = (a.mimeType || "").includes("pdf") || (a.filename || "").toLowerCase().endsWith(".pdf");
    if (!isPdf) continue;
    const gmailRef = stableGmailRef(m.emailId, a.filename);
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
      vendorCategory: vendor.category
    }, front);
  }
}
function stuckList(failures) {
  return Object.entries(failures).filter(([, f]) => (f?.count || 0) >= TUNING.MAX_ATTEMPTS).slice(0, 5).map(([ref, f]) => {
    const x = f;
    return `${x.filename || ref}${x.vendor ? ` (${x.vendor})` : ""}: ${x.error || "failed"}`;
  });
}
function costShardKey(e) {
  const m = String(e?.date || "").slice(0, 7);
  return /^\d{4}-\d{2}$/.test(m) ? m : "unknown";
}
function attachmentSlug(filename) {
  return (filename || "invoice.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
}
function stableGmailRef(messageId, filename) {
  return `gmail:${messageId}:${attachmentSlug(filename)}`;
}
function entryFingerprint(e) {
  return [
    String(e?.vendor || "").trim().toLowerCase(),
    String(e?.date || "").slice(0, 10),
    String(e?.truckId || ""),
    (Number(e?.total) || 0).toFixed(2)
  ].join("|");
}
var TRUCK_IN_DESC = /\b(?:truck|unit)\s*#?\s*(\d{3,5})\b/i;
function normalizeTruckId(raw, fleetIds) {
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
var TANK_GALLONS = 250;
function splitMultiTruckEntry(e) {
  const lines = Array.isArray(e?.lineItems) ? e.lineItems : [];
  const per = /* @__PURE__ */ new Map();
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
    gallons: gallons && lineSum > 0 ? Math.round(gallons * amt / lineSum * 10) / 10 : null,
    invoiceNum: baseNum ? `${baseNum}-${truckId}` : null,
    lineItems: [{ desc: `Diesel - Truck ${truckId}`, amount: Math.round(amt * 100) / 100 }],
    notes: [String(e.notes || "").trim(), stamp].filter(Boolean).join(" ")
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
    notes: [String(e.notes || "").trim(), stamp, "This part of the document was not broken out per truck \u2014 allocate it from the Inventory view."].filter(Boolean).join(" ")
  });
  return out;
}
function coalesceRepairInvoice(entries) {
  const rows = Array.isArray(entries) ? entries : [];
  const isRepair = (e) => String(e?.category || "").toLowerCase() === "repair";
  const isBucket = (t) => {
    const v = String(t == null ? "" : t).toUpperCase();
    return v === "" || v === "INVENTORY" || v === "UNKNOWN";
  };
  const byInv = /* @__PURE__ */ new Map();
  for (const e of rows) {
    if (!isRepair(e) || !e?.invoiceNum) continue;
    const k = String(e.invoiceNum);
    if (!byInv.has(k)) byInv.set(k, []);
    byInv.get(k).push(e);
  }
  const absorbed = /* @__PURE__ */ new Set();
  const merged = /* @__PURE__ */ new Map();
  for (const [, group] of byInv) {
    if (group.length < 2) continue;
    const trucks = [...new Set(group.filter((e) => !isBucket(e.truckId)).map((e) => String(e.truckId)))];
    if (trucks.length !== 1) continue;
    const keep = group.find((e) => String(e.truckId) === trucks[0]);
    const strays = group.filter((e) => e !== keep);
    if (!keep || !strays.length) continue;
    const total = group.reduce((sum, e) => sum + (Number(e.total) || 0), 0);
    const lines = group.flatMap((e) => Array.isArray(e.lineItems) ? e.lineItems : []);
    merged.set(keep, {
      ...keep,
      total: Math.round(total * 100) / 100,
      lineItems: lines.length ? lines : keep.lineItems,
      notes: [String(keep.notes || "").trim(), `Whole repair invoice booked to #${trucks[0]} (${strays.length} unassigned row${strays.length === 1 ? "" : "s"} folded in).`].filter(Boolean).join(" ")
    });
    strays.forEach((e) => absorbed.add(e));
  }
  if (!absorbed.size) return rows;
  return rows.filter((e) => !absorbed.has(e)).map((e) => merged.get(e) || e);
}
function splitMultiTruck(entries) {
  return entries.flatMap((e) => splitMultiTruckEntry(e));
}
function afterDateStr(daysBack) {
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() - daysBack);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
async function refreshAccessToken(refreshToken, clientId, clientSecret) {
  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    })
  });
  const data = await resp.json();
  if (!resp.ok || !data.access_token) {
    throw new Error("Token refresh failed: " + JSON.stringify(data).substring(0, 200));
  }
  return data.access_token;
}
function buildVendorQuery(vendorName, afterDate) {
  const key = vendorName.toLowerCase().trim();
  const dateFilter = afterDate ? ` after:${afterDate}` : "";
  if (VENDOR_QUERIES[key]) return VENDOR_QUERIES[key] + dateFilter;
  return `"${vendorName}" has:attachment` + dateFilter;
}
async function gmailList(accessToken, q, pageToken, max) {
  const url = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(q)}&maxResults=${max}${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await resp.json();
  if (!resp.ok) throw new Error("Gmail search failed: " + JSON.stringify(data).substring(0, 200));
  return { ids: (data.messages || []).map((m) => m.id), nextPageToken: data.nextPageToken || null };
}
async function gmailGetMessages(accessToken, ids, msgFailures, seen, errors) {
  const settled = await Promise.all(ids.map(async (id) => {
    try {
      const m = await gmailGetMessage(accessToken, id);
      if (msgFailures[id]) delete msgFailures[id];
      return m;
    } catch (e) {
      const msg = String(e?.message || e);
      const count = (msgFailures[id]?.count || 0) + 1;
      msgFailures[id] = { count, error: msg };
      if (count >= TUNING.MAX_ATTEMPTS) {
        seen[id] = 1;
        errors.push(`message ${id}: ${msg.substring(0, 160)} \u2014 skipped after ${count} attempts`);
      }
      return null;
    }
  }));
  return settled.filter(Boolean);
}
async function gmailGetMessage(accessToken, id) {
  const r = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const full = await r.json();
  if (!r.ok) throw new Error("Gmail message fetch failed: " + JSON.stringify(full).substring(0, 200));
  const headers = full.payload?.headers || [];
  const getHeader = (n) => headers.find((h) => h.name.toLowerCase() === n.toLowerCase())?.value || "";
  const attachments = [];
  const walk = (part) => {
    if (part.filename) attachments.push({
      filename: part.filename,
      size: part.body?.size || 0,
      attachmentId: part.body?.attachmentId || null,
      mimeType: part.mimeType || ""
    });
    if (part.parts) part.parts.forEach(walk);
  };
  if (full.payload) walk(full.payload);
  return {
    emailId: id,
    emailDate: getHeader("Date"),
    emailSubject: getHeader("Subject"),
    from: getHeader("From"),
    attachments
  };
}
async function processOne(item, accessToken, anthropicKey, truckIds, vendors, dedupInvoiceNums, dedupFingerprints, signal, compact = false, pageCap = false) {
  const { gmailRef, messageId, attachmentId, filename } = item;
  const vendor = vendors.find((v) => v.name === item.vendorName) || { name: item.vendorName, category: item.vendorCategory || "Other" };
  const result = { gmailRef, messageId, attachmentId, vendor: vendor.name, filename };
  let stage = "start";
  let lastAt = Date.now();
  const marks = {};
  const mark = (next) => {
    marks[stage] = (marks[stage] || 0) + (Date.now() - lastAt);
    lastAt = Date.now();
    stage = next;
  };
  const checkpoint = () => {
    if (signal.aborted) {
      const e = new Error("deadline");
      e.name = "AbortError";
      throw e;
    }
  };
  try {
    stage = "download";
    const attResp = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
      { headers: { Authorization: `Bearer ${accessToken}` }, signal }
    );
    if (!attResp.ok && (attResp.status === 429 || attResp.status >= 500)) {
      const e = new Error(`Gmail attachment fetch ${attResp.status}`);
      e.transient = true;
      throw e;
    }
    const attData = await attResp.json();
    if (!attData.data) throw new Error("No attachment data");
    const base64 = attData.data.replace(/-/g, "+").replace(/_/g, "/");
    const pdfBuffer = Buffer.from(base64, "base64");
    result.bytes = pdfBuffer.length;
    mark("parse");
    checkpoint();
    const pdfText = await parseGate(async () => {
      checkpoint();
      const big = pdfBuffer.length > TUNING.PDF_BIG_BYTES;
      const maxPages = pageCap ? TUNING.PDF_MAX_PAGES : big ? TUNING.PDF_BIG_MAX_PAGES : 0;
      const d = await pdfParse(pdfBuffer, maxPages ? { max: maxPages } : void 0);
      result.pages = d?.numpages;
      result.pagesParsed = maxPages || d?.numpages;
      return (d?.text || "").trim();
    });
    if (!pdfText) throw new Error("PDF has no extractable text (image-only PDF \u2014 needs OCR)");
    mark("upload");
    checkpoint();
    const fileStore = getStore("invoice-files");
    const safeName = (filename || "invoice.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileKey = `${Date.now()}-${safeName}`;
    await fileStore.set(fileKey, pdfBuffer, {
      metadata: { contentType: "application/pdf", filename }
    });
    const fileUrl = `/api/invoice-file?key=${encodeURIComponent(fileKey)}`;
    result.fileUrl = fileUrl;
    mark("ai");
    checkpoint();
    const parsed = await callAnthropicScan(anthropicKey, pdfText, truckIds, vendor, signal, compact);
    if (!parsed || Array.isArray(parsed) && parsed.length === 0) {
      throw new Error("Parser returned no rows");
    }
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    const built = rows.map((r) => ({
      id: newId(),
      date: r.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      truckId: normalizeTruckId(r.truckId || "INVENTORY", truckIds),
      vendor: r.vendor || vendor.name,
      category: r.category || vendor.category || "Other",
      total: Number(r.total) || 0,
      gallons: r.gallons || null,
      pricePerGallon: r.pricePerGallon || null,
      invoiceNum: r.invoiceNum || null,
      lineItems: r.lineItems || [],
      // Say so on the record rather than letting a thinner import look like a full one.
      notes: (r.notes || "") + (compact ? " [Large invoice \u2014 imported without per-line detail; see the original PDF.]" : "") + (pageCap ? ` [Only the first ${TUNING.PDF_MAX_PAGES} pages were read \u2014 check the original PDF before trusting the total.]` : ""),
      gmailRef,
      fileUrl,
      fileKey,
      addedAt: (/* @__PURE__ */ new Date()).toISOString()
    }));
    const entries = splitMultiTruck(coalesceRepairInvoice(built));
    result.split = entries.length - built.length;
    if (rows[0]?._confidence) {
      entries[0]._confidence = rows[0]._confidence;
      entries[0]._confidenceReason = rows[0]._confidenceReason;
    }
    const verdict = evaluateConfidence(entries, vendor, truckIds, vendors);
    result.entries = entries;
    result.confidence = pageCap ? "low" : verdict.level;
    result.confidenceReason = pageCap ? `Only the first ${TUNING.PDF_MAX_PAGES} pages were read (large PDF) \u2014 verify the total against the original.` : verdict.reason;
    result.invoiceNum = entries[0]?.invoiceNum;
    if (entries.every((e) => e.invoiceNum && dedupInvoiceNums.has(String(e.invoiceNum).toUpperCase()))) {
      result.skipReason = "duplicate invoiceNum";
    } else if (dedupFingerprints.size > 0 && entries.every((e) => dedupFingerprints.has(entryFingerprint(e)))) {
      result.skipReason = "already imported (same vendor/date/truck/amount)";
    }
    return result;
  } catch (err) {
    const failedAt = stage;
    mark("done");
    const worst = Object.entries(marks).sort((a, b) => b[1] - a[1])[0];
    const aborted = err?.name === "AbortError" || err?.name === "TimeoutError";
    result.stage = aborted && worst && worst[1] > 0 ? worst[0] : failedAt;
    result.timing = Object.entries(marks).filter(([, ms]) => ms > 0).map(([k, ms]) => `${k} ${Math.round(ms / 100) / 10}s`).join(", ");
    if (err?.name === "AbortError" || err?.name === "TimeoutError") {
      result.aborted = true;
      return result;
    }
    if (err?.fatal) throw err;
    if (err?.transient || err?.name === "TypeError") result.transient = true;
    result.error = (err?.message || "process failed").substring(0, 300);
    return result;
  }
}
async function callAnthropicScan(apiKey, pdfText, truckIds, vendor, signal, compact = false) {
  const truckList = truckIds.length > 0 ? truckIds.join(", ") : "(unknown)";
  const prompt = compact ? `You are extracting invoice TOTALS for ${vendor.name} (category: ${vendor.category || "Other"}).
This invoice is very large, so return ONLY summary rows \u2014 one row per truck. Be brief.
Return a JSON array. Each element MUST have:
- truckId: 4-digit truck number from the fleet (${truckList}), or "INVENTORY" if not assigned to a truck, or "UNKNOWN" if you can't tell
- vendor: "${vendor.name}"
- category: "Fuel", "Parts", "Labor", "Repair", "Maintenance", or "Other"
- total: number (that truck's total INCLUDING tax)
- gallons: number (Fuel only, that truck's total gallons) or null
- pricePerGallon: number (Fuel only, average) or null
- invoiceNum: invoice or document number as printed
- date: YYYY-MM-DD format
- lineItems: [] (ALWAYS an empty array \u2014 do not list individual lines)
- notes: "" (leave empty)

The total is ALWAYS one truck's own charge. A fuel service log lists every unit
filled that day \u2014 return one row per unit, never the document total on a single unit.


COMPLETE FLEET SERVICES L.L.C. (complete.fleet@outlook.com): the truck is the last cell of the
"Service Order | Terms | Due Date | Authorizer | Customer PO | Unit #" row and carries a yard
prefix \u2014 "BX0424", "GP2883". truckId is THE TRAILING 4 DIGITS ONLY ("BX0424" -> "0424").
One row for the whole invoice \u2014 the several "Complaint:"/"Subtotal" blocks are jobs on the SAME
truck. total = the "Total" line after the GEORGIA/HALL COUNTY tax lines, not "Pre-Charge
Subtotal" and not "Balance Due". invoiceNum "CFS-<number>". category "Repair".
The ENTIRE total goes to that ONE truck \u2014 never "INVENTORY", never a second row for parts or tax.

ALSO add ONE meta field on the FIRST element only:
- _confidence: "high" or "low"
- _confidenceReason: why low

INVOICE TEXT:
${pdfText.substring(0, 3e4)}

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

CRITICAL \u2014 a fuel service log lists EVERY unit filled that day, one row per unit
(columns: Unit Number, Gallons, Price Per Gallon, Total Charge). Return ONE OBJECT
PER UNIT, and set total to that unit's own Total Charge \u2014 NEVER the document total,
and never the whole delivery pinned on the first unit listed. Skip the "Total" row.


SPECIAL RULE FOR COMPLETE FLEET SERVICES L.L.C. (Oakwood GA, complete.fleet@outlook.com):
- A repair-shop invoice, usually 2 pages. Header shows "Invoice: <number>" and "Date: M/D/YYYY".
- THE TRUCK comes from the row under the header "Service Order | Terms | Due Date | Authorizer | Customer PO | Unit #".
  That value carries a yard prefix \u2014 e.g. "BX0424", "GP2883" \u2014 and repeats further down as
  "Unit: <X>", "Fleet #: <X>", and as the last six characters of the VIN.
  truckId = THE TRAILING 4 DIGITS ONLY: "BX0424" -> "0424", "GP2883" -> "2883". Never return the prefixed form.
  If the parenthetical after "Unit:" disagrees with the Unit # cell \u2014 one real invoice reads
  "Unit: GP2883 (GO2883)" \u2014 trust the Unit # cell.
- Return EXACTLY ONE object for the whole invoice. These invoices bill ONE truck. Several
  "Complaint:" blocks each ending in their own "Subtotal" are separate jobs on the SAME truck.
  Never split them into separate rows or separate trucks.
- total: the "Total" line near the bottom, AFTER the "GEORGIA" and "HALL COUNTY" tax lines.
  NOT "Pre-Charge Subtotal", NOT any "Subtotal", and NOT "Balance Due" (that is net of payments).
- invoiceNum: "CFS-<invoice number>" \u2014 e.g. "CFS-10785".
- vendor: "Complete Fleet Services"
- category: "Repair"
- THE ENTIRE INVOICE TOTAL GOES TO THAT ONE TRUCK. This is a repair, not a parts purchase for
  the shelf. Never route any part of it to "INVENTORY", never emit a second row for parts,
  shop supplies or tax, and never use category "Inventory". One row, one truck, the full Total.
- date: the "Date:" at the top, as YYYY-MM-DD.
- lineItems: one per "Parts ..." row and per Labor line \u2014 desc = the description as printed, amount = the Amount column.
- notes: one short line summarising the "Complaint:" text.

ALSO add ONE meta field on the FIRST element only:
- _confidence: "high" or "low"
- _confidenceReason: why low (e.g. "ambiguous truck assignment", "totals don't sum", "vendor unclear")

INVOICE TEXT:
${pdfText.substring(0, 3e4)}

Return ONLY the JSON array, no preamble.`;
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      // Output length is what blows the deadline, so the compact pass caps it hard.
      max_tokens: compact ? 4096 : 16384,
      messages: [{ role: "user", content: prompt }]
    }),
    signal
  });
  const data = await resp.json();
  if (!resp.ok) {
    const e = new Error(`Anthropic ${resp.status}: ${JSON.stringify(data).substring(0, 200)}`);
    if (resp.status === 401 || resp.status === 403) e.fatal = true;
    else if (resp.status === 429 || resp.status >= 500) e.transient = true;
    throw e;
  }
  const text = data.content?.[0]?.text || "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error("No JSON array found in response");
  return JSON.parse(match[0]);
}
function evaluateConfidence(entries, vendor, truckIds, vendors) {
  const aiVerdict = entries[0]?._confidence;
  const aiReason = entries[0]?._confidenceReason || "";
  entries.forEach((e) => {
    delete e._confidence;
    delete e._confidenceReason;
  });
  if (aiVerdict === "low") return { level: "low", reason: aiReason || "AI flagged uncertain" };
  const knownVendors = new Set(vendors.map((v) => v.name.toLowerCase()));
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
    if (e.truckId !== "INVENTORY" && Number(e.gallons) > TANK_GALLONS) {
      return { level: "low", reason: `${e.gallons} gallons on one truck \u2014 likely a whole service log booked to truck ${e.truckId}` };
    }
  }
  return { level: "high", reason: "All fields valid" };
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
var config = {
  path: "/api/auto-sync"
};
export {
  TUNING,
  VENDOR_QUERIES,
  config,
  auto_sync_default as default
};
