import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/Sidebar";
import { getGuidancePlaylist } from "@/lib/guidance-playlist";
import styles from "./guidance.module.css";

export const metadata={
  title:"Olimpiyat Rehberliği | OlympionLab",
  description:"Olimpiyat hazırlığı rehberlik videolarını sırayla izle."
};

export default async function GuidanceCoursePage({
  searchParams
}:{
  searchParams:Promise<{video?:string}>
}){
  const supabase=await createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/giris?next=%2Fcourses%2Frehberlik");
  const playlist=await getGuidancePlaylist();
  const query=await searchParams;
  const selected=playlist.videos.find(v=>v.youtubeId===query.video)||playlist.videos[0];
  const source=selected
    ? "https://www.youtube-nocookie.com/embed/"+selected.youtubeId+"?rel=0"
    : "https://www.youtube-nocookie.com/embed/videoseries?list="+encodeURIComponent(playlist.id);
  const watchLink="https://www.youtube.com/playlist?list="+encodeURIComponent(playlist.id);
  return <><link rel="stylesheet" href="/style.css"/><div className="app-page"><div className="app-shell">
    <Sidebar active="courses"/>
    <main className="app-main"><div className={styles.page}>
      <div className={styles.top}>
        <Link href="/kurslar" className={styles.back}>← Derslere dön</Link>
        <span className={styles.free}>ÜCRETSİZ · REHBERLİK</span>
      </div>
      <div className={styles.heading}>
        <span className={styles.eyebrow}>OLYMPIONLAB / OLİMPİYAT HAZIRLIĞI</span>
        <h1>Rehberlik dersleri</h1>
        <p>Olimpiyat hazırlığına ilk adım. YouTube oynatma listesine eklediğimiz dersleri buradan sırayla izleyebilirsin.</p>
      </div>
      <div className={styles.grid}>
        <section className={styles.playerPanel}>
          <div className={styles.player}>
            {playlist.state==="invalid_id"?<div className={styles.noPlayer}>Oynatma listesi bağlantısı geçerli değil. Yönetici bağlantıyı kontrol etmeli.</div>
              :<iframe src={source} title={selected?.title||"Olimpiyat Rehberliği oynatma listesi"}
               allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
               allowFullScreen referrerPolicy="strict-origin-when-cross-origin" loading="lazy"/>}
          </div>
          <div className={styles.detail}>
            <span className={styles.detailLabel}>{selected?"DERS "+String(selected.position+1).padStart(2,"0"):"YOUTUBE OYNATMA LİSTESİ"}</span>
            <h2>{selected?.title||"Rehberlik oynatma listesi"}</h2>
            <p>{selected?"Seçtiğin rehberlik dersini izliyorsun. Diğer videolara sağdaki listeden geçebilirsin.":"İlk video oynatma listesinin başından oynatılır; YouTube oynatıcısındaki liste simgesinden diğerlerine geçebilirsin."}</p>
            <a href={watchLink} rel="noopener noreferrer" target="_blank" className={styles.youtube}>YouTube'da oynatma listesini aç ↗</a>
          </div>
        </section>
        <aside className={styles.playlist}>
          <div className={styles.playlistHead}><span>İZLEME SIRASI</span><h2>Rehberlik videoları</h2>
            <p>{playlist.videos.length?playlist.videos.length+" video · YouTube sırasına göre":"YouTube oynatma listesi"}</p>
          </div>
          {playlist.videos.length ? <div className={styles.items}>{playlist.videos.map((video,index)=>
            <Link key={video.youtubeId} href={"/courses/rehberlik?video="+video.youtubeId}
              className={styles.item+(selected?.youtubeId===video.youtubeId?" "+styles.current:"")}>
              <span className={styles.ordinal}>{String(index+1).padStart(2,"0")}</span>
              <img src={"https://i.ytimg.com/vi/"+video.youtubeId+"/mqdefault.jpg"} alt="" width={92} height={58} loading="lazy"/>
              <span className={styles.itemCopy}><strong>{video.title}</strong><small>{video.duration||"YouTube"} · Ücretsiz</small></span>
            </Link>
          )}</div>:<div className={styles.empty}>
             <p>{playlist.state==="api_key_missing"?"Video başlıklarını otomatik listelemek için YouTube API anahtarı henüz tanımlanmamış. Üstteki oynatıcı YouTube'un kendi playlist sırasını kullanır.":playlist.state==="invalid_id"?"Oynatma listesi kimliği hatalı.":playlist.state==="unavailable"?"YouTube API'den liste alınamadı. Üstteki oynatıcıyı deneyebilir veya listeyi YouTube'da açabilirsin.":"Oynatma listesinde şu anda erişilebilir video bulunmuyor."}</p>
             <a href={watchLink} target="_blank" rel="noopener noreferrer">Listeyi YouTube'da kontrol et ↗</a>
          </div>}
          <div className={styles.notice}>Yeni videolar oynatma listesine eklendiğinde otomatik yenilenir. Liste dışı videolar bağlantısı olan kişilerce de izlenebilir.</div>
        </aside>
      </div>
    </div></main>
  </div></div></>;
}
