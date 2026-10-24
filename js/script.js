// LÓGICA DO SITE: desenha as cenas em pixel art, monta os cartões, filtros, ficha e gráfico.
// Usa as listas GAMES e STEAM que vêm do arquivo dados.js.

/* ---- pixel art: cada jogo tem uma cena de 160x90 pixels, ampliada na tela ---- */
const W=160,H=90;
function rng(seed){let s=0;for(const c of seed)s=(s*31+c.charCodeAt(0))>>>0;return()=>((s=(s*1664525+1013904223)>>>0)/4294967296);}
function px(x,c,X,Y,w=1,h=1){x.fillStyle=c;x.fillRect(Math.round(X),Math.round(Y),w,h);}
// desenha um sprite: cada letra da linha vira um pixel com a cor da paleta ("." = vazio)
function spr(x,rows,pal,X,Y,s=1){rows.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(row[i]!==".")px(x,pal[row[i]],X+i*s,Y+j*s,s,s);});}
function hex(c){return[1,3,5].map(i=>parseInt(c.slice(i,i+2),16));}
// céu em faixas de cor, no estilo dos jogos antigos
function sky(x,top,bottom,y0=0,y1=H,bands=7){const a=hex(top),b=hex(bottom),h=(y1-y0)/bands;
  for(let i=0;i<bands;i++){const k=i/(bands-1);x.fillStyle=`rgb(${a.map((v,j)=>Math.round(v+(b[j]-v)*k))})`;x.fillRect(0,Math.floor(y0+i*h),W,Math.ceil(h)+1);}}
function disc(x,c,cx,cy,r){for(let dy=-r;dy<=r;dy++){const w=Math.round(Math.sqrt(r*r-dy*dy));px(x,c,cx-w,cy+dy,w*2,1);}}
function ring(x,c,cx,cy,r,ry=1,step=.12){for(let a=0;a<6.29;a+=step)px(x,c,cx+Math.cos(a)*r,cy+Math.sin(a)*r*ry);}
function line(x,c,[x0,y0],[x1,y1],w=1){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0),1);for(let i=0;i<=n;i++)px(x,c,x0+(x1-x0)*i/n-w/2,y0+(y1-y0)*i/n-w/2,w,w);}
function wrap(v,min,max){const s=max-min;return((v-min)%s+s)%s+min;}
function cloud(x,X,Y){px(x,"#ffffff",X,Y,18,4);px(x,"#ffffff",X+4,Y-3,9,3);}
function palm(x,X,Y,leaf,trunk="#6b4423"){for(let i=0;i<16;i++)px(x,trunk,X+Math.round(Math.sin(i/6)*2),Y+i,2,1);
  [[-9,-1],[2,-1],[-7,-3],[0,-3],[-5,1],[3,1],[-11,1],[5,3]].forEach(([dx,dy])=>px(x,leaf,X+dx,Y+dy,8,2));}
// ponto ao longo de um caminho (lista de pontos), p de 0 a 1
function along(path,p){const seg=[];let tot=0;for(let i=0;i<path.length-1;i++){const a=path[i],b=path[i+1],l=Math.hypot(b[0]-a[0],b[1]-a[1]);seg.push([a,b,l]);tot+=l;}
  let d=p*tot;for(const[a,b,l]of seg){if(d<=l)return[a[0]+(b[0]-a[0])*d/l,a[1]+(b[1]-a[1])*d/l];d-=l;}return path[path.length-1];}

const BLOCK={grass:["#5fbf3f","#4ea832"],dirt:["#8a5a35","#6e4526"],stone:["#8c8c8c","#6f6f6f"],leaf:["#3f9b2f","#2f7d22"],ore:["#8c8c8c","#3fe0e0"]};
function block(x,X,Y,type,r,s=8){const[a,b]=BLOCK[type];px(x,a,X,Y,s,s);for(let i=0;i<s*s/4;i++)px(x,b,X+Math.floor(r()*s),Y+Math.floor(r()*s));
  if(type==="grass"){px(x,BLOCK.dirt[0],X,Y+3,s,s-3);for(let i=0;i<10;i++)px(x,BLOCK.dirt[1],X+Math.floor(r()*s),Y+3+Math.floor(r()*(s-3)));}}
function crate(x,X,Y,s){px(x,"#5a3c1c",X,Y,s,s);px(x,"#a8743a",X+1,Y+1,s-2,s-2);line(x,"#7a5226",[X+2,Y+2],[X+s-3,Y+s-3]);line(x,"#7a5226",[X+s-3,Y+2],[X+2,Y+s-3]);}

