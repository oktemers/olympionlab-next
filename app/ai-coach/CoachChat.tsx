"use client";
import {useState,useRef,useEffect} from "react";
import s from "./coach.module.css";
type Message={id:number;role:"user"|"assistant";text:string;mode?:string;notice?:string};
const starter=["Fizik olimpiyatına nasıl başlamalıyım?","Momentum mu enerji mi kullanmalıyım?","Kimyasal dengede nasıl düşünmeliyim?","Haftalık problem çözme planı oluştur."];
export default function CoachChat(){
 const [messages,setMessages]=useState<Message[]>([{id:0,role:"assistant",text:"Merhaba! Olympion Koç'a hoş geldin. Hazırlık hedefini veya çözmekte zorlandığın soruyu yaz; birlikte bir yöntem geliştirelim."}]);
 const [question,setQuestion]=useState("");const [sending,setSending]=useState(false);const [error,setError]=useState("");const end=useRef<HTMLDivElement>(null);const counter=useRef(1);
 useEffect(()=>{end.current?.scrollIntoView({behavior:"smooth",block:"end"})},[messages,sending]);
 async function ask(text:string){
  const q=text.trim();if(!q||sending)return;setSending(true);setError("");setQuestion("");
  setMessages(prev=>[...prev,{id:counter.current++,role:"user",text:q}]);
  try{
   const r=await fetch("/api/ai-coach",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({question:q})});
   const data=await r.json().catch(()=>({}));
   if(!r.ok||typeof data.answer!=="string")throw Error(data.error||"Yanıt alınamadı.");
   setMessages(prev=>[...prev,{id:counter.current++,role:"assistant",text:data.answer,mode:data.mode,notice:data.notice}]);
  }catch(e){setError(e instanceof Error?e.message:"Bağlantı hatası. Lütfen tekrar dene.");setQuestion(q)}
  finally{setSending(false)}
 }
 return <section className={s.chatPanel} aria-label="Olympion AI Koç sohbeti"><div className={s.chatHeading}><div className={s.avatar}>✧</div><div><strong>Olympion Koç</strong><small>Olimpiyat hazırlığında çözüm stratejileri</small></div></div>
  <div className={s.messages} role="log" aria-live="polite">{messages.map(m=><article key={m.id} className={m.role==="user"?s.userMessage:s.assistantMessage}><span className={s.roleLabel}>{m.role==="user"?"Sen":m.mode==="rehber"?"Rehber Yanıtı":"Olympion Koç"}</span><p>{m.text}</p>{m.notice&&<small className={s.notice}>{m.notice}</small>}</article>)}{sending&&<div className={s.loading} role="status"><span></span><span></span><span></span> Yanıt hazırlanıyor…</div>}<div ref={end}/></div>
  <div className={s.composer}><div className={s.prompts}>{starter.map(p=><button type="button" key={p} disabled={sending} onClick={()=>ask(p)}>{p}</button>)}</div>{error&&<p className={s.error} role="alert">{error}</p>}
   <form onSubmit={e=>{e.preventDefault();ask(question)}}><label htmlFor="coach-question" className={s.srOnly}>Koç'a sorunu yaz</label><textarea id="coach-question" value={question} onChange={e=>setQuestion(e.target.value)} maxLength={1800} rows={2} placeholder="Sorunu veya hedefini yaz…" onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();ask(question)}}}/><button type="submit" disabled={sending||question.trim().length<3}>{sending?"…":"Gönder ↗"}</button></form>
  </div></section>;
}
