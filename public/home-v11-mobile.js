/* Mobile-only homepage pricing selector; desktop shows the original three cards. */
(function(){
 "use strict";
 const root=document.querySelector(".home-v10");
 if(!root)return;
 const tabs=[...root.querySelectorAll(".h11-mobile-pricing-tabs [data-h11-choice]")];
 const cards=[...root.querySelectorAll(".h10-price-grid [data-h11-plan]")];
 if(tabs.length!==3||cards.length!==3)return;
 const media=window.matchMedia("(max-width: 600px)");
 let selected="plus";
 function paint(){
  const mobile=media.matches;
  for(const btn of tabs){
   const active=btn.dataset.h11Choice===selected;
   btn.classList.toggle("is-active",active);
   btn.setAttribute("aria-selected",String(active));
   btn.tabIndex=active?0:-1;
  }
  for(const card of cards){
   const active=card.dataset.h11Plan===selected;
   card.classList.toggle("is-active-mobile",active);
   if(mobile){
    card.setAttribute("aria-hidden",String(!active));
    card.inert=!active;
   }else{
    card.removeAttribute("aria-hidden");
    card.inert=false;
   }
  }
 }
 tabs.forEach((tab,index)=>{
  tab.addEventListener("click",()=>{selected=tab.dataset.h11Choice||"plus";paint()});
  tab.addEventListener("keydown",e=>{
   const dir=e.key==="ArrowRight"?1:e.key==="ArrowLeft"?-1:0;
   if(!dir&&e.key!=="Home"&&e.key!=="End")return;
   e.preventDefault();
   const target=e.key==="Home"?0:e.key==="End"?tabs.length-1:(index+dir+tabs.length)%tabs.length;
   selected=tabs[target].dataset.h11Choice||"plus";paint();tabs[target].focus();
  });
 });
 if(media.addEventListener)media.addEventListener("change",paint);
 else media.addListener(paint);
 paint();
})();