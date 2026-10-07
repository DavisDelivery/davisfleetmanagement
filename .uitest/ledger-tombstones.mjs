/**
 * The 🧹 ledger cleanup must stay cleaned up (v2.33.0).
 *
 * Every night the server rebuilds its "already imported" list from what the ledger
 * holds (reconcileFromLedger in auto-sync.mts). A ref that dropped out of the ledger
 * is read as an invoice lost to a bad write: the server un-sees its email and imports
 * it again. That self-heal is deliberate. But removing the extra copies of a re-sent
 * FuelFox log leaves exactly that trace. On the production ledger of 2026-10-07 the
 * cleanup dropped every row of 55 emails, so the next sync would have re-parsed all 55.
 * The content check only skips a document when EVERY re-parsed row matches the ledger
 * to the cent, so any copy that came back slightly different would return in full.
 *
 * So the button now tombstones what it removes outright. This runs the REAL pieces:
 *   - the browser's cleanup pipeline out of App.jsx: repairCostLedger,
 *     reallocateImplausibleFuel, healCollidedIds, then vanishedGmailRefs;
 *   - the server's reconcileFromLedger out of auto-sync.mts, over a fake Firestore.
 * It asserts that every ref the server knew before the cleanup is still known after
 * it, so nothing is un-seen and nothing is re-imported. It also runs a control: the
 * same cleanup without the tombstones does lose refs. Without that, a test that could
 * never fail would pass.
 *
 * Pass a ledger export as argv[2] (a JSON array of cost entries) to run the same
 * assertions over real data as well.
 */
import * as esbuild from "esbuild";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");

// ── the browser's copy (App.jsx, module scope) ──────────────────────────────
const { code: appCode } = await esbuild.transform(readFileSync(path.join(REPO, "App.jsx"), "utf8"), {
  loader: "jsx", jsxFactory: "h", jsxFragment: "f",
});
const app = await import("data:text/javascript;base64," + Buffer.from(
  "const React={createElement(){},Fragment:null};const h=()=>{};const f=null;\n" +
  "const useState=()=>[],useEffect=()=>{},useCallback=(x)=>x,useMemo=()=>{},useRef=()=>({current:null});\n" +
  appCode + "\nexport { repairCostLedger, reallocateImplausibleFuel, healCollidedIds, entryGmailRefs, vanishedGmailRefs };"
).toString("base64"));

// ── the server's copy (auto-sync.mts) over a fake Firestore ─────────────────
// Its imports pull in the Netlify and Firebase runtimes; strip them, and supply the
// handful of Firestore calls reconcileFromLedger makes against an in-memory `kv`.
const FAKE_FIRESTORE = `
const documentId=()=>"__name__";
const where=(f,op,v)=>({op,v});
const query=(kv,...conds)=>({kv,conds});
const collection=(db,name)=>({db,name});
const doc=(db,coll,id)=>({db,id});
const getDoc=async(ref)=>{const v=ref.db.kv[ref.id];return{exists:()=>v!==undefined,data:()=>({v})};};
const getDocs=async(q)=>{const kv=q.kv.db.kv;
  const ids=Object.keys(kv).filter(id=>q.conds.every(c=>c.op===">="?id>=c.v:c.op==="<"?id<c.v:true)).sort();
  return{forEach(cb){ids.forEach(id=>cb({id,data:()=>({v:kv[id]})}));}};};
`;
const { code: srvCode } = await esbuild.transform(
  readFileSync(path.join(REPO, "netlify/functions/auto-sync.mts"), "utf8"), { loader: "ts" });
const srv = await import("data:text/javascript;base64," + Buffer.from(
  FAKE_FIRESTORE +
  // Line-scoped: [^;] would match newlines and swallow whole declarations.
  srvCode.replace(/^\s*(?:import|export)\s[^;\n]*\bfrom\s[^;\n]+;[ \t]*$/gm, "")
  + "\nexport { reconcileFromLedger, stableGmailRef };"
).toString("base64"));

