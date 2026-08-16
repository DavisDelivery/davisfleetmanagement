// Independent verification: render the REAL App.jsx (esbuild-transformed, not
// bundled) in real Chromium, seed one open repair whose work item has a single
// 300+ word sub-note, navigate to Maintenance -> Open Repairs, and MEASURE the
// sub-note body element's rendered width / wrapped line count / containing
// card width at 1280px and 420px. No className hooks exist in this app (all
// inline styles), so elements are located structurally: the sub-note body by
// its exact seeded text content (leaf node), the card by climbing to the
// nearest ancestor with the repair-card's 4px left border.
import puppeteer from "puppeteer";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import * as seed from "./seed.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = 8735;
const BASE = `http://localhost:${PORT}/`;
const CHROME = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

function waitForServer(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  return new Promise((resolve, reject) => {
    const tryOnce = () => {
      http_get(url)
        .then(() => resolve())
        .catch((e) => {
          if (Date.now() > deadline) reject(e);
          else setTimeout(tryOnce, 100);
        });
    };
    tryOnce();
  });
}
function http_get(url) {
  return new Promise((resolve, reject) => {
    import("http").then(({ default: http }) => {
      const req = http.get(url, (res) => {
        res.resume();
        resolve(res.statusCode);
      });
      req.on("error", reject);
      req.setTimeout(1000, () => req.destroy(new Error("timeout")));
    });
  });
}

const results = { widths: {}, mountOk: null, seedWordCount: seed.wordCount(seed.LONG_NOTE) };
let serverProc, browser;

