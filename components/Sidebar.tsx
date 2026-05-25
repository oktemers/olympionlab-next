import { signOut } from "@/app/auth/actions";

export function Sidebar({ active }: { active?: string }) {
  const items = [
    ["dashboard", "/dashboard", "⌘", "Genel"],
    ["videos", "/videos", "▶", "Videolar"],
    ["onboarding", "/onboarding", "🧭", "Rota"],
    ["coach", "/ai-coach", "✦", "Koç"],
    ["admin", "/admin", "⚙", "Admin"]
  ];

  return (
    <aside className="app-sidebar">
      <a href="/dashboard" className="app-brand">
        <div className="brand-badge">O</div>
        <div>Olympion Lab<small>Öğrenci Paneli</small></div>
      </a>
      <nav className="app-nav" aria-label="Panel menüsü">
        {items.map(([key, href, icon, label]) => (
          <a key={key} href={href} className={`app-link ${active === key ? "active" : ""}`}><span>{icon}</span>{label}</a>
        ))}
        <form action={signOut}>
          <button className="app-link logout-sidebar" type="submit"><span>⏻</span>Çıkış</button>
        </form>
      </nav>
      <div className="sidebar-upgrade">
        <span>Pro</span><strong>Rotanı kilitsiz kullan.</strong>
        <p>Premium dersler, PDF notları ve deney arşivi.</p>
        <a href="/pricing">Planı yükselt →</a>
      </div>
      <a href="/" className="back-site">← Ana siteye dön</a>
    </aside>
  );
}
