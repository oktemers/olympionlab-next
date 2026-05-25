"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function saveOnboarding(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const branch = String(formData.get("branch") || "physics");
  const level = String(formData.get("level") || "beginner");
  const goal = String(formData.get("goal") || "tubitak-1");
  const studyDays = String(formData.get("study_days") || "3-4");

  await supabase
    .from("profiles")
    .update({ branch, level, goal, study_days: studyDays })
    .eq("id", user.id);

  redirect("/dashboard");
}