const AVATAR=["..YYYY..","..kYYk..","..YYYY..","..YkkY..","YBBBBBBY","YBBBBBBY","YBBBBBBY",".BBBBBB.",".GG..GG.",".GG..GG."];
const MINER=["HHHHHH","HSSSSH","SkSSkS","SSSSSS","CCCCCC","CCCCCC","SCCCCS","SCCCCS","PPPPPP","PP..PP","PP..PP","GG..GG"];
const BUS=["..bbbbbbbbbb..",".bwwbwwbwwbwwb","bbbbbbbbbbbbbb","bYYYYYYYYYYYYb","bbbbbbbbbbbbbb",".kk........kk."];
const BALLOON=["..BBBB..",".BBBBBB.","BBBBBBBB","BBBBBBBB",".BBBBBB.","..BBBB..","..w..w..","..w..w.."];
const CHUTE=["..RRRRR..",".RWRWRWR.","RRRRRRRRR","w.......w",".w.....w.","..w...w..","...wkw...","....k...."];
const MINI_CHUTE=["RRRRR","w...w",".w.w.","..k.."];
const PLANE=["......g.....",".....ggg....","gggggggggggg",".....ggg....","....ggggg..."];
const CAR=["......RRRRRRR.......","....RRcccccccRR.....","RRRRRRRRRRRRRRRRRRRY","RRRRRRRRRRRRRRRRRRRR",".kkk..........kkk..."];
const SPIKE=["...r...","..rrr..",".rrwrr.","rrwwwrr",".rrwrr.","..rrr..","...r..."];
const AGENT=["..kkk..",".kkkkk.",".kccck.","..kkk..",".kkkkk.","kkkkkkk","k.kkk.k","k.kkk.k","..k.k..","..k.k..","..k.k..",".kk.kk."];
const CRACKS=[[3,3],[4,4],[2,4],[5,3],[1,5],[6,2],[2,2],[5,5],[3,6],[6,6],[1,1],[4,1],[0,4],[7,3],[3,0],[4,7]];
const MC_H=[4,4,5,4,3,3,4,4,5,5,4,3,3,4,4,5,4,4,3,4];
const MA=[14,78],MB=[146,12],MPATHS=[[MA,[14,12],MB],[MA,MB],[MA,[146,78],MB]];

// mapa de MOBA visto de cima (League of Legends e Dota 2): rotas, rio, torres e bases
function mobaBg(x,r,o){px(x,o.ground,0,0,W,H);for(let i=0;i<240;i++)px(x,r()>.5?o.tree:o.tree2,r()*W,r()*H,2,2);
  line(x,o.river,[14,12],[146,78],7);MPATHS.forEach(p=>{for(let i=0;i<p.length-1;i++)line(x,o.lane,p[i],p[i+1],4);});
  [[[14,48],[50,78],[54,58]],[[110,12],[146,42],[106,32]]].forEach((ts,k)=>ts.forEach(([a,b])=>{px(x,"#000",a-3,b-3,6,6);px(x,k?o.red:o.blue,a-2,b-2,4,4);}));}
function mobaFg(x,t,o){const s=t%10<5?1:0;
  [[MA,o.blue],[MB,o.red]].forEach(([[a,b],c])=>{px(x,"#000",a-7-s,b-7-s,14+2*s,14+2*s);px(x,c,a-6-s,b-6-s,12+2*s,12+2*s);px(x,"#ffffff",a-2,b-2,4,4);});
  MPATHS.forEach(p=>{const rev=[...p].reverse();for(let k=0;k<3;k++){const q=(t*.006+k*.035)%.5;let[a,b]=along(p,q);px(x,o.blue,a-1,b-1,3,3);[a,b]=along(rev,q);px(x,o.red,a-1,b-1,3,3);}});}
const LOL={ground:"#2a5e35",tree:"#1f4a2a",tree2:"#36703f",river:"#3a7fc4",lane:"#a8875a",blue:"#3fa9f5",red:"#ff4f5e"};
const DOTA={ground:"#22301f",tree:"#142012",tree2:"#2c3d24",river:"#2d4f6e",lane:"#6e5a3e",blue:"#5fd068",red:"#d6453d"};

