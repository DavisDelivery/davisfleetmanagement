/**
 * The crawler iterates whatever vendor list the app last POSTed into the "vendors" blob.
 * That read used to be `stored || DEFAULT_VENDORS`, so the fallback only applied to an
 * install that had NEVER pushed a list. Every real install has. Adding a built-in vendor
 * therefore did nothing on the unattended path: the crawler never iterated it, its
 * invoices were never fetched, and nothing anywhere reported a problem.
 *
 * That is the failure this guards — a new vendor silently importing nothing.
 */
import * as esbuild from "esbuild";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");

const src = readFileSync(path.join(REPO, "netlify/functions/auto-sync.mts"), "utf8");
const { code } = await esbuild.transform(src, { loader: "ts" });
const mod = await import("data:text/javascript;base64," + Buffer.from(
  code.replace(/^\s*import[^;]+;$/gm, "") + "\nexport { mergeVendors, DEFAULT_VENDORS, VENDOR_QUERIES };"
).toString("base64")).catch(async () => {
  // the module imports netlify runtime bits; strip and retry via a narrow extraction
  const fn = src.slice(src.indexOf("function mergeVendors"), src.indexOf("// Exported so the test harness"));
  const dv = src.slice(src.indexOf("const DEFAULT_VENDORS"), src.indexOf("];", src.indexOf("const DEFAULT_VENDORS")) + 2);
  const vq = src.slice(src.indexOf("export const VENDOR_QUERIES"), src.indexOf("};", src.indexOf("export const VENDOR_QUERIES")) + 2).replace("export ", "");
  const { code: c2 } = await esbuild.transform(dv + "\n" + vq + "\n" + fn + "\nexport { mergeVendors, DEFAULT_VENDORS, VENDOR_QUERIES };", { loader: "ts" });
  return import("data:text/javascript;base64," + Buffer.from(c2).toString("base64"));
});
const { mergeVendors, DEFAULT_VENDORS, VENDOR_QUERIES } = mod;

let pass = 0, fail = 0;
const t = (n, c, d = "") => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n}${d ? ` — ${d}` : ""}`); } };
const names = (l) => l.map(v => v.name).sort();
const has = (l, n) => l.some(v => v.name === n);

// exactly what a live install has stored: the three vendors from before this change
const LEGACY = [
  { name: "FuelFox Atlanta", category: "Fuel" },
  { name: "Peach State Freightliner", category: "Parts" },
  { name: "Quick Fuel", category: "Fuel" },
];

console.log("\n═ the reported failure: a live install with a saved vendor list ═");
{
  const out = mergeVendors(LEGACY, DEFAULT_VENDORS);
  t("Complete Fleet Services is now crawled", has(out, "Complete Fleet Services"), names(out).join(", "));
  t("the three existing vendors survive", ["FuelFox Atlanta", "Peach State Freightliner", "Quick Fuel"].every(n => has(out, n)));
  t("nothing is duplicated", new Set(names(out)).size === out.length, `${out.length} entries`);
}

console.log("\n═ every built-in vendor has a Gmail query to crawl with ═");
{
  const out = mergeVendors(LEGACY, DEFAULT_VENDORS);
  const missing = out.filter(v => !VENDOR_QUERIES[String(v.name).toLowerCase()]);
  t("no vendor is left without a query", missing.length === 0, missing.map(v => v.name).join(", ") || "none");
}

console.log("\n═ the office's own edits are not stamped on ═");
{
  const edited = [{ name: "Complete Fleet Services", category: "Parts" }];
  const out = mergeVendors(edited, DEFAULT_VENDORS);
  const cfs = out.filter(v => v.name === "Complete Fleet Services");
  t("appears exactly once", cfs.length === 1, `${cfs.length}`);
  t("the stored category wins over the built-in", cfs[0].category === "Parts", cfs[0].category);
}

console.log("\n═ name matching is forgiving ═");
{
  t("case and padding do not create a duplicate",
    mergeVendors([{ name: "  complete fleet services  " }], DEFAULT_VENDORS)
      .filter(v => String(v.name).toLowerCase().trim() === "complete fleet services").length === 1);
}

console.log("\n═ degenerate stored values fall back safely ═");
{
  t("no blob yet → the built-ins", mergeVendors(null, DEFAULT_VENDORS).length === DEFAULT_VENDORS.length);
  t("empty array → the built-ins", mergeVendors([], DEFAULT_VENDORS).length === DEFAULT_VENDORS.length);
  t("junk entries are dropped, built-ins still arrive",
    has(mergeVendors([null, {}, { name: "" }], DEFAULT_VENDORS), "Complete Fleet Services"));
  t("a non-array does not throw", mergeVendors("nonsense", DEFAULT_VENDORS).length === DEFAULT_VENDORS.length);
}

console.log(`\n${fail ? "FAILED" : "PASSED"}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
