import { NextResponse } from "next/server";

// IMPORTANT: Keep this endpoint closed until a verified payment-provider integration
// is implemented. Never create speculative payment rows or start a paid subscription
// merely because a visitor selected a plan.
const unavailable = () =>
  NextResponse.json(
    { error: "Ödeme alma işlemi şu anda kullanılamıyor.", code: "PAYMENTS_NOT_CONFIGURED" },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );

export async function GET() {
  return unavailable();
}

export async function POST() {
  return unavailable();
}
