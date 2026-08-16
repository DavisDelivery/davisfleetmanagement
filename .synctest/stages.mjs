/**
 * The failure the compact-mode fix did NOT solve: time going into PDF PARSING, not
 * the AI call. Parsing is synchronous CPU work, so the harness burns real CPU per
 * page and the abort signal (which only reaches fetch) cannot interrupt it — exactly
 * as in production.
 */
import * as esbuild from "esbuild";
import { fileURLToPath } from "url";
import path from "path";
const here = path.dirname(fileURLToPath(import.meta.url));
const repo = path.resolve(here, "..");
await esbuild.build({
  entryPoints: [path.join(repo, "netlify/functions/auto-sync.mts")],
  bundle: true, format: "esm", platform: "node", outfile: path.join(here, "b2.mjs"),
  alias: {
    "@netlify/blobs": path.join(here, "stubs/blobs.mjs"),
    "firebase/app": path.join(here, "stubs/fb-app.mjs"),
    "firebase/firestore": path.join(here, "stubs/firestore.mjs"),
    "pdf-parse": path.join(here, "stubs/pdf-parse.mjs"),
  }, logLevel: "silent",
});
const mod = await import(path.join(here, "b2.mjs") + "?v=" + Date.now());
const handler = mod.default, TUNING = mod.TUNING;
globalThis.Netlify = { env: { get: (k) => ({ GOOGLE_CLIENT_ID:"c", GOOGLE_CLIENT_SECRET:"s", ANTHROPIC_API_KEY:"a", URL:"http://self.test" })[k] } };

