import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { hasPlusAccess } from "@/lib/plans";
import { getGuidancePlaylist } from "@/lib/guidance-playlist";
import RoadmapTaskList, { type RoadmapTask } from "./RoadmapTaskList";
import styles from "./step.module.css";

export const metadata = {
  title: "Olimpiyat Yol Haritası | OlympionLab",
  description: "Derslerini ve sorularını tamamla, ilerlemeni takip et."
};

const steps = [
  { number: 1, label: "Hedefini belirle" },
  { number: 2, label: "Konuyu öğren" },
  { number: 3, label: "Soru çöz" },
  { number: 4, label: "Gelişimini ölç" }
];
const branchLabels: Record<string, string> = { physics: "Fizik", chemistry: "Kimya", math: "Matematik", biology: "Biyoloji" };
const levelLabels: Record<string, string> = { beginner: "Başlangıç", intermediate: "Orta", advanced: "İleri" };

type Module = { id: string; title: string; type: string; href: string | null; estimated_minutes: number | null; branch: string };
type Progress = { module_id: string; status: string; progress_percent: number | null };
type LessonProgress = { video_id: string; is_completed: boolean; progress_percent: number | null };
type Lesson = {
  id: string; title: string; youtube_id: string | null; is_active: boolean;
  duration_seconds: number | null; order_index: number;
};
type Section = { id: string; stage: string; lesson_videos: Lesson[] | null };

