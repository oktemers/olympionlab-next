import { resetPassword, signIn, signInWithGoogle, signUp } from "@/app/auth/actions";

export default function LoginPage({ searchParams }: { searchParams: { error?: string; message?: string } }) {
  return (
    <div className="login-page premium-login-page next-page-shell">
      <div className="noise"></div>
      <main className="auth-layout-v2">
        <a href="/" className="brand auth-brand"><div className="brand-badge">O</div><div>Olympion Lab<small>Akademik çalışma alanı</small></div></a>
        <section className="auth-copy-panel"><div className="badge cyan">Öğrenci girişi</div><h1>Çalışma rotana kaldığın yerden devam et.</h1><p>Videolarını, PDF notlarını, günlük problemini ve Labs deneylerini tek panelden yönet.</p><div className="auth-highlights"><span>Rota takibi</span><span>Plus içerikler</span><span>AI Koç</span></div></section>
        <section className="auth-card premium-auth-card">
          <div className="auth-tabs"><span className="auth-tab active">Giriş Yap</span><span className="auth-tab">Üye Ol</span></div>
          {searchParams?.error && <p className="next-status-error">{searchParams.error}</p>}
          {searchParams?.message && <p className="next-status-ok">{searchParams.message}</p>}
          <form action={signInWithGoogle}><button className="google-btn" type="submit">Google ile bağlan</button></form>
          <div className="auth-separator"><span>veya e-posta ile devam et</span></div>
          <div className="grid-2" style={{display:"grid",gap:18}}>
            <form className="next-form-stack" action={signIn}>
              <h3>Giriş Yap</h3><label>E-posta<input name="email" type="email" required /></label><label>Şifre<input name="password" type="password" required /></label><button className="btn btn-primary" type="submit">Giriş Yap</button>
            </form>
            <form className="next-form-stack" action={signUp}>
              <h3>Üye Ol</h3><label>Ad Soyad<input name="full_name" required /></label><label>E-posta<input name="email" type="email" required /></label><label>Şifre<input name="password" type="password" minLength={8} required /></label><button className="btn btn-secondary" type="submit">Hesap Oluştur</button>
            </form>
          </div>
          <details style={{marginTop:18}}><summary className="forgot-link">Şifremi unuttum</summary><form className="next-form-stack" action={resetPassword} style={{marginTop:12}}><label>E-posta<input name="email" type="email" required /></label><button className="btn btn-secondary" type="submit">Sıfırlama bağlantısı gönder</button></form></details>
        </section>
      </main>
    </div>
  );
}
