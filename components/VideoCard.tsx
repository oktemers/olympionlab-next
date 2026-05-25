import { canAccess, planLabel, type Plan } from "@/lib/plans";

type Props = {
  video: { id: number; title: string; youtube_id: string; branch: string; topic: string | null; plan_required: Plan };
  userPlan?: Plan | null;
  progress?: number;
};

const branchLabel: Record<string, string> = { physics: "Fizik", chemistry: "Kimya", math: "Matematik", biology: "Biyoloji" };

export function VideoCard({ video, userPlan = "free", progress = 0 }: Props) {
  const allowed = canAccess(userPlan, video.plan_required);
  const href = allowed ? `/lesson/${video.id}` : `/pricing?upgrade=${video.plan_required}`;
  return (
    <a className="video-card" href={href}>
      <img src={`https://i.ytimg.com/vi/${video.youtube_id}/hqdefault.jpg`} alt={video.title} />
      <div className="video-info">
        <div className="video-meta"><span>{branchLabel[video.branch] || video.branch}</span><span>{planLabel(video.plan_required)}</span></div>
        <h3>{video.title}</h3>
        <p>{video.topic || "Olimpiyat hazırlık videosu"}</p>
        {!allowed && <p className="premium-note">🔒 {planLabel(video.plan_required)} erişimi gerekli</p>}
        {allowed && <div className="next-progress"><span style={{ width: `${Math.min(100, progress)}%` }} /></div>}
      </div>
    </a>
  );
}
