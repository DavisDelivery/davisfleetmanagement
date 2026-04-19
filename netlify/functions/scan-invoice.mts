import type { Config } from "@netlify/functions";

export default async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  const apiKey = Netlify.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        // pdfs-2024-09-25 enables native PDF document support (type: "document") so we
        // can send whole multi-page invoices at once instead of per-page images.
        "anthropic-beta": "pdfs-2024-09-25",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 16384,
        messages: body.messages,
      }),
    });
    const text = await resp.text();
    if (!resp.ok) {
      return new Response(JSON.stringify({
        error: `Anthropic API ${resp.status}`,
        details: text.substring(0, 500),
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    return new Response(text, {
      status: resp.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Proxy error";
    return new Response(JSON.stringify({ error: message }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  path: "/api/scan-invoice",
  rateLimit: {
    windowSize: 60,
    limit: 100,
  },
};
