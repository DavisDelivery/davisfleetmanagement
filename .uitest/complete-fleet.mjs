/**
 * Complete Fleet Services — the Oakwood GA shop doing our truck repairs, invoicing from
 * complete.fleet@outlook.com.
 *
 * The fixture beside this file is the real extracted text of invoice 11016. It is here
 * because three separate things about how this shop writes an invoice were being read
 * wrong, and each one loses money quietly rather than loudly:
 *
 *   1. The money is printed "$5,755.63". `Number("5,755.63")` is NaN, so both entry
 *      builders — `Number(r.total) || 0` on the server, `q.parsed.total || 0` in the
 *      browser — turned a $5,755 repair into a $0 one. It files, it shows, it sums to
 *      nothing.
 *   2. The date is printed "9/4/2026". costShardKey() only reads YYYY-MM, so the entry
 *      lands in the "unknown" cost shard, which no month view ever displays. The
 *      invoice is on disk and invisible.
 *   3. The invoice bills two jobs on one truck, each closing with its own "Subtotal"
 *      ($4,738.52 and $468.80) above a $5,755.63 "Total". A parse that grabs a subtotal
 *      is short by $1,017 and looks perfect: real invoice number, real truck, real
 *      date, plausible amount. No field check can catch it — only the document's own
 *      arithmetic can.
 *
 * Asserts all three against the real document, on both the server and the browser code
 * paths, plus that the invoice stays ONE row on ONE truck through coalesce and split.
 */
import * as esbuild from "esbuild";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");

const INVOICE = readFileSync(path.join(here, "fixtures/complete-fleet-11016.txt"), "utf8");

// ── the browser's copy (App.jsx, module scope) ──────────────────────────────
const { code: appCode } = await esbuild.transform(readFileSync(path.join(REPO, "App.jsx"), "utf8"), {
  loader: "jsx", jsxFactory: "h", jsxFragment: "f",
});
const app = await import("data:text/javascript;base64," + Buffer.from(
  "const React={createElement(){},Fragment:null};const h=()=>{};const f=null;\n" +
  "const useState=()=>[],useEffect=()=>{},useCallback=(x)=>x,useMemo=()=>{},useRef=()=>({current:null});\n" +
  appCode + "\nexport { parseMoney, toYMD, costShardKey, normalizeApprovedRow, normalizeTruckId, coalesceRepairInvoice, splitMultiTruck, entryFingerprint };"
).toString("base64"));

// ── the server's copy (auto-sync.mts) ───────────────────────────────────────
// Its imports pull in the Netlify and Firebase runtimes; strip them and name the pure
// functions under test, which is all this exercises.
const { code: srvCode } = await esbuild.transform(
  readFileSync(path.join(REPO, "netlify/functions/auto-sync.mts"), "utf8"), { loader: "ts" });
const srv = await import("data:text/javascript;base64," + Buffer.from(
  // Line-scoped: [^;] would match newlines and swallow whole declarations.
  srvCode.replace(/^\s*(?:import|export)\s[^;\n]*\bfrom\s[^;\n]+;[ \t]*$/gm, "")
  + "\nexport { parseMoney, toYMD, maxPrintedAmount, evaluateConfidence, coalesceRepairInvoice, splitMultiTruck, normalizeTruckId, entryFingerprint };"
).toString("base64"));

