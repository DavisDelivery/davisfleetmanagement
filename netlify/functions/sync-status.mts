import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

// Returns current sync state for the app to display in the status banner.
// State shape: { lastRun, lastSuccess, running, imported, queued, errors, message }
export default async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  try {
    const store = getStore("gmail-sync");
    const state = (await store.get("sync-state", { type: "json" })) || {
      lastRun: null,
      lastSuccess: null,
      running: false,
      imported: 0,
      queued: 0,
      errors: [],
      message: "Never run",
    };
    const token = await store.get("token", { type: "json" });
    return json({ ...state, tokenStored: !!token });
  } catch (err: any) {
    return json({ error: err.message || "Failed to read state" }, 500);
  }
};

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config: Config = {
  path: "/api/sync-status",
};
