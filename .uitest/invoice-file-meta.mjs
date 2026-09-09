/**
 * Tapping "View" on a review-queue card showed a grey ? page reading "file / data —
 * 51 KB / Open in…" instead of the invoice. Not a viewer bug: the file was being
 * served as application/octet-stream, and iOS will not preview an octet-stream.
 *
 * Two writers put invoices in the same blob store and disagreed on metadata key names.
 * The browser upload path (invoice-file.mts POST) writes `mimeType` / `originalName`.
 * The server importer (auto-sync.mts) writes `contentType` / `filename`. The reader
 * only knew the first pair, so everything auto-sync imported — nearly every invoice,
 * including all the FuelFox service logs — fell through to the octet-stream default
 * and to the literal fallback name "file", which is exactly what was on screen.
 *
 * The reader accepts both spellings, because the blobs already in the store carry the
 * old keys and re-uploading them is not on the table.
 */
import * as esbuild from "esbuild";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(here, "..");

const { code } = await esbuild.transform(
  readFileSync(path.join(REPO, "netlify/functions/invoice-file.mts"), "utf8"),
  { loader: "ts", format: "esm" },
);
// The module imports @netlify/blobs at the top; stub it out so the pure helper can be
// read without a Netlify runtime.
const stubbed = code.replace(/import\s*\{[^}]*\}\s*from\s*["']@netlify\/blobs["'];?/, "const getStore=()=>({});");
const mod = await import("data:text/javascript;base64," + Buffer.from(stubbed).toString("base64"));
const { resolveFileMeta } = mod;

let pass = 0, fail = 0;
const t = (n, c, d = "") => { if (c) { pass++; console.log(`  ✔ ${n}`); } else { fail++; console.log(`  ✘ ${n}${d ? ` — ${d}` : ""}`); } };

const pdfBytes = () => new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]).buffer; // "%PDF-1.7"

console.log("\n═ what auto-sync actually stored (the broken case) ═");
{
  const meta = { contentType: "application/pdf", filename: "FuelFox-ServiceLog-DavisDelivery-05-21-2026-009.pdf" };
  const r = resolveFileMeta(meta, pdfBytes());
  t("served as a PDF, not octet-stream", r.mimeType === "application/pdf", r.mimeType);
  t("keeps the real filename, not the literal \"file\"",
    r.originalName === meta.filename, r.originalName);
}

console.log("\n═ what the browser upload stores (already worked, must keep working) ═");
{
  const meta = { mimeType: "application/pdf", originalName: "scan.pdf" };
  const r = resolveFileMeta(meta, pdfBytes());
  t("still a PDF", r.mimeType === "application/pdf");
  t("still its own name", r.originalName === "scan.pdf");
}

console.log("\n═ the canonical pair wins when both are present ═");
{
  const r = resolveFileMeta(
    { mimeType: "application/pdf", originalName: "right.pdf", contentType: "text/plain", filename: "wrong.txt" },
    pdfBytes());
  t("mimeType beats contentType", r.mimeType === "application/pdf", r.mimeType);
  t("originalName beats filename", r.originalName === "right.pdf", r.originalName);
}

console.log("\n═ images are not forced to PDF ═");
{
  const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]).buffer;
  t("a stored JPEG keeps its type",
    resolveFileMeta({ mimeType: "image/jpeg", originalName: "photo.jpg" }, jpg).mimeType === "image/jpeg");
  t("contentType spelling works for images too",
    resolveFileMeta({ contentType: "image/png", filename: "p.png" }, null).mimeType === "image/png");
}

console.log("\n═ falls back rather than downloading a viewable file ═");
{
  t("no metadata at all, but the bytes say %PDF → PDF",
    resolveFileMeta(null, pdfBytes()).mimeType === "application/pdf");
  t("no metadata and no bytes, but a .pdf name → PDF",
    resolveFileMeta({ filename: "x.pdf" }, null).mimeType === "application/pdf");
  t("genuinely unknown stays octet-stream",
    resolveFileMeta({}, new Uint8Array([1, 2, 3, 4]).buffer).mimeType === "application/octet-stream");
  t("unknown name still defaults to \"file\"",
    resolveFileMeta({}, null).originalName === "file");
  t("undefined metadata does not throw", resolveFileMeta(undefined).mimeType === "application/octet-stream");
  t("a short buffer does not throw on the magic-number sniff",
    resolveFileMeta({}, new Uint8Array([0x25]).buffer).mimeType === "application/octet-stream");
}

console.log("\n═ the writer now emits both spellings ═");
{
  const src = readFileSync(path.join(REPO, "netlify/functions/auto-sync.mts"), "utf8");
  const block = /metadata:\s*\{[^}]*mimeType:\s*"application\/pdf"[^}]*originalName:[^}]*\}/.test(src);
  t("auto-sync writes mimeType/originalName as well as contentType/filename", block);
}

console.log(`\n${fail ? `FAILED: ${fail} check(s)` : `PASSED: ${pass} checks`}\n`);
process.exit(fail ? 1 : 0);
