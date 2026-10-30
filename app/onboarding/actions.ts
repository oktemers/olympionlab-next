"use server";

import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function saveOnboarding(formData: FormData) {
  const user=await requireUser();
  const branch=String(formData.get("branch")||"");
  const level=String(formData.get("level")||"");
  const goal=String(formData.get("goal")||"");
  const studyDays=String(formData.get("study_days")||"");

  if(!["physics","chemistry","math","biology"].includes(branch)
    || !["beginner","intermediate","advanced"].includes(level)
    || !["tubitak-1","tubitak-2","international","conceptual"].includes(goal)
    || !["2","3-4","5+","daily"].includes(studyDays)) {
    redirect("/baslangic?error="+encodeURIComponent("Lütfen geçerli bir çalışma planı seç."));
  }

  const supabase=await createClient();
  const {error}=await supabase.from("profiles")
    .update({branch,level,goal,study_days:studyDays}).eq("id",user.id);
  if(error) {
    console.error("Onboarding save failed",error.message);
    redirect("/baslangic?error="+encodeURIComponent("Planın kaydedilemedi. Lütfen yeniden dene."));
  }
  redirect("/panel");
}
