(function(){
 const shell=document.querySelector(".app-page"), sidebar=shell?.querySelector(".app-sidebar");
 if(!sidebar||shell.dataset.olympionNav==="ready")return;
 shell.dataset.olympionNav="ready";sidebar.classList.add("student-unified-sidebar");sidebar.id="student-panel-sidebar";
 const entries=[["/panel","⌘","Genel"],["/kurslar","▶","Dersler"],["/yol-haritasi","◇","Yol Haritası"],["/notlar","▤","PDF Notları"],["/gunun-sorusu","✦","Günün Problemi"],["/yapay-zeka-kocu","✧","AI Koç"],["/student-labs","◈","Labs"],["/ayarlar","⚙","Ayarlar"]];
 const canon=window.location.pathname.replace(/\.html$/,"").replace(/\/$/,"");
 const active=(x)=>x===canon||(x==="/panel"&&["/dashboard","/panel"].includes(canon))||(x==="/student-labs"&&["/student-labs","/uygulama-laboratuvarlari"].includes(canon));
 sidebar.innerHTML='<a href="/panel" class="app-brand"><img src="/logo-icon.svg" width="42" height="42" alt=""><div>Olympion<small>Öğrenci Paneli</small></div></a><span class="student-menu-caption">ÇALIŞMA ALANIN</span><nav class="app-nav" aria-label="Öğrenci menüsü">'+entries.map(([href,icon,label])=>'<a href="'+href+'" class="app-link '+(active(href)?"active":"")+'" '+(active(href)?'aria-current="page"':"")+'><span aria-hidden="true">'+icon+"</span>"+label+"</a>").join("")+'</nav><div class="student-menu-bottom"><a class="student-plan-link" href="/fiyatlandirma">✦ Planları keşfet <span>↗</span></a><a href="/" class="back-site">← Ana sayfaya dön</a><form method="POST" action="/auth/signout"><button class="student-signout" type="submit">⏻ Çıkış Yap</button></form></div>';
 const bar=document.createElement("header");bar.className="student-mobile-bar";
 bar.innerHTML='<button type="button" class="student-menu-trigger" aria-controls="student-panel-sidebar" aria-expanded="false" aria-label="Öğrenci menüsünü aç"><span></span><span></span></button><a class="student-mobile-title" href="/panel"><img src="/logo-icon.svg" width="31" height="31" alt=""><span>Olympion<small>Öğrenci Paneli</small></span></a>';
 const scrim=document.createElement("button");scrim.type="button";scrim.className="student-menu-scrim";scrim.setAttribute("aria-label","Menüyü kapat");
 // HTML hidden must override display:grid/flex styling
 scrim.style.display="none";
 shell.prepend(bar);shell.append(scrim);
 const button=bar.querySelector("button");
 const close=()=>{shell.classList.remove("student-menu-open");scrim.style.display="none";button.setAttribute("aria-expanded","false");button.setAttribute("aria-label","Öğrenci menüsünü aç");document.body.style.overflow="";};
 const open=()=>{shell.classList.add("student-menu-open");scrim.style.display="block";button.setAttribute("aria-expanded","true");button.setAttribute("aria-label","Öğrenci menüsünü kapat");document.body.style.overflow="hidden";sidebar.querySelector("nav a")?.focus();};
 button.addEventListener("click",()=>shell.classList.contains("student-menu-open")?close():open());
 scrim.addEventListener("click",close);
 document.addEventListener("keydown",e=>{if(e.key==="Escape")close();});
 window.addEventListener("resize",()=>{if(window.innerWidth>850)close();});
 sidebar.addEventListener("click",e=>{if(e.target.closest("a"))close();});
})();