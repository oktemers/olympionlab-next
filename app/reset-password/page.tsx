"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const [status, setStatus] = useState<"checking" | "ready" | "invalid" | "done">("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();
    async function verifyRecovery() {
      try {
        // Compatibility with implicit-flow recovery links. PKCE links use /auth/callback.
        const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
        const access = params.get("access_token");
        const refresh = params.get("refresh_token");
        if (access && refresh) {
          const { error: sessionError } = await supabase.auth.setSession({ access_token: access, refresh_token: refresh });
          window.history.replaceState({}, "", window.location.pathname);
          if (sessionError) throw sessionError;
        }
        const { data, error: userError } = await supabase.auth.getUser();
        if (!mounted) return;
        setStatus(!userError && data.user ? "ready" : "invalid");
      } catch {
        if (mounted) setStatus("invalid");
      }
    }
    void verifyRecovery();
    return () => { mounted = false; };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setError("");
    if (password.length < 8) { setError("Şifren en az 8 karakter olmalı."); return; }
    if (password !== confirm) { setError("Şifreler eşleşmiyor."); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      await supabase.auth.signOut();
      setPassword("");
      setConfirm("");
      setStatus("done");
    } catch {
      setError("Şifre güncellenemedi. Bağlantı süresi dolmuş olabilir. Lütfen yeni bağlantı iste.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="login-page premium-login-page" style={{ minHeight:"100dvh",display:"grid",placeItems:"center",padding:"30px 16px" }}>
    <section className="auth-card premium-auth-card" style={{width:"min(100%,460px)",margin:"0 auto"}}>
      <Link className="brand" href="/" style={{marginBottom:25,display:"inline-flex",alignItems:"center",gap:10,textDecoration:"none"}}>
        <img src="/logo-icon.svg" alt="" width="39" height="39"/> Olympion
      </Link>
      <h1 style={{fontSize:"clamp(26px,6vw,34px)",margin:"0 0 12px"}}>Yeni şifreni belirle.</h1>
      {status==="checking" && <p role="status">Güvenli bağlantın kontrol ediliyor…</p>}
      {status==="invalid" && <><p role="alert">Geçerli bir sıfırlama oturumu bulunamadı. Bağlantı süresi dolmuş olabilir.</p><Link href="/giris?mode=reset" className="btn btn-primary">Yeni bağlantı iste →</Link></>}
      {status==="done" && <><p role="status">Şifren başarıyla güncellendi. Artık yeni şifrenle giriş yapabilirsin.</p><Link href="/giris" className="btn btn-primary">Giriş yap →</Link></>}
      {status==="ready" && <form onSubmit={submit} className="form" style={{display:"grid",gap:15}}>
        <label>Yeni şifre<input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="En az 8 karakter" /></label>
        <label>Yeni şifre (tekrar)<input type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Şifreni tekrar yaz" /></label>
        {error && <p className="next-status-error" role="alert">{error}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy?"Güncelleniyor…":"Şifremi güncelle"}</button>
      </form>}
      <p style={{marginTop:20}}><Link className="forgot-link" href="/giris">← Giriş ekranına dön</Link></p>
    </section>
  </main>;
}