// bg: parte parada (desenhada uma vez); fg: parte animada (redesenhada a cada quadro t)
const SCENES={
  roblox:{
    bg(x){sky(x,"#4a9eff","#bfe3ff",0,70);px(x,"#3f9b4a",0,70,W,20);for(let i=2;i<W;i+=8)for(let j=73;j<H;j+=6)px(x,"#368a40",i,j,3,2);},
    fg(x,t){for(let i=0;i<3;i++)cloud(x,wrap(i*60+t*.4*(i+1),-20,W),10+i*8);
      const cols=["#ff5a4e","#ffc24b","#3fa9f5","#b98bff"];
      [[6,58],[32,44],[110,40],[134,56]].forEach(([bx,by],i)=>{by+=Math.round(Math.sin((t+i*7)/5)*2);px(x,cols[i],bx,by,22,6);px(x,"rgba(255,255,255,.35)",bx,by,22,1);for(let k=0;k<3;k++)px(x,cols[i],bx+3+k*7,by-2,4,2);});
      const jump=Math.round(Math.abs(Math.sin(t/4))*14);px(x,"rgba(0,0,0,.25)",72,69,16,2);
      spr(x,AVATAR,{Y:"#ffd23f",k:"#1a1a1a",B:"#2f6fdd",G:"#3fbf5a"},72,50-jump,2);}},
  minecraft:{
    bg(x,r){sky(x,"#6fb6ff","#d4ecff");px(x,"#fff6a8",126,8,12,12);px(x,"#fffbe0",128,10,8,8);
      MC_H.forEach((h,c)=>{for(let k=0;k<h;k++)block(x,c*8,H-(k+1)*8,k===h-1?"grass":r()>.8?"stone":"dirt",r);});
      const ty=H-MC_H[3]*8;px(x,"#6b4423",27,ty-16,3,16);[[19,-28],[25,-28],[31,-28],[19,-22],[25,-22],[31,-22],[25,-34]].forEach(([a,b])=>block(x,a,ty+b,"leaf",r,6));},
    fg(x,t){for(let i=0;i<2;i++)px(x,"#ffffff",wrap(i*80+t*.5,-24,W),10+i*10,24,5);
      const cyc=t%32,ox=96,oy=H-MC_H[12]*8-8,my=H-MC_H[11]*8-12;
      if(cyc<24){block(x,ox,oy,"ore",rng("ore"));CRACKS.slice(0,Math.floor(cyc/6)*4).forEach(([a,b])=>px(x,"#1a1a1a",ox+a,oy+b));}
      else{const k=cyc-24;for(let i=0;i<8;i++){const a=i/8*6.28;px(x,i%2?"#3fe0e0":"#8c8c8c",ox+4+Math.cos(a)*k*2,oy+4+Math.sin(a)*k*2-k,2,2);}}
      spr(x,MINER,{H:"#4a2f1a",S:"#e0a878",k:"#2b1a10",C:"#2fb5b5",P:"#3a3fa0",G:"#555555"},88,my);
      if(t%4<2){px(x,"#6b4423",94,my+1,1,6);px(x,"#9a9a9a",92,my,5,1);}else{line(x,"#6b4423",[93,my+7],[98,my+5]);px(x,"#9a9a9a",98,my+2,1,5);}}},
  fortnite:{
    bg(x){sky(x,"#2f7de1","#a8dcff",0,64);for(let X=0;X<W;X++){const h=Math.round(Math.sin(X/20)*4+Math.sin(X/9)*2);px(x,"#58b947",X,60+h,1,H);}px(x,"#4aa33c",0,76,W,14);
      [[14,58],[40,62],[150,60]].forEach(([a,b])=>{px(x,"#6b4423",a,b,2,8);disc(x,"#2f8f3a",a+1,b-3,5);});
      for(let i=0;i<8;i++){px(x,"#8a5a2b",96+i*4,72-i*4,5,4);px(x,"#c48a4a",96+i*4,72-i*4,5,1);}
      px(x,"#a0703a",128,40,4,34);for(let y=42;y<74;y+=6)px(x,"#7a4f22",128,y,4,1);},
    fg(x,t){const R=95-(t%120)*.45;x.fillStyle="rgba(130,50,230,.4)";x.beginPath();x.rect(0,0,W,H);x.moveTo(80+R,62);x.arc(80,62,R,0,7);x.fill("evenodd");ring(x,"#e0c4ff",80,62,R,1,.02);
      const bx=wrap(t*1.6,-30,W+10);spr(x,BALLOON,{B:"#3fa9f5",w:"#ffffff"},bx+3,6);spr(x,BUS,{b:"#2f6fdd",w:"#cfefff",Y:"#ffd23f",k:"#1a1a1a"},bx,22);}},
  freefire:{
    bg(x){sky(x,"#ff6a3d","#ffd27a",0,56);disc(x,"#fff1a8",118,44,14);
      for(let X=0;X<70;X++){const h=Math.round(Math.abs(Math.sin(X/18))*12+Math.sin(X/6)*2);px(x,"#3d6b3a",X,56-h,1,h);}
      px(x,"#1f7fb8",0,56,W,20);for(let X=0;X<W;X++){const top=74+Math.round(Math.sin(X/11)*2);px(x,"#f2d08a",X,top,1,H-top);}
      palm(x,20,58,"#2e5a2a");palm(x,138,60,"#2e5a2a");},
    fg(x,t){for(let i=0;i<8;i++)px(x,"rgba(255,255,255,.7)",wrap(i*22+t,-6,W),60+(i%3)*4,5,1);
      spr(x,PLANE,{g:"#3b3b46"},wrap(t*1.4,-14,W+14),8);
      for(let i=0;i<3;i++)spr(x,CHUTE,{R:"#ff4d2e",W:"#ffd23f",w:"#ffffff",k:"#1a1a1a"},22+i*48+Math.sin(t/6+i)*3,wrap(t*.5+i*25,8,70));}},
  lol:{bg(x,r){mobaBg(x,r,LOL);},fg(x,t){mobaFg(x,t,LOL);}},
  cs2:{
    bg(x,r){sky(x,"#8ec9ff","#d7ecff",0,24);px(x,"#d9b77a",0,22,W,50);
      for(let y=26;y<72;y+=6){px(x,"#c49d5e",0,y,W,1);for(let X=(y/6%2)*6;X<W;X+=12)px(x,"#c49d5e",X,y,1,6);}
      px(x,"#2a1d12",66,38,28,34);px(x,"#2a1d12",70,34,20,4);px(x,"#2a1d12",74,31,12,3);
      spr(x,[".RRRR.","R....R","R....R","RRRRRR","R....R","R....R"],{R:"#b8342b"},124,34,2);
      px(x,"#c9a265",0,72,W,18);for(let i=0;i<60;i++)px(x,"#b38d55",r()*W,72+r()*18);
      crate(x,8,50,22);crate(x,30,58,14);crate(x,12,36,14);},
    fg(x,t){px(x,"#1f1f18",98,77,16,8);px(x,"#3b3b2e",99,78,14,6);px(x,"#0b2a0b",101,79,7,3);px(x,"#5dff5d",102,80,(t%10)/2+1|0,1);
      px(x,t%6<3?"#ff2a2a":"#5a1010",110,79,2,2);px(x,"#dd4433",99,84,14,1);
      if(t%28<2){px(x,"#ffe066",78,50,6,3);px(x,"#ffffff",80,51,3,1);}
      const cx=80+Math.round(Math.sin(t/9)*22),cy=50+Math.round(Math.sin(t/6)*6),c="#5dff5d";
      px(x,c,cx-6,cy,4,1);px(x,c,cx+3,cy,4,1);px(x,c,cx,cy-6,1,4);px(x,c,cx,cy+3,1,4);}},
  valorant:{
    bg(x){px(x,"#0f1923",0,0,W,H);for(let y=60;y<H;y+=6)px(x,"#1b2a36",0,y,W,1);for(let i=-8;i<=8;i++)line(x,"#1b2a36",[80,60],[80+i*24,H]);
      for(let i=0;i<28;i++)px(x,"#ff4655",W-28+i,0,1,28-i);line(x,"#ff4655",[0,40],[50,0],3);line(x,"#ece8e1",[6,50],[58,8]);},
    fg(x,t){for(let k=0;k<3;k++){const rad=(t*1.5+k*14)%42+4;ring(x,rad<30?"#ff4655":"#7a2430",80,62,rad,.45,.1);}
      spr(x,SPIKE,{r:t%8<4?"#ff4655":"#ff8a96",w:"#ece8e1"},73,48,2);
      spr(x,AGENT,{k:"#ece8e1",c:"#3fe0e0"},22,38,2);
      x.globalAlpha=.35;disc(x,"#3fe0e0",128,50,13+(t%20<10?1:0));x.globalAlpha=1;}},
  pubg:{
    bg(x,r){px(x,"#b5a65a",0,0,W,H);for(let i=0;i<40;i++)px(x,r()>.5?"#97a04c":"#c9b86c",r()*W,r()*H,8+r()*20|0,6+r()*14|0);
      for(let X=0;X<W;X++)px(x,"#4f7fa6",X,60+Math.sin(X/14)*8,1,5);
      line(x,"#e3d9b5",[0,30],[160,45]);line(x,"#e3d9b5",[60,0],[75,90]);
      for(let i=0;i<14;i++){const hx=r()*W,hy=r()*H;px(x,"#000000",hx,hy,5,5);px(x,r()>.5?"#a33a2a":"#7d7d7d",hx,hy,4,4);}
      for(let X=0;X<W;X+=20)px(x,"rgba(0,0,0,.15)",X,0,1,H);for(let Y=0;Y<H;Y+=20)px(x,"rgba(0,0,0,.15)",0,Y,W,1);
      for(let i=0;i<W;i+=6)px(x,"#ffffff",i,8+i*.45,3,1);},
    fg(x,t){const p=(t*.006)%1.2,X=p*W;spr(x,PLANE,{g:"#e8e8e8"},X-6,6+X*.45);
      for(let k=1;k<=3;k++){const q=p-k*.12;if(q<0||q>1)continue;const dx=q*W,dy=8+dx*.45+(p-q)*90;if(dy<H-6)spr(x,MINI_CHUTE,{R:"#ff7a3d",w:"#ffffff",k:"#222222"},dx-2,dy);}
      px(x,"#000000",117,47,8,7);px(x,"#2f6fdd",118,48,6,5);px(x,"#ffd23f",118,50,6,1);
      for(let i=0;i<5;i++){const s=(t+i*4)%20;x.globalAlpha=1-s/20;px(x,"#ff3b3b",120+Math.sin((t+i*4)/3)*2,44-s*1.5,3,3);}x.globalAlpha=1;}},
  dota2:{bg(x,r){mobaBg(x,r,DOTA);},fg(x,t){mobaFg(x,t,DOTA);}},
  gta5:{
    bg(x,r){sky(x,"#1d0b3a","#7a2a7a",0,40,5);sky(x,"#ff5e62","#ffb36b",40,66,4);
      disc(x,"#ffd36b",112,62,18);for(let y=52;y<66;y+=4)px(x,"#ff8a6a",90,y,44,1);
      for(let X=0;X<W;X++){const h=Math.round(10+Math.sin(X/16)*5);px(x,"#3a1450",X,66-h,1,h);}
      let X=0;while(X<W){const w=6+Math.floor(r()*10),h=8+Math.floor(r()*26);px(x,"#140a26",X,72-h,w,h);
        for(let wy=74-h;wy<70;wy+=3)for(let wx=X+1;wx<X+w-1;wx+=2)if(r()>.7)px(x,"#ffd23f",wx,wy);X+=w+1;}
      px(x,"#1c1c24",0,72,W,18);px(x,"#2a2a36",0,72,W,1);palm(x,24,50,"#0a0614","#0a0614");palm(x,140,48,"#0a0614","#0a0614");},
    fg(x,t,r){for(let i=0;i<14;i++){const sx=r()*W,sy=r()*30;if((t+i*3)%9<6)px(x,"#ffffff",sx,sy);}
      for(let X=-(t*3%16);X<W;X+=16)px(x,"#ffd23f",X,84,8,1);
      const cx=wrap(t*2.2,-30,W+10);x.globalAlpha=.35;px(x,"#fff3b0",cx+20,78,18,3);x.globalAlpha=1;
      spr(x,CAR,{R:"#e8394b",c:"#7fd3ff",Y:"#fff3b0",k:"#0a0a0a"},cx,77);}}
};

