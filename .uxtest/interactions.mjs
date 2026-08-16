/**
 * Behavioral tests: destructive actions, layout shift, concurrent-save races,
 * double-tap protection, focus visibility, and failure feedback.
 */
import puppeteer from "puppeteer";
import path from "path";
import { fileURLToPath } from "url";
import { buildHtml, startServer, CHROME_PATH, sleep } from "./harness.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
function hr(t) { console.log(`\n${"=".repeat(8)} ${t} ${"=".repeat(Math.max(0, 70 - t.length))}`); }

const browser = await puppeteer.launch({ executablePath: CHROME_PATH, args: ["--no-sandbox", "--disable-dev-shm-usage"] });

// ───────────────────────── 1. Destructive delete: is it confirmed? ─────────────────────────
{
  const PORT = 8421;
  const server = startServer(buildHtml({ slow: false }), PORT);
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 2 });
  let dialogSeen = null;
  page.on("dialog", async (d) => { dialogSeen = { type: d.type(), message: d.message() }; await d.accept(); });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  await sleep(500);

  hr("Destructive action: delete a WORK ITEM (✕) — is it confirmed?");
  const before = await page.evaluate(() => JSON.parse(window.__KV["fl-repairs"]).find(r => r.id === "r1").notesLog.length);
  await page.screenshot({ path: path.join(here, "shot-delete-before.png") });
  await page.click("#note-r1-1 .note-del"); // deletes item1 ("Air leak..." — NOT done, has 2 sub-notes of real diagnostic work)
  await sleep(400);
  const after = await page.evaluate(() => JSON.parse(window.__KV["fl-repairs"]).find(r => r.id === "r1").notesLog.length);
  await page.screenshot({ path: path.join(here, "shot-delete-after.png") });
  console.log(`confirm()/prompt() dialog shown before delete: ${dialogSeen ? JSON.stringify(dialogSeen) : "NONE"}`);
  console.log(`notesLog length before=${before} after=${after}  (item + its 2 sub-notes permanently removed in one tap)`);
  const toastText = await page.$eval("#toast", el => el.textContent);
  console.log(`only feedback shown: toast = "${toastText}"`);

  hr("Destructive action: delete a SUB-NOTE (✕) — is it confirmed?");
  dialogSeen = null;
  const subBefore = await page.evaluate(() => JSON.parse(window.__KV["fl-repairs"]).find(r => r.id === "r1").notesLog[0].notes.length);
  await page.click("#note-r1-0 .subnote-del"); // first sub-note under the now-shifted item0 (Radiator)
  await sleep(400);
  const subAfter = await page.evaluate(() => JSON.parse(window.__KV["fl-repairs"]).find(r => r.id === "r1").notesLog[0].notes.length);
  console.log(`confirm()/prompt() dialog shown before sub-note delete: ${dialogSeen ? JSON.stringify(dialogSeen) : "NONE"}`);
  console.log(`sub-notes before=${subBefore} after=${subAfter}`);

  hr("Contrast: closeRepair() DOES confirm — show the asymmetry");
  dialogSeen = null;
  // Trigger close on r2 (has 1 open item) to see the confirm text listing open items
  const closeClickable = await page.$("#card-r2 .btn-complete");
  if (closeClickable) {
    page.removeAllListeners("dialog");
    page.on("dialog", async (d) => { dialogSeen = { type: d.type(), message: d.message() }; await d.dismiss(); });
    await closeClickable.click();
    await sleep(300);
  }
  console.log(`closeRepair() dialog: ${dialogSeen ? JSON.stringify(dialogSeen) : "NONE (unexpected)"}`);
  console.log(`--> deleteNote()/deleteItemNote() (permanent, irreversible) get ZERO confirmation.`);
  console.log(`--> closeRepair() (recoverable — ticket can be reopened by editing status) DOES get a confirm() with the open-items list.`);

  await page.close();
  server.close();
}

