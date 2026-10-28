import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import styles from "./step.module.css";

export const metadata = { title: "Olimpiyat Yol Haritası | Olympion", description: "Hedef belirle, dersleri keşfet, problem çöz ve ilerlemeni takip et." };

const steps = [
 {number:1,label:"Hedefini belirle"},
 {number:2,label:"Konuyu öğren"},
 {number:3,label:"Soru çöz"},
 {number:4,label:"Gelişimini ölç"}
];
const branchLabels:Record<string,string>={physics:"Fizik",chemistry:"Kimya",math:"Matematik",biology:"Biyoloji"};
const levelLabels:Record<string,string>={beginner:"Başlangıç",intermediate:"Orta",advanced:"İleri"};
type LearningModule={id:string;title:string;type:string;href:string|null;estimated_minutes:number|null};
type Progress={module_id:string;status:string;progress_percent:number|null};

function ModuleList({items,emptyText,defaultHref}:{items:LearningModule[],emptyText:string,defaultHref:string}) {
 if(items.length===0)return <div className={styles.empty}><p>{emptyText}</p><a href={defaultHref}>İlgili içeriklere git ↗</a></div>;
 return <div className={styles.moduleList}>{items.slice(0,4).map((m,i)=><a key={m.id} href={m.href?.startsWith("/")&&!m.href.startsWith("//")?m.href:defaultHref} className={styles.module}>
  <span className={styles.moduleIcon}>{String(i+1).padStart(2,"0")}</span><div><strong>{m.title}</strong><small>{m.estimated_minutes ? m.estimated_minutes+" dk · " : ""}{m.type==="pdf_note"?"PDF Notu":m.type==="video"?"Video Ders":m.type==="question_set"?"Soru Seti":"Olimpiyat Çalışması"}</small></div><span className={styles.moduleArrow}>↗</span>
 </a>)}</div>;
}

