import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return json({ error: "POST required" }, 405);
  }

  const clientId = Netlify.env.get("GOOGLE_CLIENT_ID");
  const clientSecret = Netlify.env.get("GOOGLE_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    return json({ error: "OAuth not configured" }, 500);
  }

  try {
    const body = await req.json();
    const { refresh_token, messageId, attachmentId } = body;

    if (!refresh_token || !messageId || !attachmentId) {
      return json({ error: "Missing refresh_token, messageId, or attachmentId" }, 400);
    }

    // Refresh access token
    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token,
        grant_type: "refresh_token",
      }),
    });
    const tokenData = await tokenResp.json();
    if (!tokenResp.ok || !tokenData.access_token) {
      return json({ error: "Token refresh failed" }, 400);
    }

    // Fetch attachment
    const attResp = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`,
      { headers: { Authorization: `Bearer ${tokenData.access_token}` } }
    );
    const attData = await attResp.json();
    if (!attResp.ok) {
      return json({ error: "Attachment fetch failed: " + JSON.stringify(attData).substring(0, 200) }, 400);
    }

    // Gmail returns base64url — convert to standard base64
    const b64 = (attData.data || "").replace(/-/g, "+").replace(/_/g, "/");
    return json({ data: b64, size: attData.size || 0 });
  } catch (err: any) {
    return json({ error: err.message || "Proxy error" }, 500);
  }
};

function json(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const config: Config = {
  path: "/api/gmail-attachment",
};
