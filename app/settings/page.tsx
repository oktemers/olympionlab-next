import { Sidebar } from "@/components/Sidebar";
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
          <Sidebar active="settings" />

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



                <p className="auth-note">
                  E-posta ve plan alanları güvenlik için kullanıcı tarafından
                  değiştirilemez.
                </p>
              </section>

              <section className="app-panel">
                <div className="panel-head">
                  <h2>Çalışma profili</h2>
                </div>

                <label>
                  Branş
                  <select name="branch" defaultValue={branch} required>
                    <option value="" disabled>Branş seç</option>
                    <option value="physics">Fizik</option>
                    <option value="chemistry">Kimya</option>
                    <option value="math">Matematik</option>
                    <option value="biology">Biyoloji</option>
                  </select>
                </label>

                <label>
                  Seviye
                  <select name="level" defaultValue={level} required>
                    <option value="" disabled>Seviye seç</option>
                    <option value="beginner">Başlangıç</option>
                    <option value="intermediate">Orta</option>
                    <option value="advanced">İleri</option>
                  </select>
                </label>

                <label>
                  Hedef
                  <input name="goal" defaultValue={goal} maxLength={160}
                    placeholder="Örn. TÜBİTAK Fizik 1. aşamaya hazırlanmak" />
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
