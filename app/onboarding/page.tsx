import { Sidebar } from "@/components/Sidebar";
import { requireUser } from "@/lib/auth";
import { saveOnboarding } from "./actions";

export default async function OnboardingPage() {
  await requireUser();

  return (
    <div className="app-shell">
      <Sidebar active="onboarding" />
      <main className="main">
        <span className="badge">İlk Kurulum</span>
        <h1>Rotanı oluşturalım.</h1>
        <form className="card form" action={saveOnboarding}>
          <label>Branş<select name="branch"><option value="physics">Fizik</option><option value="chemistry">Kimya</option><option value="math">Matematik</option><option value="biology">Biyoloji</option></select></label>
          <label>Seviye<select name="level"><option value="beginner">Başlangıç</option><option value="intermediate">Orta</option><option value="advanced">İleri</option></select></label>
          <label>Hedef<select name="goal"><option value="tubitak-1">TÜBİTAK 1. Aşama</option><option value="tubitak-2">TÜBİTAK 2. Aşama</option><option value="international">Uluslararası</option><option value="conceptual">Kavram öğrenmek</option></select></label>
          <label>Haftalık çalışma<select name="study_days"><option value="2">2 gün</option><option value="3-4">3-4 gün</option><option value="5+">5+ gün</option><option value="daily">Her gün</option></select></label>
          <button className="btn btn-primary" type="submit">Rotamı Oluştur</button>
        </form>
      </main>
    </div>
  );
}
