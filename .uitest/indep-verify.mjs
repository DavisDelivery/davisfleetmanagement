/**
 * INDEPENDENT verification of the sub-note layout fix in mechanic/index.html.
 *
 * Written from scratch for this check — does NOT import or re-run .uitest/render.mjs,
 * and uses its own fixture data (different truck, different repair id, and a 443-word
 * mechanic write-up authored separately from any note text already in the repo).
 *
 * Method: serve the real mechanic/index.html with a stubbed Firestore (same stubbing
 * *approach* as the project's own harness — window.firebase / db.collection(...).doc(...)
 * — since that's the interface the app actually calls), seeded with one open repair
 * containing one work item whose `notes` array holds one very long sub-note. Render in
 * real Chromium at four iPhone widths and measure the DOM with getBoundingClientRect(),
 * not a visual guess.
 */
import puppeteer from "puppeteer";
import { readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
const PORT = 8842;

// ── Fixture data, independent of any existing test fixture in the repo ──────
const SUBNOTE = "Truck came in on a road call after the driver said the dash lit up with a check engine light and a reduced power message climbing the grade outside of town. Hooked up the reader before touching anything so we would not clear a code we might need later and pulled two stored faults, one for low boost pressure and one for a turbo actuator position that did not match commanded position. Started the engine cold and let it idle while watching live boost and actuator data on the scan tool, actuator was hunting back and forth about four percent instead of holding steady like the other trucks in the yard with the same engine. Popped the charge air cooler piping loose at the coupler behind the steer tire and found the boot cracked most of the way around on the bottom side where you cannot see it without a mirror, that explained the boost bleeding off under load even though the actuator itself is probably fine and just chasing a leak it cannot fix. Pulled both charge air cooler boots front and rear, both showed the same heat cracking, ribs flattened out and brittle instead of soft like new rubber, looks like they have never been changed since the truck left the factory going by the mileage on the sticker in the door jamb. Ordered a full set of silicone couplers instead of the factory rubber ones since silicone holds up a lot better under the heat cycling this truck sees running mountain grades every week, plus new t-bolt clamps since the old worm gear clamps were rusted and would not torque evenly anymore. While the piping was off, inspected the intercooler core itself for oil residue that would point to a turbo seal problem, core was clean and dry, no oil film anywhere, which is a good sign the turbo bearings and seals are still healthy and this is purely a piping leak and not something more expensive. Reinstalled everything with the new couplers and clamps, cleared the stored codes, and ran the truck up through the gears in the yard while watching boost pressure climb cleanly with no hesitation and no fault lights coming back. Test drove it up the on ramp grade nearby to load the engine the same way the driver described and boost held steady through the whole pull with no reduced power event. Driver is scheduled to take it back out first thing tomorrow so wanted to get eyes on it again before it leaves in case the actuator code comes back once it heats fully up and cycles a few more times under real load.";

const SUBNOTE_WORDS = SUBNOTE.trim().split(/\s+/).filter(Boolean).length;

const ITEM_TEXT = "Reduced power / check engine light on grade climb — suspected turbo boost leak";

const truck = { id: "4471", mk: "INTL", type: "tractor", tr: "A", year: 2020 };
const repair = {
  id: "rep-verify-9",
  truckId: "4471",
  reason: "Mechanical Repair",
  shop: "North Yard",
  dateIn: "2026-08-04T14:30:00.000Z",
  status: "open",
  openedBy: "R. Ostrowski",
  notesLog: [
    {
      ts: "2026-08-04T14:32:00.000Z",
      text: ITEM_TEXT,
      by: "R. Ostrowski",
      done: false,
      notes: [
        { ts: "2026-08-04T15:10:00.000Z", text: SUBNOTE, by: "R. Ostrowski" },
      ],
    },
  ],
};

console.log(`Fixture sub-note is ${SUBNOTE_WORDS} words.`);
if (SUBNOTE_WORDS < 300) throw new Error("Fixture note is under the required 300 words — fix the fixture, not the threshold.");

let html = readFileSync(path.join(REPO, "mechanic/index.html"), "utf8");
// No network access to the real Firebase SDK in this sandbox, and we don't want one —
// strip the real <script> tags, same as necessary for any headless run of this file.
html = html.replace(/<script src="https:\/\/www\.gstatic\.com\/firebasejs[^>]*><\/script>/g, "");

const STUB = `<script>
window.__KV = {
  "fl-trucks": ${JSON.stringify(JSON.stringify([truck]))},
  "fl-repairs": ${JSON.stringify(JSON.stringify([repair]))}
};
window.firebase = { initializeApp(){}, firestore(){ return window.__DB; } };
function __mkDoc(id) {
  return {
    async get() {
      const v = window.__KV[id];
      return { exists: v !== undefined, data: () => ({ v }) };
    },
    async set(o) { window.__KV[id] = o.v; },
    onSnapshot(cb) {
      setTimeout(() => cb({ exists: window.__KV[id] !== undefined, data: () => ({ v: window.__KV[id] }) }), 0);
      return () => {};
    },
  };
}
window.__DB = { collection() { return { doc: __mkDoc, async get() { return { forEach(){} }; } }; } };
localStorage.setItem("fl-device-user", "R. Ostrowski");
</script>`;
html = html.replace("</head>", STUB + "</head>");

const server = http
  .createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  })
  .listen(PORT);

