"use client";
import { useEffect, useState } from "react";
export function StudentMenuToggle() {
 const [open,setOpen]=useState(false);
 useEffect(()=>{
  const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};
  const onResize=()=>{if(window.innerWidth>850)setOpen(false)};
  window.addEventListener("keydown",onKey);window.addEventListener("resize",onResize);
  document.body.style.overflow=open&&window.innerWidth<=850?"hidden":"";
  return ()=>{window.removeEventListener("keydown",onKey);window.removeEventListener("resize",onResize);document.body.style.overflow=""};
 },[open]);
 return <>
  <header className="student-mobile-bar"><button type="button" className="student-menu-trigger" aria-expanded={open} aria-controls="student-panel-sidebar" aria-label={open?"Menüyü kapat":"Öğrenci menüsünü aç"} onClick={()=>setOpen(!open)}><span></span><span></span></button><a className="student-mobile-title" href="/panel"><img src="/logo-icon.svg" alt="" width="31" height="31"/><span>Olympion <small>Öğrenci Paneli</small></span></a><a href="/" className="student-mobile-website" aria-label="Ana siteye dön">↗</a></header>
  {open&&<button className="student-menu-scrim" aria-label="Menüyü kapat" onClick={()=>setOpen(false)}/>}
  <style>{`@media(max-width:850px){body:has(.student-menu-scrim) #student-panel-sidebar{transform:translateX(0)!important;visibility:visible!important}}`}</style>
 </>;
}
