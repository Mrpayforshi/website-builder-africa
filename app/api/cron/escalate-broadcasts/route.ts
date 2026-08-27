import { NextResponse } from "next/server";
import { escalateAndRebroadcastStale } from "@/lib/delivery/dispatch";

/** Scheduled route — see vercel.json. Sweeps stale broadcasts and re-notifies riders. */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await escalateAndRebroadcastStale();
  return NextResponse.json(result);
}
