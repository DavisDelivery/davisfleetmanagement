// Shared harness: builds the REAL mechanic/index.html with a stubbed window.firebase
// backed by our own seed data, and serves it over local http. No file under
// mechanic/ or App.jsx is ever written to — this only reads index.html.
import { readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import { trucks, repairs, DEVICE_USER } from "./seed.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");

/**
 * @param {object} opts
 * @param {boolean} opts.slow - if true, the mock Firestore .set() takes real
 *   network-like time AND rebroadcasts to onSnapshot listeners on every write
 *   (like real Firestore does), so same-device/cross-device race conditions
 *   actually manifest instead of resolving instantly.
 * @param {number} opts.delayMs
 */
export function buildHtml({ slow = false, delayMs = 500 } = {}) {
  let html = readFileSync(path.join(REPO, "mechanic/index.html"), "utf8");
  html = html.replace(/<script src="https:\/\/www\.gstatic\.com\/firebasejs[^>]*><\/script>/g, "");

  const kv = {
    "fl-trucks": JSON.stringify(trucks),
    "fl-repairs": JSON.stringify(repairs),
  };

  const STUB = `<script>
window.__KV = ${JSON.stringify(kv)};
window.__SETLOG = [];
window.__SLOW = ${slow};
window.__DELAY = ${delayMs};
window.firebase = { initializeApp(){}, firestore(){ return window.__DB; } };
const __listeners = {};
function mkDoc(id) {
  return {
    async get(){ const v = window.__KV[id]; return { exists: v!==undefined, data: ()=>({v}) }; },
    set(o){
      const rec = { id, seq: window.__SETLOG.length, startedAt: performance.now(), len: o.v.length };
      window.__SETLOG.push(rec);
      const commit = () => {
        window.__KV[id] = o.v;
        rec.resolvedAt = performance.now();
        if (window.__SLOW && __listeners[id]) {
          __listeners[id].forEach(cb => cb({ exists: true, data: () => ({ v: window.__KV[id] }) }));
        }
      };
      if (window.__SLOW) return new Promise(res => setTimeout(() => { commit(); res(); }, window.__DELAY));
      commit();
      return Promise.resolve();
    },
    onSnapshot(cb){
      (__listeners[id] = __listeners[id] || []).push(cb);
      setTimeout(()=>cb({ exists: window.__KV[id]!==undefined, data: ()=>({v:window.__KV[id]}) }),0);
      return ()=>{ __listeners[id] = (__listeners[id]||[]).filter(x=>x!==cb); };
    }
  };
}
window.__DB = { collection(){ return { doc: mkDoc, async get(){ return { forEach(){} }; } }; } };
window.firebase.firestore.FieldPath = { documentId: ()=>"__id" };
localStorage.setItem("fl-device-user", ${JSON.stringify(DEVICE_USER)});
</script>`;
  html = html.replace("</head>", STUB + "</head>");
  return html;
}

export function startServer(html, port) {
  const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(html);
  }).listen(port);
  return server;
}

export const CHROME_PATH = "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