const browser = await puppeteer.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const WIDTHS = [320, 360, 390, 430];
const results = [];

for (const width of WIDTHS) {
  const page = await browser.newPage();
  const errors = [];       // genuine JS runtime errors (uncaught exceptions)
  const netFails = [];     // failed sub-resource loads, e.g. offline sandbox can't reach Google Fonts
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    if (/Failed to load resource/.test(m.text())) netFails.push(m.text());
    else errors.push(m.text());
  });
  page.on("requestfailed", (req) => netFails.push(`${req.url()} :: ${req.failure()?.errorText}`));
  page.on("dialog", async (d) => { await d.accept("R. Ostrowski"); });
  await page.setViewport({ width, height: 900, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 900));

  const m = await page.evaluate(() => {
    const sub = document.querySelector(".subnote-text");
    const card = document.querySelector(".repair-card");
    const btn = document.querySelector(".note-meta .item-done-btn");
    const completeBtn = [...document.querySelectorAll("button")].find((b) => /Repair Completed/.test(b.textContent || ""));
    if (!sub || !card) return { found: false };
    const cs = getComputedStyle(sub);
    const lineH = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
    const subRect = sub.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const btnRect = btn ? btn.getBoundingClientRect() : null;
    const words = (sub.textContent || "").trim().split(/\s+/).filter(Boolean).length;
    return {
      found: true,
      subW: subRect.width,
      subH: subRect.height,
      lineH,
      lines: Math.round(subRect.height / lineH),
      words,
      cardW: cardRect.width,
      btnFound: !!btn,
      btnW: btnRect ? btnRect.width : 0,
      btnH: btnRect ? btnRect.height : 0,
      completeBtnFound: !!completeBtn,
      completeBtnY: completeBtn ? completeBtn.getBoundingClientRect().top + window.scrollY : null,
      docScrollW: document.documentElement.scrollWidth,
      docScrollH: document.documentElement.scrollHeight,
      viewportW: window.innerWidth,
      fontPx: parseFloat(cs.fontSize),
    };
  });

  if (width === 390) {
    await page.screenshot({ path: path.join(here, "indep-390-full.png"), fullPage: true });
  }
  await page.screenshot({ path: path.join(here, `indep-${width}-viewport.png`) });

  results.push({ width, ...m, errors, netFails });
  await page.close();
}

// ── Interaction test: the done-toggle button must exist, be a real touch target,
// and clicking it must visually mark the work item done. ──────────────────────
const page2 = await browser.newPage();
const errors2 = [];
page2.on("pageerror", (e) => errors2.push(e.message));
page2.on("dialog", async (d) => { await d.accept("R. Ostrowski"); });
await page2.setViewport({ width: 390, height: 900, deviceScaleFactor: 2 });
await page2.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 900));

