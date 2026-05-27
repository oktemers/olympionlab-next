import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export const dynamic = "force-dynamic";

const branchLabels: Record<string, string> = {
  physics: "Fizik",
  chemistry: "Kimya",
};

export default async function DailyProblemPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("branch")
    .eq("id", user.id)
    .maybeSingle();

  const branchKey = profile?.branch === "chemistry" ? "chemistry" : "physics";
  const branchLabel = branchLabels[branchKey];

  return (
    <>
      <link rel="stylesheet" href="/style.css" />

      <div className="app-page">
        <div className="noise"></div>

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

              <a href="/courses" className="app-link">
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

              <a href="/daily-problem" className="app-link active">
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

              <a href="/settings" className="app-link">
                <span>⚙</span>
                Ayarlar
              </a>

              <form action={signOut} className="dashboard-logout-form">
                <button className="app-link logout-sidebar" type="submit">
                  <span>⏻</span>
                  Çıkış
                </button>
              </form>
            </nav>
          </aside>

          <main className="app-main">
            <div className="app-top">
              <div>
                <span className="eyebrow">Günlük Problem</span>
                <h1>{branchLabel} problemi</h1>
                <p>
                  Bu sayfa artık çalışıyor. Sonraki adımda buraya profil bazlı
                  günlük problem bankasını yerleştireceğiz.
                </p>
              </div>

              <a className="btn btn-primary compact-btn" href="/courses">
                Derslere Dön
              </a>
            </div>

            <section className="app-panel">
              <span className="eyebrow">{branchLabel}</span>

              {branchKey === "chemistry" ? (
                <>
                  <h2>Elektron dizilimi ve 4s² yorumu</h2>
                  <p>
                    Bir elementin temel hâl elektron diziliminin son kısmı{" "}
                    <strong>4s² 3d⁶</strong> şeklindedir. Bu element hangi
                    blokta yer alır?
                  </p>
                </>
              ) : (
                <>
                  <h2>Enerji korunumu problemi</h2>
                  <p>
                    Sürtünmesiz rayda hareket eden bir cisim başlangıç
                    seviyesinden <strong>h/4</strong> kadar aşağı iniyor. Bu
                    noktadaki <strong>v²</strong> değerini bulun.
                  </p>
                </>
              )}
            </section>
          </main>
        </div>

        <style>{`
          .dashboard-logout-form {
            margin: 0;
          }

          .dashboard-logout-form .app-link {
            width: 100%;
            border: 0;
            text-align: left;
            cursor: pointer;
          }

          .app-panel h2 {
            color: #ffffff;
            margin: 8px 0 12px;
          }

          .app-panel p {
            color: rgba(235, 245, 255, 0.74);
            line-height: 1.7;
          }

          .app-panel strong {
            color: #7cf2ff;
          }
        `}</style>
      </div>
    </>
  );
}
