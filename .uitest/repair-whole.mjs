/**
 * Runs the REAL coalesceRepairInvoice() out of App.jsx.
 *
 * "Those invoices are repairs so put the whole thing to the truck." A Complete Fleet
 * Services invoice bills labour, parts, shop supplies and tax for ONE job on ONE unit —
 * none of it is shelf stock. The prompts say so three times, but a prompt is a request.
 * This is the guarantee: if the model still parks the tax or the parts on INVENTORY, the
 * strays get folded back onto the truck instead of sitting where nobody looks at them.
 *
 * Narrow on purpose. A repair that genuinely names two trucks is left alone for a human —
 * silently merging that would be the same class of error as splitting this one.
 */
import * as esbuild from "esbuild";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");

const { code } = await esbuild.transform(readFileSync(path.join(REPO, "App.jsx"), "utf8"), {
  loader: "jsx", jsxFactory: "h", jsxFragment: "f",
});
const mod = await import("data:text/javascript;base64," + Buffer.from(
  "const React={createElement(){},Fragment:null};const h=()=>{};const f=null;\n" +
  "const useState=()=>[],useEffect=()=>{},useCallback=(x)=>x,useMemo=()=>{},useRef=()=>({current:null});\n" +
  code + "\nexport { coalesceRepairInvoice };"
).toString("base64"));
const { coalesceRepairInvoice } = mod;

let pass = 0, fail = 0;
const t = (n, c, d = "") => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n}${d ? ` — ${d}` : ""}`); } };
const R = (o) => ({ category: "Repair", vendor: "Complete Fleet Services", invoiceNum: "CFS-10785", ...o });
const sum = (a) => Math.round(a.reduce((s, e) => s + (e.total || 0), 0) * 100) / 100;

console.log("\n═ invoice 10785: the whole $5,415.48 belongs to #0424 ═");
{
  // what a model might return if it obeys the tax/parts structure instead of the rule
  const out = coalesceRepairInvoice([
    R({ truckId: "0424", total: 5236.68, lineItems: [{ desc: "Labor", amount: 2682.5 }] }),
    R({ truckId: "INVENTORY", total: 178.80, lineItems: [{ desc: "GA + Hall County tax", amount: 178.8 }] }),
  ]);
  t("one row survives", out.length === 1, `${out.length} rows`);
  t("it is truck 0424", out[0] && out[0].truckId === "0424", out[0] && out[0].truckId);
  t("carrying the full 5415.48", out[0] && out[0].total === 5415.48, out[0] && String(out[0].total));
  t("nothing is left on INVENTORY", !out.some(e => e.truckId === "INVENTORY"));
  t("line items from both rows are kept", out[0] && out[0].lineItems.length === 2);
  t("the note says what happened", /Whole repair invoice booked to #0424/.test(out[0].notes || ""), out[0].notes);
}

console.log("\n═ three-way split folds back too ═");
{
  const out = coalesceRepairInvoice([
    R({ invoiceNum: "CFS-10819", truckId: "2883", total: 2135 }),
    R({ invoiceNum: "CFS-10819", truckId: "INVENTORY", total: 4923.34 }),
    R({ invoiceNum: "CFS-10819", truckId: "UNKNOWN", total: 665.63 }),
  ]);
  t("collapses to one row", out.length === 1);
  t("full 7723.97 on #2883", out[0].total === 7723.97 && out[0].truckId === "2883", `${out[0].truckId} ${out[0].total}`);
}

console.log("\n═ leaves alone what it must ═");
{
  const clean = [R({ truckId: "0424", total: 5415.48 })];
  t("a correct single row is untouched", coalesceRepairInvoice(clean)[0] === clean[0]);

  const two = [R({ truckId: "0424", total: 100 }), R({ truckId: "0451", total: 200 })];
  t("a repair naming TWO real trucks is left for a human", coalesceRepairInvoice(two).length === 2);

  const noTruck = [R({ truckId: "INVENTORY", total: 100 }), R({ truckId: "UNKNOWN", total: 50 })];
  t("no real truck at all → left alone", coalesceRepairInvoice(noTruck).length === 2);

  const fuel = [
    { category: "Fuel", invoiceNum: "FF-1", truckId: "0424", total: 100 },
    { category: "Fuel", invoiceNum: "FF-1", truckId: "INVENTORY", total: 50 },
  ];
  t("FUEL invoices are not touched — that is splitMultiTruck's job", coalesceRepairInvoice(fuel).length === 2);

  const diffInv = [R({ invoiceNum: "CFS-1", truckId: "0424", total: 10 }), R({ invoiceNum: "CFS-2", truckId: "INVENTORY", total: 20 })];
  t("different invoice numbers never merge", coalesceRepairInvoice(diffInv).length === 2);

  const noNum = [R({ invoiceNum: null, truckId: "0424", total: 10 }), R({ invoiceNum: null, truckId: "INVENTORY", total: 20 })];
  t("rows with no invoice number are not merged on a guess", coalesceRepairInvoice(noNum).length === 2);
}

console.log("\n═ does not disturb the rest of the ledger ═");
{
  const mixed = [
    { category: "Fuel", invoiceNum: "FF-9", truckId: "0805", total: 300 },
    R({ truckId: "0424", total: 5236.68 }),
    R({ truckId: "INVENTORY", total: 178.80 }),
    { category: "Parts", invoiceNum: "PSF-3", truckId: "1506", total: 90 },
  ];
  const out = coalesceRepairInvoice(mixed);
  t("only the repair pair collapses", out.length === 3, `${out.length} rows`);
  t("total money is conserved", sum(out) === sum(mixed), `${sum(out)} vs ${sum(mixed)}`);
  t("the fuel row is byte-identical", out.includes(mixed[0]));
  t("the parts row is byte-identical", out.includes(mixed[3]));
}

console.log("\n═ junk in ═");
{
  t("null does not throw", coalesceRepairInvoice(null).length === 0);
  t("empty array", coalesceRepairInvoice([]).length === 0);
}

console.log(`\n${fail ? "FAILED" : "PASSED"}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
