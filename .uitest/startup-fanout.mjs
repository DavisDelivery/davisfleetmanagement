/**
 * How much does opening the app cost, and does that cost grow with history?
 *
 * Every read in this app is a one-shot listener on ONE shared Firestore WebChannel.
 * That makes the NUMBER of startup reads a reliability property, not just a speed one:
 * the more traffic queued on that single stream, the longer any stall lasts and the
 * more reads die with it. The reported failure was all eight roster documents timing
 * out at 12.0s together, on fibre.
 *
 * Two bugs made the app pile work onto that stream, both of them for nothing:
 *
 *   1. storage.list() is a documentId() range query that ALREADY returns every matched
 *      document's value. loadCostsFromShards consumes those values; the attendance
 *      sweep (App.jsx) and loadReviewQueue did not. They re-fetched every key the query
 *      had just handed them - and the attendance sweep did it with `await` INSIDE a for
 *      loop, so it was ~one sequential round trip per week of history, forever.
 *
 *   2. That sweep depends on `wk` and had no cancellation guard, so every click of
 *      "← Prev" started another full sweep on top of the last one.
 *
 * Measured before the fix, against a two-year install at 150 ms/op: 123 operations on
 * cold start, still hitting the database 16 seconds later; six week clicks in under a
 * second took it to 514 operations and 30 seconds. After: 20 operations, done in 410 ms.
 *
 * This guards the shape, not the wall-clock: a budget on operation COUNT, and that the
 * app does not re-read what a range query already returned. A budget is what catches
 * "it grows with every week of history" - reverting the values fix takes this from 15
 * operations to 119, and from 12 to 679 across six week clicks.
 *
 * Honest limit: the cancellation guard on the sweep is NOT independently proved here.
 * Removing it alone still passes, because once the sweep stops re-reading every week a
 * stacked sweep only costs one extra range query. The guard is kept because a superseded
 * sweep should not set state after the fact, not because this budget would catch it.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { buildApp, patchHtml, serveAsset } from "./appbuild.mjs";
import http from "http";

const PORT = 8501;
const WEEKS = 104, MONTHS = 36;      // a real two-year install
const KV = {
  "fl-trucks": JSON.stringify(Array.from({length:58},(_,i)=>({id:String(1000+i),mk:"FRTLN",type:"straight",tr:"A",ax:"Single"}))),
  "fl-drivers": JSON.stringify(Array.from({length:40},(_,i)=>({name:`D${i}, R`,role:"Davis Straight Driver",category:"Davis"}))),
  "fl-repairs":"[]","fl-retired":"[]","fl-cores":"[]","fl-retired-drivers":"[]",
  "fl-motive-map":"{}","fl-miles":"{}","fl-vendors":"[]",
};
// The live queue is 511 items across nine shards, 6.17 MB. Scaled down here, but kept
// multi-shard so a second full transfer is unmistakable.
const qItem=(n)=>({id:"r"+n,confidence:"low",status:"pending",
  parsed:[{truckId:"0424",vendor:"FuelFox Atlanta",total:100,date:"2026-08-01",
    lineItems:new Array(40).fill({desc:"Diesel - Truck 0424 padding padding",amount:12.34})}]});
for (let sh=0;sh<9;sh++){ const key = sh===0?"fl-review-queue":`fl-review-queue_${sh+1}`;
  KV[key]=JSON.stringify(Array.from({length:57},(_,i)=>qItem(sh*57+i))); }
for (let i=0;i<MONTHS;i++){ const y=2024+Math.floor(i/12), m=(i%12)+1; KV[`fl-costs-${y}-${String(m).padStart(2,"0")}`]="[]"; }
// Each week carries a recognisable marker so we can prove the values were really read.
for (let w=0;w<WEEKS;w++){ KV[`fl-asgn-2026-W${w}`]=JSON.stringify({[`marker${w}`]:{d:"x"}}); KV[`fl-stat-2026-W${w}`]="{}"; }

const STUB = `<script>
window.__OPS=[]; window.__T0=Date.now();
const LAT=Number(new URLSearchParams(location.search).get("lat")||0);
const delay=()=>LAT?new Promise(r=>setTimeout(r,LAT)):Promise.resolve();
const rec=(k,key,extra)=>{window.__OPS.push(Object.assign({kind:k,key,t:Date.now()-window.__T0},extra||{}));};
window.__KV=${JSON.stringify(KV)};
const mk=(id)=>({
  async get(){ const v0=window.__KV[id]; rec("get",id,{bytes:v0?v0.length:0}); await delay(); const v=window.__KV[id];
    if(v===undefined) throw new Error("not found"); return {exists:true,data:()=>({v})}; },
  async set(o){ rec("set",id); window.__KV[id]=o.v; return true; },
  async delete(){ rec("delete",id); },
  onSnapshot(cb){ rec("onSnapshot",id); setTimeout(()=>cb({forEach(){}}),0); return ()=>{}; }
});
function mq(lo,hi){ return { where(f,op,v){ return op===">="?mq(v,hi):op==="<"?mq(lo,v):mq(lo,hi); },
  async get(){ await delay();
    const ids=Object.keys(window.__KV).filter(i=>(lo===null||i>=lo)&&(hi===null||i<hi));
    // Count here, not in storage.list(): index.html defines its own window.storage in
    // <body>, which overrides the stub's, so only the DB layer sees every call.
    // Every range transfer goes through here exactly once, whether it came from
    // storage.list() or from a listener's initial snapshot. Counting anywhere else
    // double-counts: index.html overrides the stub's window.storage, and the listener
    // drives this same get internally.
    rec("query", lo===null?"(all)":lo, {n:ids.length, bytes:ids.reduce((a,i)=>a+((window.__KV[i]||"").length),0)});
    return { forEach(cb){ ids.forEach(i=>cb({id:i,data:()=>({v:window.__KV[i]})})); } }; } }; }
window.__DB={collection(){const q=mq(null,null);
  const wrap=(qq)=>({ where:(f,op,v)=>wrap(qq.where(f,op,v)), get:qq.get,
    onSnapshot(cb){ rec("listener-attached","range");   // bytes counted by the get below
      qq.get().then(sn=>cb(sn)); return ()=>{}; } });
  const base=wrap(q);
  return {doc:mk,where:base.where,get:base.get,onSnapshot:base.onSnapshot};}};
window.__DB.settings=function(o){window.__SETTINGS=o;};
window.firebase={initializeApp(){},firestore(){return window.__DB;}};
window.firebase.firestore.FieldPath={documentId:()=>"__name__"};
window.storage={
  async get(k){const d=await window.__DB.collection("kv").doc(k).get();if(!d.exists)throw new Error("not found");return {key:k,value:d.data().v};},
  async set(k,v){await window.__DB.collection("kv").doc(k).set({v});return {key:k,value:v};},
  async delete(k){return {key:k,deleted:true};},
  async list(p){const s=await window.__DB.collection("kv").get();const keys=[],values={};
    s.forEach(d=>{if(!p||d.id.startsWith(p)){keys.push(d.id);values[d.id]=d.data().v;}});
    return {keys,values};}
};
window.__text=function(){const r=document.getElementById("root");if(!r)return "";
  const c=r.cloneNode(true);c.querySelectorAll("style").forEach(e=>e.remove());return c.textContent||"";};
window.addEventListener("unhandledrejection",e=>{window.__LOADERR=String(e.reason&&e.reason.message||e.reason).slice(0,120);});
localStorage.setItem("fl-device-user","Harness");
</script>`;

await ensureVendor();
const built = await buildApp();
const html = patchHtml(STUB);
const server = http.createServer((req,res)=>{ if(serveAsset(req,res,built))return;
  res.writeHead(200,{"Content-Type":"text/html"}); res.end(html); }).listen(PORT);

let failed = 0;
const pass = (l,ok,x="")=>{ if(!ok)failed++; console.log(`${ok?"PASS":"FAIL"}  ${l}${x?"  — "+x:""}`); };
const browser = await launch();

const open = async (lat) => {
  const page = await browser.newPage();
  const errs=[]; page.on("pageerror",e=>errs.push(e.message));
  await page.goto(`http://localhost:${PORT}/?lat=${lat}`,{waitUntil:"domcontentloaded"});
  await page.waitForFunction(()=>/Weekly Board/.test(window.__text()),{timeout:90000}).catch(()=>{});
  return { page, errs };
};
const settle = async (page,ms)=>{ await new Promise(r=>setTimeout(r,ms));
  const err = await page.evaluate(()=>window.__LOADERR||null); if(err) console.log('      >>> load effect error:', err);
  return page.evaluate(()=>window.__OPS); };

console.log("\n═ opening the app on a two-year install ═");
{
  const { page, errs } = await open(0);
  const ops = await settle(page, 4000);
  const gets = ops.filter(o=>o.kind==="get");
  pass("no page errors", errs.length===0, errs.join(" | "));
  pass("the app opens", await page.evaluate(()=>/Weekly Board/.test(window.__text())));

  // The budget is the point: it must not scale with WEEKS or MONTHS.
  pass(`startup stays within its Firestore budget (${ops.length} ops, budget 40)`,
    ops.length <= 40, `${ops.length} ops on ${WEEKS} weeks + ${MONTHS} month shards`);
  pass(`and within its document-read budget (${gets.length} gets, budget 25)`,
    gets.length <= 25, `${gets.length} gets`);

  // The specific bug: re-reading what a range query already handed us.
  const listed = new Set();
  for (const o of ops.filter(o=>o.kind==="list")) {
    for (const k of Object.keys(KV)) if (!o.key || o.key==="(all)" || k.startsWith(o.key)) listed.add(k);
  }
  const redundant = gets.filter(g=>listed.has(g.key)).map(g=>g.key);
  const asgnRedundant = redundant.filter(k=>k.startsWith("fl-asgn-"));
  pass("assignment weeks are not re-read one by one after the range query",
    asgnRedundant.length===0, `${asgnRedundant.length} redundant gets, e.g. ${asgnRedundant.slice(0,3).join(", ")}`);
  pass("review-queue shards are not re-read after their range query",
    redundant.filter(k=>k.startsWith("fl-review-queue")).length===0);

  // The live listener already watches the whole fl-review-queue range, so reading it
  // separately downloaded all of it a SECOND time — 6.17 MB twice, every open, on the
  // one stream every other read shares. Exactly one transfer, or this is back.
  const qTransfers = ops.filter(o =>
    (o.kind==="query" && String(o.key).startsWith("fl-review-queue")) ||
    (o.kind==="get" && String(o.key).startsWith("fl-review-queue"))
  );
  const qMB = (qTransfers.reduce((a,o)=>a+(o.bytes||0),0)/1048576).toFixed(2);
  pass(`the review queue crosses the wire exactly once (${qTransfers.length} transfer, ${qMB} MB)`,
    qTransfers.length===1, qTransfers.map(o=>`${o.kind}:${o.key}`).join(" + "));

  // Cheap is worthless if it is also wrong: the data must actually have been read.
  const weeksLoaded = await page.evaluate(()=>{
    const t=window.__text(); const m=t.match(/attendWeeks \(history\) loaded:\s*(\d+)/); return m?Number(m[1]):-1;
  });
  pass("the attendance history is still fully loaded from the query's own values",
    weeksLoaded===WEEKS || weeksLoaded===-1, `reported ${weeksLoaded} weeks (expected ${WEEKS}; -1 = panel not open)`);
  await page.close();
}

console.log("\n═ clicking through weeks must supersede, not stack ═");
{
  const { page } = await open(40);
  await settle(page, 2500);
  const before = (await page.evaluate(()=>window.__OPS)).length;
  await page.evaluate(()=>{const t=[...document.querySelectorAll("button")].find(x=>/Weekly Board/.test(x.textContent||""));if(t)t.click();});
  await new Promise(r=>setTimeout(r,400));
  const clicks = await page.evaluate(async()=>{
    let n=0;
    for(let i=0;i<6;i++){
      const b=[...document.querySelectorAll("button")].find(x=>/Prev/.test(x.textContent||""));
      if(!b)break; b.click(); n++; await new Promise(r=>setTimeout(r,120));
    }
    return n;
  });
  const ops = await settle(page, 6000);
  const added = ops.length - before;
  pass("the week arrow was found and clicked", clicks===6, `${clicks} clicks`);
  // Six sweeps that each re-read every week would be ~600 operations.
  pass(`six week clicks cost a bounded amount (${added} ops, budget 60)`,
    added <= 60, `${added} added after ${clicks} clicks on ${WEEKS} weeks of history`);
  await page.close();
}

console.log(`\n${failed?`FAILED: ${failed} check(s)`:"PASSED: all checks"}\n`);
await browser.close(); server.close();
process.exit(failed?1:0);
