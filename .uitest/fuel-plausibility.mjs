/**
 * Reported directly, twice: truck 0424 shows spend it never incurred. The first fix
 * (splitMultiTruck) only reaches a collapsed service log whose OWN line items name
 * two or more trucks — it divides by the amounts the document prints and refuses to
 * invent an allocation it cannot read. Correct, but it leaves a hole.
 *
 * A compact-mode parse — what a big PDF falls back to — returns a total with no line
 * items and usually no gallons figure. So:
 *   - splitMultiTruckEntry sees per.size < 2 and returns the row untouched, whole
 *     delivery still pinned to whichever unit was printed first (0424 is the lowest
 *     unit number in this fleet, so it is first on most of them), and
 *   - the server's only physical-plausibility gate is `gallons > TANK_GALLONS`, which
 *     never fires because Number(undefined) > 250 is false, and nothing at all looks
 *     at the dollar amount.
 *
 * So a $6,801 one-day fuel charge against one truck imports silently and no later pass
 * ever questions it. These are the checks for the amount-based backstop that closes it.
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
  code + "\nexport { implausibleFuelRow, auditFuelRows, reallocateImplausibleFuel, splitMultiTruckEntry, FUEL_ROW_MAX, TANK_GALLONS };"
).toString("base64"));
const { implausibleFuelRow, auditFuelRows, reallocateImplausibleFuel, splitMultiTruckEntry, FUEL_ROW_MAX, TANK_GALLONS } = mod;

let pass = 0, fail = 0;
const t = (n, c, d = "") => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n}${d ? ` — ${d}` : ""}`); } };

const fuel = (o) => ({ category: "Fuel", vendor: "FuelFox Atlanta", date: "2026-03-26", truckId: "0424", ...o });

console.log("\n═ the row that slipped through: a whole delivery, no line items, no gallons ═");
{
  // Exactly the shape a compact-mode parse produces for a collapsed service log.
  const collapsed = fuel({ id: 1, total: 6801.56, invoiceNum: "Davis Delivery - 03/26/2026" });
  t("splitMultiTruckEntry cannot split it — there is nothing to split by",
    splitMultiTruckEntry(collapsed).length === 1);
  t("no gallons recorded, so the gallons gate could never have fired",
    collapsed.gallons === undefined && !(Number(collapsed.gallons) > TANK_GALLONS));
  t("the amount backstop DOES catch it", implausibleFuelRow(collapsed) !== null);
  t("...and says why, in the invoice's own numbers",
    /6801\.56/.test(implausibleFuelRow(collapsed).reason), implausibleFuelRow(collapsed)?.reason);
}

console.log("\n═ ordinary fuel is left alone ═");
{
  t("a normal fill passes", implausibleFuelRow(fuel({ total: 353.09, gallons: 80 })) === null);
  t("a full 250-gal tank passes", implausibleFuelRow(fuel({ total: 1100, gallons: 250 })) === null);
  t("a same-day double fill passes", implausibleFuelRow(fuel({ total: 2200 })) === null);
  t("the ceiling itself passes (boundary is exclusive)",
    implausibleFuelRow(fuel({ total: FUEL_ROW_MAX })) === null, `FUEL_ROW_MAX=${FUEL_ROW_MAX}`);
  t("a dollar over the ceiling is caught", implausibleFuelRow(fuel({ total: FUEL_ROW_MAX + 1 })) !== null);
  t("251 gallons is caught even when the money looks fine",
    implausibleFuelRow(fuel({ total: 900, gallons: 251 })) !== null);
}

console.log("\n═ it only judges fuel, and only on a real truck ═");
{
  t("a big REPAIR invoice is not fuel and is left alone",
    implausibleFuelRow({ category: "Repair", truckId: "0424", total: 18500 }) === null);
  t("a big Parts invoice is left alone",
    implausibleFuelRow({ category: "Parts", truckId: "0424", total: 9400 }) === null);
  t("INVENTORY is already the unallocated bucket — nothing to move",
    implausibleFuelRow(fuel({ truckId: "INVENTORY", total: 99999 })) === null);
  t("UNKNOWN is left alone too", implausibleFuelRow(fuel({ truckId: "UNKNOWN", total: 99999 })) === null);
  t("a row with no truck is left alone", implausibleFuelRow(fuel({ truckId: "", total: 99999 })) === null);
  t("junk in does not throw", implausibleFuelRow(null) === null && implausibleFuelRow(undefined) === null);
}

console.log("\n═ the audit names the documents, worst truck first ═");
{
  const ledger = [
    fuel({ id: 1, total: 6801.56, date: "2026-03-26" }),
    fuel({ id: 2, total: 5210.00, date: "2026-04-02" }),
    fuel({ id: 3, total: 353.09, gallons: 80, date: "2026-04-03" }),   // ordinary
    fuel({ id: 4, truckId: "0608", total: 4100.00, date: "2026-04-04" }),
    { id: 5, category: "Repair", truckId: "0424", total: 18500, date: "2026-04-05" }, // untouched
  ];
  const a = auditFuelRows(ledger);
  t("finds exactly the three oversized fuel rows", a.count === 3, `found ${a.count}`);
  t("values them correctly", Math.abs(a.value - (6801.56 + 5210 + 4100)) < 0.005);
  t("0424 ranks worst", a.trucks[0].truckId === "0424", a.trucks[0]?.truckId);
  t("0424's two rows are grouped", a.trucks[0].count === 2);
  t("biggest row first within a truck", a.trucks[0].rows[0].entry.total === 6801.56);
  t("0608 is listed too", a.trucks[1].truckId === "0608" && a.trucks[1].count === 1);
}

console.log("\n═ reallocating moves the money without losing it ═");
{
  const ledger = [
    fuel({ id: 1, total: 6801.56 }),
    fuel({ id: 2, total: 353.09, gallons: 80 }),
    { id: 3, category: "Repair", truckId: "0424", total: 18500 },
  ];
  const before = ledger.reduce((s, c) => s + c.total, 0);
  const { entries } = reallocateImplausibleFuel(ledger);
  const after = entries.reduce((s, c) => s + c.total, 0);

  t("no row is added or removed", entries.length === ledger.length);
  t("no money leaves the ledger — it only changes bucket", Math.abs(before - after) < 0.005,
    `$${before.toFixed(2)} vs $${after.toFixed(2)}`);

  const moved = entries.find((e) => e.id === 1);
  t("the oversized row is now INVENTORY", moved.truckId === "INVENTORY");
  t("...and is categorised as Inventory so the charts agree", moved.category === "Inventory");
  t("...remembers the truck it came off, so the call is auditable", moved.unallocatedFrom === "0424");
  t("...and explains itself in the notes", /never itemized by truck/i.test(moved.notes), moved.notes);

  t("the ordinary fill stays on 0424", entries.find((e) => e.id === 2).truckId === "0424");
  t("the repair invoice is untouched", entries.find((e) => e.id === 3).truckId === "0424");

  const t0424 = entries.filter((e) => e.truckId === "0424").reduce((s, c) => s + c.total, 0);
  t("0424's total drops by exactly the oversized row", Math.abs(t0424 - (353.09 + 18500)) < 0.005,
    `$${t0424.toFixed(2)}`);

  // Pressing the button twice must not keep churning the ledger.
  const twice = reallocateImplausibleFuel(entries);
  t("running it again finds nothing left to move", twice.audit.count === 0);
  t("...and changes nothing", JSON.stringify(twice.entries) === JSON.stringify(entries));
}

console.log(`\n${fail ? `FAILED: ${fail} check(s)` : `PASSED: ${pass} checks`}\n`);
process.exit(fail ? 1 : 0);