/* ---- animação: roda a ~10 quadros por segundo (ritmo de jogo antigo) e só nas cenas visíveis ---- */
const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches,live=new Set(),bgs=new Map();
const seen=new IntersectionObserver(es=>es.forEach(e=>{e.target._on=e.isIntersecting;}));
function bgOf(g){if(!bgs.has(g.id)){const c=document.createElement("canvas");c.width=W;c.height=H;SCENES[g.id].bg(c.getContext("2d"),rng(g.id));bgs.set(g.id,c);}return bgs.get(g.id);}
let frame=0,last=0;
function paint(cv){const g=cv._g,x=cv.getContext("2d");x.drawImage(bgOf(g),0,0);SCENES[g.id].fg(x,frame,rng(g.id+"*"));}
function mount(cv,g){cv.width=W;cv.height=H;cv._g=g;paint(cv);if(!reduce){live.add(cv);seen.observe(cv);}}
function loop(now){if(now-last>=100){last=now;frame++;for(const cv of live){if(!cv.isConnected){live.delete(cv);seen.unobserve(cv);}else if(cv._on)paint(cv);}}requestAnimationFrame(loop);}
if(!reduce)requestAnimationFrame(loop);

// números que sobem contando até o valor final
function countUp(el,to,fmt,ms=1400){if(reduce){el.textContent=fmt(to);return;}const t0=performance.now();
  const step=now=>{const k=Math.min(1,(now-t0)/ms);el.textContent=fmt(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step);};requestAnimationFrame(step);}
