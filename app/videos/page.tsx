import { PublicNav } from "@/components/PublicNav";
import { VideoCard } from "@/components/VideoCard";
import { createClient } from "@/lib/supabase/server";
import { getUser, getProfile } from "@/lib/auth";

export default async function VideosPage() {
  const supabase = await createClient();
  const user = await getUser();
  const profile = user ? await getProfile(user.id) : null;

  const { data: videos } = await supabase
    .from("videos")
    .select("id,title,youtube_id,branch,topic,plan_required,sort_order")
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  return (
    <>
      <PublicNav />
      <main className="container hero">
        <span className="badge">Video Kütüphanesi</span>
        <h1>Olimpiyat arşivi.</h1>
        <div className="grid grid-3">
          {(videos || []).map((video) => (
            <VideoCard key={video.id} video={video} userPlan={profile?.plan || "free"} />
          ))}
        </div>
      </main>
    </>
  );
}
