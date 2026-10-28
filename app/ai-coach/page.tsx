import { Sidebar } from "@/components/Sidebar";
import { requireUser } from "@/lib/auth";
import CoachChat from "./CoachChat";
import s from "./coach.module.css";
export const metadata={title:"AI Koç | Olympion",description:"Bilim olimpiyatlarına hazırlık için çözüm stratejileri."};
export default async function AICoachPage(){
 await requireUser();
 return <><link rel="stylesheet" href="/style.css"/><div className="app-page"><div className="app-shell"><Sidebar active="coach"/><main className="app-main"><div className={s.pageHead}><span>OLYMPION KOÇ</span><h1>Birlikte düşünelim.</h1><p>Takıldığın adımı anlat, çözüm yaklaşımını birlikte bulalım. Sorunun cevabını ezberlemekten çok nasıl ilerleyeceğine odaklan.</p></div><CoachChat/></main></div></div></>;
}
