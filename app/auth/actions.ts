"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function trAuthError(message?: string) {
  const text = (message || "").toLowerCase();

  if (
    text.includes("invalid login credentials") ||
    text.includes("invalid credentials") ||
    text.includes("invalid")
  ) {
    return "E-posta veya şifre hatalı.";
  }

  if (text.includes("email not confirmed")) {
    return "E-posta adresin henüz doğrulanmamış.";
  }

  if (text.includes("already registered") || text.includes("user already registered")) {
    return "Bu e-posta adresiyle zaten hesap oluşturulmuş. Giriş yapmayı dene.";
  }

  if (text.includes("security purposes") || text.includes("seconds")) {
    return "Çok fazla deneme yaptın. Lütfen biraz bekleyip tekrar dene.";
  }

  if (text.includes("password")) {
    return "Şifre geçersiz. Lütfen en az 8 karakterli bir şifre gir.";
  }

  if (text.includes("email")) {
    return "E-posta adresi geçersiz.";
  }

  return "Bir hata oluştu. Lütfen tekrar dene.";
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect("/login?error=" + encodeURIComponent("E-posta ve şifre zorunlu."));
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(trAuthError(error.message)));
  }

  redirect("/dashboard");
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  const branch = String(formData.get("branch") || "").trim();

  if (!fullName || !email || !password) {
    redirect(
      "/login?mode=register&error=" +
        encodeURIComponent("Ad soyad, e-posta ve şifre zorunlu.")
    );
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        branch,
      },
    },
  });

  if (error) {
    redirect(
      "/login?mode=register&error=" +
        encodeURIComponent(trAuthError(error.message))
    );
  }

  redirect("/dashboard");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://olympionlab.com";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/auth/callback`,
    },
  });

  if (error) {
    redirect("/login?error=" + encodeURIComponent(trAuthError(error.message)));
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/login?error=" + encodeURIComponent("Google ile giriş başlatılamadı."));
}

export async function resetPassword(formData: FormData) {
  const email = String(formData.get("email") || "").trim();

  if (!email) {
    redirect("/login?mode=reset&error=" + encodeURIComponent("E-posta zorunlu."));
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://olympionlab.com";

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  if (error) {
    redirect(
      "/login?mode=reset&error=" + encodeURIComponent(trAuthError(error.message))
    );
  }

  redirect(
    "/login?message=" +
      encodeURIComponent("Şifre sıfırlama bağlantısı e-posta adresine gönderildi.")
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}
