import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { canAccess, type Plan } from "@/lib/plans";

const validPlan=(value:unknown):Plan=>
 ["free","plus","pro","mentor"].includes(String(value))?value as Plan:"free";

export async function POST(request: Request) {
 const origin=request.headers.get("origin");
 const url=new URL(request.url);
 if((origin && origin!==url.origin)||request.headers.get("sec-fetch-site")==="cross-site") {
  return NextResponse.json({error:"Geçersiz istek kaynağı."},{status:403});
 }
 const data=await request.formData().catch(()=>null);
 const videoId=String(data?.get("videoId")||"");
 const slug=String(data?.get("slug")||"");
 if(!/^[a-z0-9-]{1,80}$/.test(slug)||videoId.length<8||videoId.length>100||!/^[a-zA-Z0-9_-]+$/.test(videoId)) {
  return NextResponse.json({error:"Geçersiz ders bilgisi."},{status:400});
 }
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.redirect(new URL("/giris",url.origin),303);
 const {data:profile,error:profileError}=await supabase.from("profiles").select("plan,branch").eq("id",user.id).maybeSingle();
 const {data:section,error:sectionError}=await supabase.from("course_sections")
  .select("id,slug,branch,is_active,unlock_after_slug,lesson_videos(id,access_tier,is_active)")
  .eq("slug",slug).eq("is_active",true).maybeSingle();
 if(profileError||sectionError)return NextResponse.json({error:"Ders erişimi kontrol edilemedi."},{status:503});
 if(!section)return NextResponse.json({error:"Bölüm bulunamadı."},{status:404});
 if(profile?.branch && profile.branch!==section.branch)return NextResponse.json({error:"Yanlış branş."},{status:403});
 const video=(section.lesson_videos||[]).find(v=>v.id===videoId&&v.is_active);
 if(!video)return NextResponse.json({error:"Ders bulunamadı."},{status:404});
 if(!canAccess(validPlan(profile?.plan),validPlan(video.access_tier))) {
  return NextResponse.json({error:"Bu ders için uygun üyelik gerekiyor."},{status:403});
 }
 if(section.unlock_after_slug) {
  const {data:prev,error:prevError}=await supabase.from("course_sections")
   .select("id,lesson_videos(id,is_active)").eq("slug",section.unlock_after_slug).eq("is_active",true).maybeSingle();
  if(prevError||!prev)return NextResponse.json({error:"Ön koşul kontrol edilemedi."},{status:403});
  const prerequisites=(prev.lesson_videos||[]).filter(v=>v.is_active);
  if(!prerequisites.length)return NextResponse.json({error:"Ön koşul eksik."},{status:403});
  const {data:rows,error:progressError}=await supabase.from("user_video_progress")
   .select("video_id,is_completed,progress_percent").eq("user_id",user.id)
   .in("video_id",prerequisites.map(v=>v.id));
  if(progressError)return NextResponse.json({error:"İlerleme kontrol edilemedi."},{status:503});
  const completed=new Set((rows||[]).filter(r=>r.is_completed||Number(r.progress_percent)>=100).map(r=>r.video_id));
  if(prerequisites.some(v=>!completed.has(v.id)))return NextResponse.json({error:"Önce önceki bölümü tamamla."},{status:403});
 }
 // Student-declared completion, not proof of watched video duration.
 const {error:saveError}=await supabase.from("user_video_progress").upsert({
  user_id:user.id,video_id:videoId,progress_percent:100,is_completed:true
 },{onConflict:"user_id,video_id"});
 if(saveError){console.error("Course completion save failed",saveError.message);return NextResponse.json({error:"İlerleme kaydedilemedi."},{status:503});}
 return NextResponse.redirect(new URL("/courses/"+slug+"?video="+encodeURIComponent(videoId)+"&saved=1",url.origin),303);
}