const before = await page2.evaluate(() => {
  const entry = document.querySelector(".note-entry");
  const btn = document.querySelector(".note-meta .item-done-btn");
  const rect = btn ? btn.getBoundingClientRect() : null;
  return {
    hasDoneClassBefore: entry ? entry.classList.contains("item-done") : null,
    btnFound: !!btn,
    btnInMetaRow: !!document.querySelector(".note-meta .item-done-btn"),
    btnW: rect ? rect.width : 0,
    btnH: rect ? rect.height : 0,
  };
});
await page2.click(".note-meta .item-done-btn");
await new Promise((r) => setTimeout(r, 700));
const after = await page2.evaluate(() => {
  const entry = document.querySelector(".note-entry");
  let kv = null;
  try { kv = JSON.parse(window.__KV["fl-repairs"])[0].notesLog[0]; } catch (e) {}
  return {
    hasDoneClassAfter: entry ? entry.classList.contains("item-done") : null,
    subnoteSurvived: kv && Array.isArray(kv.notes) && kv.notes.length === 1,
    persistedDone: kv ? kv.done === true : null,
  };
});
await page2.screenshot({ path: path.join(here, "indep-390-after-click.png"), fullPage: true });
await page2.close();

console.log("\n============ RAW RESULTS ============");
console.log(JSON.stringify({ results: results.map(({ errors, netFails, ...rest }) => rest), errorsPerWidth: results.map(r => ({ width: r.width, errors: r.errors, netFails: r.netFails })), before, after, errors2, subnoteWords: SUBNOTE_WORDS }, null, 2));

console.log("\n============ JUDGED TABLE ============");
console.log("width | subW  | lines | words | cardW | sub>=200 | sub>=55%card | lines<<words | overflow");
let anyFail = false;
for (const r of results) {
  if (!r.found) { console.log(`${r.width} | NOT FOUND`); anyFail = true; continue; }
  const widthOk = r.subW >= 200;
  const ratioOk = r.subW >= 0.55 * r.cardW;
  const linesOk = r.lines < r.words / 3;
  const overflow = r.docScrollW > r.viewportW + 1;
  const rowFail = !widthOk || !ratioOk || !linesOk || overflow;
  if (rowFail) anyFail = true;
  console.log(
    `${String(r.width).padEnd(5)} | ${r.subW.toFixed(1).padEnd(5)} | ${String(r.lines).padEnd(5)} | ${String(r.words).padEnd(5)} | ${r.cardW.toFixed(1).padEnd(5)} | ${String(widthOk).padEnd(8)} | ${String(ratioOk).padEnd(12)} | ${String(linesOk).padEnd(12)} | ${overflow ? "YES(FAIL)" : "no"}`
  );
  if (r.errors && r.errors.length) { console.log(`   JS RUNTIME ERRORS at ${r.width}: ${r.errors.join(" | ")}`); anyFail = true; }
  if (r.netFails && r.netFails.length) { console.log(`   (informational, not a fail) sub-resource load failures at ${r.width}: ${r.netFails.join(" | ")}`); }
}

const btnSizeOk = before.btnFound && before.btnW >= 30 && before.btnH >= 30;
const toggleOk = before.hasDoneClassBefore === false && after.hasDoneClassAfter === true;
console.log(`\ndone-toggle button: found=${before.btnFound} size=${before.btnW.toFixed(1)}x${before.btnH.toFixed(1)} (need >=30x30) -> ${btnSizeOk ? "OK" : "FAIL"}`);
console.log(`click marks item done: before=${before.hasDoneClassBefore} after=${after.hasDoneClassAfter} -> ${toggleOk ? "OK" : "FAIL"}`);
console.log(`sub-note survived the toggle round-trip in the stubbed store: ${after.subnoteSurvived}`);
if (!btnSizeOk || !toggleOk) anyFail = true;

console.log(`\nOVERALL: ${anyFail ? "FAIL" : "PASS"}`);

await browser.close();
server.close();
process.exit(anyFail ? 1 : 0);
