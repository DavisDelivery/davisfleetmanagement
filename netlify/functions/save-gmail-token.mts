import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

// Persists the user's Gmail refresh token in Netlify Blobs so the scheduled
// auto-sync function can refresh access tokens without the browser being open.
// Single-user app — uses a fixed key.
export default async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204 });
  if (req.method !== "POST") return json({ error: "POST required" }, 405);

  try {
    const body = await req.json();
    const { refresh_token, email, connected_at } = body;
    if (!refresh_token) return json({ error: "refresh_token required" }, 400);

    const store = getStore("gmail-sync");
    await store.setJSON("token", {
      refresh_token,
      email: email || "",
      connected_at: connected_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    return json({ success: true });
  } catch (err: any) {
    return json({ error: err.message || "Failed to save token" }, 500);
  }
};

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config: Config = {
  path: "/api/save-gmail-token",
};