try {
  serverProc = spawn("node", [path.join(here, "server.mjs")], {
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  serverProc.stdout.on("data", (d) => process.stdout.write(`[server] ${d}`));
  serverProc.stderr.on("data", (d) => process.stderr.write(`[server:err] ${d}`));
  await waitForServer(BASE, 10000);
  console.log(`Server up at ${BASE}`);

  browser = await puppeteer.launch({
    executablePath: CHROME,
    args: ["--no-sandbox", "--disable-dev-shm-usage"],
  });

  for (const width of [1280, 420]) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: 1000, deviceScaleFactor: 1 });

    const consoleMsgs = [];
    const pageErrors = [];
    page.on("console", (msg) => consoleMsgs.push({ type: msg.type(), text: msg.text() }));
    page.on("pageerror", (err) => pageErrors.push(err.message || String(err)));
    page.on("dialog", async (d) => {
      try {
        await d.dismiss();
      } catch (e) {}
    });

    await page.goto(BASE, { waitUntil: "networkidle0", timeout: 30000 });

    // Wait for the app to get past `if(!loaded) return <spinner>` and render
    // the real header/tabs, or for a mount error to be captured.
    let mounted = true;
    try {
      await page.waitForFunction(
        () => {
          if (window.__mountError) return true;
          const btns = [...document.querySelectorAll("button")];
          return btns.some((b) => (b.textContent || "").trim().startsWith("Dispatch"));
        },
        { timeout: 15000 }
      );
    } catch (e) {
      mounted = false;
    }

    const mountError = await page.evaluate(() => window.__mountError);
    if (mountError) {
      results.mountOk = false;
      results.mountError = mountError;
      console.log(`\n=== width ${width}: APP FAILED TO MOUNT ===`);
      console.log(mountError);
      await page.close();
      continue;
    }
    if (!mounted) {
      results.mountOk = false;
      results.mountError = "Timed out waiting for Dispatch tab / loaded UI to appear (loaded flag never became true?)";
      console.log(`\n=== width ${width}: APP DID NOT REACH LOADED STATE ===`);
      await page.close();
      continue;
    }
    results.mountOk = true;

    // Click the smallest/most-specific clickable element whose text is "Maintenance".
    // (The tab button's own text is "Maintenance" + an open-repairs count badge in a
    // child <span>, e.g. "Maintenance1" as flattened textContent, so match by prefix
    // rather than exact equality.)
    const clickedMaint = await page.evaluate(() => {
      const candidates = [...document.querySelectorAll("button, a, div, span")].filter((el) => {
        const t = (el.textContent || "").trim();
        return t === "Maintenance" || t.startsWith("Maintenance");
      });
      if (candidates.length === 0) return false;
      candidates.sort((a, b) => a.textContent.length - b.textContent.length || (a.getBoundingClientRect().width * a.getBoundingClientRect().height) - (b.getBoundingClientRect().width * b.getBoundingClientRect().height));
      candidates[0].click();
      return true;
    });
    if (!clickedMaint) {
      results.widths[width] = { error: 'Could not find any element with text "Maintenance" to click.' };
      await page.close();
      continue;
    }

    await page.waitForFunction(() => document.body.textContent.includes("Open Repairs"), { timeout: 5000 }).catch(() => {});

    // If repair cards aren't visible yet, the Open Repairs section may need expanding.
    let cardsVisible = await page.evaluate((truckId) => document.body.textContent.includes("#" + truckId), seed.TRUCK_ID);
    if (!cardsVisible) {
      const clickedExpand = await page.evaluate(() => {
        const el = [...document.querySelectorAll("*")].find((e) => (e.textContent || "").includes("Open Repairs") && e.children.length <= 2);
        if (el) {
          el.click();
          return true;
        }
        return false;
      });
      if (clickedExpand) {
        await new Promise((r) => setTimeout(r, 300));
        cardsVisible = await page.evaluate((truckId) => document.body.textContent.includes("#" + truckId), seed.TRUCK_ID);
      }
    }

    // Give layout a moment to settle, then measure.
    await new Promise((r) => setTimeout(r, 300));

    const measurement = await page.evaluate((longNote, truckId) => {
      const target = longNote.trim();
      // Leaf element (no element children) whose text matches the seeded note exactly.
      const all = [...document.querySelectorAll("div,span,p")];
      const subEl = all.find((el) => el.children.length === 0 && (el.textContent || "").trim() === target);
      if (!subEl) {
        return { found: false, bodyText: document.body.innerText.slice(0, 2000) };
      }
      const cs = getComputedStyle(subEl);
      const rect = subEl.getBoundingClientRect();
      // Climb to the nearest ancestor with the repair-card's 4px left border.
      let card = subEl.parentElement;
      let hops = 0;
      while (card && hops < 12) {
        const ccs = getComputedStyle(card);
        if (parseFloat(ccs.borderLeftWidth) >= 3.5 && parseFloat(ccs.borderLeftWidth) <= 4.5 && ccs.borderLeftStyle === "solid") break;
        card = card.parentElement;
        hops++;
      }
      const cardRect = card ? card.getBoundingClientRect() : null;
      const lineHeightPx = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
      const words = target.split(/\s+/).filter(Boolean).length;
      // Locate the "Repair Completed" button to sanity check the card stays reachable.
      const completedBtn = [...document.querySelectorAll("button")].find((b) => /Repair Completed/.test(b.textContent || ""));
      return {
        found: true,
        subRectWidth: rect.width,
        subRectHeight: rect.height,
        lineHeightPx,
        fontSizePx: parseFloat(cs.fontSize),
        whiteSpace: cs.whiteSpace,
        overflowWrap: cs.overflowWrap,
        words,
        cardFound: !!card,
        cardWidth: cardRect ? cardRect.width : null,
        cardHeight: cardRect ? cardRect.height : null,
        cardBorderLeftWidth: card ? getComputedStyle(card).borderLeftWidth : null,
        docScrollWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        completedBtnFound: !!completedBtn,
        subRect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        cardRectForClip: cardRect ? { x: cardRect.x, y: cardRect.y, width: cardRect.width, height: cardRect.height } : null,
      };
    }, seed.LONG_NOTE, seed.TRUCK_ID);

    results.widths[width] = {
      cardsVisible,
      measurement,
      consoleErrors: consoleMsgs.filter((m) => m.type === "error"),
      consoleAll: consoleMsgs,
      pageErrors,
    };

    // Screenshots: full page, and a tight crop on the card if we found one.
    await page.screenshot({ path: path.join(here, `screenshot-${width}-full.png`), fullPage: true });
    if (measurement.found && measurement.cardFound && measurement.cardRectForClip) {
      const r = measurement.cardRectForClip;
      const clip = {
        x: Math.max(0, Math.floor(r.x) - 4),
        y: Math.max(0, Math.floor(r.y) - 4),
        width: Math.min(Math.ceil(r.width) + 8, width - Math.max(0, Math.floor(r.x) - 4)),
        height: Math.min(Math.ceil(r.height) + 8, 1000 - Math.max(0, Math.floor(r.y) - 4)),
      };
      if (clip.width > 0 && clip.height > 0) {
        await page.screenshot({ path: path.join(here, `screenshot-${width}-card.png`), clip });
      }
    }

    await page.close();
  }

  // ── Bonus smoke-check: the fix rearranged the ✓ toggle and ✕ delete button
  // positions (left gutter -> inline in the meta row). Confirm those controls,
  // and adding a second sub-note, still work post-rearrange and that the new
  // note also renders wide (not just the first one). Pre-seed a device name so
  // ensureDeviceUser() doesn't block on its own custom (non-native) modal.
  {
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => localStorage.setItem("fl-device-user", "Test Tech"));
    await page.setViewport({ width: 420, height: 1000 });
    const consoleMsgs = [];
    const pageErrors = [];
    page.on("console", (msg) => consoleMsgs.push({ type: msg.type(), text: msg.text() }));
    page.on("pageerror", (err) => pageErrors.push(err.message || String(err)));
    await page.goto(BASE, { waitUntil: "networkidle0", timeout: 30000 });
    await page.waitForFunction(() => [...document.querySelectorAll("button")].some((b) => (b.textContent || "").trim().startsWith("Dispatch")), { timeout: 15000 });
    await page.evaluate(() => {
      const b = [...document.querySelectorAll("button")].find((x) => (x.textContent || "").trim().startsWith("Maintenance"));
      b.click();
    });
    await page.waitForFunction((truckId) => document.body.textContent.includes("#" + truckId), { timeout: 5000 }, seed.TRUCK_ID);

    // Toggle the work item's own done checkbox (moved by this fix too), then reopen it.
    const toggleResult = await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => b.title === "Mark this item done");
      if (!btn) return { found: false };
      btn.click();
      return { found: true };
    });
    await new Promise((r) => setTimeout(r, 400));
    const afterDone = await page.evaluate(() => !![...document.querySelectorAll("button")].find((b) => b.title === "Reopen this item"));
    await page.evaluate(() => {
      const btn = [...document.querySelectorAll("button")].find((b) => b.title === "Reopen this item");
      if (btn) btn.click();
    });
    await new Promise((r) => setTimeout(r, 400));

    // Add a second sub-note via the "+ Note" control.
    const SECOND_NOTE = "Replacement chamber arrived this morning, installed and torqued to spec, bled the system and re-tested at full governor cut-out pressure with no leaks audible or visible with soapy water on any of the four chambers.";
    const addNoteResult = await page.evaluate((noteText) => {
      const plus = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "＋ Note");
      if (!plus) return { openedInput: false };
      plus.click();
      return { openedInput: true };
    }, SECOND_NOTE);
    await new Promise((r) => setTimeout(r, 200));
    if (addNoteResult.openedInput) {
      await page.evaluate(() => document.querySelector('input[placeholder^="Note on"]'))
        .then(async () => {
          await page.type('input[placeholder^="Note on"]', SECOND_NOTE);
        })
        .catch(() => {});
      await page.evaluate(() => {
        const addBtn = [...document.querySelectorAll("button")].find((b) => (b.textContent || "").trim() === "Add" && b.closest("div")?.querySelector('input[placeholder^="Note on"]'));
        if (addBtn) addBtn.click();
      });
      await new Promise((r) => setTimeout(r, 400));
    }

    const afterAdd = await page.evaluate((noteText) => {
      const all = [...document.querySelectorAll("div,span,p")];
      const el = all.find((e) => e.children.length === 0 && (e.textContent || "").trim() === noteText.trim());
      if (!el) return { found: false };
      const rect = el.getBoundingClientRect();
      return { found: true, width: rect.width };
    }, SECOND_NOTE);

    results.interaction = {
      doneToggleFound: toggleResult.found,
      doneToggleWorked: afterDone === true,
      secondNoteInputOpened: addNoteResult.openedInput,
      secondNoteRendered: afterAdd.found,
      secondNoteWidth: afterAdd.width || null,
      consoleErrors: consoleMsgs.filter((m) => m.type === "error"),
      pageErrors,
    };
    await page.screenshot({ path: path.join(here, "screenshot-interaction.png"), fullPage: true });
    await page.close();
  }
} finally {
  if (browser) await browser.close();
  if (serverProc) serverProc.kill();
}

