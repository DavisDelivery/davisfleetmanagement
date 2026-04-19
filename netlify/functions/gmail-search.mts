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
    const refreshToken = body.refresh_token;
    const vendor = body.vendor || "peach state";
    const afterDate = body.afterDate || "";

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

    // Build search query per vendor — broader matching
    const dateFilter = afterDate ? ` after:${afterDate}` : "";
    let searchQuery;
    if (vendor === "peach state" || vendor === "peach state freightliner") {
      // v2.9.5: tightened — loose text matches ("peach state", "peachstate") and
      // unfiltered Ryan forwards caught unrelated emails (Uline billing, NuVizz
      // reports, etc.). Real Peach State invoices come from:
      //   (a) ar@peachstatetrucks.com or peachstatetrucks.com domain
      //   (b) forwarded by Ryan AND the subject contains "Parts 20407"
      //       (Peach State's account-reference phrase for Davis Delivery)
      // A forwarded email has "Fwd:" in subject AND is from Ryan's address.
      searchQuery = `((from:peachstatetrucks.com) OR ((from:ryan@davisdelivery.com OR from:ryan@davisdeliveryservice.com) AND subject:"Parts 20407")) has:attachment${dateFilter}`;
    } else if (vendor === "fuelfox atlanta" || vendor === "fuelfox") {
      // FuelFox invoices come from QuickBooks on their behalf, NOT fuelfox.com
      // Subject line always contains "FuelFox Atlanta" for invoice emails.
      searchQuery = `(from:quickbooks@notification.intuit.com subject:"FuelFox Atlanta") has:attachment${dateFilter}`;
    } else if (vendor === "quick fuel" || vendor === "quickfuel") {
      // Quick Fuel invoices come ONLY from ebilling@4flyers.com. No text matches — they
      // pull in unrelated emails (NuVizz reports, Uline invoices, etc.) that happen to
      // mention terms like "CFS-" or "flyers" somewhere in the body.
      searchQuery = `from:ebilling@4flyers.com has:attachment${dateFilter}`;
    } else {
      // Generic vendor — just search for the name anywhere + attachment
      searchQuery = `"${vendor}" has:attachment${dateFilter}`;
    }

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
