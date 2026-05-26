import { resetPassword, signIn, signInWithGoogle, signUp } from "@/app/auth/actions";

type LoginSearchParams = {
  error?: string;
  message?: string;
  mode?: string;
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  const params = await searchParams;
  const mode =
    params?.mode === "register" || params?.mode === "reset"
      ? params.mode
      : "login";

  return (
    <div className="login-page premium-login-page">
      <div className="noise"></div>
      <div id="cursorFormulaLayer" className="cursor-formula-layer" aria-hidden="true"></div>

      <main className="auth-layout-v2">
        <a href="/" className="brand auth-brand">
          <div className="brand-badge">O</div>
          <div>
            Olympion
            <small>Akademik çalışma alanı</small>
          </div>
        </a>

        <section className="auth-copy-panel">
          <div className="badge cyan">Öğrenci girişi</div>

          <h1>Çalışma rotana kaldığın yerden devam et.</h1>

          <p>
            Videolarını, PDF notlarını, günlük problemini ve Labs deneylerini tek panelden
            yönet.
          </p>

          <div className="auth-highlights">
            <span>Rota takibi</span>
            <span>Plus içerikler</span>
            <span>Koç</span>
          </div>
        </section>

        <section className="auth-card premium-auth-card">
          <div className="auth-tabs">
            <a className={`auth-tab ${mode === "login" || mode === "reset" ? "active" : ""}`} href="/login">
              Giriş Yap
            </a>

            <a className={`auth-tab ${mode === "register" ? "active" : ""}`} href="/login?mode=register">
              Üye Ol
            </a>
          </div>

          {params?.error && <p className="next-status-error">{params.error}</p>}
          {params?.message && <p className="next-status-ok">{params.message}</p>}

          {mode !== "reset" && (
            <>
              <form action={signInWithGoogle}>
                <button className="google-btn" type="submit" aria-label="Google ile bağlan">
                  <svg viewBox="0 0 48 48" aria-hidden="true">
                    <path
                      fill="#FFC107"
                      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-7.9l-6.5 5C9.5 39.5 16.2 44 24 44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.3-4.1 5.6l6.2 5.2C36.9 39.3 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
                    />
                  </svg>
                  Google ile bağlan
                </button>
              </form>

              <div className="auth-separator">
                <span>veya e-posta ile devam et</span>
              </div>
            </>
          )}

          {mode === "login" && (
            <form id="authForm" action={signIn}>
              <label>
                E-posta
                <input name="email" type="email" required placeholder="ornek@mail.com" />
              </label>

              <label>
                Şifre
                <input name="password" type="password" required placeholder="••••••••" />
              </label>

              <div className="auth-row">
                <label className="remember-row">
                  <input type="checkbox" /> Beni hatırla
                </label>

                <a href="/login?mode=reset" className="forgot-link">
                  Şifremi unuttum
                </a>
              </div>

              <button id="authMainBtn" className="btn btn-primary" type="submit">
                Giriş Yap
              </button>

              <p className="auth-note">
                Hesabın Olympion Lab profilinle eşleşir. Giriş yaptıktan sonra çalışma
                paneline yönlendirilirsin.
              </p>
            </form>
          )}

          {mode === "register" && (
            <form id="authForm" action={signUp}>
              <label>
                Ad Soyad
                <input name="full_name" type="text" required placeholder="Adın ve soyadın" />
              </label>

              <label>
                E-posta
                <input name="email" type="email" required placeholder="ornek@mail.com" />
              </label>

              <label>
                Şifre
                <input
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  placeholder="••••••••"
                />
              </label>

              <label>
                Hedef branş
                <select name="branch" defaultValue="Fizik Olimpiyatı">
                  <option>Fizik Olimpiyatı</option>
                  <option>Kimya Olimpiyatı</option>
                  <option>Matematik Olimpiyatı</option>
                  <option>Biyoloji Olimpiyatı</option>
                  <option>TÜBİTAK Proje</option>
                </select>
              </label>

              <button id="authMainBtn" className="btn btn-primary" type="submit">
                Hesap Oluştur
              </button>

              <p className="auth-note">
                Hesabın Supabase Auth’a kaydedilir ve otomatik öğrenci profilin oluşturulur.
              </p>
            </form>
          )}

          {mode === "reset" && (
            <form id="authForm" action={resetPassword}>
              <h3>Şifremi unuttum</h3>

              <label>
                E-posta
                <input name="email" type="email" required placeholder="ornek@mail.com" />
              </label>

              <button id="authMainBtn" className="btn btn-primary" type="submit">
                Sıfırlama bağlantısı gönder
              </button>

              <p className="auth-note">
                Şifre sıfırlama bağlantısı e-posta adresine gönderilecek.
              </p>

              <a href="/login" className="forgot-link">
                Giriş ekranına dön
              </a>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
