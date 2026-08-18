/**
 * Runs the REAL dateTimeStr() out of App.jsx.
 *
 * Repairs have always STORED a full ISO timestamp in dateIn/dateClosed — the display was
 * the only thing dropping the time. In the reported screenshot three repairs read
 * "In: Aug 17, 2026 ... Resolved: Aug 17, 2026": same date on both sides, so there was no
 * way to tell a twenty-minute fix from one that held the truck all day.
 *
 * The one thing that must NOT happen: a row stored date-only has no recorded time, and
 * rendering it as "12:00 AM" would invent a fact. Those stay a plain date.
 */
process.env.TZ = "America/New_York";   // the fleet's timezone, so the assertions are stable

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
  code + "\nexport { dateTimeStr, dateStr };"
).toString("base64"));
const { dateTimeStr, dateStr } = mod;

let pass = 0, fail = 0;
const t = (n, c, d = "") => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n}${d ? ` — ${d}` : ""}`); } };
const HAS_TIME = /\d{1,2}:\d{2}\s?(AM|PM)/i;

console.log("\n═ a completion timestamp now carries the time ═");
{
  const closed = dateTimeStr("2026-08-17T19:42:00.000Z");   // 3:42 PM Eastern
  t("shows the date", /Aug 17, 2026/.test(closed), closed);
  t("shows the time", HAS_TIME.test(closed), closed);
  t("reads as one line", closed === "Aug 17, 2026 3:42 PM", closed);
}

console.log("\n═ the reported case: opened and closed the same day ═");
{
  const inAt = dateTimeStr("2026-08-17T11:15:00.000Z");     // 7:15 AM
  const outAt = dateTimeStr("2026-08-17T19:42:00.000Z");    // 3:42 PM
  t("both carry a time", HAS_TIME.test(inAt) && HAS_TIME.test(outAt), `${inAt} → ${outAt}`);
  t("they are distinguishable", inAt !== outAt, `${inAt} vs ${outAt}`);
  t("the old rendering could NOT tell them apart", dateStr("2026-08-17T11:15:00.000Z") === dateStr("2026-08-17T19:42:00.000Z"));
}

console.log("\n═ never invent a time that was not recorded ═");
{
  const dOnly = dateTimeStr("2026-08-17");
  t("a date-only value shows no time", !HAS_TIME.test(dOnly), dOnly);
  t("and is not rendered as midnight", !/12:00\s?AM/i.test(dOnly), dOnly);
  t("it still shows the date", dOnly === "Aug 17, 2026", dOnly);
}

console.log("\n═ junk in ═");
{
  t("null → em dash", dateTimeStr(null) === "—");
  t("undefined → em dash", dateTimeStr(undefined) === "—");
  t("empty string → em dash", dateTimeStr("") === "—");
  t("garbage does not throw or print Invalid Date", !/Invalid/.test(dateTimeStr("not-a-date")), dateTimeStr("not-a-date"));
  t("a Date object works", HAS_TIME.test(dateTimeStr(new Date("2026-08-17T19:42:00.000Z"))));
  t("an epoch number works", HAS_TIME.test(dateTimeStr(Date.parse("2026-08-17T19:42:00.000Z"))));
}

console.log("\n═ midnight and noon are not confused ═");
{
  t("00:30 local reads AM", /12:30\s?AM/i.test(dateTimeStr("2026-08-17T04:30:00.000Z")), dateTimeStr("2026-08-17T04:30:00.000Z"));
  t("12:30 local reads PM", /12:30\s?PM/i.test(dateTimeStr("2026-08-17T16:30:00.000Z")), dateTimeStr("2026-08-17T16:30:00.000Z"));
}

console.log(`\n${fail ? "FAILED" : "PASSED"}: ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
