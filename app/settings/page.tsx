import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { updateProfile } from "@/app/settings/actions";

type SettingsSearchParams = {
  error?: string;
  message?: string;
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<SettingsSearchParams>;
}) {
  const params = await searchParams;
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
const role = profile?.role || "student";
const branch = profile?.branch || "";
const level = profile?.level || "";
const goal = profile?.goal || "";

const displayPlan =
  plan === "free"
    ? "Ücretsiz"
    : plan === "plus"
      ? "Plus"
      : plan === "pro"
        ? "Pro"
        : plan;

const displayRole =
  role === "admin"
    ? "Admin"
    : "Öğrenci";
 

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
                <p>Adını ve çalışma profilini buradan güncelleyebilirsin.</p>
              </div>
            </div>

            {params?.error && (
              <div className="app-panel settings-status settings-error">
                {params.error}
              </div>
            )}

            {params?.message && (
              <div className="app-panel settings-status settings-success">
                {params.message}
              </div>
            )}

            <form action={updateProfile} className="settings-grid">
              <section className="app-panel">
                <div className="panel-head">
                  <h2>Hesap bilgileri</h2>
                </div>

                <label>
                  Ad Soyad
                  <input
                    name="full_name"
                    defaultValue={fullName}
                    placeholder="Adın ve soyadın"
                    required
                  />
                </label>

                <label>
                  E-posta
                  <input value={email} readOnly />
                </label>

                <label>
  Plan
  <input value={displayPlan} readOnly />
</label>

<label>
  Rol
  <input value={displayRole} readOnly />
</label>

                <p className="auth-note">
                  E-posta, plan ve rol alanları güvenlik için kullanıcı tarafından
                  değiştirilemez.
                </p>
              </section>

              <section className="app-panel">
                <div className="panel-head">
                  <h2>Çalışma profili</h2>
                </div>

                <label>
                  Branş
                  <select name="branch" defaultValue={branch}>
                    <option value="">Henüz seçilmedi</option>
                    <option value="Fizik">Fizik</option>
                    <option value="Kimya">Kimya</option>
                    <option value="Matematik">Matematik</option>
                    <option value="Biyoloji">Biyoloji</option>
                    <option value="TÜBİTAK Proje">TÜBİTAK Proje</option>
                  </select>
                </label>

                <label>
                  Seviye
                  <select name="level" defaultValue={level}>
                    <option value="">Henüz seçilmedi</option>
                    <option value="Başlangıç">Başlangıç</option>
                    <option value="Orta">Orta</option>
                    <option value="İleri">İleri</option>
                  </select>
                </label>

                <label>
                  Hedef
                  <select name="goal" defaultValue={goal}>
                    <option value="">Henüz seçilmedi</option>
                    <option value="TÜBİTAK 1. Aşama">TÜBİTAK 1. Aşama</option>
                    <option value="TÜBİTAK 2. Aşama">TÜBİTAK 2. Aşama</option>
                    <option value="Uluslararası Olimpiyat">Uluslararası Olimpiyat</option>
                    <option value="Kavram öğrenmek">Kavram öğrenmek</option>
                  </select>
                </label>

                <button className="btn btn-primary compact-btn" type="submit">
                  Değişiklikleri kaydet
                </button>

                <a className="btn btn-secondary compact-btn" href="/dashboard">
                  Dashboard’a dön
                </a>
              </section>
            </form>
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

          .settings-status {
            margin-bottom: 18px;
            padding: 16px 18px;
            font-weight: 800;
          }

          .settings-error {
            border-color: rgba(255, 120, 150, 0.35);
            color: #ffd0d8;
            background: rgba(255, 78, 116, 0.08);
          }

          .settings-success {
            border-color: rgba(124, 242, 255, 0.35);
            color: #cfffff;
            background: rgba(124, 242, 255, 0.08);
          }

          .settings-grid button,
          .settings-grid a.btn {
            margin-top: 8px;
          }

          .settings-grid select,
.settings-grid select option {
  background: #081222;
  color: #f7fbff;
}

.settings-grid select:focus {
  border-color: rgba(124, 242, 255, 0.45);
  box-shadow: 0 0 0 3px rgba(124, 242, 255, 0.08);
}

.settings-grid input[readonly] {
  color: #f7fbff;
  opacity: 1;
}
        `}</style>
      </div>
    </>
  );
}
