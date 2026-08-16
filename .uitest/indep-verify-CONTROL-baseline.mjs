/**
 * CONTROL test — NOT part of the PASS/FAIL verdict on the fix.
 *
 * Renders the OLD pre-fix mechanic/index.html (git commit 9752d2b, parent of the fix
 * commit) with the exact same fixture/stub/measurement code as indep-verify.mjs, to
 * prove the measurement method actually detects the reported bug when it's present —
 * i.e. that indep-verify.mjs reporting PASS isn't just a harness that always passes.
 */
import puppeteer from "puppeteer";
import { readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = 8843;

const SUBNOTE = "Truck came in on a road call after the driver said the dash lit up with a check engine light and a reduced power message climbing the grade outside of town. Hooked up the reader before touching anything so we would not clear a code we might need later and pulled two stored faults, one for low boost pressure and one for a turbo actuator position that did not match commanded position. Started the engine cold and let it idle while watching live boost and actuator data on the scan tool, actuator was hunting back and forth about four percent instead of holding steady like the other trucks in the yard with the same engine. Popped the charge air cooler piping loose at the coupler behind the steer tire and found the boot cracked most of the way around on the bottom side where you cannot see it without a mirror, that explained the boost bleeding off under load even though the actuator itself is probably fine and just chasing a leak it cannot fix. Pulled both charge air cooler boots front and rear, both showed the same heat cracking, ribs flattened out and brittle instead of soft like new rubber, looks like they have never been changed since the truck left the factory going by the mileage on the sticker in the door jamb. Ordered a full set of silicone couplers instead of the factory rubber ones since silicone holds up a lot better under the heat cycling this truck sees running mountain grades every week, plus new t-bolt clamps since the old worm gear clamps were rusted and would not torque evenly anymore. While the piping was off, inspected the intercooler core itself for oil residue that would point to a turbo seal problem, core was clean and dry, no oil film anywhere, which is a good sign the turbo bearings and seals are still healthy and this is purely a piping leak and not something more expensive. Reinstalled everything with the new couplers and clamps, cleared the stored codes, and ran the truck up through the gears in the yard while watching boost pressure climb cleanly with no hesitation and no fault lights coming back. Test drove it up the on ramp grade nearby to load the engine the same way the driver described and boost held steady through the whole pull with no reduced power event. Driver is scheduled to take it back out first thing tomorrow so wanted to get eyes on it again before it leaves in case the actuator code comes back once it heats fully up and cycles a few more times under real load.";

const ITEM_TEXT = "Reduced power / check engine light on grade climb — suspected turbo boost leak";
const truck = { id: "4471", mk: "INTL", type: "tractor", tr: "A", year: 2020 };
const repair = {
  id: "rep-verify-9", truckId: "4471", reason: "Mechanical Repair", shop: "North Yard",
  dateIn: "2026-08-04T14:30:00.000Z", status: "open", openedBy: "R. Ostrowski",
  notesLog: [{
    ts: "2026-08-04T14:32:00.000Z", text: ITEM_TEXT, by: "R. Ostrowski", done: false,
    notes: [{ ts: "2026-08-04T15:10:00.000Z", text: SUBNOTE, by: "R. Ostrowski" }],
  }],
};

let html = readFileSync(path.join(here, "index-prefix-baseline.html"), "utf8");
html = html.replace(/<script src="https:\/\/www\.gstatic\.com\/firebasejs[^>]*><\/script>/g, "");
const STUB = `<script>
window.__KV = {
  "fl-trucks": ${JSON.stringify(JSON.stringify([truck]))},
  "fl-repairs": ${JSON.stringify(JSON.stringify([repair]))}
};
window.firebase = { initializeApp(){}, firestore(){ return window.__DB; } };
function __mkDoc(id) {
  return {
    async get() { const v = window.__KV[id]; return { exists: v !== undefined, data: () => ({ v }) }; },
    async set(o) { window.__KV[id] = o.v; },
    onSnapshot(cb) { setTimeout(() => cb({ exists: window.__KV[id] !== undefined, data: () => ({ v: window.__KV[id] }) }), 0); return () => {}; },
  };
}
window.__DB = { collection() { return { doc: __mkDoc, async get() { return { forEach(){} }; } }; } };
localStorage.setItem("fl-device-user", "R. Ostrowski");
</script>`;
html = html.replace("</head>", STUB + "</head>");

const server = http.createServer((req, res) => { res.writeHead(200, { "Content-Type": "text/html" }); res.end(html); }).listen(PORT);
const browser = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox", "--disable-dev-shm-usage"] });

for (const width of [320, 390]) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 900));
  const m = await page.evaluate(() => {
    const sub = document.querySelector(".subnote-text");
    const card = document.querySelector(".repair-card");
    if (!sub || !card) return { found: false };
    const cs = getComputedStyle(sub);
    const lineH = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
    const subRect = sub.getBoundingClientRect();
    const cardRect = card.getBoundingClientRect();
    const words = (sub.textContent || "").trim().split(/\s+/).filter(Boolean).length;
    return {
      found: true, subW: subRect.width, subH: subRect.height,
      lines: Math.round(subRect.height / lineH), words, cardW: cardRect.width,
      docScrollW: document.documentElement.scrollWidth, docScrollH: document.documentElement.scrollHeight,
      viewportW: window.innerWidth,
    };
  });
  console.log(`OLD pre-fix code @ ${width}px:`, JSON.stringify(m));
  await page.screenshot({ path: path.join(here, `CONTROL-baseline-${width}.png`), fullPage: true });
  await page.close();
}
await browser.close();
server.close();
