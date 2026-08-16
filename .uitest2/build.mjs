// Transform App.jsx (JSX -> JS) WITHOUT bundling, so `function App(){}` stays a
// top-level statement and becomes a global when loaded as a classic <script>,
// exactly like production (Babel standalone) does. esbuild.transform() operates
// on a single string with no module resolution, so there is no bundling step to
// accidentally opt into.
import { transform } from "esbuild";
import { readFileSync, writeFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const APP_SRC = path.resolve(here, "../App.jsx");

const src = readFileSync(APP_SRC, "utf8");
const result = await transform(src, { loader: "jsx" });

if (result.warnings.length) {
  console.log("esbuild warnings:");
  for (const w of result.warnings) console.log(" -", w.text, w.location);
}

writeFileSync(path.join(here, "app.compiled.js"), result.code);
console.log(`Compiled ${APP_SRC} -> app.compiled.js (${result.code.length} bytes)`);

// Sanity: the compiled output must still declare a top-level, unwrapped `App`
// function (not hidden inside an IIFE/closure from bundling).
if (!/^function App\(\)\s*\{/m.test(result.code)) {
  console.error("WARNING: top-level `function App(){` not found at start of a line in compiled output — mount may fail.");
  process.exitCode = 1;
} else {
  console.log("Sanity check OK: top-level `function App()` present in compiled output.");
}
