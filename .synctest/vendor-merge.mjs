/**
 * The crawler iterates whatever vendor list the app last POSTed into the "vendors" blob.
 * That read used to be `stored || DEFAULT_VENDORS`, so the fallback only applied to an
 * install that had NEVER pushed a list. Every real install has. Adding a built-in vendor
 * therefore did nothing on the unattended path: the crawler never iterated it, its
 * invoices were never fetched, and nothing anywhere reported a problem.
 *
 * That is the failure this guards — a new vendor silently importing nothing.
 *
 * v2.26.0: it used to check only that a query EXISTED for each vendor, which is the
 * cheap half. A vendor's query is one string naming one sender; a typo in it
 * ("complete.fleet@outlook.co") still passes a presence check, still crawls, and still
 * returns nothing forever. The exact sender is asserted below. The queries also moved to
 * netlify/lib/vendor-queries.mts so the "📧 <vendor>" buttons search the mailbox the same
 * way the crawler does — that shared module is what is loaded here.
 */
import * as esbuild from "esbuild";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");

// Loads a .mts source as a module. `expose` re-exports internals that the file keeps
// private — auto-sync.mts pulls in the Netlify/Firebase runtime, so its own imports are
// stripped and the two pure functions this file exercises are named here instead.
const load = async (rel, expose = []) => {
  const src = readFileSync(path.join(REPO, rel), "utf8");
  const { code } = await esbuild.transform(src, { loader: "ts" });
  // Line-scoped on purpose: [^;] would match newlines and swallow the query map, whose
  // values contain the word "from" and whose closing brace ends in ";".
  const stripped = code.replace(/^\s*(?:import|export)\s[^;\n]*\bfrom\s[^;\n]+;[ \t]*$/gm, "");
  const withExports = expose.length ? `${stripped}\nexport { ${expose.join(", ")} };` : stripped;
  return import("data:text/javascript;base64," + Buffer.from(withExports).toString("base64"));
};

const { mergeVendors, DEFAULT_VENDORS } = await load(
  "netlify/functions/auto-sync.mts", ["mergeVendors", "DEFAULT_VENDORS"]);
// The queries live in their own module and export themselves, so nothing to expose.
const { VENDOR_QUERIES, VENDOR_ALIASES, vendorQuery, buildVendorQuery } =
  await load("netlify/lib/vendor-queries.mts");

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
  const missing = out.filter(v => !vendorQuery(v.name));
  t("no vendor is left without a query", missing.length === 0, missing.map(v => v.name).join(", ") || "none");
  t("one query per built-in vendor, no strays",
    Object.keys(VENDOR_QUERIES).length === DEFAULT_VENDORS.length,
    `${Object.keys(VENDOR_QUERIES).length} queries vs ${DEFAULT_VENDORS.length} vendors`);
}

console.log("\n═ each query names the sender it is supposed to name ═");
{
  // Presence is not the check that matters. One wrong character in an address crawls
  // forever and returns nothing, and no test, log or screen would say so.
  const SENDERS = {
    "complete fleet services": "from:complete.fleet@outlook.com has:attachment",
    "quick fuel": "from:ebilling@4flyers.com has:attachment",
  };
  for (const [vendor, expected] of Object.entries(SENDERS)) {
    t(`${vendor} → ${expected}`, VENDOR_QUERIES[vendor] === expected, VENDOR_QUERIES[vendor]);
  }
  t("FuelFox is matched by its QuickBooks sender and subject, not by name",
    VENDOR_QUERIES["fuelfox atlanta"] === '(from:quickbooks@notification.intuit.com subject:"FuelFox Atlanta") has:attachment',
    VENDOR_QUERIES["fuelfox atlanta"]);
  t("Peach State keeps both the domain and the Ryan-forward clause",
    /from:peachstatetrucks\.com/.test(VENDOR_QUERIES["peach state freightliner"])
    && /subject:"Parts 20407"/.test(VENDOR_QUERIES["peach state freightliner"]));
  for (const [k, q] of Object.entries(VENDOR_QUERIES)) {
    t(`${k} restricts to messages that carry a file`, q.includes("has:attachment"), q);
    t(`${k} narrows by sender or subject, never by loose text`, /from:|subject:/.test(q), q);
  }
}

console.log("\n═ the manual search and the crawler ask Gmail the same thing ═");
{
  // The "📧 <vendor>" buttons POST `v.name.toLowerCase()`; the crawler passes v.name.
  t("the button's lowercased name resolves",
    buildVendorQuery("complete fleet services") === "from:complete.fleet@outlook.com has:attachment");
  t("the crawler's cased name resolves the same",
    buildVendorQuery("Complete Fleet Services") === buildVendorQuery("complete fleet services"));
  t("a date range is appended in Gmail's own syntax",
    buildVendorQuery("complete fleet services", "2026/8/1", "2026/9/1")
      === "from:complete.fleet@outlook.com has:attachment after:2026/8/1 before:2026/9/1",
    buildVendorQuery("complete fleet services", "2026/8/1", "2026/9/1"));
  t("no range → no date terms", !/after:|before:/.test(buildVendorQuery("quick fuel")));
  t("after alone works", buildVendorQuery("quick fuel", "2026/8/1").endsWith(" after:2026/8/1"));
  // This is the bug: before the shared module, the search endpoint had no branch for
  // this vendor and fell through to a text match on its name.
  t("the vendor is never searched by its name as loose text",
    !buildVendorQuery("complete fleet services").includes('"complete fleet services"'));
  for (const [alias, canonical] of Object.entries(VENDOR_ALIASES)) {
    t(`alias "${alias}" reaches ${canonical}`, vendorQuery(alias) === VENDOR_QUERIES[canonical], vendorQuery(alias));
  }
  t("an unknown vendor still gets a search rather than nothing",
    buildVendorQuery("Bob's Tires") === '"Bob\'s Tires" has:attachment', buildVendorQuery("Bob's Tires"));
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
