/**
 * Build step. Until now there wasn't one: App.jsx was served to the phone as raw JSX
 * and transpiled there, which meant every cold start had to download @babel/standalone
 * — 604 KB gzipped, 2.87 MB unpacked, more than everything else on the page combined —
 * and then run a compiler over 609 KB of source on a phone CPU before a single pixel
 * of the app could render.
 *
 * Measured on a 4x-throttled CPU with an empty cache (.uitest/coldstart-bench.mjs):
 *
 *     in-browser Babel   12,410 ms
 *     pre-built bundle      683 ms      18.2x faster
 *
 * and 604 KB less to download before it can start. That is the whole reason this file
 * exists. Netlify runs it as the build command, so the parse gate that used to be
 * `npm run check` is still here — esbuild fails the deploy on a syntax error rather
 * than shipping a white screen to the yard.
 *
 * No `--target`: Babel ran with only the `react` preset, so it never downlevelled
 * syntax either. Matching that exactly keeps this a pure swap of WHERE the transpile
 * happens, not WHAT the browser is asked to support.
 *
 * Deliberately not `--bundle`/`--format=iife`: App.jsx is a classic script whose
 * top-level declarations are globals that boot.jsx reads. Wrapping it in a function
 * scope makes `App` unreachable and minification then drops it entirely.
 */
import * as esbuild from "esbuild";

const ENTRIES = [
  { in: "App.jsx", out: "app.build.js" },
  { in: "boot.jsx", out: "boot.build.js" },
];

for (const e of ENTRIES) {
  const res = await esbuild.build({
    entryPoints: [e.in],
    outfile: e.out,
    loader: { ".jsx": "jsx" },
    minify: true,
    legalComments: "none",
    logLevel: "info",
  });
  if (res.errors?.length) process.exit(1);
}
