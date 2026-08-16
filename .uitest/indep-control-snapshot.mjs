// Small helper: just grabs a viewport-only (non-fullpage) screenshot of the OLD
// pre-fix code at 390px so it's a reasonably sized image to actually look at,
// instead of the ~16000px-tall full-page captures.
import puppeteer from "puppeteer";
import { readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = 8844;
const SUBNOTE = "Truck came in on a road call after the driver said the dash lit up with a check engine light and a reduced power message climbing the grade outside of town. Hooked up the reader before touching anything so we would not clear a code we might need later and pulled two stored faults, one for low boost pressure and one for a turbo actuator position that did not match commanded position.";
const ITEM_TEXT = "Reduced power / check engine light on grade climb — suspected turbo boost leak";
const truck = { id: "4471", mk: "INTL", type: "tractor", tr: "A", year: 2020 };
const repair = { id: "rep-verify-9", truckId: "4471", reason: "Mechanical Repair", shop: "North Yard", dateIn: "2026-08-04T14:30:00.000Z", status: "open", openedBy: "R. Ostrowski",
  notesLog: [{ ts: "2026-08-04T14:32:00.000Z", text: ITEM_TEXT, by: "R. Ostrowski", done: false, notes: [{ ts: "2026-08-04T15:10:00.000Z", text: SUBNOTE, by: "R. Ostrowski" }] }] };
let html = readFileSync(path.join(here, "index-prefix-baseline.html"), "utf8");
html = html.replace(/<script src="https:\/\/www\.gstatic\.com\/firebasejs[^>]*><\/script>/g, "");
const STUB = `<script>
window.__KV = { "fl-trucks": ${JSON.stringify(JSON.stringify([truck]))}, "fl-repairs": ${JSON.stringify(JSON.stringify([repair]))} };
window.firebase = { initializeApp(){}, firestore(){ return window.__DB; } };
function __mkDoc(id){ return { async get(){ const v=window.__KV[id]; return {exists:v!==undefined,data:()=>({v})}; }, async set(o){window.__KV[id]=o.v;}, onSnapshot(cb){ setTimeout(()=>cb({exists:window.__KV[id]!==undefined,data:()=>({v:window.__KV[id]})}),0); return ()=>{}; } }; }
window.__DB = { collection(){ return { doc: __mkDoc, async get(){ return {forEach(){}}; } }; } };
localStorage.setItem("fl-device-user","R. Ostrowski");
</script>`;
html = html.replace("</head>", STUB + "</head>");
const server = http.createServer((req,res)=>{res.writeHead(200,{"Content-Type":"text/html"});res.end(html);}).listen(PORT);
const browser = await puppeteer.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--no-sandbox","--disable-dev-shm-usage"] });
const page = await browser.newPage();
await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 2 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
await new Promise(r => setTimeout(r, 900));
await page.screenshot({ path: path.join(here, "CONTROL-baseline-390-viewport-only.png") }); // NOT fullPage — just what's on screen
await page.close();
await browser.close();
server.close();
console.log("done");
