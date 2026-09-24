/**
 * The Fleet List tab (v2.30.0): the tab's name, Model as a dropdown for the makes that
 * have a model list, and a Deleted checkbox column beside Trans.
 *
 * What matters most is what reaches storage, not what the screen shows:
 *   - opening the tab writes nothing, even for trucks whose stored model is not on the
 *     new list (an older free-text "M2 106") — they keep it until someone picks;
 *   - picking a model or ticking Deleted changes that one field on that one truck;
 *   - old make codes (FRTLN, HINO) get the same list as the full names;
 *   - a make with no list keeps its free-text box.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { buildApp, patchHtml, serveAsset } from "./appbuild.mjs";
import http from "http";

const PORT = 8561;
const TRUCKS = [
  { id: "0424", mk: "FRTLN", md: "", type: "straight", tr: "A", ax: "Single" },            // old code, no model yet
  { id: "5042", mk: "Freightliner", md: "M2 106", type: "straight", tr: "A", ax: "Single", year: 2012 }, // off-list model
  { id: "0451", mk: "HINO", type: "straight", tr: "M", ax: "Single" },                       // old code, never had md
  { id: "1506", mk: "International", md: "LT625", type: "tractor", tr: "A", ax: "Tandem" },  // no list for this make
  { id: "0877", mk: "Tractor", md: "Volvo", type: "tractor", tr: "A", ax: "Tandem" },        // legacy oddity, kept as is
];
const KV = {
  "fl-trucks": JSON.stringify(TRUCKS),
  "fl-drivers": JSON.stringify([{ name: "Alvarez, R", role: "Davis Straight Driver", category: "Davis" }]),
  "fl-repairs": "[]", "fl-review-queue": "[]",
};

const STUB = `<script>
window.__KV=${JSON.stringify(KV)};
window.__WRITES=[];
const mk=(id)=>({
  async get(){ const v=window.__KV[id]; if(v===undefined) throw new Error("not found"); return {exists:true,data:()=>({v})}; },
  async set(o){ window.__KV[id]=o.v; window.__WRITES.push(id); return true; },
  async delete(){ delete window.__KV[id]; window.__WRITES.push(id); },
  onSnapshot(cb){ setTimeout(()=>cb({forEach(){}}),0); return ()=>{}; }
});
function mq(lo,hi){ return { where(f,op,v){ return op===">="?mq(v,hi):op==="<"?mq(lo,v):mq(lo,hi); },
  async get(){ const ids=Object.keys(window.__KV).filter(i=>(lo===null||i>=lo)&&(hi===null||i<hi));
    return { forEach(cb){ ids.forEach(i=>cb({id:i,data:()=>({v:window.__KV[i]})})); } }; } }; }
window.__DB={collection(){const q=mq(null,null);return {doc:mk,where:q.where,get:q.get};},
  settings(){}, async disableNetwork(){}, async enableNetwork(){}};
window.firebase={initializeApp(){},firestore(){return window.__DB;}};
window.firebase.firestore.FieldPath={documentId:()=>"__name__"};
window.__text=function(){const r=document.getElementById("root");if(!r)return "";
  const c=r.cloneNode(true);c.querySelectorAll("style").forEach(e=>e.remove());return c.textContent||"";};
localStorage.setItem("fl-device-user","Harness");
</script>`;

await ensureVendor();
const built = await buildApp();
const html = patchHtml(STUB);
const server = http.createServer((req, res) => {
  if (serveAsset(req, res, built)) return;
  res.writeHead(200, { "Content-Type": "text/html" }); res.end(html);
}).listen(PORT);

let failed = 0;
const pass = (l, ok, x = "") => { if (!ok) failed++; console.log(`${ok ? "PASS" : "FAIL"}  ${l}${x ? "  — " + x : ""}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const until = async (fn, ms = 5000) => {
  const end = Date.now() + ms;
  for (;;) { const v = await fn(); if (v || Date.now() > end) return v; await sleep(50); }
};

const browser = await launch();
const page = await browser.newPage();
const errs = [];
page.on("pageerror", (e) => errs.push(e.message));
page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(m.text()); });
page.on("dialog", (d) => d.accept());
await page.setViewport({ width: 1400, height: 1000 });
await page.goto(`http://localhost:${PORT}/`, { waitUntil: "domcontentloaded" });
await page.waitForFunction(() => /Weekly Board/.test(window.__text()), { timeout: 60000 }).catch(() => {});

await page.evaluate(() => {
  // The cell under `header` in the row whose first cell is truck `id`, in whichever
  // table (box trucks or tractors) holds it.
  window.__cell = (id, header) => {
    for (const table of document.querySelectorAll("table")) {
      const heads = [...table.querySelectorAll("thead th")].map((th) => th.textContent.trim());
      const col = heads.indexOf(header);
      if (col < 0) continue;
      for (const tr of table.querySelectorAll("tbody tr")) {
        const tds = tr.querySelectorAll("td");
        if (tds[0] && tds[0].textContent.trim() === id) return tds[col] || null;
      }
    }
    return null;
  };
  window.__pick = (sel, val) => {
    Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value").set.call(sel, val);
    sel.dispatchEvent(new Event("change", { bubbles: true }));
  };
  window.__truck = (id) => JSON.parse(window.__KV["fl-trucks"]).find((t) => t.id === id);
  window.__byText = (sel, text) => [...document.querySelectorAll(sel)].find((e) => (e.textContent || "").trim() === text);
  // The report's own close button. Row buttons are also "×" but carry a
  // "Remove / retire" title, and must never be clicked by accident.
  window.__closeReport = () => [...document.querySelectorAll("button")]
    .filter((b) => b.textContent.trim() === "×" && !b.title).forEach((b) => b.click());
});
const truck = (id) => page.evaluate((id) => window.__truck(id), id);
const modelCell = (id) => page.evaluate((id) => {
  const td = window.__cell(id, "Model");
  if (!td) return null;
  const sel = td.querySelector("select"), inp = td.querySelector("input");
  return sel ? { kind: "select", value: sel.value, options: [...sel.options].map((o) => o.value) }
    : inp ? { kind: "input", value: inp.value } : { kind: "none" };
}, id);

console.log("\n═ the tab is called Fleet List ═");
{
  const labels = await page.evaluate(() => [...document.querySelectorAll("button")].map((b) => (b.textContent || "").trim()));
  pass("there is a Fleet List tab", labels.includes("Fleet List"));
  pass("and no tab called just Fleet", !labels.includes("Fleet"));
}

console.log("\n═ opening it changes nothing ═");
const writesBefore = await page.evaluate(() => window.__WRITES.filter((k) => k === "fl-trucks").length);
{
  await page.evaluate(() => window.__byText("button", "Fleet List").click());
  await until(() => page.evaluate(() => !!window.__cell("0424", "Model")));
  pass("the list shows the fleet", await page.evaluate(() => !!window.__cell("0424", "Model")));
  await sleep(300);
  const writes = await page.evaluate(() => window.__WRITES.filter((k) => k === "fl-trucks").length);
  pass("no truck was saved just by looking", writes === writesBefore, `${writes - writesBefore} write(s)`);
  pass("the stored list is byte-for-byte what it was", (await page.evaluate(() => window.__KV["fl-trucks"])) === KV["fl-trucks"]);
}

console.log("\n═ Model is a dropdown for Freightliner and Hino ═");
{
  const frt = await modelCell("0424");
  pass("Freightliner (stored as FRTLN) gets a dropdown", frt && frt.kind === "select", JSON.stringify(frt));
  pass("with Cascadia and M2", frt && JSON.stringify(frt.options) === JSON.stringify(["", "Cascadia", "M2"]), JSON.stringify(frt && frt.options));
  pass("showing no model where none was stored", frt && frt.value === "");

  const hino = await modelCell("0451");
  pass("Hino (stored as HINO) gets a dropdown", hino && hino.kind === "select", JSON.stringify(hino));
  pass("with 268, 338, L6 and L7", hino && JSON.stringify(hino.options) === JSON.stringify(["", "268", "338", "L6", "L7"]), JSON.stringify(hino && hino.options));

  const old = await modelCell("5042");
  pass("an older model off the list is kept, not blanked", old && old.kind === "select" && old.value === "M2 106", JSON.stringify(old));
  pass("and the list is there to pick from", old && old.options.includes("Cascadia") && old.options.includes("M2"), JSON.stringify(old && old.options));

  const intl = await modelCell("1506");
  pass("a make with no list keeps its text box", intl && intl.kind === "input" && intl.value === "LT625", JSON.stringify(intl));
  const odd = await modelCell("0877");
  pass("so does a legacy record", odd && odd.kind === "input" && odd.value === "Volvo", JSON.stringify(odd));
}

console.log("\n═ picking a model saves that one field ═");
{
  await page.evaluate(() => window.__pick(window.__cell("0424", "Model").querySelector("select"), "Cascadia"));
  await until(async () => (await truck("0424")).md === "Cascadia");
  const t0424 = await truck("0424");
  pass("#0424 is now a Cascadia", t0424.md === "Cascadia", JSON.stringify(t0424));
  pass("its make is left as stored (FRTLN)", t0424.mk === "FRTLN" && t0424.tr === "A" && t0424.ax === "Single" && t0424.type === "straight", JSON.stringify(t0424));

  await page.evaluate(() => window.__pick(window.__cell("0451", "Model").querySelector("select"), "L7"));
  await until(async () => (await truck("0451")).md === "L7");
  pass("#0451 is now an L7", (await truck("0451")).md === "L7");
  pass("the off-list model on #5042 is untouched", (await truck("5042")).md === "M2 106");
}

console.log("\n═ a Deleted column, right beside Trans ═");
{
  const heads = await page.evaluate(() => [...document.querySelectorAll("table")].map((t) =>
    [...t.querySelectorAll("thead th")].map((th) => th.textContent.trim())).filter((h) => h.includes("Trans")));
  pass("both tables have it", heads.length === 2, JSON.stringify(heads.map((h) => h.length)));
  pass("immediately after Trans", heads.length > 0 && heads.every((h) => h[h.indexOf("Trans") + 1] === "Deleted"),
    heads.map((h) => h.slice(h.indexOf("Trans"), h.indexOf("Trans") + 3).join(" | ")).join(" ; "));

  const box = () => page.evaluate(() => { const c = window.__cell("0424", "Deleted"); const b = c && c.querySelector("input[type=checkbox]"); return b ? b.checked : null; });
  pass("each truck has a checkbox, unticked to start", (await box()) === false);

  await page.evaluate(() => window.__cell("0424", "Deleted").querySelector("input").click());
  await until(async () => (await truck("0424")).del === true);
  pass("ticking it saves Deleted on #0424", (await truck("0424")).del === true, JSON.stringify(await truck("0424")));
  pass("and shows ticked", (await box()) === true);
  pass("no other truck is marked", !(await truck("5042")).del && !(await truck("0451")).del && !(await truck("1506")).del);
  pass("nothing else on #0424 moved", (await truck("0424")).md === "Cascadia" && (await truck("0424")).mk === "FRTLN");
  pass("the truck is still in the list — Deleted only marks it", await page.evaluate(() => !!window.__cell("0424", "Truck #")));

  await page.evaluate(() => window.__cell("0424", "Deleted").querySelector("input").click());
  await until(async () => (await truck("0424")).del === false);
  pass("unticking clears it", (await truck("0424")).del === false);

  await page.evaluate(() => window.__cell("0424", "Deleted").querySelector("input").click());
  await until(async () => (await truck("0424")).del === true);
}

console.log("\n═ the two tables line up ═");
{
  // Box Trucks and Tractors are separate tables stacked one above the other. Measured,
  // not eyeballed: every column must start and end at the same x in both, and nothing
  // may be wider than its column (a select or a name spilling into the next cell).
  const measure = () => page.evaluate(() => {
    const tables = [...document.querySelectorAll("table")]
      .filter((t) => [...t.querySelectorAll("thead th")].some((th) => th.textContent.trim() === "Deleted"));
    return {
      cols: tables.map((t) => [...t.querySelectorAll("thead th")].map((th) => {
        const r = th.getBoundingClientRect(); return [th.textContent.trim(), Math.round(r.left), Math.round(r.right)];
      })),
      spill: tables.flatMap((t) => [...t.querySelectorAll("tbody td")]
        .filter((td) => td.scrollWidth > td.clientWidth + 1)
        .map((td) => `${td.parentElement.firstElementChild.textContent.trim()}: ${(td.textContent || td.innerHTML).trim().slice(0, 24)}`)),
    };
  });
  const offBy = (cols) => cols.length !== 2 ? ["not two tables"] :
    cols[0].map((c, i) => { const o = cols[1][i] || ["?", NaN, NaN]; return c[0] !== o[0] || Math.abs(c[1] - o[1]) > 1 || Math.abs(c[2] - o[2]) > 1 ? `${c[0]} ${c[1]}-${c[2]} vs ${o[1]}-${o[2]}` : null; }).filter(Boolean);

  const wide = await measure();
  pass("at a desktop width, every column lines up across both tables", offBy(wide.cols).length === 0, offBy(wide.cols).join(" ; "));
  pass("and nothing spills out of its column", wide.spill.length === 0, wide.spill.slice(0, 4).join(" ; "));
  // Box trucks and tractors offer different make lists, so a dropdown left to size
  // itself comes out a different width in each table. Every control is one width.
  const widths = await page.evaluate(() => {
    const tables = [...document.querySelectorAll("table")]
      .filter((t) => [...t.querySelectorAll("thead th")].some((th) => th.textContent.trim() === "Deleted"));
    const col = (h) => [...new Set(tables.flatMap((t) => {
      const i = [...t.querySelectorAll("thead th")].map((th) => th.textContent.trim()).indexOf(h);
      return [...t.querySelectorAll("tbody tr")].map((tr) => tr.children[i] && tr.children[i].querySelector("select,input"))
        .filter(Boolean).map((el) => Math.round(el.getBoundingClientRect().width));
    }))];
    return { make: col("Make"), model: col("Model"), year: col("Year") };
  });
  pass("every Make dropdown is the same width in both tables", widths.make.length === 1, JSON.stringify(widths.make));
  pass("every Model box is the same width, dropdown or not", widths.model.length === 1, JSON.stringify(widths.model));
  pass("every Year box is the same width", widths.year.length === 1, JSON.stringify(widths.year));

  await page.setViewport({ width: 820, height: 1000 });
  await sleep(300);
  const narrow = await measure();
  pass("on a narrow screen they still line up", offBy(narrow.cols).length === 0, offBy(narrow.cols).join(" ; "));
  pass("scrolling sideways instead of squeezing the days", await page.evaluate(() =>
    [...document.querySelectorAll("table")].filter((t) => [...t.querySelectorAll("thead th")].some((th) => th.textContent.trim() === "Deleted"))
      .every((t) => t.parentElement.scrollWidth > t.parentElement.clientWidth)));
  await page.setViewport({ width: 1400, height: 1000 });
  await sleep(300);
}

console.log("\n═ the truck report shows both ═");
{
  await page.evaluate(() => window.__cell("0424", "Truck #").click());
  await until(() => page.evaluate(() => /Truck Report/.test(document.body.textContent)));
  const body = await page.evaluate(() => document.body.innerText);
  pass("Model: Cascadia", /Model:\s*Cascadia/.test(body));
  pass("Deleted: Yes", /Deleted:\s*Yes/.test(body));
  await page.evaluate(() => window.__closeReport());
  await until(() => page.evaluate(() => !/Truck Report/.test(document.body.textContent)));
}

console.log("\n═ the Edit panel uses the same dropdown and the checkbox ═");
{
  await page.evaluate(() => window.__cell("0451", "Truck #").click());
  await until(() => page.evaluate(() => !!window.__byText("button", "✏️ Edit")));
  await page.evaluate(() => window.__byText("button", "✏️ Edit").click());
  await until(() => page.evaluate(() => /EDIT TRUCK/.test(document.body.textContent)));
  const panel = await page.evaluate(() => {
    const label = (name) => [...document.querySelectorAll("label")].find((l) => (l.textContent || "").trim().startsWith(name));
    const m = label("Model"), d = label("Deleted");
    const sel = m && m.querySelector("select"), box = d && d.querySelector("input[type=checkbox]");
    return { model: sel ? { value: sel.value, options: [...sel.options].map((o) => o.value) } : null, del: box ? box.checked : null };
  });
  pass("Model is the Hino dropdown, on the saved L7", panel.model && panel.model.value === "L7" && JSON.stringify(panel.model.options) === JSON.stringify(["", "268", "338", "L6", "L7"]), JSON.stringify(panel));
  pass("Deleted is a checkbox, unticked for this truck", panel.del === false, JSON.stringify(panel));

  await page.evaluate(() => {
    const label = (name) => [...document.querySelectorAll("label")].find((l) => (l.textContent || "").trim().startsWith(name));
    window.__pick(label("Model").querySelector("select"), "268");
    label("Deleted").querySelector("input[type=checkbox]").click();
  });
  await sleep(100);
  await page.evaluate(() => window.__byText("button", "Save").click());
  await until(async () => { const t = await truck("0451"); return t.md === "268" && t.del === true; });
  const t0451 = await truck("0451");
  pass("Save stores the new model", t0451.md === "268", JSON.stringify(t0451));
  pass("and Deleted", t0451.del === true, JSON.stringify(t0451));
  pass("and leaves transmission and axle alone", t0451.tr === "M" && t0451.ax === "Single", JSON.stringify(t0451));
  await page.evaluate(() => window.__closeReport());
  await until(() => page.evaluate(() => !/Truck Report/.test(document.body.textContent)));
}

console.log("\n═ Add Truck uses the same dropdown and the checkbox ═");
{
  await page.evaluate(() => window.__byText("button", "+ Add").click());
  await until(() => page.evaluate(() => !!document.querySelector("input[placeholder='Truck #']")));
  const form = await page.evaluate(() => {
    const sel = [...document.querySelectorAll("select")].find((s) => s.options[0] && s.options[0].textContent === "Model —");
    return sel ? [...sel.options].map((o) => o.value) : null;
  });
  pass("a new Freightliner offers Cascadia and M2", JSON.stringify(form) === JSON.stringify(["", "Cascadia", "M2"]), JSON.stringify(form));

  await page.type("input[placeholder='Truck #']", "9001");
  await page.evaluate(() => {
    const sel = [...document.querySelectorAll("select")].find((s) => s.options[0] && s.options[0].textContent === "Model —");
    window.__pick(sel, "M2");
    const del = [...document.querySelectorAll("label")].find((l) => (l.textContent || "").trim() === "Deleted" && !l.closest("table"));
    del.querySelector("input[type=checkbox]").click();
  });
  await sleep(100);
  await page.evaluate(() => window.__byText("button", "Save").click());
  await until(async () => !!(await truck("9001")));
  const t9001 = await truck("9001");
  pass("the new truck is saved as an M2", t9001 && t9001.md === "M2" && t9001.mk === "Freightliner", JSON.stringify(t9001));
  pass("with Deleted ticked", t9001 && t9001.del === true, JSON.stringify(t9001));
  pass("and it shows in the list with its dropdown on M2", ((await modelCell("9001")) || {}).value === "M2");
}

console.log("\n═ the Truck Weekly Board shows the model ═");
{
  await page.evaluate(() => document.querySelector("button[title='Truck Weekly Board']").click());
  await until(() => page.evaluate(() => /M2 106/.test(document.getElementById("root").textContent)));
  pass("#5042's model is on the board (it read a field that never existed)", await page.evaluate(() => /M2 106/.test(document.getElementById("root").textContent)));
}

console.log("\n═ no errors ═");
pass("no page errors", errs.length === 0, errs.slice(0, 3).join(" | "));

console.log(`\n${failed ? `FAILED: ${failed} check(s)` : "PASSED: all checks"}\n`);
await browser.close(); server.close();
process.exit(failed ? 1 : 0);