export default async function RoadmapStepPage({params,searchParams}:{params:Promise<{step:string}>,searchParams:Promise<{saved?:string,error?:string}>}) {
 const {step}=await params;
 if(!["1","2","3","4"].includes(step))notFound();
 const index=Number(step);
 const query=await searchParams;
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/giris");
 const {data:profile}=await supabase.from("profiles").select("branch,level,goal,full_name").eq("id",user.id).maybeSingle();
 const branch=typeof profile?.branch==="string"?profile.branch:"";
 const level=typeof profile?.level==="string"?profile.level:"";
 const goal=typeof profile?.goal==="string"?profile.goal:"";
 let modules:LearningModule[]=[];
 let progress:Progress[]=[];
 if(index>1){
  const [{data:moduleRows},{data:progressRows}]=await Promise.all([
   supabase.from("learning_modules").select("id,title,type,href,estimated_minutes").eq("is_active",true).or(branch&&branchLabels[branch]?"branch.eq.all,branch.eq."+branch:"branch.eq.all").order("order_index",{ascending:true}).limit(80),
   supabase.from("user_module_progress").select("module_id,status,progress_percent").eq("user_id",user.id)
  ]);
  modules=(moduleRows||[]) as LearningModule[];
  progress=(progressRows||[]) as Progress[];
 }
 const doneSet=new Set(progress.filter(p=>p.status==="completed"||Number(p.progress_percent||0)>=100).map(p=>p.module_id));
 const completed=modules.filter(m=>doneSet.has(m.id)).length;
 const progressPercent=modules.length>0?Math.round(completed/modules.length*100):0;
 const videos=modules.filter(m=>m.type==="video"||m.type==="guidance"||m.type==="pdf_note");
 const problems=modules.filter(m=>["question_set","practice","exam"].includes(m.type));
 return <><link rel="stylesheet" href="/style.css"/><div className="app-page"><div className="app-shell"><Sidebar active="roadmap"/>
  <main className="app-main"><div className={styles.page}>
   <div className={styles.back}><a href="/yol-haritasi">← Yol haritasına dön</a><span>ADIM {String(index).padStart(2,"0")} / 04</span></div>
   <section className={styles.hero}>
    <div className={styles.heading}><div className={styles.eyebrow}>OLYMPION HAZIRLIK ROTASI</div>
     <h1>{index===1?"Hedefin belli olsun.":index===2?"Konuyu gerçekten öğren.":index===3?"Sorularla güçlen.":"İlerlemeni gör, devam et."}</h1>
     <p>{index===1?"Bilim olimpiyatlarında ilerlemek için önce hangi branşa ve seviyeye odaklanacağını belirle.":index===2?"Rotana uygun video ve notlara ulaş. İzlediklerini kısa notlarla pekiştir.":index===3?"Problem çözme pratiği yap; yanlışlarını incele ve farklı çözüm yolları dene.":"Tamamlanan çalışmaları incele, eksiklerini belirle ve bir sonraki haftanı planla."}</p>
    </div><div className={styles.orbit} aria-hidden="true"><span>{String(index).padStart(2,"0")}</span><i/><i/></div>
   </section>
   <nav className={styles.steps} aria-label="Rota adımları">{steps.map(s=><a href={"/rota/adim/"+s.number} key={s.number} aria-current={s.number===index?"step":undefined} className={s.number===index?styles.active:""}><b>{String(s.number).padStart(2,"0")}</b><span>{s.label}</span></a>)}</nav>
   {query.saved==="1"&&<p className={styles.success} role="status">Hedef ve seviye bilgilerin kaydedildi. Şimdi dersleri keşfedebilirsin.</p>}
   {index===1&&<section className={styles.panel}><div className={styles.sectionHeading}><span>01 / PROFİLİN</span><h2>Hazırlık planını kişiselleştir.</h2><p>Seçimlerin öğrenci profilinde ve çalışma rotanda saklanır. Daha sonra değiştirebilirsin.</p></div>
    {query.error&&<p className={styles.error} role="alert">{query.error.slice(0,180)}</p>}
    <form action="/dashboard/setup" method="POST" className={styles.form}><input type="hidden" name="next" value="/rota/adim/2"/>
      <label>Olimpiyat branşı<select name="branch" defaultValue={branchLabels[branch]?branch:"physics"} required><option value="physics">Fizik</option><option value="math">Matematik</option><option value="chemistry">Kimya</option><option value="biology">Biyoloji</option></select></label>
      <label>Hazırlık seviyen<select name="level" defaultValue={levelLabels[level]?level:"beginner"} required><option value="beginner">Yeni başlıyorum</option><option value="intermediate">Temel konuları biliyorum</option><option value="advanced">İleri düzey hazırlık</option></select></label>
      <label className={styles.full}>Hedefin<input name="goal" type="text" maxLength={160} required defaultValue={goal||"TÜBİTAK 1. aşamaya hazırlanmak"} placeholder="Ör. TÜBİTAK Fizik 1. aşamasına hazırlanmak"/></label>
      <button type="submit">Kaydet ve derslere geç <span>→</span></button>
    </form>
   </section>}
   {index===2&&<section className={styles.panel}><div className={styles.sectionHeading}><span>02 / ÖĞREN</span><h2>{branchLabels[branch]?branchLabels[branch]+" derslerin":"Olimpiyat derslerin"}</h2><p>{branchLabels[branch]?"Seçtiğin "+branchLabels[branch]+" branşına göre önerilen ilk kaynaklar:":"Henüz branş belirlemediysen ilk adımdan hedefini seç."}</p></div>
    <ModuleList items={videos} emptyText="Bu branş için henüz yayınlanan rota modülü bulunmuyor. Tüm dersleri inceleyebilirsin." defaultHref="/kurslar"/>
    <div className={styles.ctas}><a className={styles.primary} href="/kurslar">Tüm video dersleri aç →</a><a href="/notlar">PDF notlarını incele ↗</a></div>
   </section>}
   {index===3&&<section className={styles.panel}><div className={styles.sectionHeading}><span>03 / UYGULA</span><h2>Pratik zamanı.</h2><p>Soruları çözerken önce kendi yaklaşımını dene, ardından çözümdeki farklı fikirlere bak.</p></div>
    <ModuleList items={problems} emptyText="Bu branşta yayımlanmış problem seti henüz görünmüyor; günlük problem alanından devam edebilirsin." defaultHref="/gunun-sorusu"/>
    <div className={styles.ctas}><a className={styles.primary} href="/gunun-sorusu">Günün problemine geç →</a><a href="/yapay-zeka-kocu">AI Koç'tan ipucu al ↗</a></div>
   </section>}
   {index===4&&<section className={styles.panel}><div className={styles.sectionHeading}><span>04 / DEĞERLENDİR</span><h2>Ne kadar ilerledin?</h2><p>Profilindeki rota ve modül ilerlemelerini temel alan güncel özetin.</p></div>
    <div className={styles.metrics}><div><small>Tamamlanan modül</small><strong>{completed} / {modules.length}</strong></div><div><small>Rota ilerlemesi</small><strong>%{progressPercent}</strong></div><div><small>Hazırlık branşı</small><strong>{branchLabels[branch]||"Seçilmedi"}</strong></div></div>
    <div className={styles.track}><i style={{width:progressPercent+"%"}}/></div>
    <div className={styles.next}><h3>Bir sonraki adımın</h3><p>{modules.length===0?"Önce hedefini oluştur ve ilk dersine geç.":completed===modules.length?"Harika! Yeni hedefler ve daha ileri sorularla devam edebilirsin.":"Bitmemiş derslerden birini seç, ardından yanlışlarını tekrar incele."}</p></div>
    <div className={styles.ctas}><a className={styles.primary} href="/panel">Panelimde gör →</a><a href="/kurslar">Derslere dön ↗</a></div>
   </section>}
   <div className={styles.footerNav}>{index>1?<a href={"/rota/adim/"+(index-1)}>← Önceki aşama</a>:<span/>}{index<4?<a href={"/rota/adim/"+(index+1)}>Sonraki aşama →</a>:<a href="/yol-haritasi">Yol haritasına dön →</a>}</div>
  </div></main>
 </div></div></>;
}
