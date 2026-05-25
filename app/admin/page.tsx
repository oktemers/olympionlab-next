import { Sidebar } from "@/components/Sidebar";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createVideo } from "./actions";

export default async function AdminPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: videos } = await supabase.from("videos").select("*").order("created_at", { ascending: false }).limit(20);

  return (
    <div className="app-shell">
      <Sidebar active="admin" />
      <main className="main">
        <span className="badge">Admin</span>
        <h1>Video yönetimi</h1>
        <div className="grid grid-2">
          <form className="card form" action={createVideo}>
            <label>Başlık<input name="title" required /></label>
            <label>YouTube ID<input name="youtube_id" required /></label>
            <label>Branş<select name="branch"><option value="physics">Fizik</option><option value="chemistry">Kimya</option><option value="math">Matematik</option><option value="biology">Biyoloji</option></select></label>
            <label>Konu<input name="topic" /></label>
            <label>Seviye<select name="level"><option value="beginner">Başlangıç</option><option value="intermediate">Orta</option><option value="advanced">İleri</option></select></label>
            <label>Plan<select name="plan_required"><option value="free">Free</option><option value="plus">Plus</option><option value="pro">Pro</option></select></label>
            <label>Sıra<input name="sort_order" type="number" defaultValue="0" /></label>
            <label>Açıklama<textarea name="description" /></label>
            <label><input name="is_published" type="checkbox" /> Yayında</label>
            <button className="btn btn-primary" type="submit">Videoyu Kaydet</button>
          </form>
          <section className="card">
            <h2>Son videolar</h2>
            <table className="table">
              <thead><tr><th>Başlık</th><th>Plan</th><th>Yayın</th></tr></thead>
              <tbody>
                {(videos || []).map((v) => (
                  <tr key={v.id}><td>{v.title}</td><td>{v.plan_required}</td><td>{v.is_published ? "Evet" : "Taslak"}</td></tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </main>
    </div>
  );
}
