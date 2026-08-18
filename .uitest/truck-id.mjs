/**
 * Runs the REAL normalizeTruckId() out of App.jsx.
 *
 * Complete Fleet Services bills the unit with a yard prefix — "BX0424", "GP2883" — in the
 * Customer PO / Unit # cell. The fleet knows those trucks as 0424 and 2883. Getting this
 * wrong is not cosmetic: a repair booked to a truck that does not exist is invisible in
 * per-truck cost, and a repair booked to the WRONG truck is how #0424 came to show $498k.
 *
 * The rule only rewrites when the bare digits are a real fleet number, so a genuinely
 * unknown unit still surfaces as unknown rather than being coerced into the nearest match.
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
  code + "\nexport { normalizeTruckId };"
).toString("base64"));
const { normalizeTruckId } = mod;

const FLEET = new Set(["0424", "0451", "0805", "1478", "1506", "2883", "3299", "70333"]);

let pass = 0, fail = 0;
const t = (n, got, want) => {
  const ok = got === want;
  if (ok) { pass++; console.log(`  ✔ ${n}`); }
  else { fail++; console.log(`  ✘ ${n} — got ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`); }
};

console.log("\n═ the two real Complete Fleet invoices ═");
t("BX0424 (invoice 10785) → 0424", normalizeTruckId("BX0424", FLEET), "0424");
t("GP2883 (invoice 10819) → 2883", normalizeTruckId("GP2883", FLEET), "2883");
// invoice 10819 prints "Unit: GP2883 (GO2883)" — the parenthetical disagrees with the cell
t("the GO2883 typo in the same invoice also resolves", normalizeTruckId("GO2883", FLEET), "2883");

console.log("\n═ prefix shapes ═");
t("hyphenated GP-2883", normalizeTruckId("GP-2883", FLEET), "2883");
t("spaced BX 0424", normalizeTruckId("BX 0424", FLEET), "0424");
t("single-letter prefix B0424", normalizeTruckId("B0424", FLEET), "0424");
t("three-letter prefix ABC0451", normalizeTruckId("ABC0451", FLEET), "0451");
t("lowercase bx0424", normalizeTruckId("bx0424", FLEET), "0424");

console.log("\n═ leaves alone what it should ═");
t("a bare fleet number is untouched", normalizeTruckId("0424", FLEET), "0424");
t("INVENTORY is untouched", normalizeTruckId("INVENTORY", FLEET), "INVENTORY");
t("UNKNOWN is untouched", normalizeTruckId("UNKNOWN", FLEET), "UNKNOWN");
t("a 5-digit fleet number survives", normalizeTruckId("70333", FLEET), "70333");
t("empty stays empty", normalizeTruckId("", FLEET), "");
t("null does not throw", normalizeTruckId(null, FLEET), "");

console.log("\n═ refuses to invent a truck ═");
t("prefix whose digits are NOT in the fleet stays as-is", normalizeTruckId("BX9999", FLEET), "BX9999");
t("a bare unknown number stays as-is", normalizeTruckId("9999", FLEET), "9999");
t("a long alpha string is not a prefix", normalizeTruckId("FREIGHT0424", FLEET), "FREIGHT0424");
t("empty fleet cannot match anything", normalizeTruckId("BX0424", new Set()), "BX0424");

console.log("\n═ zero-padding ═");
t("BX424 matches fleet 0424", normalizeTruckId("BX424", FLEET), "0424");
t("no false match on a different number", normalizeTruckId("BX425", FLEET), "BX425");

console.log(`\n${fail ? "FAILED" : "PASSED"}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
