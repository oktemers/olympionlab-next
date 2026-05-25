import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const videoId = Number(url.searchParams.get("videoId"));
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user || !videoId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  await supabase.from("user_progress").upsert({
    user_id: data.user.id,
    video_id: videoId,
    completed: true,
    watched_seconds: 999999,
    updated_at: new Date().toISOString()
  }, { onConflict: "user_id,video_id" });

  return NextResponse.redirect(new URL(`/lesson/${videoId}`, request.url));
}