// ───────────────────────── 2. Layout shift after toggling ✓ done ─────────────────────────
{
  const PORT = 8422;
  const server = startServer(buildHtml({ slow: false }), PORT);
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  await sleep(500);

  hr("Layout shift: does marking an item ✓ done move the controls below it?");
  const before = await page.evaluate(() => {
    const item1 = document.getElementById("note-r1-1"); // "Air leak..." — not done, will be toggled
    const item2 = document.getElementById("note-r1-2"); // next item's done-btn position
    return {
      item1Height: item1.getBoundingClientRect().height,
      item2Top: item2.getBoundingClientRect().top,
      item2DoneBtnTop: item2.querySelector(".item-done-btn").getBoundingClientRect().top,
    };
  });
  await page.screenshot({ path: path.join(here, "shot-toggle-before.png") });
  // Dispatch a raw click (not Puppeteer's auto-scroll-into-view) so we can tell if OUR code scrolls.
  const scrollYBefore = await page.evaluate(() => window.scrollY);
  await page.evaluate(() => document.querySelector("#note-r1-1 .item-done-btn").click());
  await sleep(400);
  const scrollYAfter = await page.evaluate(() => window.scrollY);
  const after = await page.evaluate(() => {
    const item1 = document.getElementById("note-r1-1");
    const item2 = document.getElementById("note-r1-2");
    return {
      item1Height: item1.getBoundingClientRect().height,
      item2Top: item2.getBoundingClientRect().top,
      item2DoneBtnTop: item2 ? item2.querySelector(".item-done-btn").getBoundingClientRect().top : null,
    };
  });
  await page.screenshot({ path: path.join(here, "shot-toggle-after.png") });
  const shiftPx = after.item2Top - before.item2Top;
  console.log(`item1 (toggled) height: ${before.item1Height.toFixed(0)}px -> ${after.item1Height.toFixed(0)}px`);
  console.log(`item2's ✓ button moved by ${shiftPx.toFixed(0)}px (from top=${before.item2DoneBtnTop.toFixed(0)} to top=${after.item2DoneBtnTop.toFixed(0)})`);
  console.log(`page scrollY: ${scrollYBefore} -> ${scrollYAfter} (unexpected page scroll: ${scrollYBefore !== scrollYAfter})`);
  console.log(`--> a tap that lands ${Math.abs(shiftPx).toFixed(0)}px away from where the user's thumb is now hovering, immediately after their tap registers, can be mis-aimed on the FOLLOW-UP tap (e.g. rapid-fire ticking off several items).`);

  await page.close();
  server.close();
}

// ───────────────────────── 3. Focus visibility (keyboard) ─────────────────────────
{
  const PORT = 8423;
  const server = startServer(buildHtml({ slow: false }), PORT);
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  await sleep(500);

  hr("Keyboard focus visibility + tab reachability");
  // Tab from the top of the page through the interactive elements and record what's focused + its outline.
  const hops = [];
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      return {
        tag: el.tagName, cls: (el.className || "").toString().slice(0, 30), id: el.id || null,
        text: (el.textContent || el.value || el.getAttribute("aria-label") || "").trim().slice(0, 30),
        outlineStyle: cs.outlineStyle, outlineWidth: cs.outlineWidth, outlineColor: cs.outlineColor,
        boxShadow: cs.boxShadow,
      };
    });
    hops.push(info);
  }
  hops.forEach((h, i) => {
    if (!h) { console.log(`  Tab #${i + 1}: (body / nothing focused)`); return; }
    const visible = h.outlineStyle !== "none" && h.outlineWidth !== "0px";
    console.log(`  Tab #${i + 1}: <${h.tag} class="${h.cls}" id="${h.id}"> "${h.text}"  outline=${h.outlineStyle} ${h.outlineWidth} ${h.outlineColor}  boxShadow=${h.boxShadow}  ${visible ? "(visible ring)" : "(NO visible focus ring — relies on browser default which may be suppressed)"}`);
  });
  await page.screenshot({ path: path.join(here, "shot-focus-ring.png") });

  // Are tabs reachable/operable via keyboard, and do they expose tab semantics?
  const tabInfo = await page.evaluate(() => [...document.querySelectorAll(".tab-btn")].map(b => ({
    text: b.textContent.trim(), role: b.getAttribute("role"), ariaSelected: b.getAttribute("aria-selected"),
    tag: b.tagName,
  })));
  console.log(`\ntab-btn semantics: ${JSON.stringify(tabInfo)}`);
  const hasTablist = await page.evaluate(() => !!document.querySelector('[role="tablist"]'));
  console.log(`role="tablist" present: ${hasTablist}  (tabs are plain <button> with no ARIA tab semantics — operable, but state isn't announced as "tab 2 of 3, selected")`);

  await page.close();
  server.close();
}

