"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function authErrorMessage(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("invalid login credentials")) {
    return "E-posta veya şifre yanlış.";
  }

  if (lower.includes("email not confirmed")) {
    return "E-posta henüz doğrulanmamış. Lütfen e-posta doğrulama ayarını kontrol et.";
  }

  if (lower.includes("security purposes") || lower.includes("seconds")) {
    return "Çok fazla deneme yaptın. Lütfen biraz bekleyip tekrar dene.";
  }

  if (lower.includes("user already registered") || lower.includes("already registered")) {
    return "Bu e-posta ile zaten hesap oluşturulmuş. Giriş yapmayı dene.";
  }

  return message || "Bir hata oluştu. Lütfen tekrar dene.";
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
    redirect("/login?error=" + encodeURIComponent(authErrorMessage(error.message)));
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
        encodeURIComponent(authErrorMessage(error.message))
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
    redirect("/login?error=" + encodeURIComponent(authErrorMessage(error.message)));
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/login?error=" + encodeURIComponent("Google bağlantısı başlatılamadı."));
}

export async function resetPassword(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://olympionlab.com";

  if (!email) {
    redirect("/login?mode=reset&error=" + encodeURIComponent("E-posta zorunlu."));
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  if (error) {
    redirect("/login?mode=reset&error=" + encodeURIComponent(authErrorMessage(error.message)));
  }

  redirect(
    "/login?message=" +
      encodeURIComponent("Sıfırlama bağlantısı e-posta adresine gönderildi.")
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/");
}
