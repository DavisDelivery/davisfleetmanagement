import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request) => {
  if (req.method === "POST") {
    try {
      const body = await req.json();
      const { filename, mimeType, data } = body; // data is base64

      if (!filename || !data) {
        return json({ error: "Missing filename or data" }, 400);
      }

      // Decode base64 to binary
      const binary = atob(data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      // Generate unique key
      const timestamp = Date.now();
      const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
      const key = `${timestamp}-${safeName}`;

      const store = getStore("invoice-files");
      await store.set(key, bytes.buffer, {
        metadata: { mimeType: mimeType || "application/octet-stream", originalName: filename },
      });

      // Return key so we can retrieve later
      return json({ success: true, key, url: `/api/invoice-file?key=${encodeURIComponent(key)}` });
    } catch (err: any) {
      return json({ error: err.message || "Upload failed" }, 500);
    }
  }

  if (req.method === "GET") {
    // Retrieve/serve a file
    const url = new URL(req.url);
    const key = url.searchParams.get("key");
    if (!key) return new Response("Missing key", { status: 400 });

    try {
      const store = getStore("invoice-files");
      const result = await store.getWithMetadata(key, { type: "arrayBuffer" });
      if (!result) return new Response("Not found", { status: 404 });

      const { mimeType, originalName } = resolveFileMeta(result.metadata, result.data);

      return new Response(result.data, {
        status: 200,
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `inline; filename="${originalName}"`,
          "Cache-Control": "public, max-age=31536000",
        },
      });
    } catch (err: any) {
      return new Response("Error: " + err.message, { status: 500 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
};

/**
 * Two writers put invoices in this store and they did not agree on the metadata key
 * names. The browser upload (the POST above) writes `mimeType` / `originalName`; the
 * server importer in auto-sync.mts writes `contentType` / `filename`. This reader only
 * knew the first pair, so everything auto-sync imported — which is nearly every invoice,
 * including all the FuelFox service logs — came back as `application/octet-stream`
 * named "file". iOS will not preview an octet-stream: it shows a grey ? page and an
 * "Open in..." button, which is what the office actually saw when they hit View.
 *
 * Accept BOTH spellings rather than just fixing the writer, because the blobs already
 * stored carry the old keys and re-uploading them is not on the table. Fall back to
 * sniffing the PDF magic number, so a blob written with no metadata at all still
 * renders instead of downloading.
 */
export function resolveFileMeta(metadata: any, data?: ArrayBuffer): { mimeType: string; originalName: string } {
  const m = metadata || {};
  const name = m.originalName || m.filename || "file";
  let type = m.mimeType || m.contentType || "";
  if (!type && data) {
    // "%PDF" — the only sniff worth doing here; everything in this store is a PDF or an image.
    const head = new Uint8Array(data.slice(0, 4));
    if (head[0] === 0x25 && head[1] === 0x50 && head[2] === 0x44 && head[3] === 0x46) type = "application/pdf";
  }
  if (!type && /\.pdf$/i.test(name)) type = "application/pdf";
  return { mimeType: type || "application/octet-stream", originalName: name };
}

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config: Config = {
  path: "/api/invoice-file",
};
