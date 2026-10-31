"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";

export default function VerifyShopierPurchasePage() {
  const [orderId, setOrderId] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [success, setSuccess] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setResult(""); setSuccess(false);
    try {
      const response = await fetch("/api/payments/shopier/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ orderId: orderId.trim().replace(/^#/, "") }),
      });
      const data = await response.json() as { message?: string };
      setSuccess(response.ok);
      setResult(data.message || "Sipariş kontrol edilemedi.");
    } catch {
      setResult("İnternet bağlantını kontrol ederek yeniden dene.");
    } finally { setBusy(false); }
  }

  return (
    <main style={{ minHeight: "100vh", padding: "64px 18px", background: "#050a15", color: "#eef5ff", display: "grid", placeItems: "center" }}>
      <section style={{ width: "min(530px,100%)", padding: "clamp(22px,5vw,38px)", borderRadius: 20, border: "1px solid #263850", background: "#0d192a", boxShadow: "0 24px 70px #0007" }}>
        <Link href="/odeme" style={{ color: "#83b7ff", fontSize: 13 }}>← Ödeme ekranına dön</Link>
        <div style={{ color: "#8eb7fc", fontSize: 11, letterSpacing: "0.14em", fontWeight: 750, marginTop: 27 }}>SHOPIER × OLYMPIONLAB</div>
        <h1 style={{ fontSize: "clamp(27px,6vw,39px)", lineHeight: 1.15, margin: "14px 0" }}>Üyeliğini etkinleştir.</h1>
        <p style={{ color: "#b5c4d8", fontSize: 14, lineHeight: 1.75 }}>
          Shopier ödeme ekranındaki sipariş numaranı gir. Shopier'de kullandığın e-posta,
          doğrulanmış Olympionlab hesabındaki e-postayla aynı olmalı.
        </p>
        <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 26 }}>
          <label htmlFor="shopier-order-id" style={{ fontSize: 13, fontWeight: 700 }}>Shopier sipariş numarası</label>
          <input id="shopier-order-id" type="text" autoComplete="off" required minLength={4} maxLength={65}
            placeholder="Örn. 870421429" value={orderId} onChange={e => setOrderId(e.target.value)}
            style={{ width: "100%", color: "white", border: "1px solid #385570", background: "#101f33", borderRadius: 11, padding: "14px 15px", fontSize: 16 }}/>
          <button type="submit" disabled={busy} style={{ border: 0, borderRadius: 11, background: "#4c95ff", color: "#07152c", fontWeight: 800, padding: "14px 16px", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1 }}>
            {busy ? "Shopier ile doğrulanıyor…" : "Ödemeyi doğrula"}
          </button>
        </form>
        {result && <p role="status" aria-live="polite" style={{ padding: 13, borderRadius: 10, background: success ? "#103a34" : "#322326", color: success ? "#91f2d3" : "#ffd5cc", fontSize: 13, lineHeight: 1.6 }}>{result}</p>}
        {success && <Link href="/panel" style={{ display: "inline-block", marginTop: 8, color: "#94c4ff", fontWeight: 800 }}>Öğrenci paneline git →</Link>}
        <p style={{ color: "#8193a8", fontSize: 12, lineHeight: 1.7, marginTop: 22 }}>
          Bu sayfa ödeme almaz, yalnızca Shopier'de tamamlanan siparişi kontrol eder.
          Eşleşme sorunu yaşarsan sipariş numaranla destek ekibine başvur.
        </p>
      </section>
    </main>
  );
}
