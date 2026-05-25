"use server";

import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function createVideo(formData: FormData) {
  const { user } = await requireAdmin();
  const supabase = await createClient();

  const payload = {
    title: String(formData.get("title") || ""),
    youtube_id: String(formData.get("youtube_id") || ""),
    branch: String(formData.get("branch") || "physics"),
    topic: String(formData.get("topic") || ""),
    level: String(formData.get("level") || "beginner"),
    plan_required: String(formData.get("plan_required") || "free"),
    sort_order: Number(formData.get("sort_order") || 0),
    description: String(formData.get("description") || ""),
    is_published: formData.get("is_published") === "on"
  };

  const { data, error } = await supabase.from("videos").insert(payload).select("id").single();

  if (!error) {
    await supabase.from("admin_audit_logs").insert({
      admin_id: user.id,
      action: "create_video",
      entity_type: "video",
      entity_id: String(data.id),
      details: payload
    });
  }

  redirect("/admin");
}
