import { signOut } from "@/app/auth/actions";
import { StudentMenuToggle } from "./StudentMenuToggle";
const items = [
 ["dashboard","/panel","⌘","Genel"],["courses","/kurslar","▶","Dersler"],
 ["roadmap","/yol-haritasi","◇","Yol Haritası"],["notes","/notlar","▤","PDF Notları"],
 ["problem","/gunun-sorusu","✦","Günün Problemi"],["coach","/yapay-zeka-kocu","✧","AI Koç"],
 ["labs","/student-labs","◈","Labs"],["settings","/ayarlar","⚙","Ayarlar"]
];
export function Sidebar({active}: {active?:string}){
 return <><StudentMenuToggle/><aside className="app-sidebar student-unified-sidebar" id="student-panel-sidebar">
  <a href="/panel" className="app-brand"><img src="/logo-icon.svg" alt="" width="42" height="42"/><div>Olympion<small>Öğrenci Paneli</small></div></a>
  <span className="student-menu-caption">ÇALIŞMA ALANIN</span>
  <nav className="app-nav" aria-label="Öğrenci menüsü">{items.map(([key,href,icon,label])=><a href={href} key={key} aria-current={active===key?"page":undefined} className={`app-link ${active===key?"active":""}`}><span aria-hidden="true">{icon}</span>{label}</a>)}</nav>
  <div className="student-menu-bottom"><a className="student-plan-link" href="/fiyatlandirma">✦ Planları keşfet <span>↗</span></a><a href="/" className="back-site">← Ana sayfaya dön</a><form action={signOut}><button type="submit" className="student-signout">⏻ Çıkış Yap</button></form></div>
 </aside></>;
}
