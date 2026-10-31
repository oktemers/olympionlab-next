"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type VideoKind = "guidance" | "lesson";
type PlayerState = { data: number };
type PlayerHandle = { destroy?: () => void };
type YTWindow = Window & {
  YT?: { Player: new (element: HTMLIFrameElement, config: {
    events: { onStateChange: (event: PlayerState) => void }
  }) => PlayerHandle };
};

export default function TrackedYouTubePlayer({
  videoId, kind, id, initialCompleted = false, returnTo,
}: {
  videoId: string;
  kind: VideoKind;
  id: string;
  initialCompleted?: boolean;
  returnTo: string;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const finished = useRef(initialCompleted);
  const saving = useRef(false);

  useEffect(() => {
    setCompleted(initialCompleted);
    finished.current = initialCompleted;
  }, [initialCompleted, videoId]);

  async function saveCompletion() {
    if (finished.current || saving.current) return;
    saving.current = true;
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/roadmap/progress", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id, returnTo }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.error || "İlerleme kaydedilemedi.");
      finished.current = true;
      setCompleted(true);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Kaydetme başarısız.");
    } finally {
      saving.current = false;
      setPending(false);
    }
  }

  // Use the official YouTube IFrame Player API: completion is recorded when
  // YouTube reports ENDED (0). The manual button remains available.
  useEffect(() => {
    let disposed = false;
    let player: PlayerHandle | undefined;
    const interval = window.setInterval(() => {
      const current = window as YTWindow;
      if (disposed || !frame.current || !current.YT?.Player) return;
      window.clearInterval(interval);
      try {
        player = new current.YT.Player(frame.current, {
          events: {
            onStateChange(event) {
              if (event.data === 0) void saveCompletion();
            }
          }
        });
      } catch {
        // The embedded video is still playable without progress automation.
      }
    }, 250);
    if (!document.querySelector('script[data-olympion-yt-api]')) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      script.dataset.olympionYtApi = "true";
      document.head.appendChild(script);
    }
    return () => { disposed = true; window.clearInterval(interval); player?.destroy?.(); };
  // The player must be recreated only if the selected video changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, id, kind]);

  return <div>
    <div style={{ aspectRatio: "16 / 9", width: "100%", background: "#030d18" }}>
      <iframe
        ref={frame}
        key={videoId}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&rel=0`}
        title="Video dersi"
        width="100%"
        height="100%"
        style={{ display: "block", border: 0, width: "100%", height: "100%" }}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "14px 2px" }}>
      <span style={{ color: completed ? "#9cf1d4" : "#a8c4d4", fontSize: 13 }}>
        {completed ? "✓ Video tamamlandı · %100" : "Video bitince ilerlemen otomatik işaretlenir."}
      </span>
      {!completed && <button type="button" onClick={() => void saveCompletion()} disabled={pending}
        style={{ borderRadius: 12, padding: "11px 15px", background: "#8ceaf3", color: "#071827", border: 0, fontWeight: 850, cursor: "pointer" }}>
        {pending ? "Kaydediliyor…" : "İzledim, tamamla ✓"}
      </button>}
    </div>
    {error && <p role="alert" style={{ color: "#ffc1c1", fontSize: 12 }}>{error}</p>}
  </div>;
}
