import type { Config } from "@netlify/functions";

// Motive caps per_page at 100, so anything larger (we used to request 250) is
// rejected with HTTP 400. We page through results 100 at a time and aggregate.
const PER_PAGE = 100;
const MAX_PAGES = 25; // safety cap → up to 2,500 records

async function fetchAllPages(
  baseUrl: string,
  itemsKey: string,
  apiKey: string
): Promise<{ ok: true; items: unknown[] } | { ok: false; status: number; body: string }> {
  const all: unknown[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const sep = baseUrl.includes("?") ? "&" : "?";
    const url = `${baseUrl}${sep}per_page=${PER_PAGE}&page_no=${page}`;
    const resp = await fetch(url, {
      headers: { "X-Api-Key": apiKey, "Content-Type": "application/json" },
    });
    const text = await resp.text();
    if (!resp.ok) return { ok: false, status: resp.status, body: text };
    let json: any;
    try {
      json = JSON.parse(text);
    } catch {
      return { ok: false, status: 502, body: text };
    }
    const items: unknown[] = Array.isArray(json?.[itemsKey]) ? json[itemsKey] : [];
    all.push(...items);
    // Last page reached when this page came back short (or empty).
    if (items.length < PER_PAGE) break;
  }
  return { ok: true, items: all };
}

export default async (req: Request) => {
  const apiKey = Netlify.env.get("MOTIVE_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "MOTIVE_API_KEY not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "vehicles";

    switch (action) {
      case "vehicles": {
        const r = await fetchAllPages("https://api.gomotive.com/v1/vehicles", "vehicles", apiKey);
        if (!r.ok) {
          return new Response(
            JSON.stringify({ error: `Motive vehicles request failed (HTTP ${r.status})`, detail: r.body.slice(0, 500) }),
            { status: r.status, headers: { "Content-Type": "application/json" } }
          );
        }
        return new Response(JSON.stringify({ vehicles: r.items }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      case "drivers": {
        const r = await fetchAllPages("https://api.gomotive.com/v1/users?role=driver", "users", apiKey);
        if (!r.ok) {
          return new Response(
            JSON.stringify({ error: `Motive drivers request failed (HTTP ${r.status})`, detail: r.body.slice(0, 500) }),
            { status: r.status, headers: { "Content-Type": "application/json" } }
          );
        }
        return new Response(JSON.stringify({ users: r.items }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }
      case "assign": {
        // Assign a driver to a vehicle (or clear it when driverId is null).
        const reqBody = await req.json();
        const vehicleId = reqBody.vehicleId;
        const driverId = reqBody.driverId;
        if (!vehicleId) {
          return new Response(JSON.stringify({ error: "vehicleId required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        const resp = await fetch(`https://api.gomotive.com/v1/vehicles/${vehicleId}`, {
          method: "PATCH",
          headers: { "X-Api-Key": apiKey, "Content-Type": "application/json" },
          body: JSON.stringify({ vehicle: { current_driver_id: driverId || null } }),
        });
        const text = await resp.text();
        return new Response(text, {
          status: resp.status,
          headers: { "Content-Type": "application/json" },
        });
      }
      default:
        return new Response(JSON.stringify({ error: "Unknown action. Use: vehicles, drivers, assign" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Proxy error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  path: "/api/motive",
};
