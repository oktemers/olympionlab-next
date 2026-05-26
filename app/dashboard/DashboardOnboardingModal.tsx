"use client";

import { useEffect, useState } from "react";

export default function DashboardOnboardingModal() {
  const [open, setOpen] = useState(false);
  const [branch, setBranch] = useState("Fizik");
  const [level, setLevel] = useState("Başlangıç");
  const [goal, setGoal] = useState("TÜBİTAK 1. Aşama");
  const [days, setDays] = useState("3-4 gün");

  useEffect(() => {
    const dismissed = localStorage.getItem("olympion_onboarding_dismissed");

    if (!dismissed) {
      const timer = window.setTimeout(() => {
        setOpen(true);
      }, 650);

      return () => window.clearTimeout(timer);
    }
  }, []);

  function closeModal() {
    localStorage.setItem("olympion_onboarding_dismissed", "true");
    setOpen(false);
  }

  function createRoadmap() {
    localStorage.setItem("olympion_onboarding_dismissed", "true");
    localStorage.setItem(
      "olympion_onboarding_choices",
      JSON.stringify({
        branch,
        level,
        goal,
        days,
      })
    );

    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="onboarding-modal open" aria-hidden="false">
      <div className="onboarding-card">
        <button
          className="modal-close"
          aria-label="Kapat"
          type="button"
          onClick={closeModal}
        >
          ×
        </button>

        <div className="badge cyan">İlk kurulum</div>

        <h2>Rotanı birlikte oluşturalım.</h2>

        <p>Dashboard’u sana göre şekillendirmek için birkaç hızlı seçim yap.</p>

        <div className="onboarding-step">
          <strong>Hangi branşla başlamak istiyorsun?</strong>

          <div className="choice-grid">
            {["Fizik", "Kimya", "Matematik", "Biyoloji"].map((item) => (
              <button
                key={item}
                type="button"
                className={branch === item ? "active" : ""}
                onClick={() => setBranch(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="onboarding-step">
          <strong>Seviyen?</strong>

          <div className="choice-grid">
            {["Başlangıç", "Orta", "İleri"].map((item) => (
              <button
                key={item}
                type="button"
                className={level === item ? "active" : ""}
                onClick={() => setLevel(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="onboarding-step">
          <strong>Hedefin?</strong>

          <div className="choice-grid goal-choice-grid">
            {[
              "TÜBİTAK 1. Aşama",
              "TÜBİTAK 2. Aşama",
              "Uluslararası",
              "Kavram öğrenmek",
            ].map((item) => (
              <button
                key={item}
                type="button"
                className={goal === item ? "active" : ""}
                onClick={() => setGoal(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="onboarding-step">
          <strong>Haftalık çalışma ritmin?</strong>

          <div className="choice-grid">
            {["2 gün", "3-4 gün", "5+ gün"].map((item) => (
              <button
                key={item}
                type="button"
                className={days === item ? "active" : ""}
                onClick={() => setDays(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary" type="button" onClick={createRoadmap}>
          Rotamı Oluştur
        </button>
      </div>
    </div>
  );
}
