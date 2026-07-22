import type { Config } from "@netlify/functions";

/**
 * Scheduled function — runs every 3 hours and calls /api/auto-sync to do the
 * actual work. Kept thin so the cron logic and the sync logic stay testable
 * independently.
 *
 * v2.16.8: bumped from once-daily to every 3h with a 30-day lookback so invoices
 * are auto-ingested throughout the day and the sync reliably keeps up with volume
 * (one nightly run + a ~22s budget could lag behind a busy week). This is cost-safe:
 * auto-sync dedups every attachment BEFORE the paid AI call, so once caught up a run
 * finds nothing new and costs ~nothing — only genuinely new invoices are ever scanned.
 *
 * Note: Netlify scheduled functions share the 26s timeout, so auto-sync time-budgets
 * itself and persists state; if a run doesn't finish, the next run picks up where it
 * left off (dedup skips what's already imported).
 */
export default async () => {
  const siteUrl = Netlify.env.get("URL") || "https://davis-fleet-mgmt.netlify.app";
  try {
    const resp = await fetch(`${siteUrl}/api/auto-sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ daysBack: 30, triggeredBy: "schedule" }),
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
  // Every 3 hours, on the hour (00:00, 03:00, 06:00 … UTC)
  schedule: "0 */3 * * *",
};
