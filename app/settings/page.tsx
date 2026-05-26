import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,role,plan,branch,level,goal")
    .eq("id", user.id)
    .maybeSingle();

  const email = profile?.email || user.email || "";
  const fullName = profile?.full_name || email.split("@")[0] || "Öğrenci";
  const plan = profile?.plan || "free";
  const branch = profile?.branch || "Henüz seçilmedi";
  const level = profile?.level || "Henüz seçilmedi";
  const goal = profile?.goal || "Henüz seçilmedi";

  return (
    <>
      <link rel="stylesheet" href="/style.css" />

      <div className="app-page">
        <a href="/" className="app-mobile-home">
          ← Ana Sayfa
        </a>

        <div className="noise"></div>

        <div className="app-bg-formulas" aria-hidden="true">
          <span>F = ma</span>
          <span>ΔG = ΔH − TΔS</span>
          <span>∇·E = ρ/ε₀</span>
          <span>sin²x + cos²x = 1</span>
        </div>

        <div className="app-shell">
          <aside className="app-sidebar">
            <a href="/dashboard" className="app-brand">
              <div className="brand-badge">O</div>
              <div>
                Olympion
                <small>Öğrenci Paneli</small>
              </div>
            </a>

            <nav className="app-nav" aria-label="Panel menüsü">
              <a href="/dashboard" className="app-link">
                <span>⌘</span>
                Genel
              </a>

              <a href="/courses.html" className="app-link">
                <span>▶</span>
                Dersler
              </a>

              <a href="/roadmap.html" className="app-link">
                <span>🧭</span>
                Rota
              </a>

              <a href="/notes.html" className="app-link">
                <span>📚</span>
                PDF
              </a>

              <a href="/daily-problem.html" className="app-link">
                <span>🔥</span>
                Problem
              </a>

              <a href="/ai-coach.html" className="app-link">
                <span>✦</span>
                Koç
              </a>

              <a href="/student-labs.html" className="app-link">
                <span>🧪</span>
                Labs
              </a>

              <a href="/settings" className="app-link active">
                <span>⚙</span>
                Ayarlar
              </a>

              <form action={signOut} className="settings-logout-form">
                <button className="app-link logout-sidebar" type="submit">
                  <span>⏻</span>
                  Çıkış
                </button>
              </form>
            </nav>

            <div className="sidebar-upgrade">
              <span>Pro</span>
              <strong>Rotanı kilitsiz kullan.</strong>
              <p>Premium dersler, PDF notları ve deney arşivi.</p>
              <a href="/pricing.html">Planı yükselt →</a>
            </div>

            <a href="/" className="back-site">
              ← Ana siteye dön
            </a>
          </aside>

          <main className="app-main">
            <div className="app-top">
              <div>
                <span className="eyebrow">Ayarlar</span>
                <h1>Profil ayarları</h1>
                <p>Hesap bilgilerin Supabase profilinden alınır.</p>
              </div>
            </div>

            <div className="settings-grid">
              <section className="app-panel">
                <div className="panel-head">
                  <h2>Hesap bilgileri</h2>
                </div>

                <label>
                  Ad Soyad
                  <input value={fullName} readOnly />
                </label>

                <label>
                  E-posta
                  <input value={email} readOnly />
                </label>

                <label>
                  Plan
                  <input value={plan} readOnly />
                </label>

                <label>
                  Rol
                  <input value={profile?.role || "student"} readOnly />
                </label>

                <p className="auth-note">
                  Bu bilgiler kayıt olurken oluşturulan profilinden gelir.
                </p>
              </section>

              <section className="app-panel">
                <div className="panel-head">
                  <h2>Çalışma profili</h2>
                </div>

                <label>
                  Branş
                  <input value={branch} readOnly />
                </label>

                <label>
                  Seviye
                  <input value={level} readOnly />
                </label>

                <label>
                  Hedef
                  <input value={goal} readOnly />
                </label>

                <a className="btn btn-secondary compact-btn" href="/dashboard">
                  Dashboard’a dön
                </a>
              </section>
            </div>
          </main>
        </div>

        <style>{`
          .settings-logout-form {
            margin: 0;
          }

          .settings-logout-form .app-link {
            width: 100%;
            border: 0;
            text-align: left;
            cursor: pointer;
          }
        `}</style>
      </div>
    </>
  );
}
