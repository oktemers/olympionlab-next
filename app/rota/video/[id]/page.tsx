import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasPlusAccess } from "@/lib/plans";
import { Sidebar } from "@/components/Sidebar";
import TrackedYouTubePlayer from "@/components/TrackedYouTubePlayer";

export const metadata = { title: "Video Ders | OlympionLab" };

export default async function RoadmapLesson({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(id)) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");
  const { data: profile } = await supabase.from("profiles").select("plan,role,branch").eq("id", user.id).maybeSingle();
  if (profile?.role !== "admin" && !hasPlusAccess(profile?.plan)) redirect("/odeme?plan=plus");

  const { data: sections, error } = await supabase.from("course_sections")
    .select("id,stage,branch,lesson_videos(id,title,description,youtube_id,is_active,duration_seconds)")
    .eq("branch", profile?.branch ?? "").eq("is_active", true);
  if (error) throw new Error("Video listesi yüklenemedi.");
  const lessons = (sections || []).filter(section => section.stage !== "guidance")
    .flatMap(section => section.lesson_videos || []);
  const video = lessons.find(item => item.id === id && item.is_active);
  if (!video) notFound();

  const { data: progress } = await supabase.from("user_video_progress")
    .select("is_completed,progress_percent").eq("user_id", user.id).eq("video_id", id).maybeSingle();
  const completed = !!progress?.is_completed || Number(progress?.progress_percent || 0) >= 100;
  const playable = typeof video.youtube_id === "string" && /^[A-Za-z0-9_-]{11}$/.test(video.youtube_id);

  return <><link rel="stylesheet" href="/style.css" />
    <div className="app-page"><div className="app-shell">
      <Sidebar active="courses" />
      <main className="app-main" style={{ maxWidth: 1080, margin: "0 auto", width: "100%", paddingBottom: 70 }}>
        <Link href="/rota/adim/2" style={{ color: "#8fe8f0", fontSize: 13, textDecoration: "none", fontWeight: 800 }}>← Yol haritasına dön</Link>
        <span style={{ display: "block", color: "#8fe8f0", fontSize: 12, marginTop: 30, letterSpacing: ".11em" }}>OLYMPION PLUS / VİDEO DERS</span>
        <h1 style={{ color: "#f2fbff", margin: "10px 0 15px", fontSize: "clamp(26px, 4vw, 41px)" }}>{video.title}</h1>
        <p style={{ color: "#a9c3d5", lineHeight: 1.7 }}>{video.description || "Bu derste olimpiyat sorularının çözüm yaklaşımını incele."}</p>
        <section style={{ overflow: "hidden", padding: 18, borderRadius: 20, border: "1px solid rgba(124,242,255,.18)", background: "#0e2134", marginTop: 22 }}>
          {playable ?
            <TrackedYouTubePlayer key={id} id={id} kind="lesson" videoId={video.youtube_id!} initialCompleted={completed} returnTo={"/rota/video/" + id} />
            : <div style={{ textAlign: "center", padding: 32, color: "#b5cbda" }}>
              Bu videonun YouTube bağlantısı henüz eklenmemiş. Video yüklenince burada oynatılacak; izlenmediği için tamamlandı olarak kaydedilemez.
            </div>}
        </section>
        <p style={{ marginTop: 15, color: "#95b2c7", fontSize: 13 }}>Video sonunda ilerleme otomatik kaydedilir. Gerekirse “İzledim, tamamla” butonunu da kullanabilirsin.</p>
      </main>
    </div></div>
  </>;
}
