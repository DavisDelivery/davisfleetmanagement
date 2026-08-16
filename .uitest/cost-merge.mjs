/**
 * Runs the REAL costAdditionsToKeep() out of App.jsx — the rule that decides what a
 * browser write to a month shard must preserve.
 *
 * The bug it exists for: the server appends imported invoices to fl-costs-<month>
 * while a tab is open, nothing listens on fl-costs, and saveCosts used to overwrite
 * the shard from a page-load snapshot. Approving one review item deleted every
 * invoice imported since load. Rows outside the 30-day re-crawl (the 365-day backlog
 * sweep) and hand-keyed rows never came back.
 *
 * The rule has to separate two things that look identical from memory alone:
 * a server insert and a user deletion.
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
  code + "\nexport { costAdditionsToKeep, dedupById };"
).toString("base64"));
const { costAdditionsToKeep } = mod;

let pass = 0, fail = 0;
const t = (n, c, d = "") => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n}${d ? ` — ${d}` : ""}`); } };
const ids = a => a.map(e => e.id).sort();

const row = (id, extra = {}) => ({ id, truckId: "0424", date: "2026-08-02", total: 100, ...extra });

console.log("\n═ the reported bug: approve a review item on a tab that has been open ═");
{
  // Tab loaded with one row. Server imported two more since. User approves an item,
  // so memory = the original row + the newly approved one.
  const snapshot = [row("a")];
  const onDisk   = [row("a"), row("srv1", { gmailRef: "gmail:m1:inv.pdf" }), row("srv2", { gmailRef: "gmail:m2:inv.pdf" })];
  const inMemory = [row("a"), row("approved")];

  const keep = costAdditionsToKeep(onDisk, snapshot, inMemory);
  t("both server-imported invoices are preserved", JSON.stringify(ids(keep)) === JSON.stringify(["srv1", "srv2"]), ids(keep).join(","));

  const written = [...inMemory, ...keep];
  t("the approved row still lands", written.some(e => e.id === "approved"));
  t("nothing is lost: 4 rows written, not 2", written.length === 4, `${written.length} rows`);
}

console.log("\n═ a deletion must stay deleted (merge-by-absence would resurrect it) ═");
{
  const snapshot = [row("a"), row("b"), row("c")];
  const onDisk   = [row("a"), row("b"), row("c")];   // disk still has b; user just deleted it
  const inMemory = [row("a"), row("c")];

  const keep = costAdditionsToKeep(onDisk, snapshot, inMemory);
  t("deleted row is NOT merged back", keep.length === 0, `resurrected ${ids(keep).join(",")}`);
}

console.log("\n═ delete one row while the server adds another, in the same window ═");
{
  const snapshot = [row("a"), row("b")];
  const onDisk   = [row("a"), row("b"), row("srv")];
  const inMemory = [row("a")];                        // user deleted b

  const keep = costAdditionsToKeep(onDisk, snapshot, inMemory);
  t("server row kept AND deleted row stays gone", JSON.stringify(ids(keep)) === JSON.stringify(["srv"]), ids(keep).join(","));
}

console.log("\n═ edge cases ═");
{
  const snap = [row("a")];
  t("a row already in memory is not duplicated",
    costAdditionsToKeep([row("a")], snap, [row("a")]).length === 0);

  t("a torn shard showing the same id twice merges it once",
    costAdditionsToKeep([row("s"), row("s")], snap, [row("a")]).length === 1);

  t("a row with no id is never merged (indistinguishable from a deletion)",
    costAdditionsToKeep([{ truckId: "0424", total: 5 }], snap, [row("a")]).length === 0);

  t("empty disk yields nothing to keep", costAdditionsToKeep([], snap, [row("a")]).length === 0);
  t("missing/garbage inputs do not throw", costAdditionsToKeep(null, null, null).length === 0);

  // A month the user emptied entirely, where the server has since imported.
  t("emptying a month still preserves a server import",
    ids(costAdditionsToKeep([row("old"), row("srv")], [row("old")], [])).join(",") === "srv");

  // Ids that differ only by type must not be treated as different rows.
  t("numeric 7 and string '7' are the same row",
    costAdditionsToKeep([row(7)], [], [row("7")]).length === 0);
}

console.log(`\n${fail ? "FAILED" : "PASSED"}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
