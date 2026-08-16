// The portal is one big inline script; a broken template literal would only show
// up at runtime. Load it in Chromium and assert the page actually boots.
import { launch } from "./browser.mjs";
import { readFileSync } from "fs";
import http from "http";
let html = readFileSync("../mechanic/index.html", "utf8");
html = html.replace(/<script src="https:\/\/www\.gstatic\.com\/firebasejs[^>]*><\/script>/g, "");
html = html.replace("</head>", `<script>
window.__KV={"fl-trucks":"[]","fl-repairs":"[]"};
window.firebase={initializeApp(){},firestore(){return window.__DB;}};
const mk=(id)=>({async get(){const v=window.__KV[id];return{exists:v!==undefined,data:()=>({v})};},async set(o){window.__KV[id]=o.v;},onSnapshot(cb){setTimeout(()=>cb({exists:true,data:()=>({v:window.__KV[id]})}),0);return()=>{};}});
window.__DB={collection(){return{doc:mk,async get(){return{forEach(){}}}}}};
window.firebase.firestore.FieldPath={documentId:()=>"__id"};
</script></head>`);
const server = http.createServer((q,r)=>{r.writeHead(200,{"Content-Type":"text/html"});r.end(html);}).listen(8399);
const b = await launch();
const p = await b.newPage();
const errs=[];
p.on("pageerror",e=>errs.push(e.message));
p.on("console",m=>{if(m.type()==="error"&&!/Failed to load resource/.test(m.text()))errs.push(m.text());});
await p.goto("http://localhost:8399/",{waitUntil:"networkidle0"});
await new Promise(r=>setTimeout(r,900));
const booted = await p.evaluate(()=>typeof toggleItem==="function" && typeof addItemNote==="function" && typeof noteEntryHtml==="function");
console.log("portal boots with work-item functions defined:", booted);
console.log("errors:", errs.length ? errs.slice(0,3) : "none");
await b.close(); server.close();
process.exit(booted && errs.length===0 ? 0 : 1);
