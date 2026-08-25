/**
 * Cost-entry ids have to be unique, because the ledger dedups ON them: the browser
 * collapses rows by id every time it loads the month shards. A collision there does
 * not merge two views of one invoice — it DELETES a real one, and the next save
 * writes the shortfall back to disk.
 *
 * The old generator was `Date.now() + Math.random()`, which looks unique and is not.
 * At a 2026-era epoch (~1.79e12) an IEEE double has only ~4096 distinct fractional
 * slots left below the integer part, so Math.random() is quantised to ~1/4096 and a
 * batch built in one millisecond collides by the birthday bound. Batch import and
 * batch approve both build hundreds of rows in one synchronous pass.
 *
 * Asserts the arithmetic that makes the old scheme unsafe (so this can never be
 * "simplified" back), that the new generator survives the same batch sizes, and that
 * the ledger no longer loses money end to end.
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
  code + "\nexport { newId, dedupById, healCollidedIds, costAdditionsToKeep, splitMultiTruck };"
).toString("base64"));
const { newId, dedupById, healCollidedIds, costAdditionsToKeep, splitMultiTruck } = mod;

let pass = 0, fail = 0;
const t = (n, c, d = "") => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n}${d ? ` — ${d}` : ""}`); } };

console.log("\n═ why the old scheme was unsafe (the arithmetic, not the vibe) ═");
{
  const now = Date.now();
  let ulp = Number.EPSILON;
  while (now + ulp === now) ulp *= 2;
  const slots = Math.round(1 / ulp);
  t("a double has < 100k fractional slots left at today's epoch", slots < 100000, `${slots} slots`);

  // The old generator, reproduced exactly, over a realistic batch.
  const oldIds = Array.from({ length: 200 }, () => now + Math.random());
  t("old generator collides on a 200-row batch in one ms",
    new Set(oldIds).size < oldIds.length,
    `${oldIds.length - new Set(oldIds).size} duplicate(s)`);
}

console.log("\n═ the new generator ═");
{
  for (const N of [200, 5000]) {
    const ids = Array.from({ length: N }, () => newId());
    t(`${N} ids in one synchronous pass are all distinct`, new Set(ids).size === N,
      `${N - new Set(ids).size} duplicate(s)`);
  }
  t("ids are strings (nothing does arithmetic on them)", typeof newId() === "string");
  t("two ids in the same ms differ", newId() !== newId());
}

console.log("\n═ splitting a batch of service logs keeps every row ═");
{
  const makeLog = (n) => ({
    id: "srv-" + n, date: "2026-05-21", truckId: "0424", vendor: "FuelFox Atlanta",
    category: "Fuel", total: 600, gallons: 130, invoiceNum: "FF-" + n,
    lineItems: [
      { desc: "Diesel - Truck 0424", amount: 200 },
      { desc: "Diesel - Truck 0608", amount: 200 },
      { desc: "Diesel - Truck 2561", amount: 200 },
    ],
  });
  for (const BATCH of [60, 150]) {
    const rows = splitMultiTruck(Array.from({ length: BATCH }, (_, i) => makeLog(i)));
    const ids = rows.map((r) => String(r.id));
    t(`${BATCH} logs → ${rows.length} split rows, all ids distinct`,
      new Set(ids).size === ids.length, `${ids.length - new Set(ids).size} duplicate(s)`);

    // what loadCostsFromShards does on the next page load
    const survived = dedupById(rows);
    const moneyIn = rows.reduce((s, r) => s + (Number(r.total) || 0), 0);
    const moneyOut = survived.reduce((s, r) => s + (Number(r.total) || 0), 0);
    t(`${BATCH} logs: no row is dropped on reload`, survived.length === rows.length,
      `lost ${rows.length - survived.length}`);
    t(`${BATCH} logs: no money is lost on reload`, Math.abs(moneyIn - moneyOut) < 0.005,
      `$${(moneyIn - moneyOut).toFixed(2)} lost`);
  }
}

console.log("\n═ dedupById heals data already written with colliding ids ═");
{
  // A torn shard rewrite: the SAME row visible in two shards at once. Byte-identical.
  const row = { id: 1787610139413.5, truckId: "0424", total: 353.09, date: "2026-05-21" };
  const torn = dedupById([row, { ...row }]);
  t("a torn-shard copy of one row still collapses to one", torn.length === 1);

  // Two genuinely different invoices that collided under the old generator.
  const a = { id: 1787610139413.5, truckId: "0424", total: 353.09, date: "2026-05-21" };
  const b = { id: 1787610139413.5, truckId: "0608", total: 97.20, date: "2026-05-21" };
  const healed = dedupById([a, b]);
  t("two different rows sharing an id are both kept", healed.length === 2,
    `kept ${healed.length}`);
  t("...with the money intact",
    Math.abs(healed.reduce((s, r) => s + r.total, 0) - (353.09 + 97.20)) < 0.005);
  t("...and the surviving rows keep their own truck and amount",
    healed.some((r) => r.truckId === "0424" && r.total === 353.09) &&
    healed.some((r) => r.truckId === "0608" && r.total === 97.20));
  // v2.24.7 — the read path must NOT re-key. Re-keying on read made the ids in
  // memory diverge from the ids on disk, and saveCosts then re-added the disk copy
  // of every re-keyed row as though the server had just imported it.
  t("...and their ids are left exactly as they are on disk",
    healed.every((r, i) => String(r.id) === String([a, b][i].id)),
    healed.map((r) => String(r.id)).join(" "));

  t("rows with no id are never merged away",
    dedupById([{ total: 1 }, { total: 2 }]).length === 2);
  t("empty input does not throw", dedupById([]).length === 0);
}

console.log("\n\u2550 reading a collided ledger must not inflate it on the next save \u2550");
{
  // Exactly what is on disk after the old generator collided two real invoices.
  const onDisk = [
    { id: 1787610139413.5, truckId: "0424", total: 353.09, date: "2026-05-21" },
    { id: 1787610139413.5, truckId: "0608", total: 97.20, date: "2026-05-21" },
  ];
  const inMemory = dedupById(onDisk);                       // what loadCostsFromShards holds
  const additions = costAdditionsToKeep(onDisk, inMemory, inMemory);  // what saveCosts re-adds
  const merged = [...inMemory, ...additions];
  t("nothing on disk looks like a row that arrived while the tab was open",
    additions.length === 0, `${additions.length} re-added`);
  t("a save does not grow the ledger", merged.length === onDisk.length,
    `${onDisk.length} -> ${merged.length}`);
  t("a save does not invent money",
    Math.abs(merged.reduce((s, r) => s + r.total, 0) - 450.29) < 0.005,
    `$${merged.reduce((s, r) => s + r.total, 0).toFixed(2)}`);
}

console.log("\n\u2550 healCollidedIds re-keys, for callers that save what they return \u2550");
{
  const rows = [
    { id: 7, truckId: "0424", total: 100 },
    { id: 7, truckId: "0608", total: 200 },
    { id: 7, truckId: "0805", total: 300 },
    { id: 9, truckId: "1506", total: 400 },
  ];
  const { entries, healed } = healCollidedIds(rows);
  t("every row survives", entries.length === 4);
  t("two of the three id-7 rows are re-keyed", healed === 2, `healed=${healed}`);
  t("every id is now distinct", new Set(entries.map((r) => String(r.id))).size === 4);
  t("the first row of a colliding group keeps its id", String(entries[0].id) === "7");
  t("money is untouched", entries.reduce((s, r) => s + r.total, 0) === 1000);
  t("content is otherwise untouched",
    entries.map((r) => r.truckId).join(",") === "0424,0608,0805,1506");
  t("running it again is a no-op", healCollidedIds(entries).healed === 0);
  t("rows with no id are left alone", healCollidedIds([{ total: 1 }, { total: 2 }]).healed === 0);
}

console.log(`\n${fail ? `FAILED: ${fail} check(s)` : `PASSED: ${pass} checks`}\n`);
process.exit(fail ? 1 : 0);
