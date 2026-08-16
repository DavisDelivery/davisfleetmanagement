// Minimal static server for the verification harness. No outbound network is
// available, so React/ReactDOM are served from local node_modules (UMD
// production builds) instead of a CDN, exactly like production loads them
// (just from unpkg there, from disk here).
import http from "http";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import * as seed from "./seed.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT ? Number(process.env.PORT) : 8420;

const reactSrc = readFileSync(path.join(here, "node_modules/react/umd/react.production.min.js"), "utf8");
const reactDomSrc = readFileSync(path.join(here, "node_modules/react-dom/umd/react-dom.production.min.js"), "utf8");
const appCompiled = readFileSync(path.join(here, "app.compiled.js"), "utf8");

// The storage contract (per window.storage.get) is: value is always a STRING
// (the app JSON.parses it itself via the pj() helper). So each entry here is
// pre-serialized with JSON.stringify, same as a real window.storage.set call
// would have stored.
const storeObj = {
  "fl-trucks": JSON.stringify(seed.TRUCKS),
  "fl-repairs": JSON.stringify(seed.REPAIRS),
  // Seeded truthy so the one-time DVIR-history-import effect returns immediately
  // instead of fetching /dvir_history.json on mount.
  "fl-dvir-imported": JSON.stringify({ date: "2026-08-01T00:00:00.000Z", weeks: 0 }),
};
// Valid JSON is valid JS object-literal syntax, so this can be spliced directly
// into the inline script below. Escape "</" so a literal "</script>" inside any
// seeded string can't prematurely close the tag.
const storeJsonForEmbedding = JSON.stringify(storeObj).replace(/<\//g, "<\\/");

const stubScript = `
window.__seedStore = new Map(Object.entries(${storeJsonForEmbedding}));
window.__consoleCapture = [];
window.storage = {
  get: function(k){
    return Promise.resolve(window.__seedStore.has(k) ? {key:k, value: window.__seedStore.get(k)} : null);
  },
  set: function(k, v){
    window.__seedStore.set(k, v);
    return Promise.resolve({key:k, value:v});
  },
  delete: function(k){
    window.__seedStore.delete(k);
    return Promise.resolve({key:k, deleted:true});
  },
  list: function(prefix){
    var keys = [];
    window.__seedStore.forEach(function(_, k){ if(!prefix || k.indexOf(prefix) === 0) keys.push(k); });
    return Promise.resolve({keys: keys});
  }
};
// window.db: collection().doc().onSnapshot() no-op, plus the collection().where().where().onSnapshot()
// shape the review-queue listener also uses. Never fires its callback (true no-op) —
// initial state already comes from window.storage above.
window.firebase = { firestore: { FieldPath: { documentId: function(){ return "__name__"; } } } };
window.db = {
  collection: function(_name){
    var api = {
      doc: function(_id){ return { onSnapshot: function(_cb, _errCb){ return function(){}; } }; },
      where: function(){ return api; },
      onSnapshot: function(_cb, _errCb){ return function(){}; }
    };
    return api;
  }
};
`;

const harnessHtml = `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>App.jsx harness</title>
</head>
<body>
<div id="root"><div id="loading">Loading...</div></div>
<script>${reactSrc}</script>
<script>${reactDomSrc}</script>
<script>${stubScript}</script>
<script>const { useState, useEffect, useCallback, useMemo, useRef } = React;</script>
<script>${appCompiled}</script>
<script>
window.__mountError = null;
try {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(React.createElement(App));
} catch (e) {
  window.__mountError = (e && e.stack) || String(e);
}
</script>
</body>
</html>`;

// Every route the app can hit automatically on mount (not from a user click)
// needs a harmless response here, or Chromium logs a "Failed to load resource"
// console error for the failed fetch even though the app's own try/catch
// swallows it silently. Found by actually watching network traffic (diag.mjs),
// not by guessing: DEFAULT_VENDORS is non-empty, so the vendors/trucks-changed
// effect fires syncConfigToServer -> POST /api/save-sync-config on mount too.
const routes = {
  "/api/sync-status": () => ({ status: 200, type: "application/json", body: "{}" }),
  "/api/save-sync-config": () => ({ status: 200, type: "application/json", body: "{}" }),
  "/dvir_history.json": () => ({ status: 200, type: "application/json", body: "[]" }),
  "/favicon.ico": () => ({ status: 204, type: "image/x-icon", body: "" }),
};

const server = http.createServer((req, res) => {
  const url = req.url.split("?")[0];
  if (url === "/" || url === "/index.html") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(harnessHtml);
    return;
  }
  if (routes[url]) {
    const r = routes[url]();
    res.writeHead(r.status, { "Content-Type": r.type });
    res.end(r.body);
    return;
  }
  console.log(`[server] UNEXPECTED REQUEST: ${req.method} ${url}`);
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("not found: " + url);
});

server.listen(PORT, () => {
  console.log(`Harness server listening on http://localhost:${PORT}`);
});

process.on("SIGTERM", () => server.close());
