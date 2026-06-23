import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import pdfParse from "pdf-parse";

/**
 * /api/auto-sync — server-side Gmail invoice sync.
 *
 * Pipeline: read token from Blobs → search Gmail per vendor → fetch new
 * attachments → extract PDF text → call Anthropic → evaluate confidence →
 * high-conf items go to fl-costs (Firestore), low-conf items go to
 * fl-review-queue. State is persisted in Blobs so subsequent runs are idempotent.
 *
 * Time budget: ~26s. We process attachments in parallel (CONCURRENCY=3) but
 * stop early if approaching the deadline so we always write state before exit.
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

const TIME_BUDGET_MS = 22000; // leave 4s headroom under the 26s function cap

export default async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  const startedAt = Date.now();
  const store = getStore("gmail-sync");

  // Parse options from request (manual sync may pass { daysBack: 7 } etc.)
  let daysBack = 7;
  try {
    if (req.method === "POST") {
      const body = await req.json();
      if (typeof body?.daysBack === "number") daysBack = Math.max(1, Math.min(90, body.daysBack));
    }
  } catch {}

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

  // Existing state + dedup index
  const prevState = (await store.get("sync-state", { type: "json" }) as any) || {};
  const dedup = (await store.get("dedup-index", { type: "json" }) as any) || {
    gmailRefs: [],
    invoiceNums: [],
  };
  const dedupGmailRefs = new Set<string>(dedup.gmailRefs);
  const dedupInvoiceNums = new Set<string>((dedup.invoiceNums as string[]).map((s) => s.toUpperCase()));

  // Mark running
  await store.setJSON("sync-state", {
    ...prevState,
    running: true,
    startedAt: new Date().toISOString(),
    message: "Searching Gmail…",
  });

  let imported = 0;
  let queued = 0;
  let processed = 0;
  let errors: string[] = [];
  let timedOut = false;

  try {
    // ── 2. Get Gmail access token
    const accessToken = await refreshAccessToken(tokenObj.refresh_token, clientId, clientSecret);

    // ── 3. Build queue: search each vendor in parallel
    const d = new Date();
    d.setDate(d.getDate() - daysBack);
    const afterDate = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
    const vendorResults = await Promise.all(
      vendors.map(async (v: any) => {
        const q = buildVendorQuery(v.name, afterDate);
        return { vendor: v, messages: await gmailSearch(accessToken, q) };
      })
    );

    // Build flat queue of (vendor, message, attachment) tuples
    const queue: Array<{ vendor: any; message: any; attachment: any; gmailRef: string }> = [];
    for (const { vendor, messages } of vendorResults) {
      for (const m of messages) {
        for (const a of m.attachments || []) {
          const gmailRef = `gmail:${m.emailId}:${a.attachmentId}`;
          if (dedupGmailRefs.has(gmailRef)) continue;
          const isPdf = (a.mimeType || "").includes("pdf") || (a.filename || "").toLowerCase().endsWith(".pdf");
          if (!isPdf) continue; // server-side only handles PDFs for now
          queue.push({ vendor, message: m, attachment: a, gmailRef });
        }
      }
    }

    if (queue.length === 0) {
      await store.setJSON("sync-state", {
        lastRun: new Date().toISOString(),
        lastSuccess: new Date().toISOString(),
        running: false,
        imported: 0,
        queued: 0,
        errors: [],
        message: `✓ All caught up. No new invoices in the last ${daysBack} days.`,
      });
      return json({ success: true, imported: 0, queued: 0, message: "Nothing new" });
    }

    await store.setJSON("sync-state", {
      ...prevState,
      running: true,
      message: `Processing ${queue.length} attachment(s)…`,
      lastRun: new Date().toISOString(),
    });

    // Init Firebase
    const fbApp = initializeApp(FIREBASE_CONFIG, `auto-sync-${Date.now()}`);
    const db = getFirestore(fbApp);

    // Read existing data once for dedup
    const [costsDoc, reviewDoc] = await Promise.all([
      getDoc(doc(db, "kv", "fl-costs")),
      getDoc(doc(db, "kv", "fl-review-queue")),
    ]);
    const existingCosts = costsDoc.exists() ? JSON.parse(costsDoc.data().v) : [];
    const existingReview = reviewDoc.exists() ? JSON.parse(reviewDoc.data().v) : [];
    for (const c of existingCosts) if (c.invoiceNum) dedupInvoiceNums.add(String(c.invoiceNum).toUpperCase());

    // v2.11: Firestore caps a single document field at ~1,048,487 bytes. The fl-costs
    // blob grows unbounded, and once it nears that ceiling EVERY setDoc throws
    // "INVALID_ARGUMENT: property 'v' is longer than 1048487 bytes" — which is what the
    // user saw on the Costs page. Before, the function would still burn Anthropic calls
    // scanning the whole queue and THEN fail on write, repeating nightly forever. Now we
    // short-circuit with a clear, actionable message and zero AI spend.
    const FIRESTORE_DOC_LIMIT = 1_000_000; // ~1MB with headroom for the ts field + overhead
    const existingCostsBytes = costsDoc.exists() ? (costsDoc.data().v || "").length : 0;
    if (existingCostsBytes > FIRESTORE_DOC_LIMIT) {
      await store.setJSON("sync-state", {
        ...prevState,
        running: false,
        lastRun: new Date().toISOString(),
        message: `✗ Auto-sync paused: the cost log has reached Firestore's 1 MB limit (${Math.round(existingCostsBytes / 1024)} KB). Archive or export old invoices to free space, then sync again. No new invoices were processed (no AI cost incurred).`,
        errors: ["fl-costs is at the 1 MB Firestore document limit"],
      });
      return json({ error: "cost log at storage limit", paused: true, bytes: existingCostsBytes }, 200);
    }

    const newCostsAdds: any[] = [];
    const newReviewAdds: any[] = [];

    // ── 4. Process queue with concurrency and time budget
    const CONCURRENCY = 3;
    for (let i = 0; i < queue.length; i += CONCURRENCY) {
      if (Date.now() - startedAt > TIME_BUDGET_MS) {
        timedOut = true;
        break;
      }
      const batch = queue.slice(i, i + CONCURRENCY);
      const batchResults = await Promise.all(
        batch.map((item) => processOne(item, accessToken, anthropicKey, truckIds, vendors, dedupInvoiceNums))
      );
      for (const r of batchResults) {
        processed++;
        if (r.skipReason) continue;
        if (r.error) {
          errors.push(`${r.gmailRef}: ${r.error}`);
          continue;
        }
        // Add to dedup so subsequent batches in same run don't reprocess
        dedupGmailRefs.add(r.gmailRef);
        if (r.invoiceNum) dedupInvoiceNums.add(r.invoiceNum.toUpperCase());
        if (r.confidence === "high") {
          newCostsAdds.push(...r.entries);
          imported += r.entries.length;
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
    }

    // ── 5. Write back to Firestore (single write each)
    if (newCostsAdds.length > 0) {
      const updated = [...existingCosts, ...newCostsAdds];
      const costsJson = JSON.stringify(updated);
      // v2.11: guard the incremental write too — if these new rows would push the blob
      // over the 1 MB ceiling, surface a clear message rather than letting setDoc throw
      // the raw INVALID_ARGUMENT. The dedup-index below is NOT updated in this case, so
      // these attachments can be retried after the cost log is trimmed.
      if (costsJson.length > FIRESTORE_DOC_LIMIT) {
        await store.setJSON("sync-state", {
          ...prevState,
          running: false,
          lastRun: new Date().toISOString(),
          message: `✗ Auto-sync paused: saving ${newCostsAdds.length} new invoice(s) would exceed Firestore's 1 MB limit (${Math.round(costsJson.length / 1024)} KB). Archive or export old invoices, then sync again.`,
          errors: ["fl-costs would exceed the 1 MB Firestore document limit"],
        });
        return json({ error: "cost log would exceed storage limit", paused: true, bytes: costsJson.length }, 200);
      }
      await setDoc(doc(db, "kv", "fl-costs"), {
        v: costsJson,
        ts: new Date().toISOString(),
      });
    }
    if (newReviewAdds.length > 0) {
      const updated = [...existingReview, ...newReviewAdds];
      await setDoc(doc(db, "kv", "fl-review-queue"), {
        v: JSON.stringify(updated),
        ts: new Date().toISOString(),
      });
    }

    // ── 6. Update dedup index in Blobs
    await store.setJSON("dedup-index", {
      gmailRefs: Array.from(dedupGmailRefs),
      invoiceNums: Array.from(dedupInvoiceNums),
    });

    const elapsedSec = Math.round((Date.now() - startedAt) / 1000);
    const remaining = queue.length - processed;
    const message = timedOut
      ? `⚠ Hit time budget (${elapsedSec}s) — processed ${processed}/${queue.length}, ${remaining} remain. Will continue next sync.`
      : `✓ Synced ${processed} attachment(s) in ${elapsedSec}s. Imported: ${imported}. Queued for review: ${queued}.`;

    await store.setJSON("sync-state", {
      lastRun: new Date().toISOString(),
      lastSuccess: errors.length === 0 ? new Date().toISOString() : prevState.lastSuccess,
      running: false,
      imported,
      queued,
      errors: errors.slice(0, 5), // cap to first 5
      message,
      elapsedSec,
      processed,
      total: queue.length,
      timedOut,
    });

    return json({ success: true, imported, queued, processed, total: queue.length, timedOut, message });
  } catch (err: any) {
    const errMsg = err?.message || "Unknown error";
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
  const dateFilter = ` after:${afterDate}`;
  if (VENDOR_QUERIES[key]) return VENDOR_QUERIES[key] + dateFilter;
  return `"${vendorName}" has:attachment` + dateFilter;
}

async function gmailSearch(accessToken: string, query: string) {
  const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`;
  const resp = await fetch(searchUrl, { headers: { Authorization: `Bearer ${accessToken}` } });
  const data = await resp.json();
  if (!resp.ok) throw new Error("Gmail search failed: " + JSON.stringify(data).substring(0, 200));
  const messages = data.messages || [];
  if (messages.length === 0) return [];

  // Fetch full details for each (in parallel)
  return Promise.all(
    messages.slice(0, 50).map(async (msg: any) => {
      const r = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const full = await r.json();
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
        emailId: msg.id,
        emailDate: getHeader("Date"),
        emailSubject: getHeader("Subject"),
        from: getHeader("From"),
        attachments,
      };
    })
  );
}

async function processOne(
  item: { vendor: any; message: any; attachment: any; gmailRef: string },
  accessToken: string,
  anthropicKey: string,
  truckIds: string[],
  vendors: any[],
  dedupInvoiceNums: Set<string>
) {
  const { vendor, message, attachment, gmailRef } = item;
  const result: any = { gmailRef, vendor: vendor.name, filename: attachment.filename };

  try {
    // Fetch attachment bytes
    const attResp = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.emailId}/attachments/${attachment.attachmentId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const attData = await attResp.json();
    if (!attData.data) throw new Error("No attachment data");
    const base64 = attData.data.replace(/-/g, "+").replace(/_/g, "/");
    const pdfBuffer = Buffer.from(base64, "base64");

    // Upload to invoice-file blobs for later retrieval
    const fileStore = getStore("invoice-files");
    const safeName = (attachment.filename || "invoice.pdf").replace(/[^a-zA-Z0-9._-]/g, "_");
    const fileKey = `${Date.now()}-${safeName}`;
    await fileStore.set(fileKey, pdfBuffer, {
      metadata: { contentType: "application/pdf", filename: attachment.filename },
    });
    const fileUrl = `/api/invoice-file?key=${encodeURIComponent(fileKey)}`;
    result.fileUrl = fileUrl;

    // Extract PDF text
    const pdfData = await pdfParse(pdfBuffer);
    const pdfText = (pdfData.text || "").trim();
    if (!pdfText) throw new Error("PDF has no extractable text (image-only PDF — needs OCR)");

    // Call Anthropic with strict prompt
    const parsed = await callAnthropicScan(anthropicKey, pdfText, truckIds, vendor);
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
    result.error = (err?.message || "process failed").substring(0, 300);
    return result;
  }
}

async function callAnthropicScan(apiKey: string, pdfText: string, truckIds: string[], vendor: any) {
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
