/**
 * Renders the REAL shop portal in Chromium at iPhone width with the exact long
 * mechanic write-up from the reported screenshot, and MEASURES the sub-note body:
 * a squeezed flex row produced a ~100px column and one word per line, so the check
 * is the rendered width of the text box and the number of lines it wraps to — not
 * a screenshot anyone has to squint at.
 */
import puppeteer from "puppeteer";
import { readFileSync, writeFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");

const LONG = "Driver states air leak is present. Went out to unit to verify complaint. Started unit and built-up air. Once the governor popped off, applied brakes and heard a loud air leak. Air leak is only present when brakes are applied attached to to apply brakes and began inspecting all brake chambers. All brake chambers were good found air leak at the control valve on the steer. Axle passenger side ordered parts. waiting on Parts.";
const ITEM = "Driver states air leak under the cab when brakes are applied";

let html = readFileSync(path.join(REPO, "mechanic/index.html"), "utf8");
html = html.replace(/<script src="https:\/\/www\.gstatic\.com\/firebasejs[^>]*><\/script>/g, "");
const STUB = `<script>
window.__KV = {
  "fl-trucks": JSON.stringify([{id:"5042",mk:"FRTLN",type:"straight",tr:"A",year:2012}]),
  "fl-repairs": JSON.stringify([{
    id:"r1", truckId:"5042", reason:"Mechanical Repair", shop:"Shop",
    dateIn:"2026-08-06T07:15:00.000Z", status:"open", openedBy:"Big papa",
    notesLog:[{ ts:"2026-08-06T07:15:00.000Z", text:${JSON.stringify(ITEM)}, by:"Big papa",
      notes:[{ ts:"2026-08-06T07:16:00.000Z", text:${JSON.stringify(LONG)}, by:"Big papa" }] }]
  }])
};
window.firebase = { initializeApp(){}, firestore(){ return window.__DB; } };
const mkDoc = (id) => ({
  async get(){ const v = window.__KV[id]; return { exists: v!==undefined, data: ()=>({v}) }; },
  async set(o){ window.__KV[id] = o.v; },
  onSnapshot(cb){ setTimeout(()=>cb({ exists: window.__KV[id]!==undefined, data: ()=>({v:window.__KV[id]}) }),0); return ()=>{}; }
});
window.__DB = { collection(){ return { doc: mkDoc, async get(){ return { forEach(){} }; } }; } };
window.firebase.firestore.FieldPath = { documentId: ()=>"__id" };
localStorage.setItem("fl-device-user","Big papa");
</script>`;
html = html.replace("</head>", STUB + "</head>");

const server = http.createServer((req, res) => { res.writeHead(200, { "Content-Type": "text/html" }); res.end(html); }).listen(8301);

const browser = await puppeteer.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

let pass = 0, fail = 0;
const t = (n, c, d = "") => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n}${d ? ` — ${d}` : ""}`); } };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Narrowest phone still in real use, plus a typical modern one.
for (const [label, width] of [["iPhone SE (320px)", 320], ["iPhone 14 (390px)", 390]]) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900, deviceScaleFactor: 2 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://localhost:8301/", { waitUntil: "networkidle0" });
  await sleep(900);

  console.log(`\n═ Shop portal @ ${label} ═`);
  const m = await page.evaluate(() => {
    const el = document.querySelector(".subnote-text");
    if (!el) return null;
    const cs = getComputedStyle(el);
    const lineH = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
    const card = document.querySelector(".repair-card");
    const item = document.querySelector(".note-text");
    // Longest word that fits tells us nothing; how many lines it took does.
    return {
      subW: el.getBoundingClientRect().width,
      subLines: Math.round(el.getBoundingClientRect().height / lineH),
      itemW: item ? item.getBoundingClientRect().width : 0,
      cardW: card ? card.getBoundingClientRect().width : 0,
      fontPx: parseFloat(cs.fontSize),
      words: (el.textContent || "").trim().split(/\s+/).length,
      docScrollW: document.documentElement.scrollWidth,
      viewportW: window.innerWidth,
    };
  });
  t("sub-note rendered", m !== null);
  if (m) {
    // A one-word-per-line ribbon means lines ≈ words. Wrapping normally at this
    // width should be far fewer lines than words.
    t(`body is not a one-word-per-line ribbon (${m.subLines} lines for ${m.words} words)`,
      m.subLines < m.words / 3, `lines=${m.subLines} words=${m.words}`);
    t(`body uses most of the card width (${Math.round(m.subW)}px of ${Math.round(m.cardW)}px)`,
      m.subW > m.cardW * 0.6, `sub=${Math.round(m.subW)} card=${Math.round(m.cardW)}`);
    t("body is at least 200px wide", m.subW >= 200, `${Math.round(m.subW)}px`);
    t("sub-note text is readable size (≥12px)", m.fontPx >= 12, `${m.fontPx}px`);
    t("page does not scroll sideways", m.docScrollW <= m.viewportW + 1, `scrollW=${m.docScrollW} vw=${m.viewportW}`);
  }
  t("no page errors", errors.length === 0, errors.slice(0, 2).join(" | "));

  // The whole point of the original complaint: the card must stay usable.
  const reach = await page.evaluate(() => {
    const btn = [...document.querySelectorAll("button")].find((b) => /Repair Completed/.test(b.textContent || ""));
    const card = document.querySelector(".repair-card");
    return btn && card ? { cardH: card.getBoundingClientRect().height } : null;
  });
  t("one long note does not blow the card past ~2.5 screens",
    reach && reach.cardH < 900 * 2.5, `cardH=${Math.round(reach?.cardH || 0)}px`);

  await page.screenshot({ path: path.join(here, `portal-${width}.png`), fullPage: true });
  await page.close();
}


// ── The markup moved; prove the controls still work, not just that they fit.
{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 900 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("dialog", async (d) => { await d.accept("Big papa"); });
  await page.goto("http://localhost:8301/", { waitUntil: "networkidle0" });
  await sleep(900);
  console.log("\n═ Controls still work after the layout change ═");
  t("done toggle present in the meta row", await page.$(".note-meta .item-done-btn") !== null);
  await page.click(".note-meta .item-done-btn");
  await sleep(500);
  t("ticking an item marks it done", await page.$("#note-r1-0.item-done") !== null);
  t("progress chip updated", (await page.$eval("#prog-r1", (e) => e.textContent.trim())) === "1/1 done");
  const stored = await page.evaluate(() => JSON.parse(window.__KV["fl-repairs"])[0].notesLog[0]);
  t("persisted done + who", stored.done === true && stored.doneBy === "Big papa");
  t("its sub-note survived the toggle", Array.isArray(stored.notes) && stored.notes.length === 1);
  await page.click(".note-meta .item-done-btn");
  await sleep(500);
  t("reopen works", await page.$("#note-r1-0.item-done") === null);
  await page.click("#itemnote-r1-0 .item-note-btn");
  await sleep(300);
  await page.type("#ini-r1-0", "Parts arrived, installing today");
  await page.click("#itemnote-r1-0 .btn-add");
  await sleep(600);
  const subs = await page.$$eval(".subnote-text", (n) => n.map((x) => x.textContent));
  t("a second sub-note can be added", subs.length === 2 && subs[1].includes("Parts arrived"), JSON.stringify(subs.map(s=>s.slice(0,20))));
  const w = await page.$$eval(".subnote-text", (n) => n.map((x) => Math.round(x.getBoundingClientRect().width)));
  t("both sub-notes render full width", w.every((x) => x >= 200), JSON.stringify(w));
  t("no page errors during interaction", errors.length === 0, errors.slice(0,2).join(" | "));
  await page.screenshot({ path: path.join(here, "portal-after-interaction.png"), fullPage: true });
  await page.close();
}

console.log(`\n${pass + fail} checks: ${pass} passed, ${fail} failed`);
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
