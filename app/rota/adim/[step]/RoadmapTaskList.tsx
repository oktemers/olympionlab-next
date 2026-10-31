"use client";
import { useEffect, useState } from "react";
import s from "./step.module.css";

export type RoadmapTask = {
  id: string;
  title: string;
  kind: "module" | "lesson";
  type: string;
  minutes: number | null;
  completed: boolean;
  href?: string;
  ready?: boolean;
};

export default function RoadmapTaskList({ tasks, hasPlus, returnTo, emptyText } : {
  tasks: RoadmapTask[];
  hasPlus: boolean;
  returnTo: string;
  emptyText: string;
}) {
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  useEffect(() => {
    if (!upgradeOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setUpgradeOpen(false); };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [upgradeOpen]);

  if (!tasks.length) return <div className={s.empty}>
    <p>{emptyText}</p>
    <a href="/kurslar">Dersleri görüntüle ↗</a>
  </div>;

  return <div className={s.moduleList}>
    {tasks.map((task, i) => <article key={task.kind + "-" + task.id} className={s.module}>
      <span className={s.moduleIcon}>{task.completed ? "✓" : String(i+1).padStart(2, "0")}</span>
      <div className={s.taskBody}>
        <strong>{task.title}</strong>
        <small>{task.minutes ? task.minutes + " dk · " : ""}{task.kind === "lesson" ? "Video ders" : ["question_set", "exam", "practice"].includes(task.type) ? "Soru çözümü" : "Çalışma görevi"} · {task.completed ? "%100 tamamlandı" : "%0"}</small>
        <div className={s.taskTrack}><i style={{ width: task.completed ? "100%" : "0%" }} /></div>
      </div>
      <div className={s.taskActions}>
        {task.completed ? <span className={s.taskDone}>Tamamlandı</span> : !hasPlus ? (
          <button type="button" className={s.taskUpgrade} onClick={() => setUpgradeOpen(true)}>✦ Plus gerekli</button>
        ) : task.kind === "lesson" && task.href ? (
          <a className={s.taskOpen} href={task.href}>Videoyu izle ↗</a>
        ) : task.ready === false ? (
          <span className={s.taskUnavailable}>İçerik hazırlanıyor</span>
        ) : (
          <form method="post" action="/api/roadmap/progress">
            <input type="hidden" name="kind" value={task.kind} />
            <input type="hidden" name="id" value={task.id} />
            <input type="hidden" name="returnTo" value={returnTo} />
            <button className={s.taskOpen} type="submit">
              {["question_set","practice","exam"].includes(task.type) ? "Soruları çözdüm ✓" : "Tamamladım ✓"}
            </button>
          </form>
        )}
      </div>
    </article>)}
    {upgradeOpen && <div className={s.upgradeBackdrop} onMouseDown={event => {
      if (event.target === event.currentTarget) setUpgradeOpen(false);
    }}>
      <section className={s.upgradeDialog} role="dialog" aria-modal="true" aria-labelledby="roadmap-upgrade-title">
        <button type="button" className={s.upgradeClose} aria-label="Kapat" onClick={() => setUpgradeOpen(false)}>×</button>
        <span className={s.upgradeSpark}>✦</span>
        <span className={s.upgradeCaption}>OLYMPION PLUS</span>
        <h2 id="roadmap-upgrade-title">Bu içerik için Plus gerekli</h2>
        <p>Soru çözümleri ve branş derslerine erişmek, tamamladığın görevleri kaydetmek için Plus veya daha yüksek bir plan kullanmalısın. Ortak rehberlik ücretsizdir.</p>
        <a className={s.primary} href="/odeme?plan=plus">Plus planına geç ↗</a>
        <button type="button" className={s.upgradeLater} onClick={() => setUpgradeOpen(false)}>Şimdilik devam et</button>
      </section>
    </div>}
  </div>;
}