document.querySelectorAll("[data-to]").forEach(el=>{const dec=+(el.dataset.dec||0),suf=el.dataset.suf||"";
  countUp(el,+el.dataset.to,v=>v.toLocaleString("pt-BR",{minimumFractionDigits:dec,maximumFractionDigits:dec})+suf);});

// letreiro: duplica o conteúdo para a volta ficar contínua
const ticker=document.getElementById("ticker");ticker.innerHTML+=ticker.innerHTML;

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
  list.forEach((g,i)=>{
    const el=document.createElement("button");el.className="card";el.style.setProperty("--c",g.color);el.style.setProperty("--i",i);
    el.setAttribute("aria-label",`Ver detalhes de ${g.name}`);
    el.innerHTML=`<div class="art"><canvas aria-hidden="true"></canvas><span class="rank">#${g.rank}</span><span class="genre">${g.genre}</span><span class="play">▶ Ver ficha</span></div>
      <div class="body"><h3>${g.name}</h3><p>${g.short}</p>
      <div class="stat"><b>${g.stat}</b><span>${g.statLabel}</span></div></div>`;
    mount(el.querySelector("canvas"),g);
    el.onclick=()=>openSheet(g);
    grid.appendChild(el);
  });
}

const ov=document.getElementById("overlay"),sheet=document.getElementById("sheet");let lastFocus=null;
function openSheet(g){
  lastFocus=document.activeElement;sheet.style.setProperty("--c",g.color);
  sheet.innerHTML=`<div class="art"><canvas aria-hidden="true"></canvas><span class="genre">${g.genre}</span></div>
   <div class="in"><div class="eyebrow">#${g.rank} no ranking</div><h3 id="mTitle">${g.name}</h3>
   <p>${g.long}</p>
   <div class="facts">
     <div><small>Números</small><b>${g.stat}</b> ${g.statLabel}</div>
     <div><small>Lançamento</small><b>${g.year}</b></div>
     <div><small>Desenvolvedora</small><b>${g.dev}</b></div>
     <div><small>Onde jogar</small><b>${g.plat}</b> · ${g.price}</div>
   </div>
   <p class="why"><strong>Por que jogar:</strong> ${g.why}</p>
   <div class="actions"><a class="btn" href="${g.site}" target="_blank" rel="noopener noreferrer">Site oficial ↗</a><button class="btn ghost" id="closeBtn">Fechar</button></div></div>`;
  ov.hidden=false;mount(sheet.querySelector("canvas"),g);
  document.getElementById("closeBtn").onclick=closeSheet;document.getElementById("closeBtn").focus();
}
function closeSheet(){ov.hidden=true;lastFocus&&lastFocus.focus();}
ov.addEventListener("click",e=>{if(e.target===ov)closeSheet();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!ov.hidden)closeSheet();});

/* gráfico: as barras crescem em blocos quando aparecem na tela */
const max=STEAM[0][1],rows=document.getElementById("rows");
STEAM.forEach(([n,v],i)=>{const d=document.createElement("div");d.className="row";
  d.innerHTML=`<span class="n">${n}</span><div class="track"><div class="fill"></div></div><span class="v">0 mi</span>`;
  const f=d.querySelector(".fill");f.style.setProperty("--w",`${(v/max*100).toFixed(1)}%`);f.style.setProperty("--i",i);
  rows.appendChild(d);});
const chartSeen=new IntersectionObserver(es=>{if(!es.some(e=>e.isIntersecting))return;chartSeen.disconnect();rows.classList.add("on");
  [...rows.children].forEach((d,i)=>countUp(d.querySelector(".v"),STEAM[i][1]/1e6,v=>v.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+" mi",1600));},{threshold:.3});
chartSeen.observe(rows);

render();
