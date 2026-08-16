/**
 * React, ReactDOM and @babel/standalone, fetched once into .uitest/vendor/ and kept
 * out of git (babel alone is 2.8 MB).
 *
 * The boot test serves these instead of unpkg: a test that depends on a CDN fails for
 * reasons that have nothing to do with the app, and in this sandbox the browser cannot
 * reach the network at all — only the proxied CLI can.
 */
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { execFileSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
export const VENDOR = path.join(here, "vendor");

const FILES = {
  "react.js": "https://unpkg.com/react@18/umd/react.production.min.js",
  "react-dom.js": "https://unpkg.com/react-dom@18/umd/react-dom.production.min.js",
  "babel.js": "https://unpkg.com/@babel/standalone@7.24.0/babel.min.js",
};

async function download(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return Buffer.from(await res.arrayBuffer());
  } catch (e) {
    // Sandboxes route egress through a proxy that node's fetch may not pick up, but
    // curl does. Fall back rather than failing the whole suite.
    return execFileSync("curl", ["-sL", "--max-time", "60", url], { maxBuffer: 1 << 28 });
  }
}

export async function ensureVendor() {
  if (!existsSync(VENDOR)) mkdirSync(VENDOR, { recursive: true });
  for (const [name, url] of Object.entries(FILES)) {
    const dest = path.join(VENDOR, name);
    if (existsSync(dest)) continue;
    process.stdout.write(`fetching ${name}… `);
    const buf = await download(url);
    if (!buf || buf.length < 1000) throw new Error(`could not fetch ${url}`);
    writeFileSync(dest, buf);
    console.log(`${buf.length.toLocaleString()} bytes`);
  }
  return VENDOR;
}
