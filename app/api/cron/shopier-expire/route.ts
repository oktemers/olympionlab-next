import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const db = createAdminClient();
    const { data, error } = await db.rpc("shopier_expire_memberships");
    if (error) throw new Error(error.code || "Database function unavailable");
    return NextResponse.json({ ok: true, usersReconciled: data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Shopier expiry job failed", error instanceof Error ? error.message : "Unknown");
    return NextResponse.json({ error: "Reconciliation failed" }, { status: 503 });
  }
}
