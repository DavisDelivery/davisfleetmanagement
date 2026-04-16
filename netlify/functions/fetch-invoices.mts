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
    const vendor = body.vendor || "peach state";
    const afterDate = body.afterDate || "";

    const dateFilter = afterDate ? ` after:${afterDate}` : "";
    const searchQuery = vendor === "peach state"
      ? `(from:ar@peachstatetrucks.com OR from:ryan@davisdelivery.com OR from:rfreeland@davisdelivery.com OR subject:"Parts 20407" OR subject:"Peach State" OR subject:"Peachstate") has:attachment${dateFilter}`
      : `from:${vendor} has:attachment invoice${dateFilter}`;

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 8192,
        tools: [
          {
            type: "mcp",
            server_label: "gmail",
            server_url: "https://gmail.mcp.claude.com/mcp",
            allowed_tools: ["gmail_search_messages", "gmail_read_message"],
          },
        ],
        messages: [
          {
            role: "user",
            content: `Search my Gmail for vendor invoices using this query: ${searchQuery}

For each email found:
1. Search using gmail_search_messages with query "${searchQuery}" and maxResults 10
2. For each email result, read the full message using gmail_read_message
3. Extract invoice details from the email body and attachment info

After reading all emails, return a JSON array of invoice summaries. Each object should have:
{
  "emailId": "the message ID",
  "emailDate": "YYYY-MM-DD",
  "emailSubject": "subject line",
  "from": "sender email",
  "attachments": [{"filename": "name.pdf", "size": bytes}],
  "invoiceHints": "any invoice numbers or amounts visible in the email body"
}

Return ONLY the JSON array, no markdown, no backticks, no explanation. If no emails found, return [].`,
          },
        ],
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(JSON.stringify({ error: `API error ${resp.status}: ${errText.substring(0, 300)}` }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();

    // Extract text from content blocks (ignore tool_use/tool_result blocks)
    let allText = "";
    if (data.content && Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.type === "text" && block.text) {
          allText += block.text + "\n";
        }
      }
    }

    // Try to find a JSON array in the text
    const match = allText.match(/\[[\s\S]*\]/);
    if (match) {
      try {
        const parsed = JSON.parse(match[0]);
        if (Array.isArray(parsed)) {
          return new Response(JSON.stringify({ results: parsed }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        // Fall through
      }
    }

    // Couldn't parse - return raw text
    return new Response(JSON.stringify({
      rawText: allText || "No text content in response",
      message: allText ? null : "Claude did not return any text. The Gmail MCP server may not be connected, or no emails matched the search.",
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Proxy error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  path: "/api/fetch-invoices",
};
