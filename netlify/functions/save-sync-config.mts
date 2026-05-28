import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

// Persists vendor list and truck-id roster to Blobs so the scheduled
// auto-sync function has access without needing to talk to Firestore first.
// Called by the app whenever vendors or trucks change.
export default async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  try {
    const body = await req.json();
    const store = getStore("gmail-sync");
    const updates: string[] = [];
    if (Array.isArray(body.vendors)) {
      await store.setJSON("vendors", body.vendors);
      updates.push(`vendors (${body.vendors.length})`);
    }
    if (Array.isArray(body.truckIds)) {
      await store.setJSON("truck-ids", body.truckIds);
      updates.push(`truckIds (${body.truckIds.length})`);
    }
    return json({ success: true, updated: updates });
  } catch (err: any) {
    return json({ error: err.message || "failed" }, 500);
  }
};

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config: Config = {
  path: "/api/save-sync-config",
};
