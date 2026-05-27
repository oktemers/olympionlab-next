import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

type LearningModule = {
  id: string;
  title: string;
  description: string | null;
  branch: string;
  level: string | null;
  type: "guidance" | "video" | "question_set" | "pdf_note" | "practice" | "exam";
  order_index: number;
  xp_reward: number;
  estimated_minutes: number;
  href: string | null;
};

type ModuleProgress = {
  module_id: string;
  status: "not_started" | "in_progress" | "completed";
  progress_percent: number;
};

type StudyDay = {
  study_date: string;
  minutes: number;
  completed_modules: number;
};

const branchLabels: Record<string, string> = {
  math: "Matematik",
  physics: "Fizik",
  chemistry: "Kimya",
  biology: "Biyoloji",
};

const levelLabels: Record<string, string> = {
  beginner: "Başlangıç",
  intermediate: "Orta",
  advanced: "İleri",
};

const moduleTypeLabels: Record<string, string> = {
  guidance: "Rehberlik",
  video: "Video",
  question_set: "Soru Seti",
  pdf_note: "PDF Notu",
  practice: "Pratik",
  exam: "Deneme",
};

function getModuleIcon(type: LearningModule["type"]) {
  if (type === "guidance") return "🧭";
  if (type === "pdf_note") return "📚";
  if (type === "question_set") return "🔥";
  if (type === "exam") return "📝";
  if (type === "practice") return "⚡";
  return "▶";
}

function getDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getHeatLevel(minutes: number) {
  if (minutes >= 50) return "level-3";
  if (minutes >= 25) return "level-2";
  if (minutes > 0) return "level-1";
  return "level-0";
}

