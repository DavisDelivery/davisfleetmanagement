import puppeteer from "puppeteer";
import { buildHtml, startServer, CHROME_PATH, sleep } from "./harness.mjs";

const PORT = 8441;
const server = startServer(buildHtml({ slow: false }), PORT);
const browser = await puppeteer.launch({ executablePath: CHROME_PATH, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

for (const width of [320, 390, 430]) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  await sleep(500);

  const data = await page.evaluate(() => {
    function rect(el) { const r = el.getBoundingClientRect(); return { top: r.top, left: r.left, right: r.right, bottom: r.bottom }; }
    function gapOf(a, b) {
      const dx = Math.max(a.left - b.right, b.left - a.right, 0);
      const dy = Math.max(a.top - b.bottom, b.top - a.bottom, 0);
      if (dx === 0 && dy === 0) return 0;
      if (dx === 0) return dy; if (dy === 0) return dx;
      return Math.sqrt(dx * dx + dy * dy);
    }
    const card = document.getElementById("card-r1");
    const items = [...card.querySelectorAll(".note-entry")];
    const results = [];
    for (let i = 0; i < items.length - 1; i++) {
      const prev = items[i];
      // last interactive element in prev item (could be item-note-btn, or last subnote-del, or the note-more)
      const prevTrailers = [...prev.querySelectorAll(".item-note-btn, .subnote-del, .note-more")];
      const prevLast = prevTrailers[prevTrailers.length - 1];
      const nextActs = items[i + 1].querySelector(".note-acts");
      const nextEdit = items[i + 1].querySelector(".note-edit");
      const nextDel = items[i + 1].querySelector(".note-del");
      if (prevLast && nextActs) {
        results.push({
          pair: `item${i} last-control (${prevLast.className}) -> item${i + 1} note-edit`,
          gap: +gapOf(rect(prevLast), rect(nextEdit)).toFixed(1),
        });
        results.push({
          pair: `item${i} last-control (${prevLast.className}) -> item${i + 1} note-del`,
          gap: +gapOf(rect(prevLast), rect(nextDel)).toFixed(1),
        });
      }
    }
    return results;
  });
  console.log(`\n=== ${width}px: previous item's trailing control -> next item's ✎/✕ ===`);
  data.forEach(d => console.log(`  ${d.pair}: gap=${d.gap}px${d.gap < 8 ? "  <-- UNDER 8px" : ""}`));

  await page.close();
}

await browser.close();
server.close();
