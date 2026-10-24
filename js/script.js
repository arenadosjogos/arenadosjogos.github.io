// LÓGICA DO SITE: desenha as artes, monta os cartões, filtros, ficha e gráfico.
// Usa as listas GAMES e STEAM que vêm do arquivo dados.js.

/* ---- arte original gerada em canvas ---- */
function rng(seed){let s=0;for(const c of seed)s=(s*31+c.charCodeAt(0))>>>0;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296);}
function draw(cv,g){
  const W=cv.width=640,H=cv.height=360,x=cv.getContext("2d"),r=rng(g.id),c=g.color;
  const bg=x.createLinearGradient(0,0,W,H);bg.addColorStop(0,"#0d0f1c");bg.addColorStop(1,"#1d2140");x.fillStyle=bg;x.fillRect(0,0,W,H);
  x.globalAlpha=1;
  if(g.motif==="blocks"){const s=40;for(let col=0;col<W/s;col++){const h=3+Math.floor(r()*5);for(let k=0;k<h;k++){x.fillStyle=k===h-1?c:(k%2?"#7a5233":"#5c3d26");x.globalAlpha=k===h-1?1:.9;x.fillRect(col*s+1,H-(k+1)*s+1,s-2,s-2);}}}
  if(g.motif==="bricks"){for(let i=0;i<26;i++){const w=60+r()*90,h=40+r()*60,px=r()*W,py=r()*H;x.globalAlpha=.25+r()*.6;x.fillStyle=i%3?c:"#eef0fb";x.beginPath();x.roundRect(px-w/2,py-h/2,w,h,6);x.fill();x.globalAlpha=.5;x.fillStyle="#0d0f1c";x.beginPath();x.arc(px-w/4,py-h/2,6,0,7);x.arc(px+w/4,py-h/2,6,0,7);x.fill();}}
  if(g.motif==="storm"){const cx=W*(.35+r()*.3),cy=H*.55;for(let i=10;i>0;i--){x.globalAlpha=.08*i;x.strokeStyle=c;x.lineWidth=3;x.beginPath();x.arc(cx,cy,i*34,0,7);x.stroke();}x.globalAlpha=1;for(let i=0;i<40;i++){const a=r()*7,d=r()*170;x.fillStyle=i%5?"#eef0fb":c;x.fillRect(cx+Math.cos(a)*d,cy+Math.sin(a)*d,4,4);}}
  if(g.motif==="lanes"){x.strokeStyle=c;x.lineWidth=14;x.globalAlpha=.85;x.beginPath();x.moveTo(60,H-40);x.lineTo(60,50);x.lineTo(W-60,50);x.moveTo(60,H-40);x.lineTo(W-60,40);x.moveTo(60,H-40);x.lineTo(W-60,H-40);x.lineTo(W-60,50);x.stroke();x.globalAlpha=1;[[60,H-40],[W-60,50]].forEach(([a,b],i)=>{x.fillStyle=i?"#eef0fb":c;x.beginPath();x.arc(a,b,28,0,7);x.fill();});for(let i=0;i<14;i++){x.fillStyle="#9aa0c3";x.globalAlpha=.5;x.beginPath();x.arc(80+r()*(W-160),70+r()*(H-140),5+r()*8,0,7);x.fill();}}
  if(g.motif==="cross"){const cx=W*.5,cy=H*.5;x.fillStyle="#272c4a";for(let i=0;i<7;i++){x.fillRect(r()*W,H*.35+r()*H*.5,40+r()*90,30+r()*80);}x.strokeStyle=c;x.lineWidth=4;x.beginPath();x.arc(cx,cy,70,0,7);x.stroke();[[-110,-30],[30,110]].forEach(([a,b])=>{x.beginPath();x.moveTo(cx+a,cy);x.lineTo(cx+b,cy);x.moveTo(cx,cy+a);x.lineTo(cx,cy+b);x.stroke();});x.fillStyle=c;x.beginPath();x.arc(cx,cy,5,0,7);x.fill();}
  if(g.motif==="map"){for(let i=0;i<9;i++){x.strokeStyle=c;x.globalAlpha=.15+i*.07;x.lineWidth=2;x.beginPath();const ox=W*.5+(r()-.5)*80,oy=H*.5+(r()-.5)*60;for(let a=0;a<=6.3;a+=.2){const rr=20+i*26+Math.sin(a*3+i)*10;const px=ox+Math.cos(a)*rr*1.5,py=oy+Math.sin(a)*rr;a?x.lineTo(px,py):x.moveTo(px,py);}x.closePath();x.stroke();}x.globalAlpha=1;x.strokeStyle="#eef0fb";x.setLineDash([8,8]);x.beginPath();x.moveTo(0,40);x.lineTo(W,H-30);x.stroke();x.setLineDash([]);}
  if(g.motif==="city"){const sun=x.createRadialGradient(W*.7,H*.45,10,W*.7,H*.45,160);sun.addColorStop(0,"#ffc24b");sun.addColorStop(1,"rgba(255,90,78,0)");x.fillStyle=sun;x.fillRect(0,0,W,H);let px=0;while(px<W){const w=30+r()*50,h=60+r()*200;x.fillStyle="#0a0c18";x.fillRect(px,H-h,w,h);x.fillStyle=c;x.globalAlpha=.7;for(let wy=H-h+10;wy<H-10;wy+=16)for(let wx=px+6;wx<px+w-8;wx+=12)if(r()>.6)x.fillRect(wx,wy,5,7);x.globalAlpha=1;px+=w+4;}}
  const sh=x.createLinearGradient(0,H*.5,0,H);sh.addColorStop(0,"rgba(13,15,28,0)");sh.addColorStop(1,"rgba(13,15,28,.7)");x.globalAlpha=1;x.fillStyle=sh;x.fillRect(0,0,W,H);
}