// ───────────────────────── 4. Double-tap on Add (no pressed/disabled state) ─────────────────────────
{
  const PORT = 8424;
  const server = startServer(buildHtml({ slow: true, delayMs: 500 }), PORT);
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  await sleep(500);

  hr("Double-tap the Add button before the first save resolves (network delay 500ms)");
  await page.type("#ni-r4", "Grease all fittings and check U-joints");
  const btnStateBefore = await page.evaluate(() => {
    const btn = document.querySelector("#card-r4 .btn-add");
    return { disabled: btn.disabled, text: btn.textContent, opacity: getComputedStyle(btn).opacity, cursor: getComputedStyle(btn).cursor };
  });
  // Two rapid taps, same tick — simulates an impatient double-tap because the button gave no feedback.
  await page.evaluate(() => {
    const btn = document.querySelector("#card-r4 .btn-add");
    btn.click(); btn.click();
  });
  const btnStateDuringSave = await page.evaluate(() => {
    const btn = document.querySelector("#card-r4 .btn-add");
    return { disabled: btn.disabled, text: btn.textContent, opacity: getComputedStyle(btn).opacity };
  });
  await sleep(1300);
  const finalLog = await page.evaluate(() => JSON.parse(window.__KV["fl-repairs"]).find(r => r.id === "r4").notesLog);
  const setLog = await page.evaluate(() => window.__SETLOG.filter(s => s.id === "fl-repairs"));
  console.log(`Add button state before click: disabled=${btnStateBefore.disabled} text="${btnStateBefore.text}" opacity=${btnStateBefore.opacity} cursor=${btnStateBefore.cursor}`);
  console.log(`Add button state DURING in-flight save (right after double-click, before either resolves): disabled=${btnStateDuringSave.disabled} text="${btnStateDuringSave.text}" opacity=${btnStateDuringSave.opacity}`);
  console.log(`--> no visual difference between idle and saving state; nothing tells the user their first tap registered.`);
  console.log(`separate fl-repairs writes fired: ${setLog.length}  (each one a full-array overwrite of the OTHER device's/tab's last known state)`);
  console.log(`final r4 notesLog length: ${finalLog.length} (started at 3) — new entries: ${JSON.stringify(finalLog.slice(3).map(e => e.text))}`);

  await page.close();
  server.close();
}

