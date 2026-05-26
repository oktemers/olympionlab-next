"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const fullName = String(formData.get("full_name") || "").trim();
  const branch = String(formData.get("branch") || "").trim();
  const level = String(formData.get("level") || "").trim();
  const goal = String(formData.get("goal") || "").trim();

  if (!fullName) {
    redirect("/settings?error=" + encodeURIComponent("Ad Soyad boş olamaz."));
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      branch,
      level,
      goal,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    redirect(
      "/settings?error=" +
        encodeURIComponent("Profil güncellenemedi: " + error.message)
    );
  }

  redirect("/settings?message=" + encodeURIComponent("Profil bilgilerin kaydedildi."));
}
