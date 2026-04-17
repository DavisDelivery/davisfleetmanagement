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

      const mimeType = (result.metadata as any)?.mimeType || "application/octet-stream";
      const originalName = (result.metadata as any)?.originalName || "file";

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

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config: Config = {
  path: "/api/invoice-file",
};
