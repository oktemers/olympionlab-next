import { PublicNav } from "@/components/PublicNav";

export default function HomePage() {
  return (
    <div className="public-page next-page-shell">
      <div className="noise"></div>
      <PublicNav />
      <main className="site-main">
        <section className="hero">
          <div className="container hero-grid">
            <div className="hero-copy">
              <div className="badge cyan">Olympion Lab 2026</div>
              <h1>Olimpiyat hazırlığını kişisel bir öğrenme sistemine dönüştür.</h1>
              <p>Video kütüphanesi, çalışma rotası, PDF notları, AI koç ve ilerleme takibiyle olimpiyatlara premium bir platformda hazırlan.</p>
              <div className="hero-actions"><a className="btn btn-primary" href="/videos">Video Kütüphanesine Git</a><a className="btn btn-secondary" href="/login">Ücretsiz Başla</a></div>
            </div>
            <div className="hero-visual" aria-hidden="true"><div className="science-canvas glass-focus"><div className="method-sphere"></div><div className="method-animated-layer"><div className="orbit-ring"></div><div className="glow-core"></div><span className="eq-chip">F = ma</span><span className="eq-chip">ΔG = ΔH − TΔS</span><span className="eq-chip">∇·E = ρ/ε₀</span></div></div></div>
          </div>
        </section>
        <section><div className="container feature-grid">
          <article className="feature-card"><div className="feature-icon">▶</div><h3>Video tabanlı rota</h3><p>Her video branş, seviye ve plan erişimine göre veritabanından yönetilir.</p></article>
          <article className="feature-card"><div className="feature-icon">📈</div><h3>Gerçek ilerleme</h3><p>Kullanıcı hangi videoyu tamamladıysa Supabase üzerinde kalıcı olarak tutulur.</p></article>
          <article className="feature-card"><div className="feature-icon">✦</div><h3>AI Koç</h3><p>OpenAI backend route ile kullanıcı bağlamına göre strateji odaklı cevap verir.</p></article>
        </div></section>
      </main>
    </div>
  );
}
