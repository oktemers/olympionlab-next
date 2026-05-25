import { Sidebar } from "@/components/Sidebar";
import { requireUser, getProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const user = await requireUser();
  const profile = await getProfile(user.id);
  const supabase = await createClient();

  const { data: progress } = await supabase
    .from("user_progress")
    .select("completed")
    .eq("user_id", user.id);

  const completed = progress?.filter((p) => p.completed).length ?? 0;

  return (
    <div className="app-shell">
      <Sidebar active="dashboard" />
      <main className="main">
        <span className="badge">Dashboard</span>
        <h1>Hoş geldin, {profile?.full_name || user.email}</h1>
        {!profile?.branch && (
          <p className="notice">Rotan henüz oluşmadı. <a href="/onboarding">Onboarding’i tamamla →</a></p>
        )}
        <div className="grid grid-3">
          <div className="card"><h2>{profile?.plan || "free"}</h2><p className="muted">Aktif plan</p></div>
          <div className="card"><h2>{completed}</h2><p className="muted">Tamamlanan video</p></div>
          <div className="card"><h2>{profile?.branch || "Seçilmedi"}</h2><p className="muted">Branş</p></div>
        </div>
      </main>
    </div>
  );
}
