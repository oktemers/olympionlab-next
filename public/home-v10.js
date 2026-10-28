/* Home interactions are homepage-only. Shared navigation/footer scripts remain unchanged. */
(function(){
"use strict";
const root=document.querySelector(".home-v10");if(!root)return;
const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const plot=root.querySelector("#quizArc"),dot=root.querySelector("#quizDot"),feedback=root.querySelector("#homeQuizFeedback");
const choices=[...root.querySelectorAll(".h10-answer-row button")];
let quizAnimation=0;
function pathFor(angle){
  const rad=angle*Math.PI/180;
  const speed=18,g=9.81,range=speed*speed*Math.sin(2*rad)/g,height=speed*speed*Math.sin(rad)**2/(2*g);
  const maxRange=speed*speed/g,maxH=speed*speed/(2*g);
  const x0=25,y0=138,scaleX=410/maxRange,scaleY=113/maxH;
  let d="";
  const time=2*speed*Math.sin(rad)/g;
  for(let i=0;i<=75;i++){
    const t=i/75*time,x=speed*Math.cos(rad)*t,y=Math.max(0,speed*Math.sin(rad)*t-.5*g*t*t);
    d+=(i===0?"M":"L")+(x0+x*scaleX).toFixed(2)+" "+(y0-y*scaleY).toFixed(2)+" ";
  }
  return d;
}
function renderArc(angle){
  if(!plot||!dot)return;
  cancelAnimationFrame(quizAnimation);
  plot.setAttribute("d",pathFor(angle));
  const total=plot.getTotalLength();
  const move=progress=>{const p=plot.getPointAtLength(Math.min(total,Math.max(0,total*progress)));dot.setAttribute("cx",p.x.toFixed(2));dot.setAttribute("cy",p.y.toFixed(2));};
  if(reduce){move(1);return;}
  let begin;
  function frame(t){
    if(begin===undefined)begin=t;
    const progress=Math.min(1,(t-begin)/1250);move(progress);
    if(progress<1)quizAnimation=requestAnimationFrame(frame);
  }
  quizAnimation=requestAnimationFrame(frame);
}
renderArc(45);
for(const btn of choices){
  btn.addEventListener("click",()=>{
    const angle=Number(btn.dataset.angle);
    choices.forEach(b=>b.setAttribute("aria-pressed",String(b===btn)));
    renderArc(angle);
    if(feedback){
      feedback.textContent=angle===45?
        "Doğru! R = v²·sin(2θ)/g. 45° için sin(90°) = 1 ve menzil en büyüktür.":
        "Güzel deneme. 30° ve 60° aynı menzili verir; sin(2θ) en yüksek değerini 45° açıda alır.";
      feedback.style.color=angle===45?"#8cf6d6":"#bedcf0";
    }
  });
}
const wave=root.querySelector(".h10-wave-line"),waveDot=root.querySelector(".h10-wave-ball");
if(wave&&waveDot&&!reduce){
 const length=wave.getTotalLength();
 let last=0;
 function animate(t){
   if(document.visibilityState!=="hidden"&&t-last>33){
     last=t;
     const p=wave.getPointAtLength(length*((t/6000)%1));
     waveDot.setAttribute("cx",p.x.toFixed(2));waveDot.setAttribute("cy",p.y.toFixed(2));
   }
   requestAnimationFrame(animate);
 }
 requestAnimationFrame(animate);
}
})();