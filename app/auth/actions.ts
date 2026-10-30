"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeAuthDestination } from "./redirects";
import { syncSignupBranch } from "./profile-sync";

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL || "https://olympionlab.com").replace(/\/$/, "");

function trAuthError(message?: string) {
  const text = (message || "").toLowerCase();
  if (text.includes("email not confirmed")) return "E-posta adresin henüz doğrulanmamış.";
  if (text.includes("already registered") || text.includes("user already registered")) return "Bu e-posta adresiyle zaten hesap oluşturulmuş.";
  if (text.includes("invalid login") || text.includes("invalid credentials")) return "E-posta veya şifre hatalı.";
  if (text.includes("security purposes") || text.includes("seconds") || text.includes("rate limit")) return "Çok fazla deneme yapıldı. Lütfen daha sonra tekrar dene.";
  if (text.includes("password")) return "Şifre en az 8 karakter olmalı.";
  if (text.includes("email")) return "E-posta adresini kontrol et.";
  return "İşlem tamamlanamadı. Lütfen tekrar dene.";
}

function errorUrl(message: string, mode = "login", next?: string) {
  const query = new URLSearchParams({ error: message });
  if (mode !== "login") query.set("mode", mode);
  if (next && next !== "/panel") query.set("next", next);
  return "/giris?" + query.toString();
}

export async function signIn(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const next = safeAuthDestination(formData.get("next"));
  if (!email || !password) redirect(errorUrl("E-posta ve şifre zorunlu.", "login", next));
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) redirect(errorUrl(trAuthError(error.message), "login", next));
  await syncSignupBranch(supabase);
  redirect(next);
}

export async function signUp(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("full_name") || "").trim();
  const branch = String(formData.get("branch") || "").trim();
  const validBranches = ["physics", "chemistry", "math", "biology"];
  if (!fullName || fullName.length > 90 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    || password.length < 8 || !validBranches.includes(branch)) {
    redirect(errorUrl("Bilgilerini kontrol et. Şifre en az 8 karakter olmalı.", "register"));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: siteUrl() + "/auth/callback?next=%2Fpanel",
      data: { full_name: fullName, branch }
    }
  });
  if (error) redirect(errorUrl(trAuthError(error.message), "register"));
  if (!data.session) {
    redirect("/giris?message=" + encodeURIComponent("Kayıt isteğin alındı. E-postana gelen doğrulama bağlantısını açıp giriş yap."));
  }
  await syncSignupBranch(supabase);
  redirect("/panel");
}

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient();
  const next = safeAuthDestination(formData.get("next"));
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: siteUrl() + "/auth/callback?next=" + encodeURIComponent(next)
    }
  });
  if (error) redirect(errorUrl(trAuthError(error.message), "login", next));
  if (data.url) redirect(data.url);
  redirect(errorUrl("Google ile giriş başlatılamadı.", "login", next));
}

export async function resetPassword(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    redirect(errorUrl("E-posta adresini kontrol et.", "reset"));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: siteUrl() + "/reset-password"
  });
  if (error) redirect(errorUrl(trAuthError(error.message), "reset"));
  redirect("/giris?message=" + encodeURIComponent("Şifre sıfırlama bağlantısı için e-postanı kontrol et."));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