// ───────────────────────── 5. Concurrent-save race: two in-flight writes clobber each other ─────────────────────────
{
  const PORT = 8425;
  const server = startServer(buildHtml({ slow: true, delayMs: 500 }), PORT);
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  await sleep(500);

  hr("Two concurrent edits on the SAME repair order (two mechanics on one truck)");
  console.log("Action A: tick 'Brake chamber replacement' (item4) done  — slow write, 1000ms");
  console.log("Action B: add a sub-note to 'Air leak...' (item1)        — fast write,  300ms, started just after A");

  await page.evaluate(() => { window.__DELAY = 1000; });
  await page.evaluate(() => document.querySelector("#note-r1-4 .item-done-btn").click()); // Action A starts (reads pre-state)

  await page.evaluate(() => { window.__DELAY = 300; });
  await page.click("#itemnote-r1-1 .item-note-btn");
  await sleep(80);
  await page.type("#ini-r1-1", "Confirmed leak stopped after valve swap, closing out.");
  await page.click("#itemnote-r1-1 .btn-add"); // Action B starts (ALSO reads pre-state, since A hasn't resolved yet)

  // At t=~400ms: B should have resolved (300ms) — its note visible, toast shown.
  await sleep(450);
  const midState = await page.evaluate(() => ({
    subnoteVisible: !![...document.querySelectorAll("#note-r1-1 .subnote-text")].find(el => el.textContent.includes("Confirmed leak stopped")),
    toast: document.getElementById("toast").textContent,
  }));
  await page.screenshot({ path: path.join(here, "shot-race-mid-note-visible.png") });
  console.log(`\nAt t=450ms (after B's 300ms write lands): B's new sub-note visible in DOM = ${midState.subnoteVisible}, toast="${midState.toast}"`);

  // At t=~1100ms: A's slower write has now landed and clobbered B's.
  await sleep(700);
  const finalState = await page.evaluate(() => {
    const stored = JSON.parse(window.__KV["fl-repairs"]).find(r => r.id === "r1");
    return {
      item4done: stored.notesLog[4].done,
      item1subCount: (stored.notesLog[1].notes || []).length,
      item1subTexts: (stored.notesLog[1].notes || []).map(n => n.text.slice(0, 30)),
      domSubnoteStillVisible: !![...document.querySelectorAll("#note-r1-1 .subnote-text")].find(el => el.textContent.includes("Confirmed leak stopped")),
    };
  });
  await page.screenshot({ path: path.join(here, "shot-race-final.png") });
  console.log(`At t=1150ms (after A's 1000ms write lands and rebroadcasts): `);
  console.log(`  item4 (Brake chamber) done = ${finalState.item4done}  (A's change — survived)`);
  console.log(`  item1 (Air leak) sub-note count in FIRESTORE = ${finalState.item1subCount}  texts=${JSON.stringify(finalState.item1subTexts)}`);
  console.log(`  B's sub-note still visible in DOM after A's write landed = ${finalState.domSubnoteStillVisible}`);
  console.log(`  --> B was told "Note added" and saw it on screen, then it silently vanished with no error, no re-toast, no explanation.`);

  await page.close();
  server.close();
}

// ───────────────────────── 6. Failure feedback: what happens when a save fails? ─────────────────────────
{
  const PORT = 8426;
  let html = buildHtml({ slow: false });
  const server = startServer(html, PORT);
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 900, deviceScaleFactor: 2 });
  await page.goto(`http://localhost:${PORT}/`, { waitUntil: "networkidle0" });
  await sleep(500);

  hr("Save failure feedback (simulated Firestore write error)");
  await page.evaluate(() => {
    // fsSet is a top-level `function` in the app's own (non-module) <script>, so it
    // hangs off window — override it to simulate a dropped connection in the bay.
    window.fsSet = () => Promise.reject(new Error("network error"));
  });
  await page.click("#card-r2 .shop-input");
  await page.keyboard.type(" — updated");
  await page.click("#card-r2 .note-input"); // blur triggers updateShop()
  await sleep(300);
  const toastNow = await page.evaluate(() => ({ text: document.getElementById("toast").textContent, showing: document.getElementById("toast").classList.contains("show") }));
  console.log(`Right after failed save: toast="${toastNow.text}" visible=${toastNow.showing}`);
  await page.screenshot({ path: path.join(here, "shot-save-fail-toast.png") });
  await sleep(2200); // toast auto-hides after 2.2s
  const toastAfter = await page.evaluate(() => ({ text: document.getElementById("toast").textContent, showing: document.getElementById("toast").classList.contains("show") }));
  const anyPersistentIndicator = await page.evaluate(() => {
    const input = document.querySelector("#card-r2 .shop-input");
    const cs = getComputedStyle(input);
    return { borderColor: cs.borderColor, ariaInvalid: input.getAttribute("aria-invalid"), value: input.value };
  });
  console.log(`2.2s later, toast auto-hidden: showing=${toastAfter.showing}`);
  console.log(`persistent error state on the field itself: borderColor=${anyPersistentIndicator.borderColor} aria-invalid=${anyPersistentIndicator.ariaInvalid}`);
  console.log(`--> the ONLY signal a save failed is a ${2200}ms toast. If the mechanic isn't looking at that exact moment (phone in pocket, hands full), there is no other way to discover the shop name was never saved. Value shown in the (unsaved) field: "${anyPersistentIndicator.value}"`);

  await page.close();
  server.close();
}

await browser.close();
console.log("\nDONE — interactions.mjs");
