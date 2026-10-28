"use client";
import { useEffect, useRef, useState } from "react";

export function StudentMenuToggle() {
  const [open, setOpen] = useState(false);
  const barRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    const root = bar?.closest(".app-page");
    const sidebar = root?.querySelector("#student-panel-sidebar");
    if (!bar || !root || !sidebar) return;

    // React pages and legacy HTML pages use the same class-driven drawer.
    // No page-darkening scrim: it used to cover the navigation on mobile.
    root.classList.toggle("student-menu-open", open);

    const onOutside = (event: PointerEvent) => {
      const target = event.target;
      if (open && target instanceof Node && !bar.contains(target) && !sidebar.contains(target)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        bar.querySelector<HTMLButtonElement>(".student-menu-trigger")?.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth > 850) setOpen(false);
    };
    const onSidebarClick = (event: Event) => {
      if ((event.target as Element | null)?.closest("a, button[type='submit']")) setOpen(false);
    };

    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    sidebar.addEventListener("click", onSidebarClick);
    return () => {
      root.classList.remove("student-menu-open");
      document.removeEventListener("pointerdown", onOutside);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      sidebar.removeEventListener("click", onSidebarClick);
    };
  }, [open]);

  return (
    <header ref={barRef} className="student-mobile-bar">
      <button
        type="button"
        className="student-menu-trigger"
        aria-expanded={open}
        aria-controls="student-panel-sidebar"
        aria-label={open ? "Öğrenci menüsünü kapat" : "Öğrenci menüsünü aç"}
        onClick={() => setOpen(previous => !previous)}
      >
        <span></span><span></span>
      </button>
      <a className="student-mobile-title" href="/panel">
        <img src="/logo-icon.svg" alt="" width="31" height="31" />
        <span>Olympion <small>Öğrenci Paneli</small></span>
      </a>
    </header>
  );
}
