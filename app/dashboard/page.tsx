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
  const firstName = fullName.split(" ")[0] || "Öğrenci";
  const branch = profile?.branch || "Fizik";
  const level = profile?.level || "Başlangıç";
  const goal = profile?.goal || "TÜBİTAK 1. Aşama";
  const completedCount = count || 0;

  return (
    <>
      <link rel="stylesheet" href="/style.css" />

      <div className="app-page">
        <a href="/" className="app-mobile-home">
          ← Ana Sayfa
        </a>

        <div className="noise"></div>
        <div id="cursorFormulaLayer" className="cursor-formula-layer" aria-hidden="true"></div>

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
              <a href="/dashboard" className="app-link active">
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
                <span className="eyebrow">Genel</span>
                <h1>Hoş geldin, {firstName}.</h1>
                <p>Bugünkü hedef: 1 ders, 3 problem, 1 PDF notu.</p>
              </div>

              <a
                className="btn btn-primary compact-btn"
                href="/lesson.html?course=physics-mechanics&id=QYXfaRyjdws"
              >
                Kaldığın Yerden Devam Et
              </a>
            </div>

            <div className="continue-card app-panel">
              <div>
                <span className="eyebrow">Devam Et</span>
                <h2>Mekanik #1 • TÜBİTAK 2025 Soru 1</h2>
                <p>%68 tamamlandı. Odak modunda izlemeye devam edebilirsin.</p>
                <div className="progress-track">
                  <i style={{ width: completedCount > 0 ? "68%" : "12%" }}></i>
                </div>
              </div>

              <a
                className="btn btn-secondary compact-btn"
                href="/lesson.html?course=physics-mechanics&id=QYXfaRyjdws"
              >
                Aç
              </a>
            </div>

            <div id="personalRouteSummary" className="personal-route-summary app-panel">
              <span className="eyebrow">Kişisel rota</span>
              <strong>
                {branch} • {level} • {goal}
              </strong>
              <p>Bu alan ilk kurulum seçimlerine göre güncellenir.</p>
            </div>

            <div className="metric-grid">
              <div className="metric-card">
                <span>Çalışma serisi</span>
                <strong>12 gün</strong>
                <p>Bugün 25 dakika daha çalış.</p>
              </div>

              <div className="metric-card">
                <span>{branch} rotası</span>
                <strong>%68</strong>
                <p>Mekanik modülü tamamlanıyor.</p>
              </div>

              <div className="metric-card">
                <span>PDF notları</span>
                <strong>8/24</strong>
                <p>Formül haritaları hazır.</p>
              </div>

              <div className="metric-card">
                <span>XP</span>
                <strong>1240</strong>
                <p>Seviye 4 Problem Çözücü.</p>
              </div>
            </div>

            <div className="app-grid">
              <section className="app-panel wide activity-panel">
                <div className="panel-head">
                  <div>
                    <h2>Haftalık çalışma ritmi</h2>
                    <p className="panel-sub">
                      Renkler günlük çalışma yoğunluğunu gösterir. Hedef: haftada en az 5 aktif gün.
                    </p>
                  </div>
                  <a href="/roadmap.html">Rotayı aç</a>
                </div>

                <div className="activity-summary">
                  <div>
                    <strong>5/7</strong>
                    <span>aktif gün</span>
                  </div>
                  <div>
                    <strong>3s 40dk</strong>
                    <span>toplam süre</span>
                  </div>
                  <div>
                    <strong>18</strong>
                    <span>problem</span>
                  </div>
                </div>

                <div className="activity-week">
                  <span>Pzt</span>
                  <span>Sal</span>
                  <span>Çar</span>
                  <span>Per</span>
                  <span>Cum</span>
                  <span>Cmt</span>
                  <span>Paz</span>
                </div>

                <div className="heatmap modern-heatmap" aria-label="Haftalık çalışma yoğunluğu">
                  <span className="level-3" title="Pazartesi • 45 dk"></span>
                  <span className="level-2" title="Salı • 25 dk"></span>
                  <span className="level-0" title="Çarşamba • dinlenme"></span>
                  <span className="level-1" title="Perşembe • 12 dk"></span>
                  <span className="level-3" title="Cuma • 55 dk"></span>
                  <span className="level-goal" title="Cumartesi • hedef günü"></span>
                  <span className="level-2" title="Pazar • 30 dk"></span>

                  <span className="level-1"></span>
                  <span className="level-2"></span>
                  <span className="level-3"></span>
                  <span className="level-0"></span>
                  <span className="level-2"></span>
                  <span className="level-goal"></span>
                  <span className="level-1"></span>

                  <span className="level-3"></span>
                  <span className="level-3"></span>
                  <span className="level-2"></span>
                  <span className="level-1"></span>
                  <span className="level-0"></span>
                  <span className="level-2"></span>
                  <span className="level-goal"></span>

                  <span className="level-2"></span>
                  <span className="level-1"></span>
                  <span className="level-3"></span>
                  <span className="level-2"></span>
                  <span className="level-3"></span>
                  <span className="level-1"></span>
                  <span className="level-2"></span>
                </div>

                <div className="activity-legend">
                  <span>
                    <i className="legend-low"></i> Hafif
                  </span>
                  <span>
                    <i className="legend-mid"></i> İyi
                  </span>
                  <span>
                    <i className="legend-high"></i> Yoğun
                  </span>
                  <span>
                    <i className="legend-goal"></i> Hedef günü
                  </span>
                </div>
              </section>

              <section className="app-panel">
                <div className="panel-head">
                  <h2>Günün Problemi</h2>
                  <a href="/daily-problem.html">Aç</a>
                </div>
                <p>Noether fikrinin sezgisel özeti nedir?</p>
                <div className="problem-equation small">Simetri → Korunum</div>
              </section>

              <section className="app-panel">
                <div className="panel-head">
                  <h2>PDF</h2>
                  <a href="/notes.html">Tüm notlar</a>
                </div>

                <div className="note-mini">
                  <span>Formül Haritası</span>
                  <strong>Mekanik I</strong>
                </div>

                <div className="note-mini">
                  <span>Soru Seti</span>
                  <strong>Newton Yasaları</strong>
                </div>
              </section>

              <section className="app-panel wide">
                <div className="panel-head">
                  <h2>Devam etmen gereken dersler</h2>
                  <a href="/courses.html">Dersler</a>
                </div>

                <div id="dashVideoGrid" className="video-grid mini-video-grid">
                  <a
                    className="video-card"
                    href="/lesson.html?course=physics-mechanics&id=QYXfaRyjdws"
                  >
                    <div className="thumb">
                      <div className="thumb-fallback">
                        Fizik
                        <br />
                        <small>TÜBİTAK 2025 Soru 1</small>
                      </div>
                      <img
                        src="https://img.youtube.com/vi/QYXfaRyjdws/hqdefault.jpg"
                        alt="TÜBİTAK 2025 Soru 1"
                      />
                      <div className="play">▶</div>
                      <div className="duration">10:31</div>
                    </div>
                    <div className="video-body">
                      <span className="mini-tag">Fizik • Olimpiyat çözümü</span>
                      <h3>TÜBİTAK Ulusal Fizik Olimpiyatları 2025 | Soru 1</h3>
                      <p>Model kurma ve sezgisel fizik yaklaşımıyla detaylı çözüm.</p>
                    </div>
                  </a>

                  <a
                    className="video-card"
                    href="/lesson.html?course=physics-mechanics&id=I3yS7LCecs4"
                  >
                    <div className="thumb">
                      <div className="thumb-fallback">
                        Fizik
                        <br />
                        <small>TÜBİTAK 2025 Soru 2</small>
                      </div>
                      <img
                        src="https://img.youtube.com/vi/I3yS7LCecs4/hqdefault.jpg"
                        alt="TÜBİTAK 2025 Soru 2"
                      />
                      <div className="play">▶</div>
                      <div className="duration">10:31</div>
                    </div>
                    <div className="video-body">
                      <span className="mini-tag">Fizik • Olimpiyat çözümü</span>
                      <h3>TÜBİTAK Ulusal Fizik Olimpiyatları 2025 | Soru 2</h3>
                      <p>Kaldığın yerden devam etmek için önerilen ikinci ders.</p>
                    </div>
                  </a>
                </div>
              </section>
            </div>
          </main>
        </div>

        <div id="olympionOnboardingModal" className="onboarding-modal" aria-hidden="true">
          <div className="onboarding-card">
            <button
              id="onboardingClose"
              className="modal-close"
              aria-label="Kapat"
              type="button"
            >
              ×
            </button>

            <div className="badge cyan">İlk kurulum</div>
            <h2>Rotanı birlikte oluşturalım.</h2>
            <p>Dashboard’u sana göre şekillendirmek için birkaç hızlı seçim yap.</p>

            <div className="onboarding-step">
              <strong>Hangi branşla başlamak istiyorsun?</strong>
              <div className="choice-grid" data-choice-group="branch">
                <button type="button" data-value="Fizik">Fizik</button>
                <button type="button" data-value="Kimya">Kimya</button>
                <button type="button" data-value="Matematik">Matematik</button>
                <button type="button" data-value="Biyoloji">Biyoloji</button>
              </div>
            </div>

            <div className="onboarding-step">
              <strong>Seviyen?</strong>
              <div className="choice-grid" data-choice-group="level">
                <button type="button" data-value="Başlangıç">Başlangıç</button>
                <button type="button" data-value="Orta">Orta</button>
                <button type="button" data-value="İleri">İleri</button>
              </div>
            </div>

            <div className="onboarding-step">
              <strong>Hedefin?</strong>
              <div className="choice-grid goal-choice-grid" data-choice-group="goal">
                <button type="button" data-value="TÜBİTAK 1. Aşama">TÜBİTAK 1. Aşama</button>
                <button type="button" data-value="TÜBİTAK 2. Aşama">TÜBİTAK 2. Aşama</button>
                <button type="button" data-value="Uluslararası">Uluslararası</button>
                <button type="button" data-value="Kavram öğrenmek">Kavram öğrenmek</button>
              </div>
            </div>

            <div className="onboarding-step">
              <strong>Haftalık çalışma ritmin?</strong>
              <div className="choice-grid" data-choice-group="days">
                <button type="button" data-value="2 gün">2 gün</button>
                <button type="button" data-value="3-4 gün">3-4 gün</button>
                <button type="button" data-value="5+ gün">5+ gün</button>
              </div>
            </div>

            <button id="createRoadmapBtn" className="btn btn-primary" type="button">
              Rotamı Oluştur
            </button>
          </div>
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

          .onboarding-modal.open {
            display: grid;
            opacity: 1;
            pointer-events: auto;
          }

          .choice-grid button.active {
            border-color: rgba(124, 242, 255, 0.65);
            background: rgba(124, 242, 255, 0.16);
            color: #eaffff;
          }
        `}</style>

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var modal = document.getElementById('olympionOnboardingModal');
                if (!modal) return;

                var storageKey = 'olympion_onboarding_seen_v1';
                var choices = {
                  branch: 'Fizik',
                  level: 'Başlangıç',
                  goal: 'TÜBİTAK 1. Aşama',
                  days: '3-4 gün'
                };

                function openModal() {
                  modal.classList.add('open');
                  modal.setAttribute('aria-hidden', 'false');
                }

                function closeModal() {
                  localStorage.setItem(storageKey, 'true');
                  modal.classList.remove('open');
                  modal.setAttribute('aria-hidden', 'true');
                }

                function updateActive(groupName, value) {
                  var group = modal.querySelector('[data-choice-group="' + groupName + '"]');
                  if (!group) return;

                  group.querySelectorAll('button').forEach(function (button) {
                    button.classList.toggle('active', button.getAttribute('data-value') === value);
                  });
                }

                Object.keys(choices).forEach(function (key) {
                  updateActive(key, choices[key]);
                });

                modal.querySelectorAll('[data-choice-group] button').forEach(function (button) {
                  button.addEventListener('click', function () {
                    var group = button.parentElement && button.parentElement.getAttribute('data-choice-group');
                    var value = button.getAttribute('data-value') || '';
                    if (!group) return;

                    choices[group] = value;
                    updateActive(group, value);
                  });
                });

                var closeButton = document.getElementById('onboardingClose');
                if (closeButton) {
                  closeButton.addEventListener('click', closeModal);
                }

                var createButton = document.getElementById('createRoadmapBtn');
                if (createButton) {
                  createButton.addEventListener('click', function () {
                    localStorage.setItem('olympion_onboarding_choices_v1', JSON.stringify(choices));

                    var summary = document.getElementById('personalRouteSummary');
                    if (summary) {
                      var strong = summary.querySelector('strong');
                      var p = summary.querySelector('p');
                      if (strong) strong.textContent = choices.branch + ' • ' + choices.level + ' • ' + choices.goal;
                      if (p) p.textContent = 'Haftalık ritim: ' + choices.days + '. Rotan bu tercihlere göre şekillenecek.';
                    }

                    closeModal();
                  });
                }

                setTimeout(function () {
                  if (!localStorage.getItem(storageKey)) {
                    openModal();
                  }
                }, 700);
              })();
            `,
          }}
        />
      </div>
    </>
  );
}
