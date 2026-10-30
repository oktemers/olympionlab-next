import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safeAuthDestination } from "@/app/auth/redirects";
import { syncSignupBranch } from "@/app/auth/profile-sync";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const target = url.searchParams.get("next") === "/reset-password"
    ? "/reset-password"
    : safeAuthDestination(url.searchParams.get("next"));
  const supabase = await createClient();

  let success = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    success = !error;
  } else if (tokenHash && type && ["recovery", "signup", "email"].includes(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "recovery" | "signup" | "email"
    });
    success = !error;
  }
  if (!success) {
    return NextResponse.redirect(new URL(
      "/giris?error=" + encodeURIComponent("Bağlantı geçersiz veya süresi dolmuş. Lütfen tekrar dene."),
      url.origin
    ), 303);
  }

  await syncSignupBranch(supabase);
  const destination = type === "recovery" ? "/reset-password" : target;
  return NextResponse.redirect(new URL(destination, url.origin), 303);
}
