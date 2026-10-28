"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import s from "./marketing.module.css";
import { VIDEOS, type VideoItem } from "./video-data";
import { SiteHeader, SiteFooter } from "./BrandChrome";
export { SiteHeader, SiteFooter } from "./BrandChrome";

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={diagonal ? "M7 17 17 7M8 7h9v9" : "M4 12h16m-7-7 7 7-7 7"}/></svg>;
}
function Shell({ active, children, embedded = false }: { active: string, children: React.ReactNode, embedded?: boolean }) {
  return <div className={s.root}>{!embedded && <SiteHeader active={active}/>}<main className={s.main}>{children}</main>{!embedded && <SiteFooter/>}</div>;
}
function Pill({ children }: { children: React.ReactNode }) {return <span className={s.pill}><span className={s.pillDot}/>{children}</span>}
function SectionTitle({ kicker, title, body }: { kicker: string, title: string, body?: string }) {return <div className={s.sectionIntro}><span className={s.overline}>{kicker}</span><h2>{title}</h2>{body && <p>{body}</p>}</div>}

export function HomePage({ embedded = false }: { embedded?: boolean }) {
  return <Shell active="/" embedded={embedded}><div className={s.container}>
    <section className={s.homeHero}>
      <div className={s.heroCopy}><Pill>Bilim olimpiyatlarına yeni yaklaşım</Pill><h1>Derin düşün.<br/><span className={s.gradientText}>Gerçekten öğren.</span></h1><p>Fizik, matematik ve diğer bilim olimpiyatları için video çözümlerini, konuları ve hazırlık yolunu tek bir yerde keşfet.</p><div className={s.actions}><Link className={s.primaryButton} href="/video-kutuphanesi">Video kütüphanesini keşfet <Arrow/></Link><Link className={s.secondaryButton} href="/branslar">Branşları incele <Arrow/></Link></div><div className={s.heroMiniLine}><span>01 / Keşfet</span><span>02 / Anla</span><span>03 / Çöz</span></div></div>
      <div className={s.heroVisual} aria-label="Öğrenme yol haritası örneği"><div className={s.visualTop}><span className={s.visualDot}/><span>ÖĞRENME ROTASI</span><span>OL / 2026</span></div><div className={s.visualStage}><span className={s.visualStep}>01</span><div><small>Başlangıç</small><strong>Temel kavramlar</strong><p>Önce sağlam bir anlayış oluştur.</p></div><span className={s.visualCheck}>✓</span></div><div className={`${s.visualStage} ${s.visualStageActive}`}><span className={s.visualStep}>02</span><div><small>Odak</small><strong>Olimpiyat soruları</strong><p>Yaklaşımı adım adım öğren.</p></div><span className={s.visualLive}>Aktif</span></div><div className={s.visualStage}><span className={s.visualStep}>03</span><div><small>İleri seviye</small><strong>Analitik düşünme</strong><p>Bilgini yeni problemlere aktar.</p></div><span className={s.visualLock}>↗</span></div><div className={s.visualBottom}>Φ(x) <span>Her soruda bir adım ileri</span><span>↗</span></div></div>
    </section>
    <section className={s.homeFeatures}><SectionTitle kicker="PLATFORMU KEŞFET" title="Az karmaşa. Daha fazla odak." body="İhtiyacın olan yere hızlıca ulaş; konu, çözüm ve kaynaklar bir arada."/><div className={s.featureGrid}><Link href="/video-kutuphanesi" className={s.featureCard}><span className={s.featureIcon}>▶</span><strong>Video kütüphanesi</strong><p>Ücretsiz içerikler ve Plus çözüm arşivi.</p><span className={s.featureLink}>İçeriklere git <Arrow/></span></Link><Link href="/branslar" className={s.featureCard}><span className={s.featureIcon}>∑</span><strong>Branşları keşfet</strong><p>Bilim alanlarına göre öğrenme rotaları.</p><span className={s.featureLink}>Branşları gör <Arrow/></span></Link><Link href="/fiyatlandirma" className={s.featureCard}><span className={s.featureIcon}>✦</span><strong>Planını belirle</strong><p>Free ile başla, ihtiyaç duydukça genişlet.</p><span className={s.featureLink}>Planları karşılaştır <Arrow/></span></Link></div></section>
    <section className={s.slimCTA}><div><span className={s.overline}>HAZIRSAN BAŞLAYALIM</span><h2>Bir sonraki soruyu daha iyi çöz.</h2></div><Link className={s.primaryButton} href="/video-kutuphanesi">Kütüphaneye gir <Arrow/></Link></section>
  </div></Shell>
}

