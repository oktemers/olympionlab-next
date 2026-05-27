import Script from "next/script";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

type LessonVideo = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  youtube_id: string | null;
  order_index: number;
  duration_seconds: number;
  xp_reward: number;
  access_tier: "free" | "plus" | "pro";
  is_active: boolean;
};

type CourseSection = {
  id: string;
  slug: string;
  branch: "physics" | "chemistry";
  stage: "guidance" | "stage_1" | "stage_2" | "international";
  title: string;
  short_title: string | null;
  description: string | null;
  long_description: string | null;
  order_index: number;
  unlock_after_slug: string | null;
  lock_message: string | null;
  lesson_videos: LessonVideo[] | null;
};

type VideoProgress = {
  video_id: string;
  progress_percent: number;
  is_completed: boolean;
};

const branchLabels: Record<string, string> = {
  physics: "Fizik",
  chemistry: "Kimya",
};

const stageLabels: Record<string, string> = {
  guidance: "Rehberlik",
  stage_1: "1. Aşama",
  stage_2: "2. Aşama",
  international: "Uluslararası",
};

const accessLabels: Record<string, string> = {
  free: "Free",
  plus: "Plus",
  pro: "Pro",
};

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return "Süre yakında";

  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes} dk`;
  }

  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;

  return `${hour}s ${minute}dk`;
}

function getSectionIcon(stage: CourseSection["stage"]) {
  if (stage === "guidance") return "🧭";
  if (stage === "stage_1") return "🔥";
  if (stage === "stage_2") return "⚡";
  return "🌍";
}

export default async function CoursesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,branch,level,goal,plan")
    .eq("id", user.id)
    .maybeSingle();

  const email = profile?.email || user.email || "";
  const fullName = profile?.full_name || email.split("@")[0] || "Öğrenci";
  const firstName = fullName.split(" ")[0] || "Öğrenci";

  const rawBranchKey = profile?.branch ? String(profile.branch) : "";
  const branchKey =
    rawBranchKey === "physics" || rawBranchKey === "chemistry"
      ? rawBranchKey
      : null;

  if (!branchKey) {
    redirect("/dashboard");
  }

  const branch = branchLabels[branchKey];
  const plan = String(profile?.plan || "free");

  const { data: sectionsData } = await supabase
    .from("course_sections")
    .select(
      `
      id,
      slug,
      branch,
      stage,
      title,
      short_title,
      description,
      long_description,
      order_index,
      unlock_after_slug,
      lock_message,
      lesson_videos (
        id,
        slug,
        title,
        description,
        youtube_id,
        order_index,
        duration_seconds,
        xp_reward,
        access_tier,
        is_active
      )
    `
    )
    .eq("branch", branchKey)
    .eq("is_active", true)
    .order("order_index", { ascending: true });

  const sections = ((sectionsData || []) as CourseSection[])
    .map((section) => ({
      ...section,
      lesson_videos: (section.lesson_videos || [])
        .filter((video) => video.is_active)
        .sort((a, b) => a.order_index - b.order_index),
    }))
    .sort((a, b) => a.order_index - b.order_index);

  const videoIds = sections.flatMap((section) =>
    (section.lesson_videos || []).map((video) => video.id)
  );

  let progressRows: VideoProgress[] = [];

  if (videoIds.length > 0) {
    const { data: progressData } = await supabase
      .from("user_video_progress")
      .select("video_id,progress_percent,is_completed")
      .eq("user_id", user.id)
      .in("video_id", videoIds);

    progressRows = (progressData || []) as VideoProgress[];
  }

  const progressMap = new Map(progressRows.map((row) => [row.video_id, row]));

  const sectionStats = sections.map((section) => {
    const videos = section.lesson_videos || [];

    const completedVideos = videos.filter((video) => {
      const progress = progressMap.get(video.id);

      return (
        progress?.is_completed ||
        Number(progress?.progress_percent || 0) >= 100
      );
    });

    const progressPercent =
      videos.length > 0
        ? Math.round((completedVideos.length / videos.length) * 100)
        : 0;

    return {
      ...section,
      videos,
      completedVideosCount: completedVideos.length,
      totalVideosCount: videos.length,
      progressPercent,
    };
  });

  const progressBySectionSlug = new Map(
    sectionStats.map((section) => [section.slug, section.progressPercent])
  );

  const sectionsWithLockState = sectionStats.map((section) => {
    const requiredProgress = section.unlock_after_slug
      ? progressBySectionSlug.get(section.unlock_after_slug) || 0
      : 100;

    const isUnlocked = !section.unlock_after_slug || requiredProgress >= 100;

    return {
      ...section,
      isUnlocked,
      requiredProgress,
      href: isUnlocked ? `/courses/${section.slug}` : "#",
    };
  });

  const totalVideos = sectionsWithLockState.reduce(
    (sum, section) => sum + section.totalVideosCount,
    0
  );

  const completedVideos = sectionsWithLockState.reduce(
    (sum, section) => sum + section.completedVideosCount,
    0
  );

  const overallProgress =
    totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  const nextSection =
    sectionsWithLockState.find(
      (section) => section.isUnlocked && section.progressPercent < 100
    ) || sectionsWithLockState.find((section) => section.isUnlocked);

  return (
    <>
      <link rel="stylesheet" href="/style.css" />

      <div className="app-page">
        <a href="/" className="app-mobile-home">
          ← Ana Sayfa
        </a>

        <div className="noise"></div>

        <div
          id="cursorFormulaLayer"
          className="cursor-formula-layer"
          aria-hidden="true"
        ></div>

        <div className="app-bg-formulas" aria-hidden="true">
          {branchKey === "physics" ? (
            <>
              <span>F = ma</span>
              <span>∇·E = ρ/ε₀</span>
              <span>p = mv</span>
              <span>E = mc²</span>
            </>
          ) : (
            <>
              <span>PV = nRT</span>
              <span>ΔG = ΔH − TΔS</span>
              <span>K = [ürünler]/[girenler]</span>
              <span>pH = −log[H⁺]</span>
            </>
          )}
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

              <a href="/courses" className="app-link active">
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
              <span>{plan === "free" ? "Free" : plan}</span>
              <strong>Rotanı adım adım tamamla.</strong>
              <p>Rehberlikten başlayıp soru çözümlerine sırayla ilerle.</p>
              <a href="/pricing.html">Planı yükselt →</a>
            </div>

            <a href="/" className="back-site">
              ← Ana siteye dön
            </a>
          </aside>

          <main className="app-main">
            <div className="app-top">
              <div>
                <span className="eyebrow">Dersler</span>
                <h1>{branch} ders rotası</h1>
                <p>
                  Hoş geldin, {firstName}. Bu sayfada sadece seçili branşına ait
                  dersleri görürsün. Bölümler sırayla açılır.
                </p>
              </div>

              <a
                className="btn btn-primary compact-btn course-top-action"
                href={nextSection?.href || "#"}
                data-locked={nextSection?.isUnlocked ? "false" : "true"}
                data-lock-message={
                  nextSection?.lock_message ||
                  "Önce önceki bölümü tamamlaman gerekiyor."
                }
              >
                Sıradaki Derse Git
              </a>
            </div>

            <section className="app-panel course-hero-panel">
              <div>
                <span className="eyebrow">Genel ilerleme</span>
                <h2>
                  {completedVideos}/{totalVideos} video tamamlandı
                </h2>
                <p>
                  {branch} rotasının %{overallProgress} kadarı tamamlandı. Her
                  video tamamlandığında oran, XP ve çalışma ritmi güncellenecek.
                </p>
              </div>

              <div className="course-progress-orb">
                <strong>%{overallProgress}</strong>
                <span>rota</span>
              </div>
            </section>

            <section className="course-stage-grid">
              {sectionsWithLockState.map((section) => {
                const previewVideos = section.videos.slice(0, 3);

                return (
                  <article
                    key={section.id}
                    className={`app-panel course-stage-card ${
                      section.isUnlocked ? "" : "locked"
                    }`}
                  >
                    <div className="course-card-top">
                      <div className="course-stage-icon">
                        {getSectionIcon(section.stage)}
                      </div>

                      <div>
                        <span className="eyebrow">
                          {stageLabels[section.stage]} •{" "}
                          {section.totalVideosCount} video
                        </span>
                        <h2>{section.title}</h2>
                      </div>

                      {!section.isUnlocked && (
                        <span className="lock-pill">Kilitli</span>
                      )}
                    </div>

                    <p className="course-description">{section.description}</p>

                    <div className="course-progress-row">
                      <div className="progress-track">
                        <i
                          style={{
                            width: `${Math.max(section.progressPercent, 5)}%`,
                          }}
                        ></i>
                      </div>

                      <strong>%{section.progressPercent}</strong>
                    </div>

                    <div className="course-video-preview-list">
                      {previewVideos.map((video) => {
                        const progress = progressMap.get(video.id);
                        const videoPercent = Number(
                          progress?.progress_percent || 0
                        );
                        const isCompleted =
                          progress?.is_completed || videoPercent >= 100;

                        return (
                          <div key={video.id} className="course-video-preview">
                            <span>{isCompleted ? "✓" : "▶"}</span>

                            <div>
                              <strong>{video.title}</strong>
                              <small>
                                {formatDuration(video.duration_seconds)} •{" "}
                                {accessLabels[video.access_tier]} • %
                                {videoPercent}
                              </small>
                            </div>
                          </div>
                        );
                      })}

                      {section.videos.length > 3 && (
                        <div className="course-more-videos">
                          +{section.videos.length - 3} video daha
                        </div>
                      )}
                    </div>

                    <div className="course-card-actions">
                      <a
                        href={section.href}
                        className="course-open-btn"
                        data-locked={section.isUnlocked ? "false" : "true"}
                        data-lock-message={
                          section.lock_message ||
                          "Önce önceki bölümü tamamlaman gerekiyor."
                        }
                      >
                        Derse Git
                      </a>

                      <span>
                        {section.completedVideosCount}/
                        {section.totalVideosCount} tamamlandı
                      </span>
                    </div>
                  </article>
                );
              })}
            </section>
          </main>
        </div>

        <div
          id="courseLockModal"
          className="course-lock-modal"
          aria-hidden="true"
        >
          <div className="course-lock-card">
            <button
              id="courseLockClose"
              type="button"
              aria-label="Kapat"
              className="course-lock-close"
            >
              ×
            </button>

            <div className="badge cyan">Sıralı rota</div>
            <h2>Bu bölüm henüz kilitli.</h2>
            <p id="courseLockMessage">
              Önce Rehberlik derslerini bitirmen gerekiyor.
            </p>

            <a href="/courses" className="btn btn-primary compact-btn">
              Açık derslere dön
            </a>
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

          .course-top-action {
            color: #061320 !important;
            font-weight: 900 !important;
            opacity: 1 !important;
          }

          .course-hero-panel {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 24px;
          }

          .course-hero-panel h2 {
            margin: 8px 0;
            color: #ffffff;
          }

          .course-hero-panel p {
            max-width: 720px;
            color: rgba(235, 245, 255, 0.72);
            line-height: 1.7;
          }

          .course-progress-orb {
            min-width: 132px;
            min-height: 132px;
            border-radius: 999px;
            display: grid;
            place-items: center;
            text-align: center;
            border: 1px solid rgba(124, 242, 255, 0.28);
            background:
              radial-gradient(circle at 35% 30%, rgba(124, 242, 255, 0.22), transparent 55%),
              rgba(255, 255, 255, 0.04);
            box-shadow: 0 18px 50px rgba(0, 0, 0, 0.25);
          }

          .course-progress-orb strong {
            display: block;
            color: #ffffff;
            font-size: 30px;
            line-height: 1;
          }

          .course-progress-orb span {
            display: block;
            margin-top: -28px;
            color: rgba(235, 245, 255, 0.62);
            font-size: 13px;
          }

          .course-stage-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 18px;
          }

          .course-stage-card {
            position: relative;
            min-height: 360px;
            display: flex;
            flex-direction: column;
            gap: 18px;
            overflow: hidden;
          }

          .course-stage-card.locked {
            opacity: 0.78;
          }

          .course-stage-card.locked::after {
            content: "";
            position: absolute;
            inset: 0;
            pointer-events: none;
            background: linear-gradient(
              135deg,
              rgba(5, 12, 22, 0.12),
              rgba(5, 12, 22, 0.38)
            );
          }

          .course-card-top {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            position: relative;
            z-index: 1;
          }

          .course-card-top h2 {
            margin: 6px 0 0;
            color: #ffffff;
            font-size: 22px;
          }

          .course-stage-icon {
            width: 48px;
            height: 48px;
            display: grid;
            place-items: center;
            border-radius: 18px;
            background: rgba(124, 242, 255, 0.12);
            border: 1px solid rgba(124, 242, 255, 0.22);
            font-size: 22px;
            flex: 0 0 auto;
          }

          .lock-pill {
            margin-left: auto;
            border-radius: 999px;
            padding: 7px 10px;
            color: #ffd6a3;
            background: rgba(255, 180, 80, 0.12);
            border: 1px solid rgba(255, 180, 80, 0.22);
            font-size: 12px;
            font-weight: 800;
          }

          .course-description {
            color: rgba(235, 245, 255, 0.72);
            line-height: 1.7;
            position: relative;
            z-index: 1;
          }

          .course-progress-row {
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
            z-index: 1;
          }

          .course-progress-row .progress-track {
            flex: 1;
          }

          .course-progress-row strong {
            color: #ffffff;
            font-size: 14px;
          }

          .course-video-preview-list {
            display: grid;
            gap: 10px;
            position: relative;
            z-index: 1;
          }

          .course-video-preview {
            display: flex;
            gap: 10px;
            align-items: flex-start;
            border-radius: 16px;
            padding: 12px;
            background: rgba(255, 255, 255, 0.045);
            border: 1px solid rgba(255, 255, 255, 0.08);
          }

          .course-video-preview > span {
            width: 26px;
            height: 26px;
            display: grid;
            place-items: center;
            border-radius: 999px;
            color: #07111e;
            background: #7cf2ff;
            font-size: 12px;
            font-weight: 900;
            flex: 0 0 auto;
          }

          .course-video-preview strong {
            display: block;
            color: #ffffff;
            font-size: 14px;
            line-height: 1.4;
          }

          .course-video-preview small {
            display: block;
            margin-top: 4px;
            color: rgba(235, 245, 255, 0.56);
          }

          .course-more-videos {
            color: rgba(235, 245, 255, 0.66);
            font-size: 13px;
            padding-left: 6px;
          }

          .course-card-actions {
            margin-top: auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            position: relative;
            z-index: 1;
          }

          .course-card-actions span {
            color: rgba(235, 245, 255, 0.62);
            font-size: 13px;
          }

          .course-open-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 42px;
            padding: 0 18px;
            border-radius: 999px;
            text-decoration: none;
            color: #04111f !important;
            background: linear-gradient(135deg, #7cf2ff, #9dffcb);
            font-weight: 900;
            letter-spacing: -0.01em;
            box-shadow: 0 12px 34px rgba(124, 242, 255, 0.2);
            border: 1px solid rgba(255, 255, 255, 0.24);
            opacity: 1 !important;
          }

          .course-open-btn[data-locked="true"] {
            color: rgba(255, 255, 255, 0.72) !important;
            background: rgba(255, 255, 255, 0.075);
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: none;
          }

          .course-lock-modal {
            position: fixed;
            inset: 0;
            z-index: 200;
            display: none;
            place-items: center;
            padding: 20px;
            background: rgba(0, 0, 0, 0.68);
            backdrop-filter: blur(12px);
          }

          .course-lock-modal.open {
            display: grid;
          }

          .course-lock-card {
            width: min(520px, 100%);
            position: relative;
            border-radius: 28px;
            padding: 28px;
            background: #081222;
            border: 1px solid rgba(255, 255, 255, 0.12);
            box-shadow: 0 28px 90px rgba(0, 0, 0, 0.45);
          }

          .course-lock-card h2 {
            color: #ffffff;
            margin: 14px 0 8px;
          }

          .course-lock-card p {
            color: rgba(235, 245, 255, 0.74);
            line-height: 1.7;
            margin-bottom: 20px;
          }

          .course-lock-close {
            position: absolute;
            top: 16px;
            right: 16px;
            width: 36px;
            height: 36px;
            border-radius: 999px;
            border: 1px solid rgba(255, 255, 255, 0.12);
            background: rgba(255, 255, 255, 0.06);
            color: #ffffff;
            cursor: pointer;
            font-size: 22px;
          }

          @media (max-width: 980px) {
            .course-stage-grid {
              grid-template-columns: 1fr;
            }

            .course-hero-panel {
              align-items: flex-start;
              flex-direction: column;
            }
          }
        `}</style>

        <Script
          id="course-lock-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                var modal = document.getElementById("courseLockModal");
                var message = document.getElementById("courseLockMessage");
                var close = document.getElementById("courseLockClose");

                if (!modal || !message) return;

                function openModal(text) {
                  message.textContent = text || "Önce önceki bölümü tamamlaman gerekiyor.";
                  modal.classList.add("open");
                  modal.setAttribute("aria-hidden", "false");
                }

                function closeModal() {
                  modal.classList.remove("open");
                  modal.setAttribute("aria-hidden", "true");
                }

                document.querySelectorAll('[data-locked="true"]').forEach(function (link) {
                  link.addEventListener("click", function (event) {
                    event.preventDefault();
                    openModal(link.getAttribute("data-lock-message"));
                  });
                });

                if (close) {
                  close.addEventListener("click", closeModal);
                }

                modal.addEventListener("click", function (event) {
                  if (event.target === modal) {
                    closeModal();
                  }
                });

                document.addEventListener("keydown", function (event) {
                  if (event.key === "Escape") {
                    closeModal();
                  }
                });
              })();
            `,
          }}
        />
      </div>
    </>
  );
}
