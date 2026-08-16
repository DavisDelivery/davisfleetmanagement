/**
 * Measures what the browser actually pays to transpile App.jsx, comparing the config
 * a bare <script type="text/babel"> gets (react + env + plugins + inline source maps)
 * against the explicit data-presets="react" the page now declares.
 *
 * This is the evidence for the index.html change — run it if anyone doubts the number.
 */
import { launch } from "./browser.mjs";
import { ensureVendor } from "./vendor.mjs";
import { readFileSync } from "fs";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");
const src = readFileSync(path.join(REPO, "App.jsx"), "utf8");

await ensureVendor();

const server = http.createServer((req, res) => {
  if (req.url === "/babel.js") {
    res.writeHead(200, { "Content-Type": "application/javascript" });
    return res.end(readFileSync(path.join(here, "vendor/babel.js")));
  }
  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`<!doctype html><meta charset="utf-8"><script src="/babel.js"></script>`);
}).listen(8411);

const browser = await launch();
const page = await browser.newPage();
await page.goto("http://localhost:8411/", { waitUntil: "networkidle0" });

const out = await page.evaluate((code) => {
  const run = (opts) => {
    const t0 = performance.now();
    const res = Babel.transform(code, opts);
    return { ms: Math.round(performance.now() - t0), bytes: res.code.length };
  };
  // What a preset-less <script type="text/babel"> actually gets, per babel.min.js.
  const dflt = run({
    presets: ["react", "env"],
    plugins: ["transform-class-properties", "transform-object-rest-spread", "transform-flow-strip-types"],
    sourceMaps: "inline",
    filename: "App.jsx",
  });
  const explicit = run({ presets: ["react"], filename: "App.jsx" });
  return { dflt, explicit };
}, src);

console.log(`source                        ${src.length.toLocaleString()} bytes`);
console.log(`default (react+env+plugins)   ${String(out.dflt.ms).padStart(6)} ms   → ${out.dflt.bytes.toLocaleString()} bytes`);
console.log(`data-presets="react"          ${String(out.explicit.ms).padStart(6)} ms   → ${out.explicit.bytes.toLocaleString()} bytes`);
console.log(`speedup                       ${(out.dflt.ms / out.explicit.ms).toFixed(1)}x faster, ${(out.dflt.bytes / out.explicit.bytes).toFixed(1)}x less output`);

await browser.close();
server.close();