let pass = 0, fail = 0;
const t = (n, c, d = "") => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n}${d ? ` — ${d}` : ""}`); } };

// What the button does, in the order it does it.
function cleanup(entries) {
  const r = app.repairCostLedger(entries);
  const fuel = app.reallocateImplausibleFuel(r.entries);
  return app.healCollidedIds(fuel.entries).entries;
}
// The ledger as the server stores it: one doc per month.
function asKv(entries, tombstones) {
  const kv = {};
  const byMonth = {};
  for (const e of entries) {
    const m = String(e.date || "").slice(0, 7);
    (byMonth[/^\d{4}-\d{2}$/.test(m) ? m : "unknown"] ||= []).push(e);
  }
  for (const [m, rows] of Object.entries(byMonth)) kv[`fl-costs-${m}`] = JSON.stringify(rows);
  if (tombstones) kv["fl-rejected-refs"] = JSON.stringify(tombstones);
  return kv;
}
const known = async (kv) => (await srv.reconcileFromLedger({ kv })).gmailRefs;
const missing = (a, b) => [...a].filter((r) => !b.has(r));

// ── fixtures: one delivery, imported three ways ─────────────────────────────
// A FuelFox service log PDF, its name as Gmail hands it over, and the file key the
// importer stores (timestamp + the same name made path-safe).
const LOG = "FuelFox-ServiceLog-DavisDelivery-03-26-2026-002-6a6b.pdf";
const LINES = [["0424", 368.46], ["0451", 73.15], ["0805", 178.62], ["1368", 313.26]];
const perTruck = (msg, ref, key, addedAt) => LINES.map(([truckId, amt], i) => ({
  id: `${msg}-${i}`, date: "2026-03-26", truckId, vendor: "FuelFox Atlanta", category: "Fuel",
  total: amt, gallons: Math.round(amt / 3.5 * 10) / 10, invoiceNum: `Service Log 03/26/2026-${truckId}`,
  lineItems: [{ desc: `Diesel - Truck ${truckId}`, amount: amt }], notes: "",
  gmailRef: ref, fileKey: key, addedAt,
}));
const A = "18aaaa0000000001", B = "18bbbb0000000002", C = "18cccc0000000003";
const FIXTURE = [
  // A: the original email, imported before v2.19.0 — so its stored ref is the old
  // volatile attachment-id form. Oldest, so it is the copy the cleanup keeps.
  ...perTruck(A, `gmail:${A}:ANGjdJ_volatile_A`, `1785000000001-${LOG}`, "2026-03-27T01:00:00.000Z"),
  // B: FuelFox's payment reminder, re-sending the same PDF — imported again row for row.
  ...perTruck(B, `gmail:${B}:ANGjdJ_volatile_B`, `1785000000002-${LOG}`, "2026-03-29T01:00:00.000Z"),
  // C: the same log under a third email, collapsed onto #0424 by the parser — stored
  // with the stable ref the importer has written since v2.19.0.
  { id: `${C}-0`, date: "2026-03-26", truckId: "0424", vendor: "FuelFox Atlanta", category: "Fuel",
    total: 933.49, gallons: 266.7, invoiceNum: "Davis Delivery - 03/26/2026",
    lineItems: LINES.map(([tr, a]) => ({ desc: `Diesel - Truck ${tr}`, amount: a })), notes: "",
    gmailRef: `gmail:${C}:${LOG}`, fileKey: `1785000000003-${LOG}`, addedAt: "2026-04-01T01:00:00.000Z" },
  // An unrelated parts invoice and a hand-keyed row: both must come through untouched.
  { id: "psf", date: "2026-03-11", truckId: "0451", vendor: "Peach State Freightliner", category: "Parts",
    total: 412.5, invoiceNum: "XA105252479:01", lineItems: [], notes: "",
    gmailRef: "gmail:18dddd0000000004:Invoice_XA105252479.pdf", fileKey: "1785000000004-Invoice_XA105252479.pdf",
    addedAt: "2026-03-12T01:00:00.000Z" },
  { id: "hand", date: "2026-03-15", truckId: "0805", vendor: "Tire shop", category: "Tires",
    total: 220, invoiceNum: "T-1", lineItems: [], notes: "keyed by hand", addedAt: "2026-03-15T01:00:00.000Z" },
];

console.log("\n═ the refs a row carries — the server's own reading of it ═");
{
  const refs = app.entryGmailRefs(FIXTURE[0]);
  t("the stored ref, and the file-name ref the crawler checks", refs.length === 2 && refs[0] === `gmail:${A}:ANGjdJ_volatile_A`
    && refs[1] === `gmail:${A}:${LOG}`, JSON.stringify(refs));
  t("the file-name ref is exactly what the crawler computes", refs[1] === srv.stableGmailRef(A, LOG));
  t("a row with no gmailRef has none", app.entryGmailRefs(FIXTURE.at(-1)).length === 0);
  // An older row carries the file only as a URL; the server reads the key out of it.
  const viaUrl = app.entryGmailRefs({ gmailRef: `gmail:${A}:x`, fileUrl: `/api/invoice-file?key=${encodeURIComponent(`1785000000009-${LOG}`)}` });
  t("a file URL is read the same way", viaUrl[1] === `gmail:${A}:${LOG}`, JSON.stringify(viaUrl));
  // A name with spaces is stored path-safe; the crawler slugs it the same way.
  const spaced = "DAVIS AR 501.pdf";
  t("a name with spaces matches the crawler's slug", app.entryGmailRefs({ gmailRef: `gmail:${A}:y`, fileKey: `1785000000010-DAVIS_AR_501.pdf` })[1]
    === srv.stableGmailRef(A, spaced));
}

console.log("\n═ the cleanup on a ledger shaped like production's ═");
{
  const after = cleanup(FIXTURE);
  const fuel = after.filter((e) => e.vendor === "FuelFox Atlanta");
  t("one row per truck survives", fuel.length === 4 && new Set(fuel.map((e) => e.truckId)).size === 4,
    JSON.stringify(fuel.map((e) => `${e.truckId}:${e.total}`)));
  t("the parts invoice and the hand-keyed row are untouched", after.some((e) => e.id === "psf") && after.some((e) => e.id === "hand"));

  const gone = app.vanishedGmailRefs(FIXTURE, after);
  t("the reminder email and the collapsed copy are the ones that vanish",
    gone.includes(`gmail:${B}:ANGjdJ_volatile_B`) && gone.includes(`gmail:${B}:${LOG}`) && gone.includes(`gmail:${C}:${LOG}`),
    JSON.stringify(gone));
  t("nothing from the kept email is tombstoned", !gone.some((r) => r.includes(A)), JSON.stringify(gone));
  t("nor the untouched rows", !gone.some((r) => r.includes("18dddd")));

  const before = await known(asKv(FIXTURE));
  const without = await known(asKv(after));
  const lost = missing(before, without);
  t("control: without tombstones the server loses track of those emails", lost.length > 0
    && lost.some((r) => r.includes(B)) && lost.some((r) => r.includes(C)), JSON.stringify(lost));

  const withT = await known(asKv(after, gone));
  t("with them, every ref the server knew is still known — nothing is un-seen", missing(before, withT).length === 0,
    JSON.stringify(missing(before, withT)));
  t("so the crawler skips the re-sent PDF in each email", [A, B, C].every((m) => withT.has(srv.stableGmailRef(m, LOG))));
}

console.log("\n═ pressing it again changes nothing ═");
{
  const once = cleanup(FIXTURE);
  const twice = cleanup(once);
  t("a second pass removes nothing more", twice.length === once.length);
  t("and has nothing more to tombstone", app.vanishedGmailRefs(once, twice).length === 0);
}

const exportPath = process.argv[2];
if (exportPath) {
  console.log(`\n═ the real ledger: ${path.basename(exportPath)} ═`);
  const real = JSON.parse(readFileSync(exportPath, "utf8")).map(({ _shard, ...e }) => e);
  const after = cleanup(real);
  const gone = app.vanishedGmailRefs(real, after);
  const emails = new Set(gone.map((r) => r.split(":")[1]));
  console.log(`  ${real.length} rows → ${after.length}; ${gone.length} refs from ${emails.size} emails to tombstone`);
  const before = await known(asKv(real));
  const lost = missing(before, await known(asKv(after)));
  t("control: without tombstones the cleanup loses refs", lost.length > 0, `${lost.length}`);
  const left = missing(before, await known(asKv(after, gone)));
  t("with them, the server still knows every ref it knew", left.length === 0, `${left.length} missing, e.g. ${left.slice(0, 2).join(" ")}`);
  t("and the list fits under the 2,000-entry cap", gone.length <= 2000, `${gone.length}`);
  t("and well under Firestore's 1 MB document limit", Buffer.byteLength(JSON.stringify(gone)) < 800_000,
    `${Buffer.byteLength(JSON.stringify(gone))} bytes`);
}

console.log(`\n${pass + fail} checks: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
