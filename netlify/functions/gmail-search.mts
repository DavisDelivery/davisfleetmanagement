import type { Config } from "@netlify/functions";
import { buildVendorQuery } from "../lib/vendor-queries.mjs";

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
    const refreshToken = body.refresh_token;
    const vendor = body.vendor || "peach state";
    const afterDate = body.afterDate || "";
    const beforeDate = body.beforeDate || ""; // v2.10.13: optional end date for custom range

    if (!refreshToken) {
      return json({ error: "No refresh_token provided. Gmail not connected." }, 400);
    }

    // Get a fresh access token
    const tokenResp = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const tokenData = await tokenResp.json();
    if (!tokenResp.ok || !tokenData.access_token) {
      return json({ error: "Token refresh failed: " + JSON.stringify(tokenData).substring(0, 200) }, 400);
    }
    const accessToken = tokenData.access_token;

    // v2.26.0: the per-vendor queries used to be duplicated here, and this copy was the
    // one that fell behind. Complete Fleet Services was crawled correctly on the schedule
    // but, searched by hand, fell through to the generic `"<vendor>" has:attachment` —
    // which finds any message that merely mentions the shop and misses every invoice
    // whose only mention of it is inside the PDF. Both paths now read the same map.
    // (Gmail date syntax, YYYY/MM/DD. beforeDate — v2.10.13 — is optional, for a custom
    // range rather than plain days-back.)
    const searchQuery = buildVendorQuery(vendor, afterDate, beforeDate);

    // Search messages — cap at 100 so a full year of weekly/biweekly invoices fit
    const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(searchQuery)}&maxResults=100`;
    const searchResp = await fetch(searchUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const searchData = await searchResp.json();

    if (!searchResp.ok) {
      return json({ error: "Gmail search failed: " + JSON.stringify(searchData).substring(0, 200) }, 400);
    }

    const messages = searchData.messages || [];
    if (messages.length === 0) {
      return json({ results: [] });
    }

    // Fetch details for each message (in parallel)
    const results = await Promise.all(messages.slice(0, 100).map(async (msg: any) => {
      try {
        const detailResp = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const detail = await detailResp.json();
        const headers = detail.payload?.headers || [];
        const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || "";

        // Extract attachments info from full message
        const fullResp = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const full = await fullResp.json();
        const attachments: any[] = [];
        const walkParts = (part: any) => {
          if (part.filename && part.filename.length > 0) {
            attachments.push({
              filename: part.filename,
              size: part.body?.size || 0,
              attachmentId: part.body?.attachmentId || null,
              mimeType: part.mimeType || "",
            });
          }
          if (part.parts) part.parts.forEach(walkParts);
        };
        if (full.payload) walkParts(full.payload);

        const dateStr = getHeader("Date");
        const dateObj = dateStr ? new Date(dateStr) : null;
        const dateISO = dateObj && !isNaN(dateObj.getTime())
          ? dateObj.toISOString().split("T")[0]
          : "";

        return {
          emailId: msg.id,
          emailDate: dateISO,
          emailSubject: getHeader("Subject"),
          from: getHeader("From"),
          snippet: full.snippet || "",
          attachments,
        };
      } catch (e: any) {
        return { emailId: msg.id, error: e.message || "Failed to fetch details" };
      }
    }));

    return json({ results });
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
  path: "/api/gmail-search",
};
