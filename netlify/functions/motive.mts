import type { Config } from "@netlify/functions";

// Motive caps per_page at 100, so anything larger (we used to request 250) is
// rejected with HTTP 400. We page through results 100 at a time and aggregate.
const PER_PAGE = 100;
const MAX_PAGES = 25; // safety cap → up to 2,500 records

const BASE = "https://api.gomotive.com";

// Netlify's synchronous function ceiling is 10s. Multi-month mileage pulls loop
// server-side, so they stop at this budget and hand back a cursor instead of
// timing out mid-flight and losing every month they already fetched.
const TIME_BUDGET_MS = 7000;

function motiveHeaders(apiKey: string) {
  return {
    "X-Api-Key": apiKey,
    "Content-Type": "application/json",
    // Odometer/distance come back in whatever unit the VEHICLE is configured for.
    // Ask for imperial globally; we still branch on the per-vehicle metric_units
    // flag below, because this header is a request, not a guarantee.
    "X-Metric-Units": "false",
  };
}

async function fetchAllPages(
  baseUrl: string,
  itemsKey: string,
  apiKey: string
): Promise<{ ok: true; items: unknown[] } | { ok: false; status: number; body: string }> {
  const all: unknown[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const sep = baseUrl.includes("?") ? "&" : "?";
    const url = `${baseUrl}${sep}per_page=${PER_PAGE}&page_no=${page}`;
    const resp = await fetch(url, { headers: motiveHeaders(apiKey) });
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

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

/* ─────────────────────────── month helpers ───────────────────────────
   Motive's rollup endpoints (vehicle_utilization, driver_utilization) return
   pre-aggregated data computed in the COMPANY'S configured rollup timezone —
   and their own docs warn that the X-Time-Zone header does not control it. So
   a "month" here is a UTC-midnight-to-UTC-midnight window, which may sit a few
   hours off the company's local month boundary. That's fine for cost-per-mile
   (the drift lands in an adjacent month and washes out over a trailing year)
   but it means a single 12-month pull and twelve 1-month pulls can disagree
   slightly. `action=milesReconcile` measures that gap directly.            */

const pad2 = (n: number) => String(n).padStart(2, "0");
const monthKey = (y: number, m: number) => `${y}-${pad2(m)}`;
const monthStartISO = (y: number, m: number) => `${monthKey(y, m)}-01T00:00:00Z`;
function prevMonth(y: number, m: number) {
  return m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 };
}
function nextMonth(y: number, m: number) {
  return m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
}
function parseMonth(s: string | null): { y: number; m: number } | null {
  if (!s) return null;
  const mm = /^(\d{4})-(\d{1,2})$/.exec(s.trim());
  if (!mm) return null;
  const y = Number(mm[1]), m = Number(mm[2]);
  if (m < 1 || m > 12) return null;
  return { y, m };
}

/** Normalize one vehicle_utilization row into a flat record. */
function readUtilRow(raw: any) {
  // The published example for /v2/vehicle_utilization has a malformed first
  // array element (missing its opening brace), and v1 uses a different wrapper
  // key entirely — so accept wrapped, unwrapped, and the v1 shape.
  const u = raw?.vehicle_utilization ?? raw?.vehicle_idle_rollup ?? raw;
  if (!u || typeof u !== "object") return null;
  const v = u.vehicle || {};
  const metric = v.metric_units === true;
  const dist = typeof u.total_distance === "number" ? u.total_distance : null;
  const message = typeof u.message === "string" ? u.message.trim() : "";

  // A vehicle with no gateway, or one that stopped reporting, comes back as
  // total_distance: 0.0 WITH an explanatory message. Zero-with-a-message is
  // "we don't know", not "it didn't move" — collapsing those two is how a
  // parked-truck bug becomes a cost-per-mile bug.
  let quality: string = "ok";
  if (dist === null) quality = "missing";
  else if (message) quality = /has not communicated/i.test(message) ? "no_gateway" : "stale";
  else if (dist === 0) quality = "zero_reported";

  return {
    vehicleId: v.id ?? null,
    number: v.number ?? null,
    miles: dist === null ? null : (metric ? dist * 0.621371 : dist),
    rawDistance: dist,
    metricUnits: metric,
    message,
    quality,
    lastLocatedAt: u.last_located_at ?? null,
    drivingTimeSec: typeof u.driving_time === "number" ? u.driving_time : null,
    idleTimeSec: typeof u.idle_time === "number" ? u.idle_time : null,
    totalFuel: typeof u.total_fuel === "number" ? u.total_fuel : null,
  };
}

/** Pull distance-per-vehicle for one [start, end) window. */
async function fetchUtilization(apiKey: string, startISO: string, endISO: string) {
  // The OpenAPI schema documents start_at / end_at; the prose reference page for
  // the same endpoint says start_date / end_date. Sending both costs nothing and
  // removes the guess — an ignored param is not an error here.
  const qs = new URLSearchParams({
    start_at: startISO,
    end_at: endISO,
    start_date: startISO,
    end_date: endISO,
  });
  const r = await fetchAllPages(
    `${BASE}/v2/vehicle_utilization?${qs.toString()}`,
    "vehicle_utilizations",
    apiKey
  );
  if (!r.ok) return r;
  const rows = r.items.map(readUtilRow).filter(Boolean) as any[];
  return { ok: true as const, items: rows };
}

export default async (req: Request) => {
  const apiKey = Netlify.env.get("MOTIVE_API_KEY");
  if (!apiKey) {
    return json({ error: "MOTIVE_API_KEY not configured" }, 500);
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "vehicles";

    switch (action) {
      case "vehicles": {
        const r = await fetchAllPages(`${BASE}/v1/vehicles`, "vehicles", apiKey);
        if (!r.ok) {
          return json(
            { error: `Motive vehicles request failed (HTTP ${r.status})`, detail: r.body.slice(0, 500) },
            r.status
          );
        }
        return json({ vehicles: r.items });
      }
      case "vehicle": {
        // Single vehicle by id — used for the live per-edit drift check so we
        // don't pull the whole fleet on every assignment change.
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "id required" }, 400);
        const resp = await fetch(`${BASE}/v1/vehicles/${id}`, { headers: motiveHeaders(apiKey) });
        const text = await resp.text();
        return new Response(text, {
          status: resp.status,
          headers: { "Content-Type": "application/json" },
        });
      }
      case "drivers": {
        const r = await fetchAllPages(`${BASE}/v1/users?role=driver`, "users", apiKey);
        if (!r.ok) {
          return json(
            { error: `Motive drivers request failed (HTTP ${r.status})`, detail: r.body.slice(0, 500) },
            r.status
          );
        }
        return json({ users: r.items });
      }

      /* ───────────────── odometers — current snapshot ─────────────────
         One bulk call per 100 trucks; no per-vehicle fan-out. Odometer lives
         nested inside current_location, which can itself be null.           */
      case "odometers": {
        const r = await fetchAllPages(`${BASE}/v2/vehicle_locations`, "vehicles", apiKey);
        if (!r.ok) {
          return json(
            { error: `Motive vehicle_locations request failed (HTTP ${r.status})`, detail: r.body.slice(0, 500) },
            r.status
          );
        }
        const vehicles = (r.items as any[]).map((raw) => {
          const v = raw?.vehicle ?? raw ?? {};
          const loc = v.current_location || null;
          const metric = v.metric_units === true;
          // true_odometer is the calibrated reading; odometer is the raw ECM/GPS
          // value. They can differ by a lot. Prefer calibrated, but record which
          // one we used — mixing the two across a month boundary produces
          // nonsense mileage deltas.
          const trueOdo = loc && typeof loc.true_odometer === "number" ? loc.true_odometer : null;
          const rawOdo = loc && typeof loc.odometer === "number" ? loc.odometer : null;
          const chosen = trueOdo ?? rawOdo;
          return {
            vehicleId: v.id ?? null,
            number: v.number ?? null,
            odometer: chosen === null ? null : (metric ? chosen * 0.621371 : chosen),
            odometerSource: trueOdo !== null ? "true_odometer" : (rawOdo !== null ? "odometer" : null),
            engineHours: loc && typeof loc.true_engine_hours === "number"
              ? loc.true_engine_hours
              : (loc && typeof loc.engine_hours === "number" ? loc.engine_hours : null),
            locatedAt: loc?.located_at ?? null,
            metricUnits: metric,
          };
        });
        return json({ vehicles, count: vehicles.length, fetchedAt: new Date().toISOString() });
      }

      /* ───────────────── miles — distance per vehicle per month ─────────────────
         GET /api/motive?action=miles&through=2026-08&months=12
         Walks backwards from `through` (inclusive), newest month first, until it
         runs out of months or out of time budget. `done:false` + `nextThrough`
         means call again with that cursor.                                       */
      case "miles": {
        const now = new Date();
        const through =
          parseMonth(url.searchParams.get("through")) ||
          { y: now.getUTCFullYear(), m: now.getUTCMonth() + 1 };
        const requested = Number(url.searchParams.get("months") || "1");
        const months = Math.max(1, Math.min(36, Number.isFinite(requested) ? requested : 1));

        const startedAt = Date.now();
        const periods: any[] = [];
        let cur = { ...through };
        let done = false;

        for (let i = 0; i < months; i++) {
          const nxt = nextMonth(cur.y, cur.m);
          const startISO = monthStartISO(cur.y, cur.m);
          const endISO = monthStartISO(nxt.y, nxt.m);
          const r = await fetchUtilization(apiKey, startISO, endISO);
          if (!("ok" in r) || !r.ok) {
            // Partial success beats total failure on a long backfill — return what
            // we have plus the cursor so the caller can retry from here.
            return json({
              periods,
              done: false,
              nextThrough: monthKey(cur.y, cur.m),
              error: `Motive vehicle_utilization failed for ${monthKey(cur.y, cur.m)} (HTTP ${(r as any).status})`,
              detail: String((r as any).body || "").slice(0, 500),
            }, periods.length ? 200 : (r as any).status);
          }
          periods.push({
            month: monthKey(cur.y, cur.m),
            start: startISO,
            end: endISO,
            vehicles: r.items,
            reporting: r.items.filter((v: any) => v.quality === "ok").length,
            count: r.items.length,
          });
          cur = prevMonth(cur.y, cur.m);
          if (i === months - 1) { done = true; break; }
          if (Date.now() - startedAt > TIME_BUDGET_MS) break;
        }

        return json({
          periods,
          done,
          nextThrough: done ? null : monthKey(cur.y, cur.m),
          source: "v2_vehicle_utilization",
          fetchedAt: new Date().toISOString(),
        });
      }

      /* ───────────────── milesReconcile — sanity check ─────────────────
         Motive's rollup timezone is not ours, so twelve 1-month pulls and one
         12-month pull will not agree exactly. This measures the disagreement
         so we can decide whether it matters instead of assuming it doesn't.  */
      case "milesReconcile": {
        const now = new Date();
        const through =
          parseMonth(url.searchParams.get("through")) ||
          { y: now.getUTCFullYear(), m: now.getUTCMonth() + 1 };
        const requested = Number(url.searchParams.get("months") || "3");
        const months = Math.max(2, Math.min(6, Number.isFinite(requested) ? requested : 3));

        // Oldest month in the span
        let oldest = { ...through };
        for (let i = 1; i < months; i++) oldest = prevMonth(oldest.y, oldest.m);
        const spanStart = monthStartISO(oldest.y, oldest.m);
        const afterThrough = nextMonth(through.y, through.m);
        const spanEnd = monthStartISO(afterThrough.y, afterThrough.m);

        const single = await fetchUtilization(apiKey, spanStart, spanEnd);
        if (!("ok" in single) || !single.ok) {
          return json({ error: "span request failed", detail: String((single as any).body || "").slice(0, 300) }, 502);
        }

        const perMonth: Record<string, number> = {};
        let cur = { ...through };
        for (let i = 0; i < months; i++) {
          const nxt = nextMonth(cur.y, cur.m);
          const r = await fetchUtilization(apiKey, monthStartISO(cur.y, cur.m), monthStartISO(nxt.y, nxt.m));
          if ("ok" in r && r.ok) {
            for (const v of r.items as any[]) {
              if (v.vehicleId == null || v.miles == null) continue;
              perMonth[v.vehicleId] = (perMonth[v.vehicleId] || 0) + v.miles;
            }
          }
          cur = prevMonth(cur.y, cur.m);
        }

        let spanTotal = 0, monthlyTotal = 0, worstPct = 0, worstVehicle: any = null;
        for (const v of single.items as any[]) {
          if (v.vehicleId == null || v.miles == null) continue;
          const a = v.miles, b = perMonth[v.vehicleId] || 0;
          spanTotal += a; monthlyTotal += b;
          if (a > 100) {
            const pct = Math.abs(a - b) / a * 100;
            if (pct > worstPct) { worstPct = pct; worstVehicle = { vehicleId: v.vehicleId, number: v.number, span: a, summed: b }; }
          }
        }
        return json({
          span: { start: spanStart, end: spanEnd, months },
          spanTotalMiles: Math.round(spanTotal),
          summedMonthlyMiles: Math.round(monthlyTotal),
          diffMiles: Math.round(spanTotal - monthlyTotal),
          diffPct: spanTotal ? Number(((spanTotal - monthlyTotal) / spanTotal * 100).toFixed(2)) : 0,
          worstVehiclePct: Number(worstPct.toFixed(2)),
          worstVehicle,
          note: "Motive rollups are computed in the company's configured timezone, not UTC. A small gap here is expected; a large one means the month boundary is wrong.",
        });
      }
      default:
        return json(
          { error: "Unknown action. Use: vehicles, vehicle, drivers, odometers, miles, milesReconcile" },
          400
        );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Proxy error";
    return json({ error: message }, 500);
  }
};

export const config: Config = {
  path: "/api/motive",
};
