import { requireUser, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { canAccess } from "@/lib/plans";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default async function LessonPage({ params }: { params: { id: string } }) {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const supabase = await createClient();

  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("id", Number(params.id))
    .single();

  if (!video) redirect("/videos");

  if (!canAccess(profile?.plan || "free", video.plan_required)) {
    redirect(`/pricing?upgrade=${video.plan_required}`);
  }

  const { data: progress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("user_id", user.id)
    .eq("video_id", video.id)
    .maybeSingle();

  return (
    <div className="app-shell">
      <Sidebar active="videos" />
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
              {progress?.completed ? "Tamamlandı ✓" : "Dersi tamamlandı işaretle"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
