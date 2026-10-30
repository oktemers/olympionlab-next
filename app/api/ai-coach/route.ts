import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
const tips = (q:string) => {
 const s=q.toLocaleLowerCase("tr-TR");
 if(/momentum|enerji|mekanik/.test(s))return "Önce sistemini ve korunabilecek nicelikleri belirle. Dış kuvvetlerin impulsu küçükse momentum korunumu, sürtünme ve iş dikkate alınabiliyorsa enerji yaklaşımı işe yarar. Sorudaki etkileşim öncesi ve sonrası durumları bir tabloyla karşılaştır. Hangi kuvvetler dışarıdan etki ediyor?";
 if(/kimya|denge|le chatelier|reaksiyon/.test(s))return "Başlangıçta denge ifadesini yaz; sonra değiştirilen büyüklüğü (derişim, sıcaklık, basınç) ayrı ayrı düşün. Q ile K'yi karşılaştırarak yönü tahmin et. Sıcaklık değişimi için tepkimenin endotermik mi ekzotermik mi olduğunu biliyor musun?";
 if(/çalış|olimpiyat|tübitak|plan|1. aşama/.test(s))return "İlk hafta seviye belirleme ve bir geçmiş yıl sorusu denemesi yap. Konuları üç gruba ayır: güçlü, tekrar isteyen ve hiç başlamadığın. Haftada 3 konu oturumu, 2 problem çözme oturumu ve 1 yanlış analiziyle başlayabilirsin. Hangi branşa ve hangi aşamaya hazırlanıyorsun?";
 return "Soruyu önce 'verilenler, istenenler, kısıtlar' olarak böl. Uygun yasa veya teoremi seçmeden önce şekil, grafik ya da küçük bir örnek kur. Birimi ve sınır durumlarını kontrol et. Hangi adımda takıldığını yazarsan çözüm yolunu birlikte daraltabiliriz.";
};
export async function POST(request:Request) {
 try{
  const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"Oturumun sona ermiş. Lütfen tekrar giriş yap."},{status:401});
  const origin=request.headers.get("origin");
  if ((origin && origin!==new URL(request.url).origin) || request.headers.get("sec-fetch-site")==="cross-site") {
   return NextResponse.json({error:"Geçersiz istek kaynağı."},{status:403});
  }
  const size=Number(request.headers.get("content-length")||0);
  if (size>8192) return NextResponse.json({error:"Mesaj boyutu çok büyük."},{status:413});
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
   return NextResponse.json({error:"JSON isteği bekleniyor."},{status:415});
  }
  const data=await request.json().catch(()=>null);
  const question=typeof data?.question==="string"?data.question.trim():"";
  if(question.length<3||question.length>1800)return NextResponse.json({error:"Sorun 3 ile 1800 karakter arasında olmalı."},{status:400});
  if(!process.env.OPENAI_API_KEY)return NextResponse.json({answer:tips(question),mode:"rehber",notice:"AI bağlantısı henüz yapılandırılmadığı için konuya göre hazırlanmış rehber yanıtı gösteriliyor."},{headers:{"Cache-Control":"no-store"}});
  const {data:profile}=await supabase.from("profiles").select("branch,level,goal").eq("id",user.id).maybeSingle();
  const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY,maxRetries:1,timeout:20000});
  const response=await client.responses.create({
   model:process.env.OLYMPION_AI_MODEL||"gpt-5.5",store:false,max_output_tokens:650,
   input:[{role:"system",content:"Sen Olympion bilim olimpiyatları çalışma koçusun. Türkçe, anlaşılır ve sıcak yaz. Öğrenciye bilim olimpiyatı düzeyinde ipuçları, yöntemler, basamaklı çözüm yaklaşımı sun. Soruyu tamamen çözüp bitirmek yerine önce çözüm stratejisini ve kontrol sorularını göster. Kısa ve uygulanabilir öneriler ver."},
    {role:"user",content:"Öğrenci hazırlık bilgisi: "+JSON.stringify(profile||{})+"\nSoru: "+question}]
  });
  const answer=response.output_text?.trim();
  if(!answer)return NextResponse.json({error:"Koç yanıt oluşturamadı. Lütfen tekrar dene."},{status:502});
  // Persist in conversation order; a storage failure must not fabricate a reply.
  const {error:userSaveError}=await supabase.from("ai_messages").insert({user_id:user.id,role:"user",content:question});
  if (!userSaveError) {
   const {error:assistantSaveError}=await supabase.from("ai_messages").insert({user_id:user.id,role:"assistant",content:answer});
   if (assistantSaveError) console.error("AI conversation save error",assistantSaveError.message);
  } else {
   console.error("AI conversation save error",userSaveError.message);
  }
  return NextResponse.json({answer,mode:"ai"},{headers:{"Cache-Control":"no-store"}});
 }catch(error){
  console.error("Olympion AI coach request failed",error instanceof Error?error.message:"unknown");
  return NextResponse.json({error:"AI Koç'a şu anda bağlanılamıyor. Biraz sonra tekrar deneyebilirsin."},{status:503});
 }
}
