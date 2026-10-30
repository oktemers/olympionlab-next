import { requireUser, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { canAccess } from "@/lib/plans";
import { notFound, redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const videoId = /^\\d+$/.test(id) ? Number(id) : NaN;
  if (!Number.isSafeInteger(videoId) || videoId <= 0) notFound();
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const supabase = await createClient();

  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("id", videoId)
    .single();

  if (!video) notFound();

  if (!canAccess(profile?.plan || "free", video.plan_required)) {
    redirect(`/fiyatlandirma?upgrade=${encodeURIComponent(video.plan_required || "plus")}`);
  }

  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("video_id", video.id)
    .maybeSingle();

  return (
    <><link rel="stylesheet" href="/style.css"/><div className="app-page"><div className="app-shell">
      <Sidebar active="courses" />
      <main className="main">
        <span className="badge">{video.branch}</span>
        <h1>{video.title}</h1>
        <div className="card">
          <iframe
            width="100%"
            height="520"
            style={{ border: 0, borderRadius: 20 }}
            src={`https://www.youtube-nocookie.com/embed/${video.youtube_id}`}
            title={video.title}
            allowFullScreen
          />
          <p className="muted">{video.description}</p>
          <form action={`/api/progress?videoId=${video.id}`} method="post">
            <button className="btn btn-primary" type="submit">
              {progress?.completed ? "Tamamlandı ✓" : "Dersi tamamladım (kendim işaretle)"}
            </button>
          </form>
        </div>
      </main>
    </div></div></>
  );
}
