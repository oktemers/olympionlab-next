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

  if (!fullName || fullName.length > 90 || !["physics","chemistry","math","biology"].includes(branch) || !["beginner","intermediate","advanced"].includes(level) || goal.length > 160) {
    redirect("/ayarlar?error=" + encodeURIComponent("Profil bilgilerini kontrol et."));
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      branch,
      level,
      goal,
    })
    .eq("id", user.id);

  if (error) {
    redirect(
      "/ayarlar?error=" +
        encodeURIComponent("Profil güncellenemedi: " + error.message)
    );
  }

  redirect("/ayarlar?message=" + encodeURIComponent("Profil bilgilerin kaydedildi."));
}
