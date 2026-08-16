import puppeteer from "puppeteer";
import { buildHtml, startServer, CHROME_PATH, sleep } from "./harness.mjs";

const PORT = 8412;
const server = startServer(buildHtml({ slow: false }), PORT);
const browser = await puppeteer.launch({ executablePath: CHROME_PATH, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

for (const width of [320, 390, 430]) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 700, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  await sleep(500);

  const byCheck = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll(".note-by, .subnote-by").forEach(el => {
      const r = el.getBoundingClientRect();
      const parentR = el.closest(".note-meta,.subnote-meta").getBoundingClientRect();
      results.push({ cls: el.className, text: el.textContent.trim().slice(0, 15), right: +r.right.toFixed(1), left: +r.left.toFixed(1), top: +r.top.toFixed(1), parentTop: +parentR.top.toFixed(1) });
    });
    const who = document.getElementById("who-bar");
    const whoR = who.getBoundingClientRect();
    return {
      results, vw: window.innerWidth, scrollW: document.documentElement.scrollWidth,
      who: { height: whoR.height, width: whoR.width, scrollW_after: document.documentElement.scrollWidth },
    };
  });
  const overflowing = byCheck.results.filter(r => r.right > byCheck.vw + 1 || r.left < -1);
  console.log(`\n=== ${width}px: note-by/subnote-by overflow check ===`);
  console.log(`viewport=${byCheck.vw} scrollW=${byCheck.scrollW} who-bar h=${byCheck.who.height}`);
  console.log(`long-name spans found: ${byCheck.results.filter(r=>r.text.includes("Christ")).length}, overflowing viewport: ${overflowing.length}`);
  if (overflowing.length) overflowing.forEach(o => console.log("  OVERFLOW:", JSON.stringify(o)));
  // does the author span wrap onto its own line (i.e. its top !== the meta container's top)?
  const wrapped = byCheck.results.filter(r => r.text.includes("Christ") && Math.abs(r.top - r.parentTop) > 3);
  console.log(`long-name spans that wrapped to their own line (top offset from container): ${wrapped.length} / ${byCheck.results.filter(r=>r.text.includes('Christ')).length}`);

  await page.close();
}

// item-note-input font-size (only exists after clicking "+ Note")
{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 1200, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  await sleep(500);
  await page.click("#itemnote-r1-3 .item-note-btn"); // item3 has no subnotes yet
  await sleep(200);
  const fontPx = await page.$eval("#ini-r1-3", el => parseFloat(getComputedStyle(el).fontSize));
  console.log(`\n=== dynamically-created .item-note-input font-size: ${fontPx}px ===`);

  // reason-select accessible name / label association check
  const reasonInfo = await page.evaluate(() => {
    const sel = document.querySelector(".reason-select");
    return {
      hasAriaLabel: sel.hasAttribute("aria-label"),
      hasAriaLabelledby: sel.hasAttribute("aria-labelledby"),
      hasTitle: sel.hasAttribute("title"),
      associatedLabel: !!document.querySelector(`label[for="${sel.id}"]`),
      id: sel.id || "(none)",
      currentValue: sel.value,
      accessibleNameGuess: sel.value, // browsers fall back to the selected option text
    };
  });
  console.log("reason-select accessibility:", JSON.stringify(reasonInfo, null, 2));

  // who-bar BEFORE js runs (pre-render accessible name) -- check raw served HTML
  const rawHtml = await (await fetch(`http://localhost:${PORT}/`)).text();
  const whoBarRaw = rawHtml.match(/<button class="who-bar unset" id="who-bar"[^>]*>([\s\S]*?)<\/button>/);
  console.log(`who-bar raw server-rendered content: ${JSON.stringify(whoBarRaw ? whoBarRaw[1] : null)} (empty = no accessible name until JS runs)`);

  await page.close();
}

await browser.close();
server.close();
