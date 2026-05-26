import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function DashboardPage() {
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
  const level = profile?.level || "Başlangıç";
  const goal = profile?.goal || "Onboarding tamamlanmadı";

  return (
    <div className="ol-dashboard">
      <aside className="ol-sidebar">
        <a href="/" className="ol-brand">
          <div className="ol-brand-badge">O</div>
          <div>
            <strong>Olympion Lab</strong>
            <span>Öğrenci Paneli</span>
          </div>
        </a>

        <nav className="ol-nav">
          <a className="active" href="/dashboard">Genel</a>
          <a href="/videos">Videolar</a>
          <a href="/dashboard#rota">Rota</a>
          <a href="/ai-coach">Koç</a>
          <a href="/admin">Admin</a>
        </nav>

        <div className="ol-upgrade">
          <small>PRO</small>
          <strong>Rotanı kilitsiz kullan.</strong>
          <p>Premium dersler, PDF notlar ve deney arşivi.</p>
          <a href="/pricing">Planı yükselt →</a>
        </div>

        <form action={signOut}>
          <button className="ol-signout" type="submit">Çıkış</button>
        </form>

        <a className="ol-back" href="/">← Ana siteye dön</a>
      </aside>

      <main className="ol-main">
        <header className="ol-header">
          <div>
            <span className="ol-pill">DASHBOARD</span>
            <h1>Hoş geldin, {fullName}</h1>
            <p>{email}</p>
          </div>

          <a className="ol-primary-link" href="/onboarding">
            Onboarding’i tamamla →
          </a>
        </header>

        <section className="ol-grid">
          <article className="ol-card">
            <span>Aktif plan</span>
            <strong>{plan}</strong>
            <p>Mevcut erişim seviyen.</p>
          </article>

          <article className="ol-card">
            <span>Tamamlanan video</span>
            <strong>0</strong>
            <p>İlerleme takibi yakında burada.</p>
          </article>

          <article className="ol-card">
            <span>Branş</span>
            <strong>{branch}</strong>
            <p>Onboarding ile hedef branşını seç.</p>
          </article>

          <article className="ol-card">
            <span>Seviye</span>
            <strong>{level}</strong>
            <p>Çalışma rotan seviyene göre şekillenecek.</p>
          </article>
        </section>

        <section className="ol-section" id="rota">
          <div>
            <span className="ol-pill">ROTA</span>
            <h2>Bugünkü çalışma alanın</h2>
            <p>{goal}</p>
          </div>

          <div className="ol-task-list">
            <div className="ol-task">
              <span>01</span>
              <div>
                <strong>İlk hedefini belirle</strong>
                <p>Branş, seviye ve hedef sınav bilgilerini tamamla.</p>
              </div>
            </div>

            <div className="ol-task">
              <span>02</span>
              <div>
                <strong>Free videolardan başla</strong>
                <p>Video erişim sistemi bağlandığında içerikler burada listelenecek.</p>
              </div>
            </div>

            <div className="ol-task">
              <span>03</span>
              <div>
                <strong>AI Koç’u kullan</strong>
                <p>Çalışma planı ve soru çözüm stratejisi için koç modülü hazırlanıyor.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <style>{`
        .ol-dashboard {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 280px 1fr;
          background:
            radial-gradient(circle at top left, rgba(98, 210, 255, 0.16), transparent 34%),
            radial-gradient(circle at bottom right, rgba(130, 110, 255, 0.12), transparent 36%),
            #050b14;
          color: #f5f8ff;
        }

        .ol-sidebar {
          border-right: 1px solid rgba(255,255,255,0.08);
          background: rgba(5, 13, 24, 0.82);
          backdrop-filter: blur(18px);
          padding: 28px 22px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .ol-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          color: inherit;
          text-decoration: none;
        }

        .ol-brand-badge {
          width: 44px;
          height: 44px;
          border-radius: 16px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #78e7ff, #7aa7ff);
          color: #02111f;
          font-weight: 900;
        }

        .ol-brand strong {
          display: block;
          font-size: 16px;
          letter-spacing: -0.02em;
        }

        .ol-brand span {
          display: block;
          color: rgba(245,248,255,0.62);
          font-size: 12px;
          margin-top: 2px;
        }

        .ol-nav {
          display: grid;
          gap: 8px;
        }

        .ol-nav a {
          color: rgba(245,248,255,0.76);
          text-decoration: none;
          padding: 13px 14px;
          border-radius: 16px;
          font-weight: 700;
          transition: 0.18s ease;
        }

        .ol-nav a:hover,
        .ol-nav a.active {
          color: #fff;
          background: rgba(120, 231, 255, 0.12);
          box-shadow: inset 0 0 0 1px rgba(120, 231, 255, 0.16);
        }

        .ol-upgrade {
          margin-top: auto;
          padding: 18px;
          border-radius: 22px;
          background: linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03));
          border: 1px solid rgba(255,255,255,0.1);
        }

        .ol-upgrade small {
          color: #ffe98a;
          font-weight: 900;
          letter-spacing: 0.1em;
        }

        .ol-upgrade strong {
          display: block;
          margin-top: 8px;
          font-size: 16px;
        }

        .ol-upgrade p {
          color: rgba(245,248,255,0.62);
          font-size: 13px;
          line-height: 1.55;
        }

        .ol-upgrade a,
        .ol-back,
        .ol-primary-link {
          color: #75f1ff;
          text-decoration: none;
          font-weight: 800;
        }

        .ol-signout {
          width: 100%;
          border: 1px solid rgba(255, 120, 150, 0.28);
          color: #ffc4cf;
          background: rgba(255, 78, 116, 0.08);
          padding: 13px 14px;
          border-radius: 16px;
          font-weight: 800;
          cursor: pointer;
        }

        .ol-back {
          font-size: 13px;
        }

        .ol-main {
          padding: 42px;
        }

        .ol-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .ol-pill {
          display: inline-flex;
          width: fit-content;
          padding: 7px 12px;
          border-radius: 999px;
          border: 1px solid rgba(120,231,255,0.22);
          background: rgba(120,231,255,0.08);
          color: #8ef4ff;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .ol-header h1 {
          margin: 16px 0 8px;
          font-size: clamp(32px, 4vw, 58px);
          letter-spacing: -0.06em;
          line-height: 0.96;
        }

        .ol-header p,
        .ol-section p,
        .ol-card p,
        .ol-task p {
          color: rgba(245,248,255,0.64);
        }

        .ol-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .ol-card,
        .ol-section {
          border: 1px solid rgba(255,255,255,0.1);
          background:
            linear-gradient(180deg, rgba(255,255,255,0.075), rgba(255,255,255,0.035));
          border-radius: 28px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.24);
        }

        .ol-card {
          padding: 22px;
        }

        .ol-card span {
          color: rgba(245,248,255,0.58);
          font-size: 13px;
          font-weight: 800;
        }

        .ol-card strong {
          display: block;
          margin-top: 12px;
          font-size: 30px;
          letter-spacing: -0.04em;
        }

        .ol-section {
          padding: 28px;
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 24px;
        }

        .ol-section h2 {
          margin: 16px 0 10px;
          font-size: 34px;
          letter-spacing: -0.04em;
        }

        .ol-task-list {
          display: grid;
          gap: 12px;
        }

        .ol-task {
          display: flex;
          gap: 14px;
          padding: 16px;
          border-radius: 20px;
          background: rgba(5, 13, 24, 0.48);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .ol-task > span {
          width: 38px;
          height: 38px;
          flex: 0 0 38px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(120,231,255,0.12);
          color: #8ef4ff;
          font-weight: 900;
        }

        .ol-task strong {
          display: block;
          margin-bottom: 5px;
        }

        @media (max-width: 980px) {
          .ol-dashboard {
            grid-template-columns: 1fr;
          }

          .ol-sidebar {
            position: relative;
          }

          .ol-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .ol-section {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 620px) {
          .ol-main {
            padding: 24px;
          }

          .ol-grid {
            grid-template-columns: 1fr;
          }

          .ol-header {
            display: grid;
          }
        }
      `}</style>
    </div>
  );
}