const FILTERS = ["Tümü", "Fizik", "Matematik", "Kimya", "Biyoloji", "Rehberlik", "Proje"] as const;
type Filter = typeof FILTERS[number];
type Access = "Tümü" | "Ücretsiz" | "Plus";
function Thumb({ v, large = false }: { v: VideoItem, large?: boolean }) {
 const image = v.premium ? "" : `https://i.ytimg.com/vi/${encodeURIComponent(v.id)}/hqdefault.jpg`;
 return <div className={`${s.thumb} ${large ? s.thumbLarge : ""}`} style={{backgroundImage: v.premium ? "linear-gradient(145deg,#263d63,#0c1c34)" : `linear-gradient(180deg, rgba(4,12,25,.12),rgba(4,12,25,.75)), url("${image}")`}}>
  {v.premium ? <><span className={s.thumbBlur}/><span className={s.thumbPremium}>✦ PLUS</span><span className={s.thumbLock}>✦</span></> : <span className={s.playBubble}>▶</span>}
  <span className={s.thumbDuration}>{v.premium ? "YAKINDA" : v.duration}</span>
 </div>
}
function VideoCard({ v }: { v: VideoItem }) {
 const content = <><Thumb v={v}/><div className={s.videoBody}><div className={s.videoMeta}><span>{v.branch === "proje" ? "PROJE GELİŞTİRME" : v.branch === "rehberlik" ? "HAZIRLIK & REHBERLİK" : `${v.branch.toLocaleUpperCase("tr-TR")} OLİMPİYATI`}</span><span>{v.premium ? "Plus · Planlandı" : "Ücretsiz · Yayında"}</span></div><h3>{v.title}</h3><div className={s.videoFooter}><span>{v.premium ? "Yakında yayında" : "YouTube'da izle"}</span><Arrow diagonal/></div></div></>;
 return v.premium ? <article className={`${s.videoCard} ${s.plannedCard}`} aria-label={`${v.title}, henüz çekilmemiş Plus video fikri`}>{content}</article> : <a className={s.videoCard} href={`https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}`} rel="noopener noreferrer" target="_blank" aria-label={`${v.title}, YouTube'da aç`}>{content}</a>;
}
export function VideoLibraryPage({ embedded = false }: { embedded?: boolean }) {
 const [filter, setFilter] = useState<Filter>("Tümü");
 const [access, setAccess] = useState<Access>("Tümü");
 const [query, setQuery] = useState("");
 const [visibleCount, setVisibleCount] = useState(9);
 const normalized = query.toLocaleLowerCase("tr-TR").trim();
 const found = useMemo(() => VIDEOS.filter(v => (filter === "Tümü" || v.branch === filter.toLocaleLowerCase("tr-TR")) && (access === "Tümü" || (access === "Plus" ? v.premium : !v.premium)) && (!normalized || v.title.toLocaleLowerCase("tr-TR").includes(normalized))),[filter,access,normalized]);
 const featured = VIDEOS.find(v => !v.premium) ?? VIDEOS[0];
 const list = (filter === "Tümü" && access === "Tümü" && !query.trim()) ? found.filter(v=>v.id !== featured.id) : found;
 const shown = list.slice(0, visibleCount);
 return <Shell active="/video-kutuphanesi" embedded={embedded}><div className={s.container}>
  <section className={s.pageHero}><div><Pill>VIDEO KÜTÜPHANESİ</Pill><h1>İzlemenin ötesinde.<span className={s.gradientText}>Anlayarak ilerle.</span></h1><p>Bilim olimpiyatlarına hazırlık, adım adım çözümler ve proje rehberleri. Bir sonraki konuna buradan başla. Plus bölümündeki henüz çekilmemiş içerikleri de önceden keşfet.</p></div><div className={s.heroSideNote}><span>OL / ARŞİV</span><strong>100+</strong><small>Planlanan konu ve video başlığı</small><span className={s.sideSmall}>{VIDEOS.filter(v => !v.premium).length} ücretsiz video yayında · Plus başlıkları hazırlıkta</span></div><div className={s.mobileCount}><span>✦ 100+ planlanan konu</span><span>▶ {VIDEOS.filter(v=>!v.premium).length} ücretsiz video yayında</span></div></section>
  {featured && <section className={s.featuredArea}><div className={s.featuredTop}><span className={s.overline}>ÖNE ÇIKAN</span><span>Başlamak için bir öneri</span></div><div className={s.featuredVideo}><a href={`https://www.youtube.com/watch?v=${featured.id}`} rel="noopener noreferrer" target="_blank" aria-label="Öne çıkan videoyu YouTube'da aç"><Thumb v={featured} large/></a><div className={s.featuredText}><span className={s.categoryTag}>ÜCRETSİZ İÇERİK</span><h2>{featured.title}</h2><p>Olimpiyat hazırlığında ve bilimsel çalışmalarda sağlam bir başlangıç. Videoyu doğrudan YouTube'da izleyebilirsin.</p><a href={`https://www.youtube.com/watch?v=${featured.id}`} className={s.primaryButton} rel="noopener noreferrer" target="_blank">Hemen izle <Arrow diagonal/></a></div></div></section>}
  <section className={s.librarySection}><div className={s.libraryHeading}><SectionTitle kicker="YAYINDA & PLANLANAN" title="Arşivi keşfet" body="Ücretsiz videolar yayında. Plus başlıkları ise gelecekte üretilecek içerik planıdır; henüz izlenemez."/><div className={s.searchBox}><span aria-hidden="true">⌕</span><input value={query} onChange={e=>{setQuery(e.target.value);setVisibleCount(9);}} placeholder="Video veya konu ara..." aria-label="Video ara"/></div></div><div className={s.filterRow}><div className={s.chipGroup}>{FILTERS.map(f=><button type="button" key={f} className={`${s.chip} ${filter===f ? s.chipSelected : ""}`} onClick={()=>{setFilter(f);setVisibleCount(9)}}>{f}</button>)}</div><div className={s.chipGroup}>{(["Tümü","Ücretsiz","Plus"] as Access[]).map(f=><button type="button" key={f} className={`${s.chip} ${access===f ? s.chipSelected : ""}`} onClick={()=>{setAccess(f);setVisibleCount(9)}}>{f === "Plus" ? "✦ Plus" : f}</button>)}</div></div>
  {shown.length ? <div className={s.videoGrid}>{shown.map((v,i)=><VideoCard key={`${v.title}-${i}`} v={v}/>)}</div> : <div className={s.emptyState}><strong>Bu filtrede video bulunamadı.</strong><p>Başka bir branş veya arama terimi deneyebilirsin.</p><button className={s.secondaryButton} type="button" onClick={()=>{setFilter("Tümü");setAccess("Tümü");setQuery("")}}>Filtreleri temizle</button></div>}
  {list.length > visibleCount && <div className={s.moreWrapper}><button type="button" className={s.secondaryButton} onClick={()=>setVisibleCount(n=>n+9)}>9 başlık daha göster ({Math.min(list.length-visibleCount,9)} / {list.length-visibleCount} kaldı) <Arrow/></button></div>}
  </section><section className={s.slimCTA}><div><span className={s.overline}>BİR ADIM İLERİ</span><h2>Plus arşiviyle çalışmanı derinleştir.</h2><p>Plus başlıkları içerik yol haritasıdır. Bu videolar henüz kaydedilmedi; yayınlandıklarında erişime açılacaktır.</p></div><Link className={s.primaryButton} href="/fiyatlandirma">Planları gör <Arrow/></Link></section>
 </div></Shell>
}

const PLANS = [
 {key:"free", name:"Free", amount:"0", tag:"Başlangıç", description:"Platformu keşfet ve ücretsiz içeriklerden yararlan.", features:["Seçili ücretsiz videolar", "Açık kaynak içerik önizlemeleri", "Branşları keşfet"], href:"/giris?mode=register&plan=free", action:"Ücretsiz başla"},
 {key:"plus", name:"Plus", amount:"349", tag:"Düzenli hazırlık", description:"Daha kapsamlı video ve çözüm arşiviyle ilerle.", features:["1 günlük deneme seçeneği", "Free planındaki tüm içerikler", "Plus video çözüm arşivi", "PDF notları ve çalışma kaynakları", "Konu odaklı hazırlık"], href:"/odeme?plan=plus&trial=1", action:"Plus'ı incele"},
 {key:"pro", name:"Pro", amount:"649", tag:"Derinlemesine", description:"Tüm platform modüllerini tek planda keşfet.", features:["1 günlük deneme seçeneği", "Plus planındaki tüm içerikler", "AI Koç modülü*", "Laboratuvar modülleri*", "Genişletilmiş platform erişimi*"], href:"/odeme?plan=pro&trial=1", action:"Pro'yu incele"}
] as const;
export function PricingPage({ embedded = false }: { embedded?: boolean }) {
 const [selected, setSelected] = useState<(typeof PLANS)[number]["key"]>("plus");
 const mobilePlan = PLANS.find(p => p.key === selected) ?? PLANS[1];
 return <Shell active="/fiyatlandirma" embedded={embedded}><div className={s.container}><section className={s.centerHero}><Pill>FİYATLANDIRMA</Pill><h1>Hedefine uygun<br/><span className={s.gradientText}>planı seç.</span></h1><p>İhtiyacın kadar özellik, anlaşılır planlar. Free ile başla; Plus ve Pro planlarında 1 günlük deneme seçeneğini incele.</p></section>
 <section className={s.pricingGrid}>{PLANS.map(plan=><article key={plan.key} className={`${s.priceCard} ${plan.key==='plus' ? s.priceFeatured : ''}`}>
 <div className={s.priceTop}><div><span className={s.planEyebrow}>{plan.tag}</span><h2>{plan.name}</h2></div>{plan.key==='plus' && <span className={s.popularBadge}>ÖNE ÇIKAN</span>}</div><p className={s.priceDescription}>{plan.description}</p><div className={s.amount}>₺{plan.amount}<span>/ ay</span></div><Link href={plan.href} className={plan.key==='plus' ? s.primaryButton : s.priceButton}>{plan.action}<Arrow/></Link><div className={s.featureDivider}/><span className={s.featureCaption}>PLANIN İÇERDİKLERİ</span><ul className={s.featureList}>{plan.features.map(f=><li key={f}><span>✓</span>{f}</li>)}</ul>
 </article>)}</section>
 <section className={s.mobilePricing} aria-label="Mobil plan karşılaştırma">
  <div className={s.mobilePlanSelector} role="group" aria-label="Plan seçimi">{PLANS.map(p => <button type="button" key={p.key} aria-pressed={selected === p.key} className={`${s.mobilePlanTab} ${selected === p.key ? s.mobilePlanSelected : ""}`} onClick={() => setSelected(p.key)}>{p.name}</button>)}</div>
  <article className={s.mobilePlanPanel} key={mobilePlan.key}>
   <div className={s.mobilePlanHeader}><div><small>{mobilePlan.tag}</small><h2>{mobilePlan.name}</h2></div><div className={s.mobilePlanPrice}>₺{mobilePlan.amount}<span>/ay</span></div></div>
   <p className={s.mobilePlanDescription}>{mobilePlan.description}</p>
   <div className={s.mobileFeatureTitle}>PLAN ÖZELLİKLERİ</div>
   <ul className={s.mobileFeatureList}>{mobilePlan.features.map(f => <li key={f}><span>{f}</span><strong aria-label="Dahil">✓</strong></li>)}</ul>
   <Link href={mobilePlan.href} className={s.mobilePlanButton}>{mobilePlan.action}<Arrow /></Link>
   <p className={s.mobilePayNote}>{selected === "free" ? "Ücretsiz içerikler için kayıt ekranına geçersin." : "Planını inceleyip hesap oluşturma adımına geçebilirsin."}</p>
  </article>
 </section>
 </div></Shell>
}

export function CheckoutPage({ plan = "plus", embedded = false }: { plan?: string, trial?: boolean, embedded?: boolean }) {
 const [selectedKey, setSelectedKey] = useState<"free" | "plus" | "pro">(
   plan === "free" ? "free" : plan === "pro" ? "pro" : "plus"
 );
 const chosen = PLANS.find(item => item.key === selectedKey) ?? PLANS[1];
 const isFree = selectedKey === "free";
 const accessPath = isFree ? "/giris?mode=register&plan=free" : "/giris?mode=register&plan=" + selectedKey + "&trial=1";
 return <Shell active="/fiyatlandirma" embedded={embedded}>
   <div className={s.checkoutV7}>
     <div className={s.checkoutV7Glow} aria-hidden="true"/>
     <div className={s.checkoutV7Inner}>
       <section className={s.checkoutV7Hero}>
         <div className={s.checkoutV7Eyebrow}><span className={s.checkoutV7Dot}/> OLYMPION ÜYELİK PLANLARI</div>
         <h1>Bir sonraki adımın <span>buradan başlıyor.</span></h1>
         <p>Olimpiyat hazırlığını kendi ritmine göre şekillendir. İhtiyacın olan planı seç, içerikleri ve avantajlarını keşfet.</p>
         <div className={s.checkoutV7Artwork} aria-label="Olympion öğrenme yolculuğu görselleştirmesi">
           <svg viewBox="0 0 580 280" role="img" aria-label="Başlangıçtan hedefe uzanan bilimsel öğrenme rotası">
             <defs><linearGradient id="cv7" x1="0" y1="1" x2="1" y2="0"><stop stopColor="#76eaf4"/><stop offset="1" stopColor="#8eafff"/></linearGradient><radialGradient id="cv7glow"><stop stopColor="#76eaf4" stopOpacity=".18"/><stop offset="1" stopColor="#76eaf4" stopOpacity="0"/></radialGradient></defs>
             <ellipse cx="290" cy="140" rx="240" ry="135" fill="url(#cv7glow)"/>
             <g stroke="#5386a1" strokeOpacity=".17" fill="none">{Array.from({length:11},(_,i)=><path key={i} d={"M"+(40+i*49)+" 0V280"}/>)}{Array.from({length:6},(_,i)=><path key={i} d={"M0 "+(25+i*45)+"H580"}/>)}</g>
             <path d="M55 202C135 228 163 92 246 144S355 216 430 105 506 69 535 52" stroke="url(#cv7)" strokeWidth="4" strokeLinecap="round" strokeDasharray="11 10" fill="none"/>
             <g stroke="#81e7ff" strokeWidth="2" fill="#092337"><circle cx="55" cy="202" r="15"/><circle cx="246" cy="144" r="17"/><circle cx="430" cy="105" r="19"/><circle cx="535" cy="52" r="16"/></g>
             <g fill="#c3faff"><circle cx="55" cy="202" r="5"/><circle cx="246" cy="144" r="6"/><circle cx="430" cy="105" r="7"/><circle cx="535" cy="52" r="5"/></g>
             <g stroke="#79b3db" strokeOpacity=".5" fill="none"><ellipse cx="371" cy="130" rx="82" ry="38" transform="rotate(-24 371 130)"/><ellipse cx="371" cy="130" rx="80" ry="38" transform="rotate(37 371 130)"/></g>
             <g fill="#9cbfd5" fontSize="12" fontWeight="700"><text x="28" y="237">BAŞLANGIÇ</text><text x="202" y="183">ÖĞRENME</text><text x="408" y="147">PRATİK</text><text x="502" y="27">HEDEF</text></g>
             <g fill="#8cddf3" fillOpacity=".6"><text x="90" y="58" fontSize="27">F = ma</text><text x="475" y="227" fontSize="25">∑</text><text x="264" y="53" fontSize="29">λ</text></g>
           </svg>
           <div className={s.checkoutV7ArtworkCaption}><span>01 · KEŞFET</span><span>02 · ÖĞREN</span><span>03 · GELİŞ</span></div>
         </div>
         <div className={s.checkoutV7Links}><Link href="/video-kutuphanesi">Video kütüphanesini keşfet <Arrow/></Link><Link href="/mentorluk-basvurusu">Mentörlük hakkında bilgi al <Arrow/></Link></div>
       </section>
       <section className={s.checkoutV7Panel} aria-label="Üyelik planı seçimi">
         <div className={s.checkoutV7PanelTop}><div><span>ÜYELİK PLANIN</span><h2>Sana uygun olanı seç.</h2></div><span className={s.checkoutV7MiniMark}>✦ OLYMPION</span></div>
         <div className={s.checkoutV7Tabs} role="group" aria-label="Planlar">{PLANS.map(p=><button type="button" key={p.key} aria-pressed={selectedKey===p.key} onClick={()=>setSelectedKey(p.key)} className={[s.checkoutV7Tab,selectedKey===p.key?s.checkoutV7TabActive:""].join(" ")}>{p.name}</button>)}</div>
         <div key={selectedKey} className={s.checkoutV7Content}>
           <div className={s.checkoutV7PlanHead}><div><span>{chosen.tag}</span><h3>{chosen.name}</h3></div><div className={s.checkoutV7Price}>₺{chosen.amount}<small>/ay</small></div></div>
           <p className={s.checkoutV7Description}>{chosen.description}</p>
           {!isFree && <div className={s.checkoutV7Trial}><span>✧</span><div><strong>1 günlük deneme seçeneği</strong><small>Planını keşfetmek için kısa bir başlangıç.</small></div></div>}
           <div className={s.checkoutV7FeaturesTitle}>PLAN ÖZELLİKLERİ <span>{chosen.features.length} özellik</span></div>
           <ul className={s.checkoutV7Features}>{chosen.features.map(f=><li key={f}><span aria-hidden="true">✓</span>{f}</li>)}</ul>
         </div>
         <Link href={accessPath} className={s.checkoutV7Action}>{isFree?"Ücretsiz hesap oluştur":"Hesap oluşturarak devam et"}<Arrow/></Link>
         <p className={s.checkoutV7ActionNote}>Bu adımda hesap oluşturma ekranına yönlendirilirsin. Kart bilgisi istenmez.</p>
       </section>
     </div>
     <div className={s.checkoutV7Bottom}><span>✦ Düşün. Deneyimle. İlerle.</span><Link href="/fiyatlandirma">Planları karşılaştır <Arrow/></Link></div>
   </div>
 </Shell>;
}
