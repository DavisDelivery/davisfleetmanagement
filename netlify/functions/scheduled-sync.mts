import type { Config } from "@netlify/functions";

/**
 * Scheduled function — runs daily at 11:00 UTC (~7am Eastern, ~6am Central) and
 * calls /api/auto-sync to do the actual work. Kept thin so the cron logic and
 * the sync logic stay testable independently.
 *
 * Note: Netlify scheduled functions have the same 26s timeout on the dev plan,
 * so auto-sync is designed to time-budget itself and persist state. If a sync
 * doesn't finish in one invocation, the next night picks up where it left off.
 */
export default async () => {
  const siteUrl = Netlify.env.get("URL") || "https://davis-fleet-mgmt.netlify.app";
  try {
    const resp = await fetch(`${siteUrl}/api/auto-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daysBack: 7, triggeredBy: "schedule" }),
    });
    const data = await resp.json();
    console.log("[scheduled-sync]", resp.status, JSON.stringify(data));
    return new Response(JSON.stringify({ ok: resp.ok, status: resp.status, data }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[scheduled-sync] failed", err);
    return new Response(JSON.stringify({ error: err?.message || "failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const config: Config = {
  // Daily at 11:00 UTC (06:00 Central / 07:00 Eastern)
  schedule: "0 11 * * *",
};