export default async function RoadmapStepPage({
  params, searchParams
}: {
  params: Promise<{ step: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { step } = await params;
  if (!["1","2","3","4"].includes(step)) notFound();
  const index = Number(step);
  const query = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/giris");
  const { data: profile } = await supabase.from("profiles")
    .select("branch,level,goal,plan,role").eq("id", user.id).maybeSingle();
  const branchKey = typeof profile?.branch === "string" ? profile.branch : "";
  const branch = branchLabels[branchKey] || "Olimpiyat";
  const level = typeof profile?.level === "string" ? profile.level : "";
  const goal = typeof profile?.goal === "string" ? profile.goal : "";
  const plus = profile?.role === "admin" || hasPlusAccess(profile?.plan);

  let modules: Module[] = [];
  let progress: Progress[] = [];
  let lessonRows: Lesson[] = [];
  let videoProgress: LessonProgress[] = [];
  let guidanceTotal = 0;
  let guidanceCompleted = 0;
  let guidanceReady = true;

  if (index > 1) {
    const [{ data: moduleRows }, { data: progressRows }, { data: sectionRows }, { data: videoRows }] =
      await Promise.all([
        supabase.from("learning_modules")
          .select("id,title,type,href,estimated_minutes,branch")
          .eq("is_active",true)
          .or(branchKey && branchLabels[branchKey] ? "branch.eq.all,branch.eq." + branchKey : "branch.eq.all")
          .order("order_index", { ascending: true }).limit(100),
        supabase.from("user_module_progress")
          .select("module_id,status,progress_percent").eq("user_id",user.id),
        supabase.from("course_sections")
          .select("id,stage,lesson_videos(id,title,youtube_id,is_active,duration_seconds,order_index)")
          .eq("branch",branchKey || "all").eq("is_active",true),
        supabase.from("user_video_progress")
          .select("video_id,is_completed,progress_percent").eq("user_id",user.id)
      ]);
    modules = (moduleRows || []) as Module[];
    progress = (progressRows || []) as Progress[];
    const sections = (sectionRows || []) as Section[];
    lessonRows = sections.filter(s => s.stage !== "guidance")
      .flatMap(s => s.lesson_videos || []).filter(v => v.is_active)
      .filter(v => branchKey === "physics" || !/fizik|physics/iu.test(v.title))
      .sort((a,b) => a.order_index - b.order_index);
    videoProgress = (videoRows || []) as LessonProgress[];

    const playlist = await getGuidancePlaylist();
    guidanceTotal = playlist.videos.length;
    const { data: guided, error: guidanceError } = await supabase.from("user_guidance_video_progress")
      .select("youtube_id").eq("user_id",user.id);
    guidanceReady = !guidanceError;
    const completedIds = new Set((guided || []).map(v => v.youtube_id));
    guidanceCompleted = playlist.videos.filter(v => completedIds.has(v.youtubeId)).length;
  }

  const moduleDone = new Set(progress.filter(p =>
    p.status === "completed" || Number(p.progress_percent || 0) >= 100
  ).map(p => p.module_id));
  const lessonDone = new Set(videoProgress.filter(p =>
    p.is_completed || Number(p.progress_percent || 0) >= 100
  ).map(p => p.video_id));
  const completed = modules.filter(m => moduleDone.has(m.id)).length +
    lessonRows.filter(v => lessonDone.has(v.id)).length + guidanceCompleted;
  const total = modules.length + lessonRows.length + guidanceTotal;
  const progressPercent = total > 0 ? Math.round(completed / total * 100) : 0;

  const lessonTasks: RoadmapTask[] = lessonRows.map(v => ({
    id: v.id, title: v.title, kind: "lesson",
    type: "video", completed: lessonDone.has(v.id),
    minutes: v.duration_seconds ? Math.ceil(v.duration_seconds / 60) : null,
    href: "/rota/video/" + encodeURIComponent(v.id),
    ready: typeof v.youtube_id === "string" && /^[A-Za-z0-9_-]{11}$/.test(v.youtube_id)
  }));
  const otherTasks = (types: string[]): RoadmapTask[] => modules
    .filter(m => types.includes(m.type))
    .map(m => ({ id: m.id, kind: "module", title: m.title, type: m.type,
      completed: moduleDone.has(m.id), minutes: m.estimated_minutes,
      ready: true }));
  const practiceTasks = otherTasks(["question_set", "practice", "exam"]);
  const studyTasks = otherTasks(["guidance", "video", "pdf_note"]);

  return <><link rel="stylesheet" href="/style.css" /><div className="app-page"><div className="app-shell">
    <Sidebar active="roadmap" />
    <main className="app-main"><div className={styles.page}>
      <div className={styles.back}><Link href="/yol-haritasi">← Yol haritasına dön</Link><span>ADIM {String(index).padStart(2,"0")} / 04</span></div>
      <section className={styles.hero}>
        <div className={styles.heading}>
          <div className={styles.eyebrow}>OLYMPION HAZIRLIK ROTASI</div>
          <h1>{index === 1 ? "Hedefin belli olsun." : index === 2 ? "Konuyu gerçekten öğren." : index === 3 ? "Sorularla güçlen." : "İlerlemeni gör, devam et."}</h1>
          <p>{index === 1 ? "Branşını ve hazırlık seviyeni seç." : index === 2 ? "Dersleri izle. Tamamladıkların profilinde %100 olarak kaydedilsin." : index === 3 ? "Sorularını çöz ve bitirdiğin görevleri işaretle." : "Tamamlanan videoları, görevleri ve gelişimini incele."}</p>
        </div><div className={styles.orbit} aria-hidden="true"><span>{String(index).padStart(2,"0")}</span><i/><i/></div>
      </section>
      <nav className={styles.steps} aria-label="Rota adımları">
        {steps.map(s => <Link href={"/rota/adim/" + s.number} key={s.number}
          aria-current={s.number === index ? "step" : undefined} className={s.number === index ? styles.active : ""}>
          <b>{String(s.number).padStart(2,"0")}</b><span>{s.label}</span></Link>)}
      </nav>
      {query.saved === "1" && <p className={styles.success} role="status">Hedefin kaydedildi. Şimdi derslere geçebilirsin.</p>}
      {query.error && <p className={styles.error} role="alert">{query.error.slice(0,180)}</p>}
      {index > 1 && <section className={styles.progressSummary} aria-label="Genel rota ilerlemesi">
        <div><strong>{branch} rota ilerlemesi</strong><span>{completed}/{total} görev · %{progressPercent} tamamlandı</span></div>
        <div className={styles.track}><i style={{width: progressPercent + "%"}} /></div>
      </section>}
      {index === 1 && <section className={styles.panel}>
        <div className={styles.sectionHeading}><span>01 / PROFİLİN</span><h2>Hazırlık planını kişiselleştir.</h2><p>Seçimlerin öğrenci profilinde saklanır.</p></div>
        <form action="/dashboard/setup" method="POST" className={styles.form}>
          <input type="hidden" name="next" value="/rota/adim/2" />
          <label>Olimpiyat branşı<select name="branch" defaultValue={branchLabels[branchKey] ? branchKey : "physics"} required>
            <option value="physics">Fizik</option><option value="math">Matematik</option><option value="chemistry">Kimya</option><option value="biology">Biyoloji</option></select></label>
          <label>Hazırlık seviyen<select name="level" defaultValue={levelLabels[level] ? level : "beginner"} required>
            <option value="beginner">Yeni başlıyorum</option><option value="intermediate">Temel konuları biliyorum</option><option value="advanced">İleri düzey hazırlık</option></select></label>
          <label className={styles.full}>Hedefin<input name="goal" type="text" maxLength={160} required
            defaultValue={goal || "TÜBİTAK 1. aşamaya hazırlanmak"} placeholder="Ör. TÜBİTAK olimpiyatlarına hazırlanmak" /></label>
          <button type="submit">Kaydet ve derslere geç <span>→</span></button>
        </form>
      </section>}
      {index === 2 && <section className={styles.panel}>
        <div className={styles.sectionHeading}><span>02 / ÖĞREN</span><h2>{branch} Olimpiyat Soru Çözümleri</h2>
          <p>Branşına ait gerçek video dersleri burada görünür. Video sona erdiğinde otomatik, gerekirse “İzledim, tamamla” ile ilerlemen kaydedilir.</p></div>
        <RoadmapTaskList tasks={lessonTasks} hasPlus={plus} returnTo="/rota/adim/2"
          emptyText={branch + " branşına ait video çözümü henüz yüklenmemiş. Ders eklenince burada otomatik görünecek."} />
        <div className={styles.subSection}>
          <h3>Ortak olimpiyat rehberliği <span>{guidanceCompleted}/{guidanceTotal} tamamlandı</span></h3>
          <p>Her branş için ücretsizdir; izlenen her video ayrı tamamlanır.</p>
          <div className={styles.track}><i style={{width: guidanceTotal ? guidanceCompleted / guidanceTotal * 100 + "%" : "0%"}} /></div>
          <Link href="/courses/physics-guidance" className={styles.secondaryAction}>Rehberlik videolarına git ↗</Link>
          {!guidanceReady && <p className={styles.error}>Rehberlik kaydı için Supabase ilerleme tablosu henüz etkinleştirilmemiş.</p>}
        </div>
        {studyTasks.length > 0 && <div className={styles.subSection}>
          <h3>Ek çalışma görevleri</h3><p>Bu görevleri gerçekten bitirdiğinde kendin tamamlandı olarak işaretleyebilirsin.</p>
          <RoadmapTaskList tasks={studyTasks} hasPlus={plus} returnTo="/rota/adim/2" emptyText="Henüz çalışma görevi yok." />
        </div>}
        <div className={styles.ctas}><Link className={styles.primary} href="/kurslar">Tüm derslere git →</Link><Link href="/notlar">Branşına özel PDF notlarını aç ↗</Link></div>
      </section>}
      {index === 3 && <section className={styles.panel}>
        <div className={styles.sectionHeading}><span>03 / SORU ÇÖZ</span><h2>{branch} soru çözümü ve pratik</h2>
          <p>Soru çözümlerini tamamladıktan sonra “Soruları çözdüm” ile kaydet. Bu, öğrencinin kendi beyanıdır; otomatik cevap doğrulaması değildir.</p></div>
        <RoadmapTaskList tasks={practiceTasks} hasPlus={plus} returnTo="/rota/adim/3"
          emptyText={branch + " branşına ait soru seti henüz eklenmedi. Yeni görevler eklendiğinde burada görünecek."} />
        <div className={styles.ctas}><Link className={styles.primary} href="/kurslar">Soru çözümü videolarını gör →</Link><Link href="/rota/adim/4">Gelişimimi ölç ↗</Link></div>
      </section>}
      {index === 4 && <section className={styles.panel}>
        <div className={styles.sectionHeading}><span>04 / DEĞERLENDİR</span><h2>Gelişim raporun</h2>
          <p>Kullanıcı hesabına kaydedilmiş tamamlamalar üzerinden hesaplanır. Her video ayrı bir görevdir.</p></div>
        <div className={styles.metrics}>
          <div><small>Tamamlanan tüm görevler</small><strong>{completed} / {total}</strong></div>
          <div><small>Rota ilerlemesi</small><strong>%{progressPercent}</strong></div>
          <div><small>Video dersleri</small><strong>{lessonRows.filter(v => lessonDone.has(v.id)).length}/{lessonRows.length}</strong></div>
        </div>
        <div className={styles.track}><i style={{width: progressPercent + "%"}} /></div>
        <div className={styles.metrics}>
          <div><small>Ortak rehberlik</small><strong>{guidanceCompleted}/{guidanceTotal}</strong></div>
          <div><small>Soru çözüm görevleri</small><strong>{practiceTasks.filter(t => t.completed).length}/{practiceTasks.length}</strong></div>
          <div><small>Hazırlık branşı</small><strong>{branch}</strong></div>
        </div>
        <div className={styles.next}><h3>Bir sonraki hedefin</h3>
          <p>{total === 0 ? "Rotana dersler ve soru görevleri eklendiğinde ilerlemen burada görünecek."
            : completed === total ? "Tüm mevcut görevler tamamlandı. Yeni dersler eklendikçe rotan büyüyecek."
            : "Bir sonraki videoyu izle veya eksik soru görevini tamamla; ilerlemen kaydedilsin."}</p>
        </div>
        <div className={styles.ctas}><Link className={styles.primary} href="/panel">Panelde gör →</Link><Link href="/rota/adim/2">Derslere dön ↗</Link></div>
      </section>}
      <div className={styles.footerNav}>
        {index > 1 ? <Link href={"/rota/adim/" + (index - 1)}>← Önceki aşama</Link> : <span />}
        {index < 4 ? <Link href={"/rota/adim/" + (index + 1)}>Sonraki aşama →</Link> : <Link href="/yol-haritasi">Yol haritasına dön →</Link>}
      </div>
    </div></main>
  </div></div></>;
}
