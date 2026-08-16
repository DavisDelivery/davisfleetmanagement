/**
 * Runs the REAL repairCostLedger() out of App.jsx over a real export of the
 * production cost ledger and checks the numbers it produces — the point of the fix
 * is a specific dollar figure on a specific truck, so that is what gets asserted.
 *
 * Pass a ledger export as argv[2]: a JSON array of cost entries. Without one it
 * runs the built-in fixtures only.
 */
import * as esbuild from "esbuild";
import { readFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");

// App.jsx is a classic script: everything is a top-level declaration and nothing runs
// until App() is called. Transform it, then read the helpers out of the module scope.
const { code } = await esbuild.transform(readFileSync(path.join(REPO, "App.jsx"), "utf8"), {
  loader: "jsx", jsxFactory: "h", jsxFragment: "f",
});
const mod = await import("data:text/javascript;base64," + Buffer.from(
  "const React={createElement(){},Fragment:null};const h=()=>{};const f=null;\n" +
  "const useState=()=>[],useEffect=()=>{},useCallback=(x)=>x,useMemo=()=>{},useRef=()=>({current:null});\n" +
  code + "\nexport { repairCostLedger, entryFingerprint, splitMultiTruckEntry };"
).toString("base64"));
const { repairCostLedger, entryFingerprint, splitMultiTruckEntry } = mod;

let pass = 0, fail = 0;
const t = (n, c, d = "") => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n}${d ? ` — ${d}` : ""}`); } };

console.log("\n═ splitting a collapsed service log ═");
{
  const log = {
    id: 1, date: "2026-03-26", truckId: "0424", vendor: "FuelFox Atlanta", category: "Fuel",
    total: 6801.56, gallons: 1515.5, pricePerGallon: 4.488, invoiceNum: "Davis Delivery - 03/26/2026",
    lineItems: [
      { desc: "Diesel - Truck 0424", amount: 368.46 },
      { desc: "Truck 0451 - Diesel", amount: 73.15 },   // the parser words it three ways
      { desc: "Truck 0805 Diesel", amount: 178.62 },
      { desc: "Unit 1368 diesel", amount: 313.26 },
    ],
    notes: "FuelFox Atlanta service log",
  };
  // Lines summing to the stated total — what every real service log looks like.
  const exact = { ...log, total: 933.49, gallons: 208 };
  const out = splitMultiTruckEntry(exact);
  t("one row per truck", out.length === 4, `n=${out.length}`);
  t("0424 keeps only its own line", Math.abs(out[0].total - 368.46) < 0.01, `$${out[0].total}`);
  t("all three description styles parsed", out.map((e) => e.truckId).join(",") === "0424,0451,0805,1368", out.map((e) => e.truckId).join(","));
  t("the document total is preserved", Math.abs(out.reduce((s, e) => s + e.total, 0) - 933.49) < 0.02,
    `sum=${out.reduce((s, e) => s + e.total, 0).toFixed(2)}`);
  t("gallons split too", Math.abs(out.reduce((s, e) => s + e.gallons, 0) - 208) < 0.5);
  t("invoice numbers stay distinct", new Set(out.map((e) => e.invoiceNum)).size === 4);
  t("each row is traceable to the document", out.every((e) => /Split from a 4-truck service log/.test(e.notes)));

  // Lines covering only part of the document (tax, delivery, or trucks the parser
  // dropped). The gap must NOT be spread over the trucks that are named — that would
  // put invented fuel on a real truck.
  const short = splitMultiTruckEntry(log);
  t("a shortfall does not inflate the named trucks", Math.abs(short[0].total - 368.46) < 0.01, `$${short[0].total}`);
  t("the unaccounted remainder is parked on INVENTORY",
    short.length === 5 && short[4].truckId === "INVENTORY" && Math.abs(short[4].total - (6801.56 - 933.49)) < 0.02,
    JSON.stringify(short.map((e) => `${e.truckId}:${e.total}`)));
  t("and the document still reconciles", Math.abs(short.reduce((s, e) => s + e.total, 0) - 6801.56) < 0.02);

  const single = { id: 2, date: "2026-03-26", truckId: "0451", vendor: "Peach State Freightliner", total: 412.5, lineItems: [{ desc: "Air filter for truck 0451", amount: 412.5 }] };
  t("an ordinary one-truck invoice is left alone", splitMultiTruckEntry(single).length === 1);
  const noLines = { id: 3, date: "2026-03-26", truckId: "0451", vendor: "X", total: 100, lineItems: [] };
  t("a row with no line items is left alone", splitMultiTruckEntry(noLines).length === 1);
}

console.log("\n═ fingerprinting ═");
{
  const a = { vendor: "FuelFox Atlanta", date: "2026-07-14", truckId: "0424", total: 6086.73, invoiceNum: "Service Log 07/14/2026" };
  const b = { ...a, invoiceNum: "Davis Delivery - 07/14/2026", id: 99, gmailRef: "gmail:other:x" };
  t("the same document under a different invented invoice number matches", entryFingerprint(a) === entryFingerprint(b));
  t("a different truck does not", entryFingerprint(a) !== entryFingerprint({ ...a, truckId: "0451" }));
  t("a different day does not", entryFingerprint(a) !== entryFingerprint({ ...a, date: "2026-07-21" }));
  t("a different amount does not", entryFingerprint(a) !== entryFingerprint({ ...a, total: 6086.74 }));
  t("vendor case and spacing don't matter", entryFingerprint(a) === entryFingerprint({ ...a, vendor: " fuelfox atlanta " }));
}

const file = process.argv[2];
if (file && existsSync(file)) {
  console.log(`\n═ the real ledger (${path.basename(file)}) ═`);
  const entries = JSON.parse(readFileSync(file, "utf8"));
  const spend = (arr, truck) => arr.filter((c) => c.truckId === truck).reduce((s, c) => s + (c.total || 0), 0);
  const before0424 = spend(entries, "0424");
  const r = repairCostLedger(entries);
  const after0424 = spend(r.entries, "0424");
  console.log(`  ${entries.length} rows -> ${r.entries.length}   |  $${Math.round(r.before).toLocaleString()} -> $${Math.round(r.after).toLocaleString()}`);
  console.log(`  removed ${r.duplicatesRemoved} duplicates ($${Math.round(r.duplicateValue).toLocaleString()}), split ${r.splitDocs} service logs into ${r.splitRows} rows`);
  t("it found the duplicate imports", r.duplicatesRemoved > 1000, `${r.duplicatesRemoved}`);
  t("it found the collapsed service logs", r.splitDocs >= 40, `${r.splitDocs}`);
  t(`#0424 drops out of outlier territory ($${Math.round(before0424).toLocaleString()} -> $${Math.round(after0424).toLocaleString()})`,
    after0424 < 60000, `$${Math.round(after0424).toLocaleString()}`);

  const byTruck = {};
  for (const c of r.entries) byTruck[c.truckId] = (byTruck[c.truckId] || 0) + (c.total || 0);
  const trucksOnly = Object.entries(byTruck).filter(([k]) => k !== "INVENTORY" && k !== "UNKNOWN").sort((a, b) => b[1] - a[1]);
  console.log("  corrected top 5: " + trucksOnly.slice(0, 5).map(([k, v]) => `#${k} $${Math.round(v).toLocaleString()}`).join("  "));
  t("no truck is an order of magnitude above the next", trucksOnly[0][1] < trucksOnly[1][1] * 3,
    `${trucksOnly[0][0]}=$${Math.round(trucksOnly[0][1])} vs ${trucksOnly[1][0]}=$${Math.round(trucksOnly[1][1])}`);
  t("running the repair twice changes nothing more", (() => {
    const again = repairCostLedger(r.entries);
    return again.duplicatesRemoved === 0 && again.splitDocs === 0;
  })(), "the repair must be idempotent — the button is re-runnable");
  t("no entry lost its truck, vendor or date", r.entries.every((c) => c.truckId && c.vendor && c.date));
} else {
  console.log("\n(no ledger export passed — skipping the real-data checks)");
}

console.log(`\n${pass + fail} checks: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
