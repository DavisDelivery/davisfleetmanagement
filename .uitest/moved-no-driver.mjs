/**
 * v2.32.0: flag a truck Motive saw driving on a day nobody on the Driver Board had it
 * (#4952 ran all week with no driver on the board). Two halves, tested apart:
 *
 *   1. movedWithoutDriver(), the rule, run straight out of App.jsx.
 *   2. /api/motive?action=days, run straight out of motive.mts against a fake Motive.
 *      Motive does not say whether end_date is inclusive; the function asks for
 *      start=end=D first and only falls back to [D, D+1) when that returns nothing
 *      driven. Both kinds of Motive are simulated, and neither may double a day.
 */
import * as esbuild from "esbuild";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
let failed = 0;
const pass = (l, ok, x = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${l}${x ? "  — " + x : ""}`); };

// ── 1. the rule ──
const { code } = await esbuild.transform(readFileSync(path.join(REPO, "App.jsx"), "utf8"), { loader: "jsx", jsxFactory: "h", jsxFragment: "f" });
const { movedWithoutDriver } = await import("data:text/javascript;base64," + Buffer.from(
  "const React={createElement(){},Fragment:null};const h=()=>{};const f=null;\n" +
  "const useState=()=>[],useEffect=()=>{},useCallback=(x)=>x,useMemo=()=>{},useRef=()=>({current:null});\n" +
  code + "\nexport { movedWithoutDriver };").toString("base64"));

const trucks = ["4952", "0805", "1287", "7792", "0186"].map((id) => ({ id }));
const drivers = [{ name: "Alvarez, R" }, { name: "Byrd, B" }];
const days = [
  { date: "2026-09-21", day: "Mon", vehicles: [
    { vehicleId: 900, number: "4952", miles: 84.4, quality: "ok" },       // no driver → flag
    { vehicleId: 901, number: "0805", miles: 120, quality: "ok" },        // Alvarez has it → fine
    { vehicleId: 902, number: "1287", miles: 6, quality: "ok" },          // yard shuffle → fine
    { vehicleId: 903, number: "7792", miles: 40, quality: "ok" },         // repair ticket covers the day → fine
    { vehicleId: 904, number: "186", miles: 55, quality: "stale" },       // not reporting → says nothing
  ] },
  { date: "2026-09-22", day: "Tue", vehicles: [
    { vehicleId: 900, number: "4952", miles: 112, quality: "ok" },
    { vehicleId: 903, number: "7792", miles: 33, quality: "ok" },         // ticket closed Monday → flag
    { vehicleId: 999, number: "A-186", miles: 70, quality: "ok" },        // unmapped id, matched by number
  ] },
];
const asgn = { "Alvarez, R-Mon": "0805", "Byrd, B-Mon": "OFF" };
const repairs = [{ truckId: "7792", status: "closed", dateIn: "2026-09-20T12:00:00.000Z", dateClosed: "2026-09-21T20:00:00.000Z" }];
const flags = movedWithoutDriver({ days, byMotiveId: { "900": "4952" }, trucks, drivers, asgn, repairs });
console.log("\n═ the rule ═");
pass("a truck driven with nobody on it is flagged, per day", JSON.stringify(flags["4952"]) === JSON.stringify({ Mon: 84, Tue: 112 }), JSON.stringify(flags));
pass("a truck with its driver on the board is not", !flags["0805"]);
pass("a short yard move is not", !flags["1287"]);
pass("a day a repair ticket covers is not — a shop road test", !(flags["7792"] && flags["7792"].Mon));
pass("the day after the ticket closed is", flags["7792"] && flags["7792"].Tue === 33, JSON.stringify(flags["7792"]));
pass("a truck not reporting says nothing", !(flags["0186"] && flags["0186"].Mon));
pass("an unmapped Motive vehicle is matched by its number", flags["0186"] && flags["0186"].Tue === 70, JSON.stringify(flags["0186"]));
pass("nothing else is flagged", Object.keys(flags).sort().join(",") === "0186,4952,7792", Object.keys(flags).join(","));

// ── 2. the Motive request ──
const built = await esbuild.build({ entryPoints: [path.join(REPO, "netlify/functions/motive.mts")], bundle: true, format: "esm", platform: "node", write: false, logLevel: "silent" });
const { default: handler } = await import("data:text/javascript;base64," + Buffer.from(built.outputFiles[0].text).toString("base64"));
globalThis.Netlify = { env: { get: (k) => (k === "MOTIVE_API_KEY" ? "test-key" : undefined) } };
// A fake Motive: miles driven per UTC date, answering vehicle_utilization over [start, end].
const DRIVEN = { "2026-09-21": 84, "2026-09-22": 112, "2026-09-23": 97 };
function fakeMotive(inclusiveEnd) {
  const calls = [];
  globalThis.fetch = async (u) => {
    const q = new URL(u).searchParams; calls.push(`${q.get("start_date")}..${q.get("end_date")}`);
    const s = q.get("start_date").slice(0, 10), e = q.get("end_date").slice(0, 10);
    const miles = Object.entries(DRIVEN).filter(([d]) => d >= s && (inclusiveEnd ? d <= e : d < e)).reduce((a, [, m]) => a + m, 0);
    return new Response(JSON.stringify({ vehicle_utilizations: [{ vehicle_utilization: { vehicle: { id: 900, number: "4952" }, total_distance: miles, driving_time: miles * 90 } }] }), { status: 200 });
  };
  return calls;
}
const ask = async () => (await handler(new Request("https://x/api/motive?action=days&dates=2026-09-21,2026-09-22,2026-09-23"))).json();
const perDay = (j) => (j.days || []).map((d) => Math.round(d.vehicles[0].miles)).join(",");

console.log("\n═ the Motive request ═");
{
  const calls = fakeMotive(true);
  const j = await ask();
  pass("an inclusive Motive: each day is exactly that day", perDay(j) === "84,112,97" && j.mode === "inclusive", `${perDay(j)} ${j.mode}`);
  pass("asked once per day", calls.length === 3, calls.join(" "));
}
{
  const calls = fakeMotive(false);
  const j = await ask();
  pass("an exclusive Motive: noticed, and asked again as [D, D+1)", perDay(j) === "84,112,97" && j.mode === "exclusive", `${perDay(j)} ${j.mode}`);
  pass("no day is ever doubled", !(j.days || []).some((d) => d.vehicles[0].miles > 112));
  pass("three extra requests, not more", calls.length === 6, calls.join(" "));
}
{
  const r = await handler(new Request("https://x/api/motive?action=days&dates=last-week"));
  pass("bad dates are refused", r.status === 400);
}

console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
process.exit(failed ? 1 : 0);
