// Accept only known local app destinations after authentication.
// Do not allow absolute URLs, protocol-relative paths, or encoded backslashes.
const ALLOWED = new Set([
  "/panel", "/kurslar", "/yol-haritasi", "/student-labs", "/notlar",
  "/gunun-sorusu", "/yapay-zeka-kocu", "/ayarlar", "/baslangic",
  "/rota/adim/1", "/rota/adim/2", "/rota/adim/3", "/rota/adim/4"
]);

export function safeAuthDestination(value: FormDataEntryValue | string | null | undefined): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return "/panel";
  if (/[\\\\\r\n]/.test(value) || value.includes("%") || value.includes("?") || value.includes("#")) return "/panel";
  if (ALLOWED.has(value)) return value;
  if (/^\/courses\/[a-z0-9-]{1,80}$/.test(value)) return value;
  return "/panel";
}
