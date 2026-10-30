import { NextResponse } from "next/server";

// Do not accept an unverified token as evidence of payment.
// Re-enable this endpoint only after a provider's signed callback verification,
// amount/currency checks, replay protection, and subscription updates are implemented.
export async function POST() {
  return NextResponse.json(
    { error: "Payment callback is not configured." },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}
