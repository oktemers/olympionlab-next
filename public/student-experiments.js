(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const pendulum=$("pendulumCanvas"), projectile=$("projectileCanvas"), vector=$("vectorCanvas"), field=$("fieldCanvas");
  const length=$("pendulumLength"), angle=$("projectileAngle"), speed=$("projectileSpeed");
  const voltage=$("ohmVoltage"), resistance=$("ohmResistance");
  const magnitude=$("vectorMag"), vectorAngle=$("vectorAngle");
  const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const g=9.81;
  const size=canvas=>{
    if(!canvas)return null;
    const rect=canvas.getBoundingClientRect(),w=Math.max(1,rect.width),h=Math.max(1,rect.height),d=Math.min(window.devicePixelRatio||1,2);
    if(canvas.width!==Math.round(w*d)||canvas.height!==Math.round(h*d)){canvas.width=Math.round(w*d);canvas.height=Math.round(h*d)}
    const ctx=canvas.getContext("2d");if(!ctx)return null;
    ctx.setTransform(d,0,0,d,0,0);
    return {ctx,w,h};
  };
  const bg=({ctx,w,h})=>{
    ctx.clearRect(0,0,w,h);ctx.fillStyle="#07192a";ctx.fillRect(0,0,w,h);
    ctx.lineWidth=1;ctx.strokeStyle="rgba(124,242,255,.075)";ctx.beginPath();
    for(let x=0;x<w;x+=28){ctx.moveTo(x,0);ctx.lineTo(x,h)}
    for(let y=0;y<h;y+=28){ctx.moveTo(0,y);ctx.lineTo(w,y)}
    ctx.stroke();
  };
  const text=(ctx,s,x,y,color="#b8d8e9",font="12px system-ui")=>{ctx.fillStyle=color;ctx.font=font;ctx.fillText(s,x,y)};
  const arrow=(ctx,x1,y1,x2,y2,color,width=3)=>{
    const a=Math.atan2(y2-y1,x2-x1),head=Math.min(13,Math.max(8,width*3));
    ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=width;ctx.lineCap="round";
    ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-head*Math.cos(a-.48),y2-head*Math.sin(a-.48));ctx.lineTo(x2-head*Math.cos(a+.48),y2-head*Math.sin(a+.48));ctx.closePath();ctx.fill();
  };
  const circle=(ctx,x,y,r,color)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill()};
  function drawPendulum(t){
    const d=size(pendulum);if(!d)return;bg(d);const {ctx,w,h}=d;
    const L=Number(length?.value||95),m=L/100,period=2*Math.PI*Math.sqrt(m/g),rope=Math.min(h-66,L*.96);
    const ox=w/2,oy=25,theta=.42*Math.sin(t/1000*2*Math.PI/period),x=ox+Math.sin(theta)*rope,y=oy+Math.cos(theta)*rope;
    ctx.strokeStyle="rgba(124,242,255,.25)";ctx.lineWidth=1;ctx.beginPath();ctx.arc(ox,oy,rope,Math.PI*.20,Math.PI*.80);ctx.stroke();
    ctx.strokeStyle="#b5e4f5";ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(x,y);ctx.stroke();
    const glow=ctx.createRadialGradient(x,y,2,x,y,25);glow.addColorStop(0,"rgba(133,169,255,.56)");glow.addColorStop(1,"rgba(133,169,255,0)");circle(ctx,x,y,25,glow);circle(ctx,x,y,15,"#89a9ff");
    ctx.fillStyle="#7aeaf4";ctx.fillRect(ox-30,oy-5,60,9);
    text(ctx,"L = "+m.toFixed(2)+" m",14,22);
    const label=$("pendulumLabel");if(label)label.textContent="Periyot: yaklaşık "+period.toFixed(2).replace(".",",")+" sn";
  }
  let launchAt=0;
  function resetLaunch(){launchAt=performance.now()}
  function drawProjectile(t){
    const d=size(projectile);if(!d)return;bg(d);const {ctx,w,h}=d;
    const degrees=Number(angle?.value||45),v=Number(speed?.value||16),rad=degrees*Math.PI/180;
    const flight=2*v*Math.sin(rad)/g,range=v*v*Math.sin(2*rad)/g,height=v*v*Math.sin(rad)**2/(2*g);
    const x0=28,y0=h-26,usableW=Math.max(1,w-61),usableH=Math.max(1,h-65);
    const maxRange=26*26/g,maxHeight=26*26/(2*g);
    const projectX=x=>x0+usableW*(x/maxRange);
    const projectY=y=>y0-usableH*(y/maxHeight);
    ctx.strokeStyle="#6d98b7";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(x0,14);ctx.lineTo(x0,y0);ctx.lineTo(w-14,y0);ctx.stroke();
    // The scale is shared between all speeds and angles, so longer ranges really appear longer.
    ctx.setLineDash([5,6]);ctx.strokeStyle="rgba(152,196,218,.38)";ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(projectX(range),y0);ctx.lineTo(projectX(range),y0-usableH*.85);ctx.stroke();ctx.setLineDash([]);
    const elapsed=reduce?flight*.6:Math.max(0,(t-launchAt)/1000)*1.25;
    const phase=elapsed/flight;
    const progress=reduce?.64:phase>1.55?0:Math.min(1,phase);
    if(!reduce&&phase>1.55)launchAt=t;
    const travel=(u)=>{const sec=u*flight;return {x:Math.max(0,v*Math.cos(rad)*sec),y:Math.max(0,v*Math.sin(rad)*sec-.5*g*sec*sec)}};
    ctx.lineWidth=2.7;ctx.strokeStyle="#79e9f6";ctx.beginPath();
    const points=64;
    for(let i=0;i<=points;i++){const q=travel(i/points),px=projectX(q.x),py=projectY(q.y);if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)}
    ctx.stroke();
    const tail=ctx.createLinearGradient(x0,y0,projectX(range),y0);tail.addColorStop(0,"rgba(124,242,255,.7)");tail.addColorStop(1,"rgba(138,171,255,.1)");
    ctx.beginPath();
    for(let i=0;i<=36;i++){const q=travel(progress*i/36),px=projectX(q.x),py=projectY(q.y);if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py)}
    ctx.strokeStyle=tail;ctx.lineWidth=5;ctx.stroke();
    const ball=travel(progress),bx=projectX(ball.x),by=projectY(ball.y);
    const glow=ctx.createRadialGradient(bx,by,2,bx,by,24);glow.addColorStop(0,"rgba(143,172,255,.65)");glow.addColorStop(1,"rgba(143,172,255,0)");
    circle(ctx,bx,by,24,glow);circle(ctx,bx,by,9,"#a4b9ff");circle(ctx,bx-2,by-3,3,"#ecfbff");
    const label=$("projectileRange");if(label)label.textContent=degrees+"° · Menzil ≈ "+range.toFixed(1).replace(".",",")+" m · Tepe ≈ "+height.toFixed(1).replace(".",",")+" m";
    text(ctx,v+" m/s",14,21,"#c5e6f6");
  }
  function drawVector(t){
    const d=size(vector);if(!d)return;bg(d);const {ctx,w,h}=d;
    const mag=Number(magnitude?.value||92),rad=Number(vectorAngle?.value||38)*Math.PI/180;
    const R=(Math.min(w*.33,h*.37)-9)*(mag/160)+19,ox=w*.47,oy=h*.72;
    const vx=R*Math.cos(rad),vy=-R*Math.sin(rad),ex=ox+vx,ey=oy+vy;
    ctx.strokeStyle="rgba(177,209,232,.24)";ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(14,oy);ctx.lineTo(w-12,oy);ctx.moveTo(ox,10);ctx.lineTo(ox,h-10);ctx.stroke();
    ctx.setLineDash([5,6]);ctx.strokeStyle="rgba(132,182,222,.53)";ctx.beginPath();ctx.moveTo(ex,ey);ctx.lineTo(ex,oy);ctx.lineTo(ox,oy);ctx.stroke();ctx.setLineDash([]);
    arrow(ctx,ox,oy,ex,ey,"#7ceafa",3.5);
    ctx.strokeStyle="#91adff";ctx.lineWidth=2;ctx.beginPath();ctx.arc(ox,oy,29,-rad,0);ctx.stroke();
    const u=reduce?.7:((t/1800)%1);
    const sx=ox+vx*u,sy=oy+vy*u;
    circle(ctx,sx,sy,8,"rgba(124,242,255,.24)");circle(ctx,sx,sy,4,"#f1fdff");
    text(ctx,"Vx = "+(mag*Math.cos(rad)).toFixed(1),15,24,"#9de7ef");
    text(ctx,"Vy = "+(mag*Math.sin(rad)).toFixed(1),15,44,"#a9bcfa");
    text(ctx,Math.round(rad*180/Math.PI)+"°",ox+38,oy-12,"#ccfaff");
  }
  let polarity=1,cachedPaths=[],sizeKey="";
  $("flipChargeBtn")?.addEventListener("click",()=>{polarity*=-1;sizeKey=""});
  function fieldComponents(x,y,charges){
    let ex=0,ey=0;
    for(const q of charges){const dx=x-q.x,dy=y-q.y,r=Math.pow(dx*dx+dy*dy+130,1.5);ex+=q.sign*dx/r;ey+=q.sign*dy/r}
    return {ex,ey};
  }
  function rebuildField(w,h){
    const charges=[{x:w*.32,y:h*.51,sign:polarity},{x:w*.68,y:h*.51,sign:-polarity}];
    const start=charges[polarity===1?0:1],dest=charges[polarity===1?1:0];
    cachedPaths=[];
    for(let k=0;k<20;k++){
      const a=k*Math.PI*2/20;let x=start.x+18*Math.cos(a),y=start.y+18*Math.sin(a);const path=[];
      for(let n=0;n<230;n++){
        path.push({x,y});const v=fieldComponents(x,y,charges),len=Math.hypot(v.ex,v.ey)||1;
        x+=v.ex/len*3.1;y+=v.ey/len*3.1;
        if(Math.hypot(x-dest.x,y-dest.y)<15||x<2||y<2||x>w-2||y>h-2)break;
      }
      if(path.length>1)cachedPaths.push(path);
    }
    return charges;
  }
  function drawField(t){
    const d=size(field);if(!d)return;bg(d);const {ctx,w,h}=d;
    const key=w.toFixed(0)+"x"+h.toFixed(0)+"p"+polarity;
    if(key!==sizeKey){rebuildField(w,h);sizeKey=key}
    for(let i=0;i<cachedPaths.length;i++){
      const pts=cachedPaths[i];ctx.lineWidth=1.45;ctx.strokeStyle="rgba(124,228,248,.48)";
      ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);
      for(let j=1;j<pts.length;j++)ctx.lineTo(pts[j].x,pts[j].y);
      ctx.stroke();
      if(pts.length>4){
        const idx=reduce?Math.floor(pts.length*.45):Math.floor((t/52+i*16)%pts.length),point=pts[idx];
        circle(ctx,point.x,point.y,5,"rgba(117,231,247,.17)");circle(ctx,point.x,point.y,2.8,"#b4fcff");
      }
    }
    for(const q of [{x:w*.32,y:h*.51,sign:polarity},{x:w*.68,y:h*.51,sign:-polarity}]){
      const color=q.sign>0?"#7debf6":"#f2c67e";circle(ctx,q.x,q.y,19,color);
      ctx.textAlign="center";ctx.textBaseline="middle";text(ctx,q.sign>0?"+":"−",q.x,q.y+1,"#071827","bold 19px system-ui");ctx.textAlign="left";ctx.textBaseline="alphabetic";
    }
    text(ctx,"Alan çizgileri + yükten − yüke yönelir.",12,20,"#b2d9e9","11px system-ui");
  }
  function drawOhm(){
    const v=Number(voltage?.value||10),r=Number(resistance?.value||20),out=$("ohmResult");
    if(out)out.textContent="Akım "+(v/r).toFixed(2).replace(".",",")+" A";
  }
  function resetSettings(){resetLaunch();drawOhm()}
  for(const input of [length,angle,speed,magnitude,vectorAngle,voltage,resistance])input?.addEventListener("input",resetSettings);
  $("projectileReplay")?.addEventListener("click",resetLaunch);
  window.addEventListener("resize",()=>{sizeKey="";resetLaunch()});
  let last=0;
  function tick(t){
    if(document.visibilityState!=="hidden"&&(reduce||t-last>=30)){
      last=t;
      drawPendulum(reduce?0:t);drawProjectile(t);drawVector(t);drawField(t);
    }
    if(!reduce)requestAnimationFrame(tick);
  }
  resetLaunch();drawOhm();
  if(pendulum||projectile||vector||field){if(reduce)tick(performance.now());else requestAnimationFrame(tick)}
})();