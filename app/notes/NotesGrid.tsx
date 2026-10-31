"use client";
import { useEffect, useState } from "react";
import { isFreeNote, type Note } from "@/lib/pdf-notes-catalog";
import styles from "./notes.module.css";

export default function NotesGrid({notes,plus}:{notes:Note[],plus:boolean}) {
  const [locked,setLocked]=useState(false);
  useEffect(()=>{
    if (!locked) return;
    const close=(event:KeyboardEvent)=>{if(event.key==="Escape")setLocked(false)};
    document.addEventListener("keydown",close);
    return ()=>document.removeEventListener("keydown",close);
  },[locked]);
  return <>
    <div className={styles.grid}>
      {notes.map((note,index)=>{
        const free=isFreeNote(note);
        const allowed=free||plus;
        const url="/api/notes/"+encodeURIComponent(note.slug);
        return <article key={note.slug} className={styles.card}>
          <div className={styles.cardTop}>
            <span className={styles.number}>{String(index+1).padStart(2,"0")}</span>
            <span className={free?styles.free:styles.plus}>{free?"Ücretsiz":"✦ Plus"}</span>
          </div>
          <div className={styles.pdfIcon}>▤<span>PDF</span></div>
          <span className={styles.level}>{note.level}</span>
          <h3>{note.title}</h3>
          <p>{note.summary}</p>
          <div className={styles.sectionTags}><span>Konu anlatımı</span><span>Çözümlü örnek</span><span>Alıştırma</span></div>
          <div className={styles.cardBottom}>
            <span>6+ sayfa · Türkçe</span>
            {allowed ? <div className={styles.actions}>
              <a href={url} target="_blank" rel="noopener noreferrer">Önizle ↗</a>
              <a href={url+"?download=1"}>İndir ↓</a>
            </div> : <button type="button" className={styles.lockButton} onClick={()=>setLocked(true)}>Plus ile aç <span>↗</span></button>}
          </div>
        </article>
      })}
    </div>
    {locked && <div className={styles.overlay} onMouseDown={event=>{if(event.target===event.currentTarget)setLocked(false)}}>
      <section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="pdf-plus-heading">
        <button type="button" className={styles.close} onClick={()=>setLocked(false)} aria-label="Kapat">×</button>
        <div className={styles.modalIcon}>✦</div>
        <span className={styles.eyebrow}>OLYMPION PLUS</span>
        <h2 id="pdf-plus-heading">PDF notları için Plus gerekli</h2>
        <p>İleri düzey konu föyleri, çözümlü örnekler ve alıştırmaları Plus planıyla açabilirsin. İlk konu föyü ücretsizdir.</p>
        <a className={styles.upgrade} href="/odeme?plan=plus">Plus planına geç ↗</a>
        <button type="button" className={styles.later} onClick={()=>setLocked(false)}>Şimdilik ücretsiz notlara dön</button>
      </section>
    </div>}
  </>;
}
