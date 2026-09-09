/**
 * The Gmail query for each vendor — the single place either search path gets it from.
 *
 * There are two ways this app looks in the mailbox: the unattended crawler
 * (/api/auto-sync) and the "📧 <vendor>" buttons on the Costs tab (/api/gmail-search).
 * Each carried its own copy of the queries, and only the crawler's copy was kept up to
 * date. So Complete Fleet Services — added as a built-in vendor in v2.22.0 — was crawled
 * correctly on the schedule but, pressed by hand, fell through to the generic
 * `"complete fleet services" has:attachment`. That is exactly the loose text match the
 * other vendors' comments record as a mistake: it finds any message that happens to say
 * the vendor's name, and misses every real invoice whose only mention of the shop is
 * inside the PDF. A vendor added here is now found by both paths or neither.
 *
 * Keys are the vendor's full name, lowercased — the same string the app POSTs, since it
 * sends `v.name.toLowerCase()`. The sync harness counts these keys as "one query per
 * vendor", so this map stays one entry per built-in vendor; the shorthand older callers
 * still send lives in VENDOR_ALIASES.
 */
export const VENDOR_QUERIES: Record<string, string> = {
  // v2.9.5: tightened — loose text matches ("peach state", "peachstate") and unfiltered
  // Ryan forwards caught unrelated email (Uline billing, NuVizz reports). Real invoices
  // come from peachstatetrucks.com, or forwarded by Ryan with Peach State's own
  // account-reference phrase for Davis Delivery in the subject.
  "peach state freightliner": `((from:peachstatetrucks.com) OR ((from:ryan@davisdelivery.com OR from:ryan@davisdeliveryservice.com) AND subject:"Parts 20407")) has:attachment`,
  // FuelFox bills through QuickBooks, not from fuelfox.com. The subject always carries
  // "FuelFox Atlanta" on an invoice email.
  "fuelfox atlanta": `(from:quickbooks@notification.intuit.com subject:"FuelFox Atlanta") has:attachment`,
  // Quick Fuel invoices come only from ebilling@4flyers.com. No text match — those pull
  // in unrelated mail that happens to mention "CFS-" or "flyers" somewhere in the body.
  "quick fuel": `from:ebilling@4flyers.com has:attachment`,
  // The Oakwood GA repair shop. Every invoice is sent by the owner from this address;
  // the shop's name appears nowhere in the subject, so the sender is the only handle.
  "complete fleet services": `from:complete.fleet@outlook.com has:attachment`,
};

// Shorthand that reaches the search endpoint from older callers and hand-typed values.
// Maps onto a key of VENDOR_QUERIES; anything unlisted falls back to the generic query.
export const VENDOR_ALIASES: Record<string, string> = {
  "peach state": "peach state freightliner",
  "peachstate": "peach state freightliner",
  "fuelfox": "fuelfox atlanta",
  "quickfuel": "quick fuel",
  "complete fleet": "complete fleet services",
  "completefleet": "complete fleet services",
  "complete fleet services l.l.c.": "complete fleet services",
  "complete fleet services llc": "complete fleet services",
};

/** The vendor's own query, or null when there isn't one. */
export function vendorQuery(vendorName: string): string | null {
  const key = String(vendorName == null ? "" : vendorName).toLowerCase().trim();
  if (VENDOR_QUERIES[key]) return VENDOR_QUERIES[key];
  const alias = VENDOR_ALIASES[key];
  return alias && VENDOR_QUERIES[alias] ? VENDOR_QUERIES[alias] : null;
}

/**
 * A complete Gmail `q` for one vendor over an optional date range. Dates are Gmail's
 * own YYYY/MM/DD. A vendor with no query of its own still gets the generic name search
 * rather than nothing — a hand-added vendor has to find something.
 */
export function buildVendorQuery(vendorName: string, afterDate?: string, beforeDate?: string): string {
  const dateFilter = (afterDate ? ` after:${afterDate}` : "") + (beforeDate ? ` before:${beforeDate}` : "");
  return (vendorQuery(vendorName) || `"${vendorName}" has:attachment`) + dateFilter;
}
