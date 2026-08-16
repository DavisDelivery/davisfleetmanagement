/**
 * Layout / tap-target / contrast / overflow / reachability measurement pass
 * across three phone widths. Renders the REAL mechanic/index.html.
 */
import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";
import { buildHtml, startServer, CHROME_PATH, sleep } from "./harness.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = 8411;
const html = buildHtml({ slow: false });
const server = startServer(html, PORT);

const browser = await puppeteer.launch({
  executablePath: CHROME_PATH,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const WIDTHS = [
  ["320px (iPhone SE)", 320, 568],
  ["390px (iPhone 14)", 390, 844],
  ["430px (iPhone 14 Pro Max)", 430, 932],
];

function hr(t) { console.log(`\n${"=".repeat(8)} ${t} ${"=".repeat(Math.max(0, 70 - t.length))}`); }

const IN_PAGE = () => {
  function rect(el) {
    const r = el.getBoundingClientRect();
    return { top: +r.top.toFixed(1), left: +r.left.toFixed(1), right: +r.right.toFixed(1), bottom: +r.bottom.toFixed(1), width: +r.width.toFixed(1), height: +r.height.toFixed(1) };
  }
  function gapOf(a, b) {
    const dx = Math.max(a.left - b.right, b.left - a.right, 0);
    const dy = Math.max(a.top - b.bottom, b.top - a.bottom, 0);
    if (dx === 0 && dy === 0) return 0;
    if (dx === 0) return +dy.toFixed(1);
    if (dy === 0) return +dx.toFixed(1);
    return +Math.sqrt(dx * dx + dy * dy).toFixed(1);
  }

  // ---- Tap targets across whole page, grouped by class ----
  const classes = [".item-done-btn", ".note-del", ".note-edit", ".subnote-del", ".note-more",
    ".item-note-btn", ".btn-add", ".btn-complete", ".tab-btn", ".who-bar", ".reason-select",
    ".note-save", ".note-cancel", ".btn-log"];
  const tapTargets = {};
  classes.forEach(sel => {
    tapTargets[sel] = [...document.querySelectorAll(sel)]
      .filter(el => el.offsetParent !== null || sel === ".who-bar")
      .map(el => ({ ...rect(el), text: (el.textContent || el.getAttribute("aria-label") || "").trim().slice(0, 30) }));
  });

  // ---- Named adjacency checks on the busiest repair card (r1: 6 work items).
  // NOTE: cards are grouped into "Box Trucks" then "Tractors" sections, so the
  // first .repair-card in DOM order is not necessarily the busiest one — target
  // r1 explicitly by id.
  const card = document.getElementById("card-r1");
  const adjacency = [];
  if (card) {
    const items = [...card.querySelectorAll(".note-entry")];
    items.forEach((item, i) => {
      const done = item.querySelector(".item-done-btn");
      const edit = item.querySelector(".note-edit");
      const del2 = item.querySelector(".note-del");
      if (edit && del2) adjacency.push({ pair: `item${i}: note-edit (✎) <-> note-del (✕)`, gap: gapOf(rect(edit), rect(del2)), a: rect(edit), b: rect(del2) });
      if (done && edit) adjacency.push({ pair: `item${i}: item-done-btn (✓) <-> note-edit (✎)`, gap: gapOf(rect(done), rect(edit)), a: rect(done), b: rect(edit) });
      if (done && del2) adjacency.push({ pair: `item${i}: item-done-btn (✓) <-> note-del (✕)`, gap: gapOf(rect(done), rect(del2)), a: rect(done), b: rect(del2) });
      const subDels = [...item.querySelectorAll(".subnote-del")];
      subDels.forEach((sd, si) => {
        if (si > 0) adjacency.push({ pair: `item${i}: subnote-del#${si - 1} <-> subnote-del#${si}`, gap: gapOf(rect(subDels[si - 1]), rect(sd)) });
      });
      // vertical gap to the NEXT item's done-btn (do consecutive items crowd each other?)
      const next = items[i + 1];
      if (next) {
        const nDone = next.querySelector(".item-done-btn");
        if (done && nDone) adjacency.push({ pair: `item${i}->item${i + 1}: item-done-btn <-> next item-done-btn`, gap: gapOf(rect(done), rect(nDone)) });
        if (del2 && nDone) adjacency.push({ pair: `item${i}->item${i + 1}: note-del <-> next item-done-btn`, gap: gapOf(rect(del2), rect(nDone)) });
      }
    });
  }
  // tab-btn adjacency
  const tabs = [...document.querySelectorAll(".tab-btn")];
  for (let i = 0; i < tabs.length - 1; i++) {
    adjacency.push({ pair: `tab-btn#${i} <-> tab-btn#${i + 1}`, gap: gapOf(rect(tabs[i]), rect(tabs[i + 1])) });
  }

  // ---- Overflow ----
  const docScrollW = document.documentElement.scrollWidth;
  const vw = window.innerWidth;
  const offenders = [];
  document.querySelectorAll("body *").forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    if (r.right > vw + 1 || r.left < -1) {
      offenders.push({ tag: el.tagName, cls: (el.className || "").toString().slice(0, 40), left: +r.left.toFixed(1), right: +r.right.toFixed(1), overflowPx: +Math.max(r.right - vw, -r.left).toFixed(1), text: (el.textContent || "").trim().slice(0, 50) });
    }
  });
  offenders.sort((a, b) => b.overflowPx - a.overflowPx);

  // ---- Reachability: ✓ Repair Completed on the busiest (first) card ----
  const busyBtn = card ? card.querySelector(".btn-complete") : null;
  const reach = busyBtn ? { top: +(busyBtn.getBoundingClientRect().top + window.scrollY).toFixed(0), cardHeight: +card.getBoundingClientRect().height.toFixed(0) } : null;
  const docHeight = document.documentElement.scrollHeight;

  // ---- iOS zoom-on-focus: font-size of every form control ----
  const fields = [...document.querySelectorAll("input, select, textarea")].map(el => {
    const cs = getComputedStyle(el);
    return { tag: el.tagName, id: el.id || null, cls: (el.className || "").toString(), fontPx: parseFloat(cs.fontSize), type: el.type || null, visible: el.offsetParent !== null };
  });

  // ---- Contrast ----
  function parseColor(str) {
    const m = str.match(/rgba?\(([^)]+)\)/);
    if (!m) return { r: 0, g: 0, b: 0, a: 0 };
    const p = m[1].split(",").map(s => parseFloat(s.trim()));
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }
  function over(top, bottom) {
    const a = top.a;
    return { r: top.r * a + bottom.r * (1 - a), g: top.g * a + bottom.g * (1 - a), b: top.b * a + bottom.b * (1 - a), a: 1 };
  }
  function effectiveBg(el) {
    const chain = [];
    let cur = el;
    while (cur) { chain.unshift(cur); cur = cur.parentElement; }
    let acc = { r: 255, g: 255, b: 255, a: 1 };
    chain.forEach(node => {
      const bg = parseColor(getComputedStyle(node).backgroundColor);
      if (bg.a > 0) acc = over(bg, acc);
    });
    return acc;
  }
  function srgbToLin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
  function relLum(c) { return 0.2126 * srgbToLin(c.r) + 0.7152 * srgbToLin(c.g) + 0.0722 * srgbToLin(c.b); }
  function contrastRatio(c1, c2) { const L1 = relLum(c1), L2 = relLum(c2); const hi = Math.max(L1, L2), lo = Math.min(L1, L2); return (hi + 0.05) / (lo + 0.05); }

  const contrastTargets = [
    [".note-ts", "note timestamp"], [".subnote-ts", "sub-note timestamp"],
    [".note-by", "note author (— by)"], [".subnote-by", "sub-note author (— by)"],
    [".truck-sub", "truck sub-label"], [".meta-item", "card meta (In:/Est return)"],
    [".shop-label", "'Shop:' label"], [".empty-notes", "empty-notes italic text"],
    [".who-hint", "who-bar hint text"], [".age-chip.old", "age chip (old/red)"],
    [".age-chip.mid", "age chip (mid/yellow)"], [".age-chip.fresh", "age chip (fresh/green)"],
    [".tab-btn:not(.active)", "inactive tab text"], [".section-label", "section label"],
    [".header-sub", "header subtitle URL"], [".form-label", "form field label"],
    [".item-progress", "progress chip (N/M done)"], [".closed-chip", "CLOSED chip"],
    [".reason-badge", "reason badge"], [".truck-num", "truck number (brand blue)"],
  ];
  const contrast = contrastTargets.map(([sel, label]) => {
    const el = document.querySelector(sel);
    if (!el) return { sel, label, missing: true };
    const cs = getComputedStyle(el);
    let color = parseColor(cs.color);
    const bg = effectiveBg(el);
    const op = parseFloat(cs.opacity);
    if (op < 1) color = over({ ...color, a: op }, bg);
    const ratio = contrastRatio(color, bg);
    const fontPx = parseFloat(cs.fontSize);
    const weight = parseInt(cs.fontWeight, 10) || 400;
    const isLarge = fontPx >= 24 || (fontPx >= 18.66 && weight >= 700);
    return { sel, label, ratio: +ratio.toFixed(2), fontPx, weight, isLarge, aaThreshold: isLarge ? 3.0 : 4.5, color: cs.color, bg: `rgb(${bg.r.toFixed(0)},${bg.g.toFixed(0)},${bg.b.toFixed(0)})` };
  });

  // ---- placeholder contrast (note-input, shop-input) ----
  const placeholderEls = [".note-input", ".shop-input", ".item-note-input", ".form-input"];
  const placeholders = placeholderEls.map(sel => {
    const el = document.querySelector(sel);
    if (!el) return { sel, missing: true };
    const cs = getComputedStyle(el, "::placeholder");
    return { sel, color: cs.color, fontPx: parseFloat(cs.fontSize) };
  });

  return { tapTargets, adjacency, docScrollW, vw, offenders: offenders.slice(0, 10), reach, docHeight, fields, contrast, placeholders };
};

