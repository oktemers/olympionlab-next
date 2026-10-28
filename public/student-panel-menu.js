(function(){
 "use strict";
 const shell=document.querySelector(".app-page");
 const sidebar=shell?.querySelector(".app-sidebar");
 if(!shell||!sidebar||shell.dataset.olympionNav==="ready")return;
 shell.dataset.olympionNav="ready";
 sidebar.classList.add("student-unified-sidebar");
 sidebar.id="student-panel-sidebar";

 const entries=[
  ["/panel","⌘","Genel"],["/kurslar","▶","Dersler"],["/yol-haritasi","◇","Yol Haritası"],
  ["/notlar","▤","PDF Notları"],["/gunun-sorusu","✦","Günün Problemi"],
  ["/yapay-zeka-kocu","✧","AI Koç"],["/student-labs","◈","Labs"],["/ayarlar","⚙","Ayarlar"]
 ];
 const canon=window.location.pathname.replace(/\.html$/,"").replace(/\/$/,"");
 const active=href=>href===canon||(href==="/panel"&&["/dashboard","/panel"].includes(canon))||(href==="/student-labs"&&["/student-labs","/uygulama-laboratuvarlari"].includes(canon));

 sidebar.innerHTML='<a href="/panel" class="app-brand"><img src="/logo-icon.svg" width="42" height="42" alt=""><div>Olympion<small>Öğrenci Paneli</small></div></a><span class="student-menu-caption">ÇALIŞMA ALANIN</span><nav class="app-nav" aria-label="Öğrenci menüsü">'+entries.map(([href,icon,label])=>'<a href="'+href+'" class="app-link '+(active(href)?"active":"")+'" '+(active(href)?'aria-current="page"':"")+'><span aria-hidden="true">'+icon+"</span>"+label+"</a>").join("")+'</nav><div class="student-menu-bottom"><a class="student-plan-link" href="/fiyatlandirma">✦ Planları keşfet <span>↗</span></a><a href="/" class="back-site">← Ana sayfaya dön</a><form method="POST" action="/auth/signout"><button class="student-signout" type="submit">⏻ Çıkış Yap</button></form></div>';

 const bar=document.createElement("header");
 bar.className="student-mobile-bar";
 bar.innerHTML='<button type="button" class="student-menu-trigger" aria-controls="student-panel-sidebar" aria-expanded="false" aria-label="Öğrenci menüsünü aç"><span></span><span></span></button><a class="student-mobile-title" href="/panel"><img src="/logo-icon.svg" width="31" height="31" alt=""><span>Olympion<small>Öğrenci Paneli</small></span></a>';
 shell.prepend(bar);
 const button=bar.querySelector(".student-menu-trigger");

 const close=()=>{
  shell.classList.remove("student-menu-open");
  button.setAttribute("aria-expanded","false");
  button.setAttribute("aria-label","Öğrenci menüsünü aç");
 };
 const toggle=()=>{
  const open=shell.classList.toggle("student-menu-open");
  button.setAttribute("aria-expanded",String(open));
  button.setAttribute("aria-label",open?"Öğrenci menüsünü kapat":"Öğrenci menüsünü aç");
 };
 button.addEventListener("click",toggle);
 sidebar.addEventListener("click",event=>{
  if(event.target.closest("a,button[type='submit']"))close();
 });
 document.addEventListener("pointerdown",event=>{
  if(shell.classList.contains("student-menu-open")&&!bar.contains(event.target)&&!sidebar.contains(event.target))close();
 });
 document.addEventListener("keydown",event=>{
  if(event.key==="Escape"&&shell.classList.contains("student-menu-open")){close();button.focus()}
 });
 window.addEventListener("resize",()=>{if(window.innerWidth>850)close()});
})();
