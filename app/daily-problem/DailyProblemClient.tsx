"use client";

import { useMemo, useState } from "react";

type ProblemStep = {
  title: string;
  text: string;
};

type Problem = {
  id: string;
  branch: "physics" | "chemistry";
  branchLabel: string;
  title: string;
  difficulty: string;
  topic: string;
  questionHtml: string;
  visualHtml?: string;
  steps: ProblemStep[];
};

type DailyProblemClientProps = {
  branchKey: "physics" | "chemistry";
  branchLabel: string;
  problems: Problem[];
};

function getDailyIndex(total: number) {
  const startDate = new Date("2026-01-01T00:00:00");
  const today = new Date();
  const dayIndex = Math.floor(
    (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  return Math.abs(dayIndex) % Math.max(total, 1);
}

export default function DailyProblemClient({
  branchKey,
  branchLabel,
  problems,
}: DailyProblemClientProps) {
  const dailyIndex = useMemo(() => getDailyIndex(problems.length), [problems.length]);
  const [activeIndex, setActiveIndex] = useState(dailyIndex);
  const [showAnswer, setShowAnswer] = useState(false);
  const [studentNote, setStudentNote] = useState("");

  const problem = problems[activeIndex];

  function showAnotherProblem() {
    setActiveIndex((current) => (current + 1) % problems.length);
    setShowAnswer(false);
    setStudentNote("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (!problem) {
    return (
      <section className="app-panel">
        <span className="eyebrow">Günlük Problem</span>
        <h2>Bu branş için problem yakında eklenecek.</h2>
        <p>
          Şu an seçili branşın: {branchLabel}. Problem bankası admin panelinden
          genişletilecek.
        </p>
      </section>
    );
  }

  return (
    <>
      <section className="app-panel daily-problem-hero">
        <div>
          <span className="eyebrow">{branchLabel} • Günlük Problem</span>
          <h2>{problem.title}</h2>
          <p>
            Konu: {problem.topic}. Önce kendi çözümünü dene, sonra adım adım
            cevabı aç.
          </p>
        </div>

        <div className="daily-streak-orb">
          <strong>0</strong>
          <span>seri</span>
        </div>
      </section>

      <section className="problem-layout">
        <article className="app-panel problem-main-card">
          <div className="panel-head">
            <div>
              <h2>Soru</h2>
              <p className="panel-sub">
                Bu problem {branchLabel} profiline göre seçildi.
              </p>
            </div>

            <span className="problem-pill">{problem.difficulty}</span>
          </div>

          {problem.visualHtml && (
            <div
              className="problem-visual"
              dangerouslySetInnerHTML={{ __html: problem.visualHtml }}
            />
          )}

          <div
            className="problem-question"
            dangerouslySetInnerHTML={{ __html: problem.questionHtml }}
          />

          <div className="student-answer-box">
            <label htmlFor="studentAnswer">Kendi çözüm notun</label>
            <textarea
              id="studentAnswer"
              value={studentNote}
              onChange={(event) => setStudentNote(event.target.value)}
              placeholder="Buraya kendi çözüm fikrini yaz. Sonraki adımda bunu Supabase'e kaydedeceğiz."
            />
          </div>

          <div className="problem-actions">
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => setShowAnswer(true)}
            >
              Cevabı Göster
            </button>

            <button
              className="btn btn-secondary"
              type="button"
              onClick={showAnotherProblem}
            >
              Başka Örnek Göster
            </button>
          </div>
        </article>

        <aside className="app-panel problem-side-card">
          <div className="panel-head">
            <div>
              <h2>Çözüm disiplini</h2>
              <p className="panel-sub">Cevabı açmadan önce kontrol et.</p>
            </div>
          </div>

          <ul className="problem-checklist">
            <li>Verilenleri sembollerle yazdın mı?</li>
            <li>Ana kavramı veya yasayı seçtin mi?</li>
            <li>Birimleri ve sınır durumları kontrol ettin mi?</li>
            <li>Sonucun anlamlı olup olmadığını yorumladın mı?</li>
          </ul>

          <div className="problem-note">
            <strong>Profil bazlı seçim</strong>
            <p>
              Şu an {branchLabel} profiliyle çalışıyorsun. Problem bankası her
              gün bu branşa göre tarih bazlı değişir.
            </p>
          </div>
        </aside>
      </section>

      {showAnswer && (
        <section className="app-panel answer-panel">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Çözüm</span>
              <h2>Adım adım cevap</h2>
            </div>

            <button
              className="coach-reset-btn"
              type="button"
              onClick={() => setShowAnswer(false)}
            >
              Gizle
            </button>
          </div>

          <div className="answer-content">
            {problem.steps.map((step, index) => (
              <div key={`${problem.id}-${step.title}`} className="answer-step">
                <span>{index + 1}</span>
                <strong>{step.title}</strong>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <style>{`
        .daily-problem-hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 22px;
        }

        .daily-problem-hero h2 {
          margin: 8px 0;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .daily-problem-hero p {
          color: rgba(235, 245, 255, 0.72);
          line-height: 1.7;
          max-width: 760px;
        }

        .daily-streak-orb {
          width: 120px;
          height: 120px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          text-align: center;
          border: 1px solid rgba(124, 242, 255, 0.28);
          background:
            radial-gradient(circle at 35% 30%, rgba(124, 242, 255, 0.22), transparent 55%),
            rgba(255, 255, 255, 0.045);
          flex: 0 0 auto;
        }

        .daily-streak-orb strong {
          display: block;
          color: #ffffff;
          font-size: 30px;
          line-height: 1;
        }

        .daily-streak-orb span {
          display: block;
          margin-top: -28px;
          color: rgba(235, 245, 255, 0.62);
          font-size: 13px;
        }

        .problem-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.65fr);
          gap: 18px;
          align-items: start;
        }

        .problem-main-card {
          min-height: 520px;
        }

        .problem-side-card {
          position: sticky;
          top: 24px;
        }

        .problem-pill {
          border-radius: 999px;
          padding: 8px 12px;
          background: rgba(124, 242, 255, 0.1);
          border: 1px solid rgba(124, 242, 255, 0.18);
          color: #7cf2ff;
          font-size: 12px;
          font-weight: 900;
        }

        .problem-visual {
          margin-top: 18px;
          border-radius: 24px;
          padding: 22px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.085);
          overflow: auto;
        }

        .problem-visual svg {
          width: 100%;
          max-width: 720px;
          display: block;
          margin: 0 auto;
        }

        .problem-question {
          margin-top: 18px;
          border-radius: 24px;
          padding: 22px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.085);
          color: rgba(245, 250, 255, 0.92);
          line-height: 1.85;
          font-size: 16px;
        }

        .problem-question strong {
          color: #ffffff;
        }

        .problem-question code {
          color: #7cf2ff;
          font-weight: 900;
        }

        .student-answer-box {
          display: grid;
          gap: 10px;
          margin-top: 18px;
        }

        .student-answer-box label {
          color: rgba(235, 245, 255, 0.78);
          font-size: 13px;
          font-weight: 900;
        }

        .student-answer-box textarea {
          width: 100%;
          min-height: 150px;
          resize: vertical;
          border-radius: 20px;
          padding: 16px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(3, 10, 20, 0.58);
          color: #f7fbff;
          outline: none;
          line-height: 1.6;
        }

        .student-answer-box textarea:focus {
          border-color: rgba(124, 242, 255, 0.32);
          box-shadow: 0 0 0 4px rgba(124, 242, 255, 0.08);
        }

        .problem-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 18px;
        }

        .problem-checklist {
          display: grid;
          gap: 12px;
          margin: 18px 0 0;
          padding: 0;
          list-style: none;
        }

        .problem-checklist li {
          border-radius: 16px;
          padding: 13px 14px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(235, 245, 255, 0.76);
          line-height: 1.5;
        }

        .problem-checklist li::before {
          content: "✓";
          color: #7cf2ff;
          font-weight: 900;
          margin-right: 8px;
        }

        .problem-note {
          margin-top: 18px;
          border-radius: 20px;
          padding: 16px;
          background: rgba(157, 255, 203, 0.075);
          border: 1px solid rgba(157, 255, 203, 0.16);
        }

        .problem-note strong {
          display: block;
          color: #ffffff;
          margin-bottom: 6px;
        }

        .problem-note p {
          color: rgba(235, 245, 255, 0.72);
          line-height: 1.65;
          margin: 0;
        }

        .answer-panel {
          margin-top: 18px;
        }

        .answer-content {
          display: grid;
          gap: 14px;
          margin-top: 18px;
        }

        .answer-step {
          border-radius: 22px;
          padding: 18px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.085);
        }

        .answer-step span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 30px;
          height: 30px;
          border-radius: 999px;
          margin-bottom: 10px;
          background: rgba(124, 242, 255, 0.12);
          color: #7cf2ff;
          font-weight: 900;
          border: 1px solid rgba(124, 242, 255, 0.18);
        }

        .answer-step strong {
          display: block;
          color: #ffffff;
          margin-bottom: 6px;
          font-size: 16px;
        }

        .answer-step p {
          color: rgba(235, 245, 255, 0.76);
          line-height: 1.75;
          margin: 0;
        }

        .coach-reset-btn {
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 999px;
          padding: 10px 14px;
          background: rgba(255, 255, 255, 0.055);
          color: #ffffff;
          cursor: pointer;
          font-weight: 900;
        }

        @media (max-width: 980px) {
          .daily-problem-hero {
            flex-direction: column;
            align-items: flex-start;
          }

          .problem-layout {
            grid-template-columns: 1fr;
          }

          .problem-side-card {
            position: static;
          }
        }
      `}</style>
    </>
  );
}
