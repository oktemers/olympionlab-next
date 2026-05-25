import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const plan = url.searchParams.get("plan") || "plus";
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // TODO: iyzico Checkout Form initialize endpoint burada çağrılacak.
  // Şimdilik demo: payment kaydı oluşturup checkout sayfasına yönlendiriyoruz.
  await supabase.from("payments").insert({
    user_id: data.user.id,
    provider: "iyzico",
    plan,
    amount_cents: plan === "pro" ? 29900 : 14900,
    currency: "TRY",
    status: "created"
  });

  return NextResponse.redirect(new URL(`/checkout?plan=${plan}`, request.url));
}
