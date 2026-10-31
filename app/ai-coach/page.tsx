import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { requireUser } from "@/lib/auth";
import { hasPlusAccess } from "@/lib/plans";
import { createClient } from "@/lib/supabase/server";
import CoachChat from "./CoachChat";
import s from "./coach.module.css";

export const metadata = {
  title: "AI Koç | OlympionLab",
  description: "Bilim olimpiyatlarına hazırlık için çözüm stratejileri."
};

export default async function AICoachPage() {
  const user = await requireUser();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles")
    .select("plan,role").eq("id", user.id).maybeSingle();
  const allowed = profile?.role === "admin" || hasPlusAccess(profile?.plan);

  return <>
    <link rel="stylesheet" href="/style.css" />
    <div className="app-page"><div className="app-shell">
      <Sidebar active="coach" />
      <main className="app-main">
        <div className={s.pageHead}>
          <span>OLYMPION KOÇ</span>
          <h1>Birlikte düşünelim.</h1>
          <p>Takıldığın adımı anlat, çözüm yaklaşımını birlikte bulalım. Sorunun cevabını ezberlemekten çok nasıl ilerleyeceğine odaklan.</p>
        </div>
        {allowed ? <CoachChat /> : (
          <div className={s.upgradeArea}>
            <div className={s.upgradePreview} aria-hidden="true">
              <div className={s.chatHeading}>
                <div className={s.avatar}>✧</div>
                <div><strong>Olympion Koç</strong><small>Olimpiyat hazırlığında kişisel çalışma desteği</small></div>
              </div>
              <p>Çalışma hedeflerini, sorularını ve çözüm yaklaşımlarını AI Koç ile tartış.</p>
            </div>
            <section className={s.upgradeDialog} role="dialog" aria-modal="true" aria-labelledby="coach-upgrade-heading" aria-describedby="coach-upgrade-description">
              <div className={s.upgradeIcon} aria-hidden="true">✦</div>
              <span className={s.upgradeEyebrow}>OLYMPION PLUS</span>
              <h2 id="coach-upgrade-heading">AI Koç için Plus planı gerekli</h2>
              <p id="coach-upgrade-description">AI Koç, Plus ve üzerindeki üyeliklere açık. Plus planına geçerek sorularına özel çalışma desteğini kullanabilirsin.</p>
              <Link className={s.upgradeButton} href="/odeme?plan=plus">Plus planına geç <span aria-hidden="true">↗</span></Link>
              <Link className={s.upgradeBack} href="/kurslar">Şimdilik derslere dön</Link>
            </section>
          </div>
        )}
      </main>
    </div></div>
  </>;
}