for (const [label, width, height] of WIDTHS) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 2 });
  const pageErrors = [];
  page.on("pageerror", (e) => pageErrors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") pageErrors.push("[console] " + m.text()); });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  await sleep(700);

  hr(`WIDTH ${width} — ${label}`);
  if (pageErrors.length) console.log("PAGE ERRORS:", pageErrors);

  const data = await page.evaluate(IN_PAGE);

  console.log(`\n-- Horizontal overflow --`);
  console.log(`document.documentElement.scrollWidth=${data.docScrollW}  window.innerWidth=${data.vw}  ${data.docScrollW > data.vw + 1 ? "OVERFLOW " + (data.docScrollW - data.vw) + "px" : "OK (no overflow)"}`);
  if (data.offenders.length) {
    console.log("Elements wider than viewport / off left edge:");
    data.offenders.forEach(o => console.log(`  <${o.tag} class="${o.cls}"> overflow=${o.overflowPx}px  left=${o.left} right=${o.right}  text="${o.text}"`));
  }

  console.log(`\n-- Reachability (busiest card, r1) --`);
  if (data.reach) {
    const screens = (data.reach.top / height).toFixed(2);
    console.log(`✓ Repair Completed button: top=${data.reach.top}px from document top  (${screens} viewport-heights of scrolling @ ${height}px tall)`);
    console.log(`r1 card total height: ${data.reach.cardHeight}px`);
  }
  console.log(`document total scrollHeight: ${data.docHeight}px`);

  console.log(`\n-- Tap target sizes (min observed per class, W x H) --`);
  Object.entries(data.tapTargets).forEach(([sel, els]) => {
    if (!els.length) { console.log(`  ${sel}: (none rendered/visible)`); return; }
    const minW = Math.min(...els.map(e => e.width));
    const minH = Math.min(...els.map(e => e.height));
    const under40 = els.filter(e => e.width < 40 || e.height < 40).length;
    console.log(`  ${sel}: n=${els.length}  min=${minW.toFixed(1)}x${minH.toFixed(1)}px  ${under40}/${els.length} under 40x40px`);
  });

  console.log(`\n-- Adjacency / gaps between nearby interactive controls --`);
  data.adjacency.forEach(a => {
    const flag = a.gap < 8 ? "  <-- UNDER 8px" : "";
    console.log(`  ${a.pair}: gap=${a.gap}px${flag}`);
  });

  console.log(`\n-- iOS zoom-on-focus risk: form control font-sizes --`);
  data.fields.filter(f => f.visible).forEach(f => {
    const flag = f.fontPx < 16 ? "  <-- UNDER 16px, iOS Safari WILL zoom on focus" : "";
    console.log(`  <${f.tag}${f.type ? ` type=${f.type}` : ""} id="${f.id}" class="${f.cls}">: ${f.fontPx}px${flag}`);
  });
  console.log(`  placeholders:`);
  data.placeholders.forEach(p => console.log(`    ${p.sel}: color=${p.color} font=${p.fontPx}px`));

  console.log(`\n-- Contrast ratios (text vs effective composited background) --`);
  data.contrast.forEach(c => {
    if (c.missing) { console.log(`  ${c.sel}: (not present in this seed)`); return; }
    const pass = c.ratio >= c.aaThreshold;
    console.log(`  ${c.label.padEnd(28)} ${c.sel.padEnd(26)} ratio=${c.ratio.toFixed(2)}:1  need>=${c.aaThreshold}  font=${c.fontPx}px/w${c.weight}  ${c.color} on ${c.bg}  ${pass ? "PASS" : "FAIL AA"}`);
  });

  // Screenshots: top of page, and full page (for the record).
  await page.screenshot({ path: path.join(here, `shot-${width}-top.png`) });
  await page.screenshot({ path: path.join(here, `shot-${width}-full.png`), fullPage: true });

  // Scroll to the note-acts cluster (✎/✕) of item 0 and take a tight, zoomed clip.
  const clip1 = await page.evaluate(() => {
    const el = document.querySelector("#card-r1 .note-entry .note-acts");
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: r.top, left: r.left, width: r.width, height: r.height };
  });
  if (clip1) {
    await page.screenshot({
      path: path.join(here, `shot-${width}-noteacts-zoom.png`),
      clip: { x: Math.max(0, clip1.left - 40), y: Math.max(0, clip1.top - 30), width: Math.min(width, clip1.width + 80), height: clip1.height + 60 },
    });
  }

  // Scroll to item 4 (4 sub-notes) to see subnote stacking + subnote-del proximity.
  await page.evaluate(() => {
    const items = document.querySelectorAll("#card-r1 .note-entry");
    items[4] && items[4].scrollIntoView({ block: "start" });
  });
  await sleep(150);
  await page.screenshot({ path: path.join(here, `shot-${width}-subnotes.png`) });

  // Scroll to the bottom of r1 to see the note-input row + Repair Completed button.
  await page.evaluate(() => {
    const btn = document.querySelector("#card-r1 .btn-complete");
    btn && btn.scrollIntoView({ block: "end" });
  });
  await sleep(150);
  await page.screenshot({ path: path.join(here, `shot-${width}-complete-btn.png`) });

  await page.close();
}

