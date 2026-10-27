"use client";

import Link from "next/link";
import { useState } from "react";
import x from "./brand-chrome.module.css";

/** Single shared header/footer for the Olympion refresh pages. */
const NAV = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/video-kutuphanesi", label: "Video Kütüphanesi" },
  { href: "/branslar", label: "Branşlar" },
  { href: "/laboratuvarlar", label: "Olympion Labs" },
  { href: "/fiyatlandirma", label: "Fiyatlandırma" },
  { href: "/sikca-sorulan-sorular", label: "SSS" },
  { href: "/hakkimizda", label: "Hakkımızda" },
];

function Symbol({ size = 36 }: { size?: number }) {
  return <span className={x.symbol} style={{ width: size, height: size }} aria-hidden="true">
    <svg viewBox="0 0 42 42" width="77%" height="77%" fill="none" aria-hidden="true">
      <circle cx="21" cy="21" r="16" stroke="white" strokeOpacity=".48" strokeWidth="1.5" strokeDasharray="6 3" />
      <path d="M7.5 22C14.9 10.9 28.2 10.2 35 20.5C28.1 30.8 15.4 31.1 7.5 22Z" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" />
      <circle cx="21" cy="21" r="5.8" fill="#d5fbff" />
      <circle cx="22" cy="20" r="2.4" fill="#116b8b" />
      <path d="M13 11.5 17 8M29 31l-3 3" stroke="#fff" strokeLinecap="round" strokeWidth="2" />
    </svg>
  </span>;
}
function Arrow() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M4 12h16m-7-7 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
function InstagramIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true" width="19" height="19" fill="none" stroke="currentColor" strokeWidth="1.9"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.7" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>; }
function YoutubeIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true" width="21" height="21" fill="none" stroke="currentColor" strokeWidth="1.7"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor" stroke="none" /></svg>; }

function Brand({ footer = false }: { footer?: boolean }) {
  return <Link href="/" className={`${x.brand} ${footer ? x.footerBrand : ""}`} aria-label="Olympion ana sayfa">
    <Symbol size={footer ? 37 : 40}/>
    <span className={x.brandText}><strong>Olympion</strong><small>{footer ? "Premium Olimpiyat Öğrenme Platformu" : "Olimpiyat Öğrenme Platformu"}</small></span>
  </Link>;
}

export function SiteHeader({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  return <header className={x.header}>
    <div className={x.headerInner}>
      <Brand />
      <nav className={x.nav} aria-label="Ana menü">
        {NAV.map(n => <Link key={n.href} href={n.href} aria-current={active === n.href ? "page" : undefined} className={`${x.navItem} ${active === n.href ? x.navActive : ""}`}>{n.label}</Link>)}
      </nav>
      <div className={x.actions}>
        <Link className={x.login} href="/giris">Giriş Yap <Arrow /></Link>
        <button type="button" className={x.menuToggle} aria-expanded={open} aria-controls="olympion-mobile-nav" aria-label={open ? "Menüyü kapat" : "Menüyü aç"} onClick={() => setOpen(v=>!v)}><span/><span/><span/></button>
      </div>
    </div>
    {open && <nav id="olympion-mobile-nav" className={x.mobileMenu} aria-label="Mobil menü">
      {NAV.map(n => <Link key={n.href} href={n.href} onClick={()=>setOpen(false)} aria-current={active === n.href ? "page" : undefined} className={active === n.href ? x.mobileActive : ""}>{n.label}<Arrow /></Link>)}
      <Link href="/giris" onClick={()=>setOpen(false)}>Giriş Yap <Arrow /></Link>
    </nav>}
  </header>;
}

const footerGroups = [
  { title: "Platform", items: [
    {label:"Video Kütüphanesi",href:"/video-kutuphanesi"},
    {label:"Branşlar",href:"/branslar"},
    {label:"Olympion Labs",href:"/laboratuvarlar"},
    {label:"Fiyatlandırma",href:"/fiyatlandirma"},
  ]},
  { title: "Kurumsal", items: [
    {label:"Hakkımızda",href:"/hakkimizda"},
    {label:"Biz Kimiz?",href:"/biz-kimiz"},
    {label:"Yönetim Kurulu",href:"/yonetim-kurulu"},
    {label:"Organizasyon Şeması",href:"/organizasyon-semasi"},
  ]},
  { title: "Destek", items: [
    {label:"SSS",href:"/sikca-sorulan-sorular"},
    {label:"İletişim",href:"mailto:oktemerozannnn@gmail.com"},
    {label:"Mentörlük Başvurusu",href:"/mentorluk-basvurusu"},
    {label:"Giriş Yap",href:"/giris"},
  ]},
];

function Social({ url, name, children }: { url?: string, name: string, children: React.ReactNode }) {
  if (!url) return <span className={`${x.social} ${x.socialInactive}`} title={`${name} bağlantısı ayarlanmadı`} aria-label={`${name} bağlantısı henüz ayarlanmadı`}>{children}</span>;
  return <a className={x.social} href={url} target="_blank" rel="noopener noreferrer" aria-label={name}>{children}</a>;
}

export function SiteFooter() {
  const instagram = process.env.NEXT_PUBLIC_OLYMPION_INSTAGRAM_URL;
  const youtube = process.env.NEXT_PUBLIC_OLYMPION_YOUTUBE_URL;
  return <footer className={x.footer}>
    <div className={x.footerInner}>
      <div className={x.footerGrid}>
        <div className={x.footerAbout}>
          <Brand footer />
          <p>Olympion; olimpiyat öğrencileri için video, çalışma rotası, PDF notları, günlük problem ve deneysel öğrenme araçlarını tek çatı altında birleştiren premium öğrenme platformudur.</p>
          <div className={x.socials}>
            <Social name="Instagram" url={instagram}><InstagramIcon/></Social>
            <Social name="YouTube" url={youtube}><YoutubeIcon/></Social>
          </div>
        </div>
        {footerGroups.map(group => <div className={x.footerCol} key={group.title}><h3>{group.title}</h3>{group.items.map(item=><Link href={item.href} key={item.href}>{item.label}</Link>)}</div>)}
      </div>
      <div className={x.footerPayments}>
        <div className={x.legal}><Link href="/kullanim-sartlari">Kullanım Şartları</Link><Link href="/gizlilik-politikasi">Gizlilik Politikası</Link><Link href="/kvkk">KVKK</Link><Link href="/site-haritasi">Site Haritası</Link></div>
        <div className={x.paymentLogos} aria-label="Planlanan ödeme yöntemleri (ödeme altyapısı henüz aktif değil)">
          <span className={`${x.payLogo} ${x.visa}`}>VISA</span>
          <span className={`${x.payLogo} ${x.mastercard}`} aria-label="Mastercard"><i/><i/></span>
          <span className={`${x.payLogo} ${x.troy}`}>troy</span>
          <span className={`${x.payLogo} ${x.secure}`}>3D SECURE</span>
          <span className={`${x.payLogo} ${x.iyzico}`}>iyzico</span>
        </div>
        <span className={x.payCaption}>Ödeme altyapısı henüz aktif değildir.</span>
      </div>
      <div className={x.bottom}><span>© {new Date().getFullYear()} Olympion. Tüm hakları saklıdır.</span><span>Premium olimpiyat öğrenme deneyimi</span></div>
    </div>
  </footer>;
}
