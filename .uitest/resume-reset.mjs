/**
 * Coming back to the app after it has been in the background must not leave it talking
 * to a dead connection.
 *
 * Firestore's get() has no deadline of its own once the WebChannel handshake has
 * succeeded: onWatchStreamConnected marks the client Online and cancels the 10s
 * "Backend didn't respond" timer, after which a read settles only when a snapshot
 * arrives or the client goes Offline. Measured against the real 10.12.0 bundle with the
 * backchannel held open and silent, a read was still unsettled after 300 seconds, and
 * the app's eight cold-start reads all reported "timed out after 12.0s" — which is
 * exactly what the owner photographed.
 *
 * The SDK cannot rescue itself here. Its only network-restart trigger is the browser's
 * online/offline event pair, and iOS does not fire those when it resumes a suspended
 * home-screen web app whose connections it has taken away; its visibilitychange hook
 * only resets backoff. This app lives on a home screen and is suspended constantly.
 *
 * So the app resets the transport itself on resume: disableNetwork() rejects the stuck
 * reads, enableNetwork() forces a fresh handshake. Asserts it happens when it should,
 * and — just as important — that it does NOT happen on a brief app-switch, because a
 * reset costs a handshake and rejects reads that were doing nothing wrong.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { buildApp, patchHtml, serveAsset } from "./appbuild.mjs";
import http from "http";

const PORT = 8503;
const KV = {
  "fl-trucks": JSON.stringify([{ id: "0424", mk: "FRTLN", type: "straight", tr: "A", ax: "Single" }]),
  "fl-drivers": JSON.stringify([{ name: "Alvarez, R", role: "Davis Straight Driver", category: "Davis" }]),
  "fl-repairs": "[]", "fl-review-queue": "[]",
};

const STUB = `<script>
window.__KV=${JSON.stringify(KV)};
window.__NET=[];                       // every disableNetwork/enableNetwork call, in order
const mk=(id)=>({
  async get(){ if(window.__OFFLINE) throw new Error("Failed to get document because the client is offline.");
    const v=window.__KV[id]; if(v===undefined) throw new Error("not found");
    return {exists:true,data:()=>({v})}; },
  async set(o){ window.__KV[id]=o.v; return true; },
  async delete(){ delete window.__KV[id]; },
  onSnapshot(cb){ setTimeout(()=>cb({forEach(){}}),0); return ()=>{}; }
});
function mq(lo,hi){ return { where(f,op,v){ return op===">="?mq(v,hi):op==="<"?mq(lo,v):mq(lo,hi); },
  async get(){ const ids=Object.keys(window.__KV).filter(i=>(lo===null||i>=lo)&&(hi===null||i<hi));
    return { forEach(cb){ ids.forEach(i=>cb({id:i,data:()=>({v:window.__KV[i]})})); } }; } }; }
window.__DB={collection(){const q=mq(null,null);return {doc:mk,where:q.where,get:q.get};}};
window.__DB.settings=function(o){window.__SETTINGS=o;};
// Model what disableNetwork() actually DOES, not just that it was called: it rejects
// every in-flight read with the offline error. A no-op stub here is how a data-loss
// regression on the reset path stayed invisible to CI.
window.__OFFLINE=false;
window.__DB.disableNetwork=async function(){window.__NET.push("disable");window.__OFFLINE=true;};
window.__DB.enableNetwork=async function(){window.__NET.push("enable");window.__OFFLINE=false;};
window.firebase={initializeApp(){},firestore(){return window.__DB;}};
window.firebase.firestore.FieldPath={documentId:()=>"__name__"};
window.storage={
  async get(k){const d=await window.__DB.collection("kv").doc(k).get();if(!d.exists)throw new Error("not found");return {key:k,value:d.data().v};},
  async set(k,v){await window.__DB.collection("kv").doc(k).set({v});return {key:k,value:v};},
  async delete(k){return {key:k,deleted:true};},
  async list(p){const s=await window.__DB.collection("kv").get();const keys=[],values={};
    s.forEach(d=>{if(!p||d.id.startsWith(p)){keys.push(d.id);values[d.id]=d.data().v;}});return {keys,values};}
};
window.__text=function(){const r=document.getElementById("root");if(!r)return "";
  const c=r.cloneNode(true);c.querySelectorAll("style").forEach(e=>e.remove());return c.textContent||"";};
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
const page = await browser.newPage();
const errs=[]; page.on("pageerror",e=>errs.push(e.message));
await page.goto(`http://localhost:${PORT}/`,{waitUntil:"domcontentloaded"});
await page.waitForFunction(()=>/Weekly Board/.test(window.__text()),{timeout:60000}).catch(()=>{});

// Drive visibility directly: Page.setVisibilityState does not move document.hidden in a
// way the app can read, so override the property and dispatch, which is what the browser
// does. The listener under test is the app's own.
const setVis = (state) => page.evaluate((s)=>{
  Object.defineProperty(document,"visibilityState",{value:s,configurable:true});
  Object.defineProperty(document,"hidden",{value:s==="hidden",configurable:true});
  document.dispatchEvent(new Event("visibilitychange"));
}, state);
const nets = () => page.evaluate(()=>window.__NET.slice());

console.log("\n═ a brief app-switch keeps its connection ═");
{
  await page.evaluate(()=>{window.__NET.length=0;});
  await setVis("hidden");
  await new Promise(r=>setTimeout(r,300));      // far under the threshold
  await setVis("visible");
  await new Promise(r=>setTimeout(r,400));
  const n = await nets();
  pass("no reset after a few hundred milliseconds away", n.length===0, JSON.stringify(n));
}

console.log("\n═ a long background is treated as a dead connection ═");
{
  await page.evaluate(()=>{window.__NET.length=0;});
  // Go hidden, then rewrite the stamp so the app believes it was away long enough,
  // rather than actually idling the test for 30 seconds.
  await setVis("hidden");
  await new Promise(r=>setTimeout(r,120));
  await page.evaluate(()=>{ const real=Date.now; let once=true;
    Date.now=function(){ return once?(once=false,real()+120000):real(); }; });
  await setVis("visible");
  await new Promise(r=>setTimeout(r,600));
  const n = await nets();
  pass("the transport is torn down and rebuilt", JSON.stringify(n)===JSON.stringify(["disable","enable"]), JSON.stringify(n));
  pass("in that order — a rebuild is useless without the teardown",
    n[0]==="disable" && n[1]==="enable");
  pass("exactly one cycle, not two overlapping ones", n.length===2, `${n.length} calls`);
}

console.log("\n═ a bfcache restore always counts as a resume ═");
{
  await page.evaluate(()=>{window.__NET.length=0;});
  await page.evaluate(()=>{const e=new Event("pageshow");Object.defineProperty(e,"persisted",{value:true});window.dispatchEvent(e);});
  await new Promise(r=>setTimeout(r,500));
  const n = await nets();
  pass("a frozen page resets however briefly it was away", JSON.stringify(n)===JSON.stringify(["disable","enable"]), JSON.stringify(n));
}

console.log("\n═ and the app is still usable ═");
{
  pass("no page errors", errs.length===0, errs.join(" | "));
  pass("the roster is still on screen", /Weekly Board/.test(await page.evaluate(()=>window.__text())));
}

console.log(`\n${failed?`FAILED: ${failed} check(s)`:"PASSED: all checks"}\n`);
await browser.close(); server.close();
process.exit(failed?1:0);
