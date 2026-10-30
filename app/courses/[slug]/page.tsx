import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { canAccess, type Plan } from "@/lib/plans";
import styles from "./course.module.css";

type Video = { id:string; title:string; description:string|null; youtube_id:string|null; order_index:number; duration_seconds:number; access_tier:"free"|"plus"|"pro"; is_active:boolean };
type Course = { id:string; slug:string; title:string; description:string|null; long_description:string|null; branch:string; stage:string; unlock_after_slug:string|null; lock_message:string|null; lesson_videos:Video[]|null };

const validPlan=(v:unknown):Plan=>["free","plus","pro","mentor"].includes(String(v))?v as Plan:"free";

export default async function CourseSectionPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<{video?:string}>}) {
 const {slug}=await params;
 if(!/^[a-z0-9-]{1,80}$/.test(slug))notFound();
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/giris?next="+encodeURIComponent("/courses/"+slug));
 const {data:profile}=await supabase.from("profiles").select("plan,branch").eq("id",user.id).maybeSingle();
 const {data:course,error:courseError}=await supabase.from("course_sections")
  .select("id,slug,title,description,long_description,branch,stage,unlock_after_slug,lock_message,lesson_videos(id,title,description,youtube_id,order_index,duration_seconds,access_tier,is_active)")
  .eq("slug",slug).eq("is_active",true).maybeSingle();
 if(courseError){console.error("Course load failed",courseError.message);throw new Error("Ders bölümü yüklenemedi");}
 if(!course)notFound();
 const section=course as Course;
 if(profile?.branch && profile.branch !== section.branch) {
  // Courses should remain discoverable, but not alter another branch's learning progress.
  redirect("/kurslar");
 }
 const videos=(section.lesson_videos||[]).filter(v=>v.is_active).sort((a,b)=>a.order_index-b.order_index);
 const currentPlan=validPlan(profile?.plan);
 if(section.unlock_after_slug){
  const {data:prerequisite}=await supabase.from("course_sections")
   .select("id,lesson_videos(id,is_active)").eq("slug",section.unlock_after_slug).maybeSingle();
  const preVideos=((prerequisite?.lesson_videos||[]) as {id:string;is_active:boolean}[]).filter(v=>v.is_active);
  if(!prerequisite || !preVideos.length)redirect("/kurslar");
  const {data:completedRows}=await supabase.from("user_video_progress")
    .select("video_id,is_completed,progress_percent")
    .eq("user_id",user.id).in("video_id",preVideos.map(v=>v.id));
  const completed=new Set((completedRows||[]).filter(p=>p.is_completed||Number(p.progress_percent)>=100).map(p=>p.video_id));
  if(preVideos.some(v=>!completed.has(v.id)))redirect("/kurslar");
 }
 const query=await searchParams;
 const selected=videos.find(v=>v.id===query.video)||videos.find(v=>["free","plus","pro"].includes(String(v.access_tier))&&canAccess(currentPlan,v.access_tier));
 const permitted=selected&&["free","plus","pro"].includes(String(selected.access_tier))&&canAccess(currentPlan,selected.access_tier);
 const {data:progress}=await supabase.from("user_video_progress")
  .select("video_id,is_completed,progress_percent").eq("user_id",user.id)
  .in("video_id",videos.length?videos.map(v=>v.id):["00000000-0000-0000-0000-000000000000"]);
 const map=new Map((progress||[]).map(p=>[p.video_id,p]));
 return <><link rel="stylesheet" href="/style.css"/><div className="app-page"><div className="app-shell"><Sidebar active="courses"/>
  <main className="app-main"><div className={styles.root}>
   <Link className={styles.back} href="/kurslar">← Derslere dön</Link>
   <div className={styles.heading}><span>OLYMPION · {section.branch==="physics"?"FİZİK":section.branch==="chemistry"?"KİMYA":"BİLİM"}</span>
   <h1>{section.title}</h1><p>{section.long_description||section.description||"Dersleri sırasıyla izle ve ilerlemeni takip et."}</p></div>
   <div className={styles.grid}>
    <section className={styles.viewer}>
      {selected&&permitted&&selected.youtube_id&&/^[A-Za-z0-9_-]{11}$/.test(selected.youtube_id)?(
       <iframe src={"https://www.youtube-nocookie.com/embed/"+selected.youtube_id}
        title={selected.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin" allowFullScreen loading="lazy"/>
      ):<div className={styles.empty}><strong>{selected&&!permitted?"Bu ders üyelik gerektiriyor.":"Bu bölümde oynatılabilir video bulunmuyor."}</strong>
       {selected&&!permitted&&<Link href="/fiyatlandirma">Planları incele →</Link>}</div>}
      {selected&&<div className={styles.details}><span>{selected.access_tier.toUpperCase()} · {selected.duration_seconds>0?Math.ceil(selected.duration_seconds/60)+" dk":"Süre belirtilmedi"}</span><h2>{selected.title}</h2><p>{selected.description||"Dersi izleyerek konuyu pekiştir."}</p>
       {permitted&&<form method="post" action="/api/course-progress"><input type="hidden" name="videoId" value={selected.id}/><input type="hidden" name="slug" value={slug}/>
        <button className={styles.complete} type="submit">{map.get(selected.id)?.is_completed?"Tamamlandı ✓":"Dersi tamamladım ✓"}</button>
        <small>Tamamlama, izleme süresinden bağımsız olarak senin tarafından işaretlenir.</small></form>}
      </div>}
    </section>
    <aside className={styles.list}><h2>Bu bölümün dersleri</h2><p>{videos.length} içerik · {videos.filter(v=>map.get(v.id)?.is_completed).length} tamamlandı</p>
     <div>{videos.map((v,i)=><Link key={v.id} href={"/courses/"+slug+"?video="+encodeURIComponent(v.id)}
        className={styles.lesson+(selected?.id===v.id?" "+styles.selected:"")}>
        <span className={styles.number}>{map.get(v.id)?.is_completed?"✓":String(i+1).padStart(2,"0")}</span>
        <span className={styles.lessonName}><strong>{v.title}</strong><small>{canAccess(currentPlan,v.access_tier)?"Dersi aç":"🔒 "+v.access_tier.toUpperCase()} {v.duration_seconds>0?"· "+Math.ceil(v.duration_seconds/60)+" dk":""}</small></span>
        <span className={styles.arrow}>↗</span>
      </Link>)}</div>
      {!videos.length&&<p>Bu bölümün dersleri henüz yayınlanmadı.</p>}
    </aside>
   </div>
  </div></main></div></div></>;
}
