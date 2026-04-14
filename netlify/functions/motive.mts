import type { Config } from "@netlify/functions";

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

    let motiveUrl = "";
    let method = "GET";
    let body: string | undefined;

    switch (action) {
      case "vehicles":
        motiveUrl = "https://api.gomotive.com/v1/vehicles?per_page=250";
        break;
      case "drivers":
        motiveUrl = "https://api.gomotive.com/v1/users?per_page=250&role=driver";
        break;
      case "assign": {
        // Assign a driver to a vehicle
        const reqBody = await req.json();
        const vehicleId = reqBody.vehicleId;
        const driverId = reqBody.driverId;
        if (!vehicleId) {
          return new Response(JSON.stringify({ error: "vehicleId required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        motiveUrl = `https://api.gomotive.com/v1/vehicles/${vehicleId}`;
        method = "PATCH";
        body = JSON.stringify({
          vehicle: {
            current_driver_id: driverId || null,
          },
        });
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Unknown action. Use: vehicles, drivers, assign" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
    }

    const motiveResp = await fetch(motiveUrl, {
      method,
      headers: {
        "X-Api-Key": apiKey,
        "Content-Type": "application/json",
      },
      ...(body ? { body } : {}),
    });

    const text = await motiveResp.text();
    return new Response(text, {
      status: motiveResp.status,
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
  path: "/api/motive",
};
