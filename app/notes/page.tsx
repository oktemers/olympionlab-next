import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { NOTES, branchTitles, type Branch } from "@/lib/pdf-notes-catalog";
import { hasPlusAccess } from "@/lib/plans";
import NotesGrid from "./NotesGrid";
import styles from "./notes.module.css";

export const metadata = {
  title: "PDF Notları | OlympionLab",
  description: "Fizik, kimya, biyoloji ve matematik olimpiyatları için konu konu PDF çalışma föyleri."
};

export default async function NotesPage({
  searchParams
}: { searchParams: Promise<{ brans?: string }> }) {
  const supabase = await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if (!user) redirect("/giris");
  const {data:profile}=await supabase.from("profiles")
    .select("branch,role,plan").eq("id",user.id).maybeSingle();
  const query=await searchParams;
  const admin=profile?.role==="admin";
  const available=Object.keys(branchTitles);
  const branch:Branch = admin && available.includes(query?.brans || "")
    ? query.brans as Branch
    : available.includes(profile?.branch || "")
      ? profile!.branch as Branch
      : "physics";
  const plus = admin || hasPlusAccess(profile?.plan);
  const notes=NOTES.filter(note=>note.branch===branch);
  return <>
    <link rel="stylesheet" href="/style.css"/>
    <div className="app-page"><div className="app-shell">
      <Sidebar active="notes"/>
      <main className="app-main"><div className={styles.page}>
        <div className={styles.head}>
          <div>
            <span className={styles.eyebrow}>OLYMPIONLAB / ÇALIŞMA KÜTÜPHANESİ</span>
            <h1>PDF Notları</h1>
            <p>Olimpiyat hazırlığında konu konu ilerle. Temel açıklamalar, bağıntılar, çözümlü örnek ve kendini sınama soruları tek dosyada.</p>
          </div>
          <a className={styles.planLink} href="/fiyatlandirma">✦ Planları keşfet ↗</a>
        </div>
        <div className={styles.toolbar}>
          <div className={styles.branchText}>
            <span className={styles.branchIcon}>{branch==="physics"?"⚛":branch==="chemistry"?"⚗":branch==="biology"?"♧":"Σ"}</span>
            <div><small>SEÇİLİ BRANŞ</small><strong>{branchTitles[branch]} Olimpiyatları</strong></div>
          </div>
          <span className={styles.totalCount}>{notes.length} konu föyü · Her biri en az 6 sayfa</span>
        </div>
        {admin && <nav className={styles.branchNav} aria-label="Branşa göre notlar">
          {(Object.keys(branchTitles) as Branch[]).map(key=>
            <a key={key} className={key===branch?styles.active:""} href={"/notlar?brans="+key}>{branchTitles[key]}</a>
          )}
        </nav>}
        <div className={styles.sectionIntro}>
          <div><span>01 / KONU KÜTÜPHANESİ</span><h2>{branchTitles[branch]} çalışma föyleri</h2></div>
          <p>Birinci konu ücretsiz örnek. İleri konular Plus planına dahil. Her not, senin branşına özel hazırlanmıştır.</p>
        </div>
        <NotesGrid notes={notes} plus={plus} />
        <div className={styles.endNote}>Başka branşa hazırlanıyorsan <a href="/rota/adim/1">yol haritasından branş seçimini değiştirebilirsin.</a> Hazırlık içerikleri yeni konularla genişletilebilir.</div>
      </div></main>
    </div></div>
  </>;
}
