"use client";

import { useState, type FormEvent } from "react";

export default function RouteSetupModal() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);
    setMessage("Rota kaydediliyor...");

    try {
      const response = await fetch("/api/dashboard/setup", {
        method: "POST",
        body: formData,
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      });

      const text = await response.text();

      let payload: {
        ok?: boolean;
        error?: string;
        branch?: string;
        level?: string;
        goal?: string;
      } | null = null;

      try {
        payload = JSON.parse(text);
      } catch {
        throw new Error(
          `Sunucu JSON dönmedi. HTTP ${response.status}. Cevap: ${text.slice(
            0,
            180
          )}`
        );
      }

      if (!response.ok || !payload?.ok) {
        throw new Error(
          payload?.error ||
            `Rota kaydedilemedi. HTTP ${response.status}.`
        );
      }

      setMessage("Rota oluşturuldu. Dashboard yenileniyor...");
      window.location.assign(`/dashboard?setup=success&t=${Date.now()}`);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Beklenmeyen bir hata oluştu."
      );
      setIsSubmitting(false);
    }
  }

  return (
    <div id="setup-route" className="route-setup-modal open" aria-hidden="false">
      <div className="route-setup-card">
        <div className="badge cyan">İlk kurulum</div>

        <h2>Olympion Lab rotanı oluşturalım.</h2>

        <p>
          Branşını, seviyeni ve hedefini seç. Bu bilgiler profilinde saklanacak;
          dashboard, dersler, problem ve PDF önerileri buna göre kişiselleşecek.
        </p>

        <form onSubmit={handleSubmit} className="route-setup-form">
          <label>
            <span>Branş</span>
            <select name="branch" defaultValue="chemistry" required>
              <option value="chemistry">Kimya</option>
              <option value="physics">Fizik</option>
              <option value="math">Matematik</option>
              <option value="biology">Biyoloji</option>
            </select>
          </label>

          <label>
            <span>Seviye</span>
            <select name="level" defaultValue="beginner" required>
              <option value="beginner">Başlangıç</option>
              <option value="intermediate">Orta</option>
              <option value="advanced">İleri</option>
            </select>
          </label>

          <label>
            <span>Hedef</span>
            <select name="goal" defaultValue="TÜBİTAK 1. Aşama">
              <option value="TÜBİTAK 1. Aşama">TÜBİTAK 1. Aşama</option>
              <option value="TÜBİTAK 2. Aşama">TÜBİTAK 2. Aşama</option>
              <option value="Uluslararası olimpiyat hazırlığı">
                Uluslararası olimpiyat hazırlığı
              </option>
              <option value="Kavram öğrenmek ve temel oluşturmak">
                Kavram öğrenmek ve temel oluşturmak
              </option>
            </select>
          </label>

          <button
            className="btn btn-primary route-setup-submit"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Kaydediliyor..." : "Rotamı Oluştur"}
          </button>

          {message && <div className="route-setup-message">{message}</div>}
        </form>
      </div>

      <style>{`
        .route-setup-modal {
          position: fixed;
          inset: 0;
          z-index: 300;
          display: grid;
          place-items: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.72);
          backdrop-filter: blur(14px);
        }

        .route-setup-card {
          width: min(680px, 100%);
          border-radius: 30px;
          padding: 30px;
          background:
            radial-gradient(circle at top left, rgba(124, 242, 255, 0.12), transparent 42%),
            #081222;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.5);
        }

        .route-setup-card h2 {
          margin: 14px 0 10px;
          color: #ffffff;
          font-size: 28px;
          letter-spacing: -0.03em;
        }

        .route-setup-card p {
          color: rgba(235, 245, 255, 0.74);
          line-height: 1.7;
          margin-bottom: 22px;
        }

        .route-setup-form {
          display: grid;
          gap: 14px;
        }

        .route-setup-form label {
          display: grid;
          gap: 8px;
        }

        .route-setup-form label span {
          color: rgba(235, 245, 255, 0.78);
          font-size: 13px;
          font-weight: 800;
        }

        .route-setup-form select {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: #081222;
          color: #f7fbff;
          padding: 14px 15px;
          outline: none;
        }

        .route-setup-form option {
          background: #081222;
          color: #f7fbff;
        }

        .route-setup-submit {
          margin-top: 6px;
          width: 100%;
          justify-content: center;
          pointer-events: auto !important;
          cursor: pointer;
        }

        .route-setup-submit:disabled {
          opacity: 0.72;
          cursor: wait;
        }

        .route-setup-message {
          border-radius: 14px;
          padding: 12px 14px;
          background: rgba(124, 242, 255, 0.08);
          border: 1px solid rgba(124, 242, 255, 0.16);
          color: rgba(235, 245, 255, 0.86);
          font-size: 13px;
          line-height: 1.5;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
}
