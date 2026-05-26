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

  const { count } = await supabase
    .from("user_progress")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const email = profile?.email || user.email || "";
  const fullName = profile?.full_name || email.split("@")[0] || "Öğrenci";
  const plan = profile?.plan || "free";
  const branch = profile?.branch || "Seçilmedi";
  const level = profile?.level || "Başlangıç";
  const goal = profile?.goal || "TÜBİTAK 1. Aşama";
  const completedCount = count || 0;

  return (
    <>
      <link rel="stylesheet" href="/style.css" />

      <div className="app-page">
        <div className="noise"></div>

        <div className="app-bg-formulas" aria-hidden="true">
          <span>∇·E = ρ/ε₀</span>
          <span>ATP → ADP + Pi</span>
          <span>E = mc²</span>
          <span>a² + b² = c²</span>
        </div>

        <div className="app-shell">
          <aside className="app-sidebar">
            <a href="/" className="app-brand">
              <div className="brand-badge">O</div>
              <div>
                Olympion
                <small>Öğrenci Paneli</small>
              </div>
            </a>

            <nav className="app-nav" aria-label="Dashboard menüsü">
              <a className="app-link active" href="/dashboard">
                <span>⌘</span>
                Genel
              </a>

              <a className="app-link" href="/videos.html">
                <span>▶</span>
                Videolar
              </a>

              <a className="app-link" href="/dashboard#rota">
                <span>🧭</span>
                Rota
              </a>

              <a className="app-link" href="/ai-coach">
                <span>✦</span>
                Koç
              </a>

              <a className="app-link" href="/admin">
                <span>⚙</span>
                Admin
              </a>

              <form action={signOut}>
                <button className="app-link logout-link" type="submit">
                  <span>⏻</span>
                  Çıkış
                </button>
              </form>
            </nav>

            <div className="sidebar-upgrade">
              <span>PRO</span>
              <strong>Rotanı kilitsiz kullan.</strong>
              <p>Premium dersler, PDF notlar ve deney arşivi.</p>
              <a href="/pricing.html">Planı yükselt →</a>
            </div>

            <a className="back-site" href="/">
              ← Ana siteye dön
            </a>
          </aside>

          <main className="app-main">
            <header className="app-top">
              <div>
                <div className="eyebrow">DASHBOARD</div>
                <h1>Hoş geldin, {fullName}</h1>
                <p>
                  Rotan henüz oluşmadı. Onboarding’i tamamlayarak branş, seviye ve hedef
                  bilgilerini seçebilirsin.
                </p>
              </div>

              <a href="/onboarding" className="btn btn-primary compact-btn">
                Onboarding’i tamamla →
              </a>
            </header>

            <section className="metric-grid">
              <article className="metric-card">
                <span>Aktif plan</span>
                <strong>{plan}</strong>
                <p>Mevcut erişim seviyen.</p>
              </article>

              <article className="metric-card">
                <span>Tamamlanan video</span>
                <strong>{completedCount}</strong>
                <p>İlerleme takibi burada görünür.</p>
              </article>

              <article className="metric-card">
                <span>Branş</span>
                <strong>{branch}</strong>
                <p>Hedef branşın.</p>
              </article>

              <article className="metric-card">
                <span>Seviye</span>
                <strong>{level}</strong>
                <p>Çalışma başlangıç seviyen.</p>
              </article>
            </section>

            <section className="app-panel continue-card">
              <div>
                <div className="eyebrow">DEVAM ET</div>
                <h2>Bugünkü çalışma rotan</h2>
                <p>
                  {goal}. Video, problem ve not akışını tamamladıkça ilerleme çubuğun
                  güncellenecek.
                </p>

                <div className="progress-track">
                  <i style={{ width: completedCount > 0 ? "24%" : "7%" }}></i>
                </div>
              </div>

              <a className="btn btn-secondary" href="/videos.html">
                Video kütüphanesine git
              </a>
            </section>

            <div className="app-grid">
              <section className="app-panel" id="rota">
                <div className="panel-head">
                  <h2>Çalışma rotası</h2>
                  <a href="/onboarding">Düzenle →</a>
                </div>

                <div className="task-list">
                  <label>
                    <input type="checkbox" />
                    İlk hedefini belirle
                  </label>

                  <label>
                    <input type="checkbox" />
                    Free videolardan bir ders izle
                  </label>

                  <label>
                    <input type="checkbox" />
                    Günün problemini çöz
                  </label>

                  <label>
                    <input type="checkbox" />
                    Koç’a bir soru sor
                  </label>
                </div>
              </section>

              <section className="app-panel">
                <div className="panel-head">
                  <h2>Profil özeti</h2>
                  <a href="/settings">Ayarlar →</a>
                </div>

                <div className="note-mini">
                  <strong>E-posta</strong>
                  <span>{email}</span>
                </div>

                <div className="note-mini">
                  <strong>Plan</strong>
                  <span>{plan}</span>
                </div>

                <div className="note-mini">
                  <strong>Rol</strong>
                  <span>{profile?.role || "student"}</span>
                </div>

                <div className="note-mini">
                  <strong>Hedef</strong>
                  <span>{goal}</span>
                </div>
              </section>

              <section className="app-panel wide">
                <div className="panel-head">
                  <h2>Sıradaki dersler</h2>
                  <a href="/videos.html">Tümünü gör →</a>
                </div>

                <div className="video-grid mini-video-grid">
                  <a className="video-card" href="/videos.html">
                    <div className="thumb">
                      <div className="thumb-fallback">
                        Fizik
                        <br />
                        <small>TÜBİTAK Ulusal Fizik Olimpiyatı çözüm serisi</small>
                      </div>
                      <div className="play">▶</div>
                      <div className="duration">10:31</div>
                    </div>

                    <div className="video-body">
                      <span className="mini-tag">Sıradaki ders</span>
                      <h3>Fizik Olimpiyatı soru çözümü</h3>
                      <p>Model kurma ve sezgisel fizik yaklaşımıyla detaylı çözüm.</p>
                    </div>
                  </a>

                  <a className="video-card" href="/videos.html">
                    <div className="thumb">
                      <div className="thumb-fallback">
                        Kimya
                        <br />
                        <small>TÜBİTAK Ulusal Kimya Olimpiyatı çözüm serisi</small>
                      </div>
                      <div className="play">▶</div>
                      <div className="duration">12:40</div>
                    </div>

                    <div className="video-body">
                      <span className="mini-tag">Önerilen</span>
                      <h3>Kimya Olimpiyatı soru çözümü</h3>
                      <p>Kavramsal analiz ve hesaplama stratejisiyle ilerle.</p>
                    </div>
                  </a>
                </div>
              </section>

              <section className="app-panel">
                <div className="panel-head">
                  <h2>PDF notları</h2>
                  <a href="/notes.html">Aç →</a>
                </div>

                <p>
                  Konu özeti, formül haritası ve soru setleri Plus/Pro planlarla
                  açılacak.
                </p>

                <a className="btn btn-secondary compact-btn" href="/pricing.html">
                  Planları incele
                </a>
              </section>

              <section className="app-panel">
                <div className="panel-head">
                  <h2>AI Koç</h2>
                  <a href="/ai-coach">Koç’a git →</a>
                </div>

                <p>
                  Takıldığın soruda direkt cevap yerine ipucu, strateji ve düşünme yolu
                  al.
                </p>

                <button className="prompt-btn" type="button">
                  Enerji mi momentum mu kullanmalıyım?
                </button>

                <button className="prompt-btn" type="button">
                  Bugün hangi konuyu tekrar etmeliyim?
                </button>
              </section>
            </div>
          </main>
        </div>

        <style>{`
          .logout-link {
            width: 100%;
            border: 0;
            background: transparent;
            cursor: pointer;
            text-align: left;
          }

          .logout-link:hover {
            background: rgba(255, 116, 146, 0.11);
            color: #ffd5dd;
          }

          .app-sidebar form {
            margin: 0;
          }

          .continue-card {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
            margin-bottom: 18px;
          }

          @media (max-width: 760px) {
            .continue-card {
              display: block;
            }

            .continue-card .btn {
              margin-top: 12px;
              width: 100%;
            }
          }
        `}</style>
      </div>
    </>
  );
}