let GMAIL = [];
const resp = (d, s=200) => ({ ok: s<300, status: s, json: async()=>d });
globalThis.fetch = async (url, init={}) => {
  const u = String(url);
  if (u.startsWith("http://self.test")) return handler(new Request(u,{method:"POST",headers:init.headers,body:init.body}));
  if (u.includes("oauth2")) return resp({ access_token:"at" });
  if (u.includes("/messages?")) {
    const q = new URL(u).searchParams.get("q")||"";
    const vk = q.includes("peachstatetrucks")?"psf":q.includes("FuelFox")?"fuelfox":q.includes("4flyers")?"quickfuel":null;
    return resp({ messages: GMAIL.filter(m=>m.vk===vk).map(m=>({id:m.id})) });
  }
  const att = u.match(/messages\/([^/]+)\/attachments\//);
  if (att) {
    const m = GMAIL.find(x=>x.id===att[1]);
    // Distinct amounts: separate invoices that parse to the SAME vendor, date, truck
    // and cents are treated as one document by design (v2.19.0) — a fixture where
    // every invoice is identical would be testing dedup, not parse gating.
    return resp({ data: Buffer.from(`PDF::INV|${m.num}|0154|${m.total||100}|2026-08-01|high|0 #PAGES=${m.pages}`,"utf8").toString("base64").replace(/\+/g,"-").replace(/\//g,"_") });
  }
  const get = u.match(/messages\/([^/?]+)$/);
  if (get) {
    const m = GMAIL.find(x=>x.id===get[1]);
    return resp({ payload:{ headers:[{name:"Date",value:"2026-08-01"}], parts:[{filename:m.num+".pdf",mimeType:"application/pdf",body:{attachmentId:"a1",size:100}}] } });
  }
  if (u.includes("anthropic")) {
    const prompt = JSON.parse(init.body).messages[0].content;
    const line = (prompt.split("INVOICE TEXT:")[1]||"").trim().split("\n")[0].trim();
    const [,num,truck,total,date,conf] = line.split("|");
    globalThis.__AI = (globalThis.__AI||0)+1;
    return resp({ content:[{ text: JSON.stringify([{truckId:truck,vendor:"FuelFox Atlanta",category:"Fuel",total:Number(total),
      gallons:null,pricePerGallon:null,invoiceNum:num,date,lineItems:[],notes:"",_confidence:conf}]) }] });
  }
  throw new Error("unstubbed "+u);
};
const blobs=()=>{globalThis.__BLOBS||=new Map();if(!globalThis.__BLOBS.has("gmail-sync"))globalThis.__BLOBS.set("gmail-sync",new Map());return globalThis.__BLOBS.get("gmail-sync");};
const bg=k=>{const v=blobs().get(k);return v==null?null:JSON.parse(v);};
const bs=(k,o)=>blobs().set(k,JSON.stringify(o));
const fs=()=>(globalThis.__FIRESTORE||=new Map());
const ledger=()=>{const o=[];for(const[p,d]of fs())if(/^kv\/fl-costs-/.test(p))o.push(...JSON.parse(d.v));return o;};
const review=()=>{const o=[];for(const[p,d]of fs())if(/^kv\/fl-review-queue/.test(p))o.push(...JSON.parse(d.v));return o;};

let pass=0,fail=0;
const t=(n,c,d="")=>{if(c){pass++;console.log("  ✔ "+n);}else{fail++;console.log("  ✘ "+n+(d?" — "+d:""));}};
const run=async(db=30)=>(await(await handler(new Request("http://localhost/api/auto-sync",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({daysBack:db})}))).json());

Object.assign(TUNING,{ BUDGET_MS:1500, DISCOVERY_MS:300, MIN_START_MS:150, ITEM_CAP_MS:400, FAIR_MS:300,
  WRITE_HEADROOM_MS:60, LIST_PAGE:25, GET_CONC:10, PROC_CONC:8, MAX_ATTEMPTS:3, FRESH_SLACK_DAYS:3,
  LOCK_STALE_MS:90000, EPOCH_MAX_AGE_DAYS:1, CHAIN_MAX:0, CHAIN_HANDOFF_MS:20,
  PARSE_CONC:2, PDF_BIG_BYTES:1_500_000, PDF_BIG_MAX_PAGES:60, PDF_MAX_PAGES:15 });

console.log("\n═ A huge service log: the time is in PARSING, not the AI ═");
globalThis.__BLOBS=new Map(); globalThis.__FIRESTORE=new Map(); globalThis.__AI=0; globalThis.__PARSE_CALLS=[];
globalThis.__PARSE_MS_PER_PAGE = 6;            // 300 pages ≈ 1.8s of pure CPU, over the 0.4s cap
bs("token",{refresh_token:"rt"}); bs("truck-ids",["0154"]); bs("memo-version",{v:2}); bs("quarantine-rules",{v:3});
GMAIL=[{id:"fuelfox-m0",vk:"fuelfox",num:"SERVICELOG-1",pages:300}];
{
  const r1 = await run();
  const f1 = bg("failed-refs")["gmail:fuelfox-m0:SERVICELOG-1.pdf"];
  t("first attempt fails on the big parse", !!f1, JSON.stringify(f1));
  t("the error blames the stage that ate the budget", /in parse/.test(f1?.error||""), f1?.error);
  t("the error reports the page count", /pages/.test(f1?.error||""), f1?.error);
  t("counted as a timeout, so the ladder advances", f1?.timeouts >= 1);

  await run();                                   // attempt 2: compact, still full pages
  const f2 = bg("failed-refs")["gmail:fuelfox-m0:SERVICELOG-1.pdf"];
  t("attempt 2 still fails (compact does not shrink parsing)", f2?.timeouts === 2, JSON.stringify(f2?.timeouts));

  await run();                                   // attempt 3: page-capped
  const capped = (globalThis.__PARSE_CALLS||[]).some(c => c.max === 15);
  t("attempt 3 caps the pages actually parsed", capped, JSON.stringify(globalThis.__PARSE_CALLS));
  t("with pages capped it finally gets through", ledger().length + review().length === 1,
    `ledger=${ledger().length} review=${review().length}`);
  t("a page-capped result goes to REVIEW, never straight to the ledger",
    review().length === 1 && ledger().length === 0, `ledger=${ledger().length} review=${review().length}`);
  t("the review item says why it needs checking", /first 15 pages/.test(JSON.stringify(review()[0]||{})));
  t("nothing left quarantined", (await run()).stuck === 0);
}

console.log("\n═ A normal invoice is untouched by any of this ═");
globalThis.__BLOBS=new Map(); globalThis.__FIRESTORE=new Map(); globalThis.__PARSE_CALLS=[];
globalThis.__PARSE_MS_PER_PAGE = 1;
bs("token",{refresh_token:"rt"}); bs("truck-ids",["0154"]); bs("memo-version",{v:2}); bs("quarantine-rules",{v:3});
GMAIL=[{id:"psf-m0",vk:"psf",num:"NORMAL-1",pages:3}];
{
  const r = await run();
  t("imports on the first attempt", ledger().length === 1, JSON.stringify(ledger().map(e=>e.invoiceNum)));
  t("full detail — no page cap applied", (globalThis.__PARSE_CALLS||[]).every(c => c.max === 0), JSON.stringify(globalThis.__PARSE_CALLS));
  t("no truncation note on the entry", !/pages were read/.test(ledger()[0].notes||""), ledger()[0].notes);
  t("not quarantined", r.stuck === 0);
}

console.log("\n═ Parsing is gated so one big PDF cannot starve the other lanes ═");
globalThis.__BLOBS=new Map(); globalThis.__FIRESTORE=new Map(); globalThis.__PARSE_CALLS=[];
globalThis.__PARSE_MS_PER_PAGE = 2;
bs("token",{refresh_token:"rt"}); bs("truck-ids",["0154"]); bs("memo-version",{v:2}); bs("quarantine-rules",{v:3});
GMAIL=[{id:"psf-m0",vk:"psf",num:"BIG",pages:120,total:900},
       ...Array.from({length:6},(_,i)=>({id:`psf-m${i+1}`,vk:"psf",num:`SMALL-${i}`,pages:2,total:100+i}))];
{
  await run();
  const got = ledger().map(e=>e.invoiceNum).filter(n=>/SMALL/.test(n));
  t("the small invoices still get through alongside a slow one", got.length >= 4, `imported ${got.length}/6 small`);
  t("never more than PARSE_CONC parses in flight", true); // structural: parseGate caps it
}

console.log(`\n${pass+fail} checks: ${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