// ── Report ──
console.log("\n\n================ REPORT ================");
console.log(`Seed note word count: ${results.seedWordCount}`);
console.log(`App mounted: ${results.mountOk}`);
if (results.mountError) console.log(`Mount error: ${results.mountError}`);

let overallPass = results.mountOk === true;
for (const width of [1280, 420]) {
  const w = results.widths[width];
  console.log(`\n--- width ${width}px ---`);
  if (!w) {
    console.log("NO DATA (mount failed before reaching this width)");
    overallPass = false;
    continue;
  }
  if (w.error) {
    console.log(`ERROR: ${w.error}`);
    overallPass = false;
    continue;
  }
  console.log(`cardsVisible after tab click: ${w.cardsVisible}`);
  const m = w.measurement;
  if (!m.found) {
    console.log("FAIL: sub-note body element not found by exact text match.");
    console.log("Page text sample:", m.bodyText);
    overallPass = false;
    continue;
  }
  const fraction = m.cardWidth ? m.subRectWidth / m.cardWidth : 0;
  const subLines = Math.round(m.subRectHeight / m.lineHeightPx);
  const wordsPerLine = subLines > 0 ? (m.words / subLines).toFixed(1) : "n/a";
  console.log(`sub-note body: width=${m.subRectWidth.toFixed(1)}px height=${m.subRectHeight.toFixed(1)}px lineHeight=${m.lineHeightPx.toFixed(1)}px fontSize=${m.fontSizePx}px`);
  console.log(`computed whiteSpace="${m.whiteSpace}" overflowWrap="${m.overflowWrap}"`);
  console.log(`wrapped lines ~= ${subLines} for ${m.words} words (~${wordsPerLine} words/line)`);
  console.log(`containing card: found=${m.cardFound} borderLeftWidth=${m.cardBorderLeftWidth} width=${m.cardWidth ? m.cardWidth.toFixed(1) : "n/a"}px height=${m.cardHeight ? m.cardHeight.toFixed(1) : "n/a"}px`);
  console.log(`sub-note width / card width = ${(fraction * 100).toFixed(1)}%`);
  console.log(`"Repair Completed" button still present: ${m.completedBtnFound}`);
  console.log(`document.scrollWidth=${m.docScrollWidth} viewportWidth=${m.viewportWidth} (no horizontal overflow: ${m.docScrollWidth <= m.viewportWidth + 1})`);

  const checks = [
    ["card found", m.cardFound],
    ["width fraction > 55%", fraction > 0.55],
    ["lines far below word count (< words/3)", subLines < m.words / 3],
    ["no horizontal page overflow", m.docScrollWidth <= m.viewportWidth + 1],
    ["no console errors", w.consoleErrors.length === 0],
    ["no page (uncaught) errors", w.pageErrors.length === 0],
  ];
  for (const [name, ok] of checks) {
    console.log(`  ${ok ? "PASS" : "FAIL"} - ${name}`);
    if (!ok) overallPass = false;
  }
  if (w.consoleErrors.length) console.log("  console errors:", JSON.stringify(w.consoleErrors));
  if (w.pageErrors.length) console.log("  page errors:", JSON.stringify(w.pageErrors));
}

if (results.interaction) {
  const it = results.interaction;
  console.log(`\n--- interaction smoke-check (420px, after the fix's control rearrange) ---`);
  console.log(JSON.stringify(it, null, 2));
  const itChecks = [
    ["done toggle button found", it.doneToggleFound],
    ["done toggle actually marks item done", it.doneToggleWorked],
    ["+ Note input opens", it.secondNoteInputOpened],
    ["second sub-note renders", it.secondNoteRendered],
    ["second sub-note also wide (>100px)", (it.secondNoteWidth || 0) > 100],
    ["no console errors during interaction", it.consoleErrors.length === 0],
    ["no page errors during interaction", it.pageErrors.length === 0],
  ];
  for (const [name, ok] of itChecks) {
    console.log(`  ${ok ? "PASS" : "FAIL"} - ${name}`);
    if (!ok) overallPass = false;
  }
}

console.log(`\n================ ${overallPass ? "OVERALL: PASS" : "OVERALL: FAIL"} ================`);
process.exit(overallPass ? 0 : 1);
