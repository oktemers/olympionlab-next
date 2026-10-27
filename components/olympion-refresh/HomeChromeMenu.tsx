"use client";
import { useEffect } from "react";
export function HomeChromeMenu() {
  useEffect(() => {
    const host = document.querySelector(".olympion-shared-header");
    const button = host?.querySelector<HTMLButtonElement>("#menuBtn");
    const menu = host?.querySelector<HTMLElement>("#mobileMenu");
    if (!button || !menu) return;
    const close = () => { menu.classList.remove("open"); button.setAttribute("aria-expanded", "false"); };
    const toggle = () => { button.setAttribute("aria-expanded", String(menu.classList.toggle("open"))); };
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "mobileMenu");
    button.addEventListener("click", toggle);
    menu.addEventListener("click", close);
    const onEscape = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onEscape);
    return () => {
      button.removeEventListener("click", toggle);
      menu.removeEventListener("click", close);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);
  return null;
}
