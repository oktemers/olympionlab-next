import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const formData = await request.formData();
  const token = String(formData.get("token") || "");

  // TODO: iyzico Retrieve Checkout Form Result endpoint ile token doğrulanacak.
  // Başarılı sonuçta subscriptions tablosu güncellenecek.

  const supabase = createAdminClient();
  await supabase.from("payments").insert({
    provider: "iyzico",
    provider_payment_id: token,
    status: "callback_received",
    currency: "TRY",
    amount_cents: 0
  });

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