let pass = 0, fail = 0;
const t = (n, c, d = "") => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n}${d ? ` — ${d}` : ""}`); } };

const FLEET = ["0424", "2561", "2883", "6560"];
const VENDORS = [{ name: "Complete Fleet Services", category: "Repair" }];

// ══ 1. the money, as the shop prints it ══════════════════════════════════════
console.log("\n═ \"$5,755.63\" is five thousand dollars, not zero ═");
for (const [label, fn] of [["browser", app.parseMoney], ["server", srv.parseMoney]]) {
  t(`${label}: "$5,755.63" → 5755.63`, fn("$5,755.63") === 5755.63, String(fn("$5,755.63")));
  t(`${label}: "5,755.63" → 5755.63`, fn("5,755.63") === 5755.63, String(fn("5,755.63")));
  t(`${label}: a number is left alone`, fn(5755.63) === 5755.63);
  t(`${label}: "$0.00" is still zero`, fn("$0.00") === 0);
  t(`${label}: a credit keeps its sign`, fn("-$1,234.00") === -1234 && fn("($1,234.00)") === -1234,
    `${fn("-$1,234.00")} / ${fn("($1,234.00)")}`);
  t(`${label}: nothing at all → 0, never NaN`, fn(null) === 0 && fn(undefined) === 0 && fn("") === 0 && fn("n/a") === 0);
  t(`${label}: NaN in never becomes a number out`, fn(NaN) === 0 && fn(Infinity) === 0);
}
t("this is the bug: the old expression made it $0",
  (Number("5,755.63") || 0) === 0 && app.parseMoney("$5,755.63") === 5755.63);

// ══ 2. the date, as the shop prints it ═══════════════════════════════════════
console.log("\n═ \"9/4/2026\" is September 4th, and belongs in the September shard ═");
for (const [label, fn] of [["browser", app.toYMD], ["server", srv.toYMD]]) {
  t(`${label}: "9/4/2026" → 2026-09-04`, fn("9/4/2026") === "2026-09-04", fn("9/4/2026"));
  t(`${label}: "09/04/2026" → 2026-09-04`, fn("09/04/2026") === "2026-09-04");
  t(`${label}: "9-4-2026" → 2026-09-04`, fn("9-4-2026") === "2026-09-04");
  t(`${label}: "9/4/26" → 2026-09-04`, fn("9/4/26") === "2026-09-04");
  t(`${label}: an ISO date passes through untouched`, fn("2026-09-04") === "2026-09-04");
  t(`${label}: an ISO timestamp keeps only the day`, fn("2026-09-04T13:22:01Z") === "2026-09-04");
  t(`${label}: "Sep 4, 2026" → 2026-09-04`, fn("Sep 4, 2026") === "2026-09-04", fn("Sep 4, 2026"));
  // "" not a guess: the caller keeps what the parser said, and the date gate sees it.
  t(`${label}: unreadable → "", so nothing is invented`, fn("sometime in the fall") === "" && fn("") === "" && fn(null) === "");
}
t("the shard: 9/4/2026 used to file under \"unknown\"", app.costShardKey({ date: "9/4/2026" }) === "unknown");
t("normalized, it files under 2026-09", app.costShardKey({ date: app.toYMD("9/4/2026") }) === "2026-09");

// ══ 3. the document's own arithmetic ═════════════════════════════════════════
console.log("\n═ the invoice prints $5,755.63 — a parse under that has missed something ═");
{
  const printed = srv.maxPrintedAmount(INVOICE);
  t("the largest printed amount is the Total", printed === 5755.63, String(printed));
  t("175,464 Miles is not money", printed !== 175464 && srv.maxPrintedAmount("175,464 Miles") === 0);
  t("a bare number with no $ is not money", srv.maxPrintedAmount("Invoice: 11016") === 0);
  t("both subtotals are visible to it but neither wins",
    INVOICE.includes("$4,738.52") && INVOICE.includes("$468.80") && printed === 5755.63);

  const row = (total) => [{
    truckId: "6560", vendor: "Complete Fleet Services", category: "Repair",
    total, invoiceNum: "CFS-11016", date: "2026-09-04", lineItems: [],
  }];
  const good = srv.evaluateConfidence(row(5755.63), VENDORS[0], FLEET, VENDORS, INVOICE);
  t("the right total imports without a detour", good.level === "high", `${good.level}: ${good.reason}`);

  const grabbed = srv.evaluateConfidence(row(4738.52), VENDORS[0], FLEET, VENDORS, INVOICE);
  t("the first subtotal is held for a human", grabbed.level === "low", `${grabbed.level}: ${grabbed.reason}`);
  t("and the reason names both figures a person would compare",
    grabbed.reason.includes("4738.52") && grabbed.reason.includes("5755.63"), grabbed.reason);

  const preCharge = srv.evaluateConfidence(row(5507.32), VENDORS[0], FLEET, VENDORS, INVOICE);
  t("\"Pre-Charge Subtotal\" is caught too — it is the total before tax",
    preCharge.level === "low", `${preCharge.level}: ${preCharge.reason}`);

  // A cent of rounding is not a subtotal grab, and must not queue a correct invoice.
  t("a penny of rounding does not queue a correct invoice",
    srv.evaluateConfidence(row(5755.62), VENDORS[0], FLEET, VENDORS, INVOICE).level === "high");

  // A fuel service log is many rows against one document total; the gate must not see it.
  const log = [1, 2, 3].map((i) => ({
    truckId: FLEET[i], vendor: "Complete Fleet Services", category: "Fuel",
    total: 100, invoiceNum: "X1", date: "2026-09-04", gallons: 40, lineItems: [],
  }));
  t("a multi-row service log is not judged against one big figure",
    srv.evaluateConfidence(log, VENDORS[0], FLEET, VENDORS, INVOICE).level === "high");
  t("with no document text there is nothing to compare, and nothing is blocked",
    srv.evaluateConfidence(row(4738.52), VENDORS[0], FLEET, VENDORS, "").level === "high");
}

// ══ 4. the whole invoice, one truck, once ════════════════════════════════════
console.log("\n═ invoice 11016 end to end: $5,755.63 on truck 6560, in September ═");
{
  // What the parser returns for this document, written the way the document prints it.
  const raw = {
    id: "e1", truckId: "6560", vendor: "Complete Fleet Services", category: "Repair",
    total: "$5,755.63", date: "9/4/2026", invoiceNum: "CFS-11016",
    lineItems: [
      { desc: "Chassis / Chassis / Checked and will need clutch", amount: 1680 },
      { desc: "CLUTCH-ULTRA SHIFT - CLU-001", amount: 2344.40 },
      { desc: "50W SYNTH - PTSN-50W", amount: 188.80 },
    ],
    notes: "Clutch replacement and PTO removal",
  };
  const fleetIds = new Set(FLEET);
  const out = app.splitMultiTruck(app.coalesceRepairInvoice([app.normalizeApprovedRow(raw, fleetIds)]));
  t("one row, not one per job", out.length === 1, `${out.length} rows`);
  t("the money is the Total", out[0].total === 5755.63, String(out[0].total));
  t("the date is September 4th", out[0].date === "2026-09-04", out[0].date);
  t("it files in the September shard", app.costShardKey(out[0]) === "2026-09", app.costShardKey(out[0]));
  t("it is booked to truck 6560", out[0].truckId === "6560", out[0].truckId);
  t("no part of it went to INVENTORY", !out.some((e) => e.truckId === "INVENTORY"));
  t("the whole invoice is on the truck", out.reduce((s, e) => s + e.total, 0) === 5755.63);

  // The yard prefix this shop also uses — "BX0424" is truck 0424, not a new truck.
  t("a yard-prefixed unit still resolves to the fleet number",
    app.normalizeApprovedRow({ ...raw, truckId: "BX0424" }, fleetIds).truckId === "0424");
  t("the server agrees on the prefix", srv.normalizeTruckId("BX0424", fleetIds) === "0424");
}

// ══ 5. both entry builders actually call them ════════════════════════════════
console.log("\n═ the two entry builders read the invoice the same way ═");
{
  // A source check, deliberately: these are two lines inside a React component and a
  // request handler, and what has to hold is that neither goes back to taking the
  // parser's string at face value.
  const appSrc = readFileSync(path.join(REPO, "App.jsx"), "utf8");
  const srvSrc = readFileSync(path.join(REPO, "netlify/functions/auto-sync.mts"), "utf8");
  t("browser: the scanned-invoice total is parsed, not coerced",
    /const entryTotal=parseMoney\(q\.parsed\.total\)/.test(appSrc));
  t("browser: the scanned-invoice date is normalized",
    /const entryDate=toYMD\(q\.parsed\.date\)/.test(appSrc));
  // The duplicate check compares a candidate against what is already in the ledger. It
  // used to do `c.total||0`, so a parser returning "$5,755.63" fingerprinted as NaN on
  // one side and a number on the other — the two never matched and the same invoice
  // re-imported on every scan.
  t("browser: the duplicate fingerprint reads the money the same way",
    /Math\.round\(parseMoney\(c\.total\)\*100\)/.test(appSrc));
  t("browser: the per-gallon fallback divides parsed money, not a string",
    /entryTotal\/Number\(q\.parsed\.gallons\)/.test(appSrc));
  t("server: the imported total is parsed, not coerced",
    /total: parseMoney\(r\.total\)/.test(srvSrc) && !srvSrc.includes("total: Number(r.total) || 0"));
  t("server: the imported date is normalized", /date: toYMD\(r\.date\)/.test(srvSrc));
  // Both approve paths out of the review queue go through the one shaping function, so
  // a row that reached the queue with the raw strings is fixed on the way out.
  t("both review-queue approve paths share one normalizer",
    (appSrc.match(/=>normalizeApprovedRow\(e,fleetIds\)/g) || []).length === 2,
    String((appSrc.match(/=>normalizeApprovedRow\(e,fleetIds\)/g) || []).length));
}

// ══ 6. the mailbox search that finds these invoices at all ═══════════════════
console.log("\n═ imported twice is the other way money goes wrong ═");
{
  // The content fingerprint is what makes an invoice imported by the browser and the
  // same invoice imported by the server the same invoice. It has to survive the shop's
  // own formatting on either side, or the document lands in the ledger twice.
  const printed = { vendor: "Complete Fleet Services", date: "9/4/2026", truckId: "6560", total: "$5,755.63" };
  const stored  = { vendor: "Complete Fleet Services", date: "2026-09-04", truckId: "6560", total: 5755.63 };
  t("browser: as printed and as stored are one invoice",
    app.entryFingerprint(printed) === app.entryFingerprint(stored),
    `${app.entryFingerprint(printed)} vs ${app.entryFingerprint(stored)}`);
  t("server: the same, and the same key as the browser",
    srv.entryFingerprint(printed) === srv.entryFingerprint(stored)
    && srv.entryFingerprint(stored) === app.entryFingerprint(stored),
    `${srv.entryFingerprint(printed)} vs ${app.entryFingerprint(stored)}`);
  t("the key still carries the real amount, not zero",
    app.entryFingerprint(stored).endsWith("|5755.63"), app.entryFingerprint(stored));
  t("a different amount is still a different invoice",
    app.entryFingerprint(stored) !== app.entryFingerprint({ ...stored, total: 4738.52 }));
}

console.log("\n═ the shop's mail is found by its sender, on both search paths ═");
{
  const searchSrc = readFileSync(path.join(REPO, "netlify/functions/gmail-search.mts"), "utf8");
  const libSrc = readFileSync(path.join(REPO, "netlify/lib/vendor-queries.mts"), "utf8");
  t("the search endpoint builds its query from the shared module",
    /import \{ buildVendorQuery \} from "\.\.\/lib\/vendor-queries\.mjs"/.test(searchSrc)
    && /buildVendorQuery\(vendor, afterDate, beforeDate\)/.test(searchSrc));
  t("it no longer carries per-vendor branches of its own",
    !/vendor === "peach state"/.test(searchSrc) && !searchSrc.includes("from:ebilling@4flyers.com"));
  t("nothing falls through to a loose text match on the shop's name",
    !/`"\$\{vendor\}" has:attachment/.test(searchSrc));
  t("the sender is the one on the invoice",
    INVOICE.includes("complete.fleet@outlook.com") && libSrc.includes("from:complete.fleet@outlook.com has:attachment"));
}

console.log(`\n${fail ? "FAILED" : "PASSED"}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
