import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasPlusAccess } from "@/lib/plans";
import { getGuidancePlaylist } from "@/lib/guidance-playlist";

const validId = (id: unknown) => typeof id === "string" && /^[a-zA-Z0-9_-]{1,80}$/.test(id);
const validVideo = (id: unknown) => typeof id === "string" && /^[A-Za-z0-9_-]{11}$/.test(id);

export async function POST(request: Request) {
  const url = new URL(request.url);
  const origin = request.headers.get("origin");
  if ((origin && origin !== url.origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  const jsonRequest = request.headers.get("content-type")?.includes("application/json");
  const payload = jsonRequest
    ? await request.json().catch(() => null)
    : await request.formData().catch(() => null);
  const value = (name: string) =>
    payload instanceof FormData ? payload.get(name) : payload?.[name];
  const kind = value("kind");
  const id = value("id");
  const destination = String(value("returnTo") || "/rota/adim/4");
  const safeDestination = /^(\/rota\/adim\/[1-4]|\/rota\/video\/[A-Za-z0-9_-]+|\/courses\/physics-guidance)(?:\?video=[A-Za-z0-9_-]{11})?$/.test(destination)
    ? destination : "/rota/adim/4";
  const respond = (status: number, message: string, redirectTo = safeDestination) => {
    if (jsonRequest) return NextResponse.json({ ok: status === 200, error: status === 200 ? undefined : message }, { status, headers: { "Cache-Control": "no-store" } });
    return NextResponse.redirect(new URL(status === 200 ? redirectTo : status === 403 ? "/odeme?plan=plus" : safeDestination + (safeDestination.includes("?") ? "&" : "?") + "error=" + encodeURIComponent(message), url), 303);
  };
  if (!["module", "lesson", "guidance"].includes(String(kind)) || !validId(id)) return respond(400, "Geçersiz görev.");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return respond(401, "Önce giriş yapmalısın.", "/giris");
  const { data: profile, error: profileError } = await supabase.from("profiles")
    .select("branch,plan,role").eq("id", user.id).maybeSingle();
  if (profileError || !profile) return respond(503, "Üyelik bilgisi doğrulanamadı.");
  const plus = profile.role === "admin" || hasPlusAccess(profile.plan);

  if (kind === "guidance") {
    if (!validVideo(id)) return respond(400, "Geçersiz video.");
    const playlist = await getGuidancePlaylist();
    if (!playlist.videos.some(video => video.youtubeId === id)) return respond(404, "Video oynatma listesinde bulunamadı.");
    const { error } = await supabase.from("user_guidance_video_progress").upsert(
      { user_id: user.id, youtube_id: id, completed_at: new Date().toISOString() },
      { onConflict: "user_id,youtube_id" }
    );
    if (error) {
      console.error("Guidance progress save failed", error.message);
      return respond(503, "Rehberlik ilerlemesi kaydedilemedi. Supabase ilerleme tablosunu kontrol et.");
    }
    return respond(200, "");
  }

  if (!plus) return respond(403, "Bu görev için Plus planı gerekli.");
  let previousCompletion = false;
  let minutes = 0;
  if (kind === "module") {
    const { data: module, error } = await supabase.from("learning_modules")
      .select("id,branch,is_active,estimated_minutes,type").eq("id", id).maybeSingle();
    if (error || !module || !module.is_active || (module.branch !== "all" && module.branch !== profile.branch)) {
      return respond(404, "Görev bulunamadı.");
    }
    const { data: previous, error: previousError } = await supabase.from("user_module_progress")
      .select("status,progress_percent").eq("user_id", user.id).eq("module_id", id).maybeSingle();
    if (previousError) return respond(503, "Önceki ilerleme alınamadı.");
    previousCompletion = previous?.status === "completed" || Number(previous?.progress_percent || 0) >= 100;
    const { error: saveError } = await supabase.from("user_module_progress").upsert(
      { user_id: user.id, module_id: id, status: "completed", progress_percent: 100 },
      { onConflict: "user_id,module_id" }
    );
    if (saveError) { console.error("Module completion failed", saveError.message); return respond(503, "Görev kaydedilemedi."); }
    minutes = Number(module.estimated_minutes) || 0;
  } else {
    const { data: sections, error } = await supabase.from("course_sections")
      .select("id,branch,stage,lesson_videos(id,is_active)")
      .eq("branch", profile.branch).eq("is_active", true);
    if (error) return respond(503, "Ders listesi alınamadı.");
    const lesson = (sections || []).filter(s => s.stage !== "guidance")
      .flatMap(s => s.lesson_videos || []).find(v => v.id === id && v.is_active);
    if (!lesson) return respond(404, "Ders branşına ait değil.");
    const { data: previous, error: previousError } = await supabase.from("user_video_progress")
      .select("is_completed,progress_percent").eq("user_id", user.id).eq("video_id", id).maybeSingle();
    if (previousError) return respond(503, "Önceki ilerleme alınamadı.");
    previousCompletion = !!previous?.is_completed || Number(previous?.progress_percent || 0) >= 100;
    const { error: saveError } = await supabase.from("user_video_progress").upsert(
      { user_id: user.id, video_id: id, is_completed: true, progress_percent: 100 },
      { onConflict: "user_id,video_id" }
    );
    if (saveError) { console.error("Lesson completion failed", saveError.message); return respond(503, "Ders kaydedilemedi."); }
    minutes = 10;
  }

  // Only count first completion. Marking is self-reported, not proof of watch time or correct solutions.
  if (!previousCompletion) {
    const studyDate = new Date().toISOString().slice(0, 10);
    try {
      const { data: day } = await supabase.from("user_study_days")
        .select("minutes,completed_modules").eq("user_id", user.id).eq("study_date", studyDate).maybeSingle();
      await supabase.from("user_study_days").upsert({
        user_id: user.id, study_date: studyDate,
        minutes: Math.max(0, Number(day?.minutes || 0)) + Math.max(1, Math.min(120, minutes)),
        completed_modules: Number(day?.completed_modules || 0) + 1
      }, { onConflict: "user_id,study_date" });
    } catch (error) {
      console.warn("Study calendar update unavailable", error);
    }
  }
  return respond(200, "");
}
