/**
 * index.html no longer ships a compiler: it loads app.build.js and boot.build.js,
 * transpiled ahead of time by build.mjs. The harnesses have to serve the same thing
 * the yard gets, so they build the sources once per run and route those two URLs.
 *
 * Building here rather than reading a committed artifact means a test can never pass
 * against a stale bundle while the source it claims to cover has moved on.
 */
import * as esbuild from "esbuild";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");

let cache = null;
export async function buildApp() {
  if (cache) return cache;
  const one = async (entry) => {
    const res = await esbuild.build({
      entryPoints: [path.join(REPO, entry)],
      loader: { ".jsx": "jsx" },
      minify: false,          // readable in a failure; the transform is what matters
      write: false,
      logLevel: "silent",
    });
    return res.outputFiles[0].text;
  };
  cache = { app: await one("App.jsx"), boot: await one("boot.jsx") };
  return cache;
}

/** The harness copy of index.html: vendored React, no external network. */
export function patchHtml(stubScript) {
  const html = readFileSync(path.join(REPO, "index.html"), "utf8")
    .replace(/<script src="https:\/\/www\.gstatic\.com\/firebasejs[^>]*><\/script>/g, "")
    // Version-agnostic on purpose: these used to name react@18 exactly, so pinning the
    // app to react@18.3.1 silently stopped the rewrite, the page reached for unpkg with
    // no network, and every browser test failed with "React is not defined" — a test
    // break with no bug behind it.
    .replace(/https:\/\/unpkg\.com\/react@[^/]+\/umd\/react\.production\.min\.js/g, "/vendor/react.js")
    .replace(/https:\/\/unpkg\.com\/react-dom@[^/]+\/umd\/react-dom\.production\.min\.js/g, "/vendor/react-dom.js");
  return html.replace("</head>", stubScript + "</head>");
}

/** Routes the built bundles and the vendored React. Returns true if it handled it. */
export function serveAsset(req, res, built) {
  const send = (body) => { res.writeHead(200, { "Content-Type": "application/javascript" }); res.end(body); return true; };
  if (req.url.startsWith("/app.build.js")) return send(built.app);
  if (req.url.startsWith("/boot.build.js")) return send(built.boot);
  if (req.url.startsWith("/vendor/")) return send(readFileSync(path.join(here, "vendor", path.basename(req.url))));
  return false;
}
