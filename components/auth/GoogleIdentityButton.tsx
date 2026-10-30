"use client";

import { useCallback, useRef, useState } from "react";
import Script from "next/script";
import { createClient } from "@/lib/supabase/client";

type GoogleCredentialResponse = { credential?: string };
type GoogleIdentityClient = {
  initialize: (options: {
    client_id: string;
    nonce: string;
    callback: (response: GoogleCredentialResponse) => void;
    ux_mode: "popup";
    use_fedcm_for_button: boolean;
    auto_select: boolean;
  }) => void;
  renderButton: (element: HTMLElement, options: {
    type: "standard";
    theme: "outline";
    size: "large";
    shape: "rectangular";
    text: "continue_with";
    logo_alignment: "left";
    width: number;
  }) => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentityClient } };
  }
}

async function createNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const rawNonce = btoa(String.fromCharCode(...bytes));
  const data = new TextEncoder().encode(rawNonce);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const hashedNonce = Array.from(new Uint8Array(hash))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
  return { rawNonce, hashedNonce };
}

export function GoogleIdentityButton({ clientId, next }: { clientId: string; next: string }) {
  const buttonContainer = useRef<HTMLDivElement>(null);
  const initializing = useRef(false);
  const processing = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [helpVisible, setHelpVisible] = useState(false);

  const initialize = useCallback(async () => {
    if (initializing.current || !buttonContainer.current || !window.google?.accounts?.id) return;
    initializing.current = true;
    try {
      const { rawNonce, hashedNonce } = await createNonce();
      const identity = window.google.accounts.id;
      identity.initialize({
        client_id: clientId,
        nonce: hashedNonce,
        ux_mode: "popup",
        use_fedcm_for_button: true,
        auto_select: false,
        callback: async response => {
          if (processing.current) return;
          if (!response.credential) {
            setError("Google doğrulama bilgisi alınamadı. Lütfen tekrar dene.");
            return;
          }
          processing.current = true;
          setBusy(true);
          setError("");
          try {
            const supabase = createClient();
            const { error: signInError } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
              nonce: rawNonce
            });
            if (signInError) throw signInError;
            // A full navigation makes the authenticated Supabase session visible
            // to the server-side Next.js middleware on the next request.
            window.location.assign(next);
          } catch {
            setError("Google oturumu açılamadı. Google ve Supabase yapılandırmasını kontrol et.");
            setBusy(false);
            processing.current = false;
          }
        }
      });
      const container = buttonContainer.current;
      container.replaceChildren();
      identity.renderButton(container, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "rectangular",
        text: "continue_with",
        logo_alignment: "left",
        width: Math.min(400, Math.max(220, container.clientWidth || 320))
      });
    } catch {
      setError("Google giriş bileşeni yüklenemedi. Lütfen e-posta ile giriş yap.");
      initializing.current = false;
    }
  }, [clientId, next]);

  return (
    <div className="olympion-google-sign-in" style={{ display: "grid", justifyItems: "center", gap: 10, minWidth: 0 }}>
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={() => { void initialize(); }}
        onError={() => { setError("Google giriş bileşeni yüklenemedi. E-posta ile giriş yapabilirsin."); }}
      />
      <div
        ref={buttonContainer}
        aria-label="Google hesabıyla oturum aç"
        style={{ width: "100%", minWidth: 0, display: "flex", justifyContent: "center" }}
        onPointerDownCapture={() => setHelpVisible(true)}
      />
      {busy && <p role="status" style={{ fontSize: 12 }}>Google hesabın doğrulanıyor…</p>}
      {error && <p role="alert" className="next-status-error">{error}</p>}
      {helpVisible && !busy && (
        <p style={{ fontSize: 12, lineHeight: 1.6, color: "#b3cadc", margin: "6px 0" }}>
          Google hesap seçimi açılmıyorsa, bulunduğun sayfanın <strong>tam adresinin
          kökünü</strong> Google Cloud → Authorized JavaScript origins listesine ekle.
          Önizleme (`vercel.app`) ile canlı (`olympionlab.com`) adresleri farklıdır.
          Tarayıcının açılır pencere / üçüncü taraf oturum açma engelini de kontrol et.
        </p>
      )}
    </div>
  );
}