function getStudyStreak(studyRows: StudyDay[]) {
  const activeDateSet = new Set(
    studyRows
      .filter((row) => Number(row.minutes || 0) > 0)
      .map((row) => row.study_date)
  );

  let streak = 0;
  const cursor = new Date();

  for (let i = 0; i < 28; i += 1) {
    const key = getDateKey(cursor);

    if (!activeDateSet.has(key)) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

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
  const firstName = fullName.split(" ")[0] || "Öğrenci";

  const branchKey = (profile?.branch as string | null) || "physics";
  const levelKey = (profile?.level as string | null) || "beginner";

  const branch = branchLabels[branchKey] || branchKey;
  const level = levelLabels[levelKey] || levelKey || "Başlangıç";
  const goal = profile?.goal || "Bilim olimpiyatlarına düzenli hazırlanmak";

  const { data: modulesData } = await supabase
    .from("learning_modules")
    .select(
      "id,title,description,branch,level,type,order_index,xp_reward,estimated_minutes,href"
    )
    .eq("is_active", true)
    .or(`branch.eq.all,branch.eq.${branchKey}`)
    .order("order_index", { ascending: true });

  const modules = (modulesData || []) as LearningModule[];

  let { data: routeState } = await supabase
    .from("user_route_state")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!routeState) {
    const firstModule = modules[0];

    const { data: createdRoute } = await supabase
      .from("user_route_state")
      .insert({
        user_id: user.id,
        branch: branchKey,
        level: levelKey,
        goal,
        current_module_id: firstModule?.id || null,
      })
      .select("*")
      .single();

    routeState = createdRoute;
  }

  if (routeState && routeState.branch !== branchKey) {
    const firstModule = modules[0];

    const { data: updatedRoute } = await supabase
      .from("user_route_state")
      .update({
        branch: branchKey,
        level: levelKey,
        goal,
        current_module_id: firstModule?.id || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select("*")
      .single();

    routeState = updatedRoute;
  }

  const { data: progressData } = await supabase
    .from("user_module_progress")
    .select("module_id,status,progress_percent")
    .eq("user_id", user.id);

  const progressRows = (progressData || []) as ModuleProgress[];
  const progressMap = new Map(progressRows.map((row) => [row.module_id, row]));

  const completedModules = modules.filter((module) => {
    const progress = progressMap.get(module.id);

    return (
      progress?.status === "completed" ||
      Number(progress?.progress_percent || 0) >= 100
    );
  });

  const totalModules = modules.length;

  const routePercent =
    totalModules > 0
      ? Math.round((completedModules.length / totalModules) * 100)
      : 0;

  const pdfModules = modules.filter((module) => module.type === "pdf_note");

  const completedPdfCount = pdfModules.filter((module) => {
    const progress = progressMap.get(module.id);

    return (
      progress?.status === "completed" ||
      Number(progress?.progress_percent || 0) >= 100
    );
  }).length;

  const currentModule =
    modules.find((module) => module.id === routeState?.current_module_id) ||
    modules.find((module) => {
      const progress = progressMap.get(module.id);
      return !progress || progress.status !== "completed";
    }) ||
    modules[0];

  const currentProgress = currentModule
    ? Number(progressMap.get(currentModule.id)?.progress_percent || 0)
    : 0;

  const continueHref = "/courses.html";

  const { data: xpRows } = await supabase
    .from("user_xp_events")
    .select("amount")
    .eq("user_id", user.id);

  const totalXp = (xpRows || []).reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  const twentyEightDaysAgo = new Date();
  twentyEightDaysAgo.setDate(twentyEightDaysAgo.getDate() - 27);

  const { data: studyData } = await supabase
    .from("user_study_days")
    .select("study_date,minutes,completed_modules")
    .eq("user_id", user.id)
    .gte("study_date", getDateKey(twentyEightDaysAgo));

  const studyRows = (studyData || []) as StudyDay[];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoKey = getDateKey(sevenDaysAgo);

  const lastSevenStudyRows = studyRows.filter(
    (row) => row.study_date >= sevenDaysAgoKey
  );

  const activeDays = lastSevenStudyRows.filter(
    (row) => Number(row.minutes || 0) > 0
  ).length;

  const studyStreak = getStudyStreak(studyRows);

  const totalStudyMinutes = lastSevenStudyRows.reduce(
    (sum, row) => sum + Number(row.minutes || 0),
    0
  );

  const totalCompletedThisWeek = lastSevenStudyRows.reduce(
    (sum, row) => sum + Number(row.completed_modules || 0),
    0
  );

  const totalStudyLabel =
    totalStudyMinutes >= 60
      ? `${Math.floor(totalStudyMinutes / 60)}s ${totalStudyMinutes % 60}dk`
      : `${totalStudyMinutes}dk`;

  const unfinishedModules = modules.filter((module) => {
    const progress = progressMap.get(module.id);
    return !progress || progress.status !== "completed";
  });

  const recommendedModules = [...unfinishedModules, ...modules]
    .filter(
      (module, index, array) =>
        array.findIndex((item) => item.id === module.id) === index
    )
    .slice(0, 4);

  const pdfPreviewModules = pdfModules.slice(0, 2);

  const heatmapDays = Array.from({ length: 28 }, (_, index) => {
    const date = new Date(twentyEightDaysAgo);
    date.setDate(twentyEightDaysAgo.getDate() + index);

    const key = getDateKey(date);
    const row = studyRows.find((item) => item.study_date === key);
    const minutes = Number(row?.minutes || 0);

    return {
      key,
      minutes,
      level: getHeatLevel(minutes),
    };
  });

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
                <p>
                  Bugünkü hedef: rotandan 1 modül aç, 1 not incele, çalışma
                  ritmini koru.
                </p>
              </div>

              <a className="btn btn-primary compact-btn" href={continueHref}>
                Kaldığın Yerden Devam Et
              </a>
            </div>

            <div className="continue-card app-panel">
              <div>
                <span className="eyebrow">Devam Et</span>

                <h2>{currentModule?.title || "İlk rehberlik modülün hazır"}</h2>

                <p>
                  %{currentProgress} tamamlandı.{" "}
                  {currentModule?.description ||
                    "Rotana ilk adımdan başlayabilirsin."}
                </p>

                <div className="progress-track">
                  <i style={{ width: `${Math.max(currentProgress, 8)}%` }}></i>
                </div>
              </div>

              <a className="btn btn-secondary compact-btn" href={continueHref}>
                Aç
              </a>
            </div>

            <div
              id="personalRouteSummary"
              className="personal-route-summary app-panel"
            >
              <span className="eyebrow">Kişisel rota</span>

              <strong>
                {branch} • {level} • {goal}
              </strong>

              <p>
                Branş seçilmemişse varsayılan olarak Fizik başlangıç rotası
                açılır.
              </p>
            </div>

            <div className="metric-grid">
              <div className="metric-card">
                <span>Çalışma serisi</span>
                <strong>{studyStreak} gün</strong>
                <p>Son 7 günde {activeDays} aktif günün var.</p>
              </div>

              <div className="metric-card">
                <span>{branch} rotası</span>
                <strong>%{routePercent}</strong>
                <p>
                  {completedModules.length}/{totalModules} modül tamamlandı.
                </p>
              </div>

              <div className="metric-card">
                <span>PDF notları</span>
                <strong>
                  {completedPdfCount}/{pdfModules.length}
                </strong>
                <p>{branch} rotana uygun PDF notları.</p>
              </div>

              <div className="metric-card">
                <span>XP</span>
                <strong>{totalXp}</strong>
                <p>Kişisel ilerleme puanın.</p>
              </div>
            </div>

            <div className="app-grid">
              <section className="app-panel wide activity-panel">
                <div className="panel-head">
                  <div>
                    <h2>Haftalık çalışma ritmi</h2>
                    <p className="panel-sub">
                      Son 7 gün: {activeDays}/7 aktif gün. Hedef: haftada en az
                      5 aktif gün.
                    </p>
                  </div>

                  <a href="/roadmap.html">Rotayı aç</a>
                </div>

                <div className="activity-summary">
                  <div>
                    <strong>{activeDays}/7</strong>
                    <span>aktif gün</span>
                  </div>

                  <div>
                    <strong>{totalStudyLabel}</strong>
                    <span>toplam süre</span>
                  </div>

                  <div>
                    <strong>{totalCompletedThisWeek}</strong>
                    <span>tamamlanan modül</span>
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

                <div
                  className="heatmap modern-heatmap"
                  aria-label="Çalışma yoğunluğu"
                >
                  {heatmapDays.map((day) => (
                    <span
                      key={day.key}
                      className={day.level}
                      title={`${day.key} • ${day.minutes} dk`}
                    ></span>
                  ))}
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

                <p>
                  {branch} rotana uygun günlük problem alanı yakında burada
                  olacak.
                </p>

                <div className="problem-equation small">
                  Seçilen branş → {branch}
                </div>
              </section>

              <section className="app-panel">
                <div className="panel-head">
                  <h2>PDF</h2>
                  <a href="/notes.html">Tüm notlar</a>
                </div>

                {pdfPreviewModules.length > 0 ? (
                  pdfPreviewModules.map((module) => (
                    <a
                      key={module.id}
                      className="note-mini"
                      href="/notes.html"
                    >
                      <span>{moduleTypeLabels[module.type]}</span>
                      <strong>{module.title}</strong>
                    </a>
                  ))
                ) : (
                  <div className="note-mini">
                    <span>PDF Notu</span>
                    <strong>Bu branş için PDF yakında eklenecek.</strong>
                  </div>
                )}
              </section>

              <section className="app-panel wide">
                <div className="panel-head">
                  <h2>Devam etmen gereken dersler</h2>
                  <a href="/courses.html">Dersler</a>
                </div>

                <div id="dashVideoGrid" className="video-grid mini-video-grid">
                  {recommendedModules.length > 0 ? (
                    recommendedModules.map((module) => {
                      const progress = progressMap.get(module.id);
                      const percent = Number(progress?.progress_percent || 0);

                      return (
                        <a
                          key={module.id}
                          className="video-card"
                          href="/courses.html"
                        >
                          <div className="thumb">
                            <div className="thumb-fallback">
                              {getModuleIcon(module.type)}
                              <br />
                              <small>{moduleTypeLabels[module.type]}</small>
                            </div>

                            <div className="play">▶</div>

                            <div className="duration">
                              {module.estimated_minutes} dk
                            </div>
                          </div>

                          <div className="video-body">
                            <span className="mini-tag">
                              {branch} • {moduleTypeLabels[module.type]} • %
                              {percent}
                            </span>

                            <h3>{module.title}</h3>

                            <p>
                              {module.description ||
                                "Bu modül rotana göre önerildi."}
                            </p>
                          </div>
                        </a>
                      );
                    })
                  ) : (
                    <div className="empty-dashboard-state">
                      <strong>Henüz rota içeriği yok.</strong>
                      <p>
                        Supabase learning_modules tablosuna bu branş için içerik
                        ekle.
                      </p>
                    </div>
                  )}
                </div>
              </section>
            </div>
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

          .note-mini {
            text-decoration: none;
          }

          .empty-dashboard-state {
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 18px;
            color: rgba(255, 255, 255, 0.76);
            background: rgba(255, 255, 255, 0.04);
          }

          .empty-dashboard-state strong {
            display: block;
            color: #ffffff;
            margin-bottom: 6px;
          }
        `}</style>
      </div>
    </>
  );
}
