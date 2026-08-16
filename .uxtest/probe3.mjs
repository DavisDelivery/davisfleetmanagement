import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";
import { buildHtml, startServer, CHROME_PATH, sleep } from "./harness.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = 8431;
const server = startServer(buildHtml({ slow: false }), PORT);
const browser = await puppeteer.launch({ executablePath: CHROME_PATH, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

for (const width of [320, 390, 430]) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: 900, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  await sleep(500);

  // item0 of r1 has 3 sub-notes: [long-name author, "TW" author, long-name author]
  const info = await page.evaluate(() => {
    const item = document.getElementById("note-r1-0");
    const subnotes = [...item.querySelectorAll(".subnote")];
    return subnotes.map(sn => {
      const meta = sn.querySelector(".subnote-meta");
      const ts = sn.querySelector(".subnote-ts");
      const by = sn.querySelector(".subnote-by");
      const del = sn.querySelector(".subnote-del");
      const metaR = meta.getBoundingClientRect();
      const tsR = ts.getBoundingClientRect();
      const byR = by ? by.getBoundingClientRect() : null;
      const delR = del.getBoundingClientRect();
      return {
        author: by ? by.textContent.trim() : "(none)",
        metaHeight: +metaR.height.toFixed(1),
        tsTop: +tsR.top.toFixed(1),
        byTop: byR ? +byR.top.toFixed(1) : null,
        delTop: +delR.top.toFixed(1),
        delLeft: +delR.left.toFixed(1),
        // does the delete button sit on its OWN line, separate from both ts and by?
        delOnOwnLine: byR ? (Math.abs(delR.top - byR.top) > 3 && Math.abs(delR.top - tsR.top) > 3) : (Math.abs(delR.top - tsR.top) > 3),
        emptyLineWastedPx: byR ? Math.max(0, delR.top - byR.top) : 0,
      };
    });
  });
  console.log(`\n=== ${width}px: subnote-meta layout for item0's 3 sub-notes ===`);
  info.forEach((s, i) => {
    console.log(`  subnote#${i} author="${s.author.slice(0, 40)}"  metaHeight=${s.metaHeight}px  ts.top=${s.tsTop} by.top=${s.byTop} del.top=${s.delTop}  del-on-own-line=${s.delOnOwnLine}  wasted-row-px=${s.emptyLineWastedPx}`);
  });

  if (width === 390) {
    const clip = await page.evaluate(() => {
      const sn = document.querySelectorAll("#note-r1-0 .subnote")[0];
      const r = sn.getBoundingClientRect();
      return { top: r.top, left: r.left, width: r.width, height: r.height };
    });
    await page.screenshot({ path: path.join(here, "shot-orphaned-delete-zoom.png"), clip: { x: Math.max(0, clip.left - 5), y: Math.max(0, clip.top - 5), width: clip.width + 10, height: Math.min(clip.height + 10, 400) } });
  }

  await page.close();
}

await browser.close();
server.close();