/* ---- render ---- */
const genres=["Todos",...new Set(GAMES.map(g=>g.genre))];
let cur="Todos";
const chips=document.getElementById("chips"),grid=document.getElementById("grid"),sortSel=document.getElementById("sort");
genres.forEach(gn=>{const b=document.createElement("button");b.className="chip";b.textContent=gn;b.setAttribute("aria-pressed",gn===cur);b.onclick=()=>{cur=gn;[...chips.children].forEach(c=>c.setAttribute("aria-pressed",c.textContent===cur));render();};chips.appendChild(b);});
sortSel.onchange=render;

function render(){
  let list=GAMES.filter(g=>cur==="Todos"||g.genre===cur);
  const s=sortSel.value;
  list.sort((a,b)=>s==="year"?b.year-a.year:s==="name"?a.name.localeCompare(b.name):a.rank-b.rank);
  grid.innerHTML="";
  list.forEach(g=>{
    const el=document.createElement("button");el.className="card";el.style.setProperty("--c",g.color);
    el.setAttribute("aria-label",`Ver detalhes de ${g.name}`);
    el.innerHTML=`<div class="art"><canvas></canvas><span class="rank">#${g.rank}</span><span class="genre">${g.genre}</span></div>
      <div class="body"><h3>${g.name}</h3><p>${g.short}</p>
      <div class="stat"><b>${g.stat}</b><span>${g.statLabel}</span></div></div>`;
    draw(el.querySelector("canvas"),g);
    el.onclick=()=>open(g);
    grid.appendChild(el);
  });
}

const ov=document.getElementById("overlay"),sheet=document.getElementById("sheet");let last=null;
function open(g){
  last=document.activeElement;sheet.style.setProperty("--c",g.color);
  sheet.innerHTML=`<div class="art"><canvas></canvas><span class="genre">${g.genre}</span></div>
   <div class="in"><div class="eyebrow">#${g.rank} no ranking</div><h3 id="mTitle">${g.name}</h3>
   <p>${g.long}</p>
   <div class="facts">
     <div><small>Números</small><b>${g.stat}</b> ${g.statLabel}</div>
     <div><small>Lançamento</small><b>${g.year}</b></div>
     <div><small>Desenvolvedora</small><b>${g.dev}</b></div>
     <div><small>Onde jogar</small><b>${g.plat}</b> · ${g.price}</div>
   </div>
   <p class="why"><strong>Por que jogar:</strong> ${g.why}</p>
   <button class="close" id="closeBtn">Fechar</button></div>`;
  draw(sheet.querySelector("canvas"),g);
  ov.hidden=false;document.getElementById("closeBtn").onclick=close;document.getElementById("closeBtn").focus();
}
function close(){ov.hidden=true;last&&last.focus();}
ov.addEventListener("click",e=>{if(e.target===ov)close();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!ov.hidden)close();});

/* gráfico */
const max=STEAM[0][1],rows=document.getElementById("rows");
STEAM.forEach(([n,v])=>{const d=document.createElement("div");d.className="row";
  d.innerHTML=`<span class="n">${n}</span><div class="track"><div class="fill"></div></div><span class="v">${(v/1e6).toLocaleString("pt-BR",{maximumFractionDigits:2})} mi</span>`;
  d.querySelector(".fill").style.setProperty("--w",`${(v/max*100).toFixed(1)}%`);
  rows.appendChild(d);});

render();