// One representative width for the other tabs (History / Log New Repair) and long-name overflow check.
{
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  await sleep(700);
  hr("Log New Repair tab @ 390px");
  await page.click("#tab-log");
  await sleep(200);
  await page.screenshot({ path: path.join(here, "shot-log-tab.png") });
  const logFields = await page.evaluate(() => [...document.querySelectorAll("#panel-log input, #panel-log select")].map(el => ({ id: el.id, fontPx: parseFloat(getComputedStyle(el).fontSize) })));
  console.log(JSON.stringify(logFields, null, 2));

  hr("History tab @ 390px");
  await page.click("#tab-history");
  await sleep(200);
  await page.screenshot({ path: path.join(here, "shot-history-tab.png") });
  const histOverflow = await page.evaluate(() => ({ scrollW: document.documentElement.scrollWidth, vw: window.innerWidth }));
  console.log("history overflow check:", JSON.stringify(histOverflow));

  hr("who-bar long device-user name — overflow check");
  await page.click("#tab-open");
  await sleep(200);
  const whoCheck = await page.evaluate(() => {
    const el = document.getElementById("who-bar");
    const r = el.getBoundingClientRect();
    return { text: el.textContent.trim(), width: r.width, height: r.height, scrollW: document.documentElement.scrollWidth, vw: window.innerWidth };
  });
  console.log(JSON.stringify(whoCheck, null, 2));

  // note-by / subnote-by overflow with the long device-user name specifically
  const byCheck = await page.evaluate(() => {
    const results = [];
    document.querySelectorAll(".note-by, .subnote-by").forEach(el => {
      const r = el.getBoundingClientRect();
      results.push({ cls: el.className, text: el.textContent.trim(), right: +r.right.toFixed(1), width: +r.width.toFixed(1) });
    });
    return { results, vw: window.innerWidth, scrollW: document.documentElement.scrollWidth };
  });
  hr("note-by / subnote-by rendered width vs viewport (long author name)");
  console.log(`viewport=${byCheck.vw}px  document.scrollWidth=${byCheck.scrollW}px`);
  byCheck.results.forEach(r => {
    const overflow = r.right > byCheck.vw + 1;
    console.log(`  ${r.cls}: "${r.text}" width=${r.width}px right-edge=${r.right}px ${overflow ? `<-- OVERFLOWS viewport by ${(r.right - byCheck.vw).toFixed(1)}px` : "(within viewport)"}`);
  });

  await page.close();
}

await browser.close();
server.close();
console.log("\nDONE — measure.mjs");
