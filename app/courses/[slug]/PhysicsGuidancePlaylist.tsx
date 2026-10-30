import Link from "next/link";
import type { GuidancePlaylist as GuidancePlaylistData } from "@/lib/guidance-playlist";
import styles from "./physics-guidance.module.css";

export function PhysicsGuidancePlaylist({
  playlist,
  requestedVideo
}:{
  playlist: GuidancePlaylistData;
  requestedVideo?: string;
}){
  const selected=playlist.videos.find(v=>v.youtubeId===requestedVideo) || playlist.videos[0];
  const watchUrl="https://www.youtube.com/playlist?list="+encodeURIComponent(playlist.id);
  const validId=/^[A-Za-z0-9_-]{10,120}$/.test(playlist.id);
  const embed=selected
    ? "https://www.youtube-nocookie.com/embed/"+selected.youtubeId+"?list="+encodeURIComponent(playlist.id)+"&rel=0"
    : "https://www.youtube-nocookie.com/embed/videoseries?list="+encodeURIComponent(playlist.id);

  return (
    <div className={styles.grid} data-guidance-playlist>
      <section className={styles.viewer}>
        <div className={styles.iframeShell}>
          {validId
            ? <iframe
                key={selected?.youtubeId||playlist.id}
                src={embed}
                title={selected?.title||"Fizik Olimpiyatları Rehberlik oynatma listesi"}
                loading="lazy"
                allowFullScreen
                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
              />
            : <div className={styles.fallback}>Oynatma listesi adresi geçersiz. Yönetici tarafından düzeltilmeli.</div>}
        </div>
        <div className={styles.info}>
          <span className={styles.tag}>FİZİK · REHBERLİK · ÜCRETSİZ</span>
          <h2>{selected?.title || "YouTube rehberlik oynatma listesi"}</h2>
          <p>{selected
            ? "YouTube listesindeki seçili videoyu izliyorsun. Diğer dersleri sağdaki listeden seçebilirsin."
            : "Oynatıcı ilk videoyu YouTube'daki oynatma listesi sırasından başlatır. Liste üzerindeki kontrolle sonraki videolara geçebilirsin."}</p>
          <div className={styles.actions}>
            <a href={watchUrl} target="_blank" rel="noopener noreferrer" className={styles.watch}>YouTube'da aç ↗</a>
            <span>Bu oynatma listesi için izleme ilerlemesi henüz otomatik kaydedilmez.</span>
          </div>
        </div>
      </section>

      <aside className={styles.playlist}>
        <div className={styles.playlistHeader}>
          <span>YOUTUBE OYNATMA LİSTESİ</span>
          <h2>Rehberlik dersleri</h2>
          <p>{playlist.videos.length ? playlist.videos.length+" video · Liste sırasına göre" : "Oynatma listesi bağlantısı"}</p>
        </div>
        {playlist.videos.length ? (
          <div className={styles.items}>
            {playlist.videos.map((video,index)=>(
              <Link key={video.youtubeId}
                href={"/courses/physics-guidance?video="+encodeURIComponent(video.youtubeId)}
                className={styles.video+(selected?.youtubeId===video.youtubeId?" "+styles.active:"")}
                aria-current={selected?.youtubeId===video.youtubeId?"true":undefined}
              >
                <span className={styles.number}>{String(index+1).padStart(2,"0")}</span>
                <img src={"https://i.ytimg.com/vi/"+video.youtubeId+"/mqdefault.jpg"}
                  alt="" width={94} height={59} loading="lazy"/>
                <span className={styles.videoText}>
                  <strong>{video.title}</strong>
                  <small>{video.duration||"Video"} · Ücretsiz</small>
                </span>
              </Link>
            ))}
          </div>
        ):(
          <div className={styles.notice}>
            {playlist.state==="api_key_missing"
              ? "YouTube API anahtarı tanımlandığında video başlıkları ve sırası burada otomatik listelenir. Şimdilik oynatıcının kendi liste menüsünü kullanabilirsin."
              : playlist.state==="unavailable"
                ? "YouTube'dan video listesi alınamadı. Oynatıcıdan veya YouTube bağlantısından listeyi deneyebilirsin."
                : playlist.state==="invalid_id"
                  ? "Oynatma listesi kimliği geçersiz."
                  : "Listede henüz erişilebilir video bulunmuyor."}
          </div>
        )}
        <p className={styles.foot}>Yeni videoların başlıkları yaklaşık 10 dakikalık önbellek yenilendiğinde görünür. Liste dışı videoları bağlantısı olan kişiler izleyebilir.</p>
      </aside>
    </div>
  );
}
