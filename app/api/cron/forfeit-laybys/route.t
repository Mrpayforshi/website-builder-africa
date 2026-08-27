import { NextResponse } from "next/server";
import { forfeitOverdueLaybys } from "@/lib/commerce/layby";

/** Scheduled route — see vercel.json. Same shared-secret pattern as the other cron routes. */
export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await forfeitOverdueLaybys();
  return NextResponse.json(result);
}
