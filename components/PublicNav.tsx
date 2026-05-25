export function PublicNav() {
  return (
    <header className="site-header">
      <div className="container nav">
        <a href="/" className="brand" aria-label="Olympion Lab ana sayfa">
          <div className="brand-badge">O</div>
          <div>Olympion Lab<small>Olimpiyat Öğrenme Platformu</small></div>
        </a>
        <nav className="nav-links" aria-label="Ana menü">
          <a href="/videos">Video Kütüphanesi</a>
          <a href="/pricing">Fiyatlandırma</a>
          <a href="/dashboard">Dashboard</a>
          <a href="/ai-coach">AI Koç</a>
        </nav>
        <div className="nav-right"><a href="/login" className="login-bubble">Giriş Yap <span>→</span></a></div>
      </div>
    </header>
  );
}
