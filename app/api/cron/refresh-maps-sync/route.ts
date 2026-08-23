import { NextResponse } from "next/server";
import { refreshAllMapsSyncs } from "@/lib/market-fit/google-places";

/**
 * Scheduled route — wire to Vercel Cron (or similar) hitting this daily.
 * Protected by a shared secret rather than a user session, since there's
 * no authenticated caller for a cron trigger.
 */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await refreshAllMapsSyncs();
  return NextResponse.json(result);
}
