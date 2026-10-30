import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canAccess, type Plan } from "@/lib/plans";

const isPlan = (value: unknown): value is Plan =>
  value === "free" || value === "plus" || value === "pro" || value === "mentor";

export async function POST(request: Request) {
  const url = new URL(request.url);

  // An HTML form posts with the browser's Origin. Reject foreign-site requests.
  const origin = request.headers.get("origin");
  if ((origin && origin !== url.origin) || request.headers.get("sec-fetch-site") === "cross-site") {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }

  const rawId = url.searchParams.get("videoId");
  const videoId = rawId && /^\d+$/.test(rawId) ? Number(rawId) : NaN;
  if (!Number.isSafeInteger(videoId) || videoId <= 0) {
    return NextResponse.json({ error: "Geçersiz ders kimliği." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.redirect(new URL("/giris", request.url), 303);
  }

  const [{ data: video, error: videoError }, { data: profile, error: profileError }] = await Promise.all([
    supabase.from("videos").select("id,plan_required").eq("id", videoId).maybeSingle(),
    supabase.from("profiles").select("plan").eq("id", user.id).maybeSingle()
  ]);
  if (videoError || profileError) {
    console.error("Progress lookup failed", videoError?.message || profileError?.message);
    return NextResponse.json({ error: "Ders bilgisi kontrol edilemedi." }, { status: 503 });
  }
  if (!video) {
    return NextResponse.json({ error: "Ders bulunamadı." }, { status: 404 });
  }

  const currentPlan = isPlan(profile?.plan) ? profile.plan : "free";
  const requiredPlan = isPlan(video.plan_required) ? video.plan_required : "free";
  if (!canAccess(currentPlan, requiredPlan)) {
    return NextResponse.json({ error: "Bu ders için üyelik gerekiyor." }, { status: 403 });
  }

  // This is a student-declared completion, not verified playback duration.
  // Never fabricate "watched_seconds" (the old endpoint inserted 999999).
  const { data: existing, error: existingError } = await supabase
    .from("user_progress")
    .select("watched_seconds")
    .eq("user_id", user.id)
    .eq("video_id", videoId)
    .maybeSingle();
  if (existingError) {
    console.error("Progress read failed", existingError.message);
    return NextResponse.json({ error: "İlerleme bilgisi alınamadı." }, { status: 503 });
  }

  const { error: saveError } = await supabase.from("user_progress").upsert({
    user_id: user.id,
    video_id: videoId,
    completed: true,
    watched_seconds: Math.max(0, Number(existing?.watched_seconds) || 0),
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id,video_id" });

  if (saveError) {
    console.error("Progress save failed", saveError.message);
    return NextResponse.json({ error: "İlerleme kaydedilemedi." }, { status: 503 });
  }

  return NextResponse.redirect(new URL(`/lesson/${videoId}`, request.url), 303);
}
