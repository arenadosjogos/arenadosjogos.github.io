// MINI-JOGOS: desafios de 30 segundos jogados só com cliques (ou toques na tela).
// Cada tema diz como os alvos nascem, se mexem, aparecem na tela e quanto vale cada clique.
const MW=480,MH=270;
function mrand(a,b){return a+Math.random()*(b-a);}
function mpick(a){return a[Math.floor(Math.random()*a.length)];}
function rr(x,c,X,Y,w,h){x.fillStyle=c;x.fillRect(X,Y,w,h);}
function circle(x,c,X,Y,r){x.fillStyle=c;x.beginPath();x.arc(X,Y,r,0,7);x.fill();}
function sky(x,top,bottom,h){const g=x.createLinearGradient(0,0,0,h);g.addColorStop(0,top);g.addColorStop(1,bottom);x.fillStyle=g;x.fillRect(0,0,MW,h);}

/* ---- tiro ao alvo: bonequinhos saem de trás das barreiras (CS2, Valorant, PUBG, Free Fire, Fortnite e Arena) ---- */
const SHOOT_PAL={
  arena:{sky:["#0b1030","#3a1a6e"],ground:"#1a1440",wall:"#2c2c66",edge:"#39ff14",enemy:"#ff3cac",skin:"#f1c27d"},
  cs2:{sky:["#8ec9ff","#e6f2ff"],ground:"#c9a265",wall:"#a8743a",edge:"#5a3c1c",enemy:"#4a5a2a",skin:"#e0a878"},
  valorant:{sky:["#0f1923","#2a3440"],ground:"#1b2a36",wall:"#ece8e1",edge:"#ff4655",enemy:"#ff4655",skin:"#f1c27d"},
  pubg:{sky:["#9ccbe8","#e9f1d8"],ground:"#9aa04c",wall:"#7d6b4a",edge:"#4b3d26",enemy:"#3d4f2a",skin:"#e0a878"},
  freefire:{sky:["#ff7b3a","#ffd27a"],ground:"#f2d08a",wall:"#3d6b3a",edge:"#244522",enemy:"#d9381e",skin:"#e0a878"},
  fortnite:{sky:["#2f7de1","#a8dcff"],ground:"#58b947",wall:"#b07a3c",edge:"#7a4f22",enemy:"#7b3fe4",skin:"#f1c27d"}
};
// barreiras: x = centro, y = topo; as de trás (s menor) parecem mais longe
const COVERS=[{x:70,y:150,w:70,h:28,s:.7},{x:240,y:140,w:80,h:30,s:.7},{x:410,y:150,w:70,h:28,s:.7},{x:130,y:232,w:110,h:40,s:1},{x:350,y:232,w:110,h:40,s:1}];
function figure(x,o,c,p){const s=c.s,top=c.y-58*s*o.up,cx=o.cx,host=o.kind==="hostage";
  if(o.dead)x.globalAlpha=.45;
  if(host){rr(x,p.skin,cx-15*s,top+2*s,4*s,18*s);rr(x,p.skin,cx+11*s,top+2*s,4*s,18*s);}
  else rr(x,"#222",cx+8*s,top+26*s,18*s,4*s);
  rr(x,host?"#e8e8e8":p.enemy,cx-11*s,top+18*s,22*s,34*s);
  circle(x,p.skin,cx,top+9*s,8*s);
  if(host)circle(x,"#000",cx,top+12*s,1.6*s);
  else{rr(x,"#222",cx-8*s,top+2*s,16*s,5*s);rr(x,"#fff",cx-5*s,top+8*s,3*s,2*s);rr(x,"#fff",cx+2*s,top+8*s,3*s,2*s);}
  x.globalAlpha=1;}
function shooterTheme(pal){const p=SHOOT_PAL[pal];return{
  name:"Tiro ao alvo",crosshair:true,
  info:"Clique nos inimigos quando eles aparecerem. Na cabeça vale 3 pontos! Cuidado: não atire nos reféns de camisa branca.",
  every:el=>Math.max(.32,.85-el*.018),
  spawn(el,objs){const free=COVERS.map((c,i)=>i).filter(i=>!objs.some(o=>o.c===i));if(!free.length)return null;
    const c=mpick(free),cv=COVERS[c];return{c,cx:cv.x+mrand(-cv.w*.3,cv.w*.3),kind:Math.random()<.18?"hostage":"enemy",up:0,ph:"rise",life:Math.max(.55,1.3-el*.02)};},
  update(o,dt){if(o.ph==="rise"){o.up+=dt/.15;if(o.up>=1){o.up=1;o.ph="stay";}}
    else if(o.ph==="stay"){o.life-=dt;if(o.life<=0)o.ph="down";}
    else{o.up-=dt/(o.dead?.3:.15);if(o.up<=0)return false;}},
  hit(o,px,py){const c=COVERS[o.c],s=c.s,top=c.y-58*s*o.up;if(o.dead||o.up<.3||py>c.y)return false;
    if(Math.hypot(px-o.cx,py-(top+9*s))<9.5*s)return"head";
    return px>o.cx-11*s&&px<o.cx+11*s&&py>top+18*s&&py<top+52*s?"body":false;},
  onHit(o,zone){o.dead=true;o.ph="down";
    if(o.kind==="hostage")return{pts:-3,label:"REFÉM! -3",color:"#ff5555"};
    return zone==="head"?{pts:3,label:"HEADSHOT +3",color:"#ffd23f",hit:true,burst:"#ff3b3b"}:{pts:1,label:"+1",color:"#ffffff",hit:true,burst:"#ff3b3b",small:true};},
  draw(x,objs){sky(x,p.sky[0],p.sky[1],170);rr(x,p.ground,0,170,MW,MH-170);for(let i=0;i<6;i++)rr(x,"rgba(0,0,0,.08)",0,182+i*16,MW,2);
    COVERS.forEach((c,i)=>{objs.filter(o=>o.c===i).forEach(o=>{x.save();x.beginPath();x.rect(0,0,MW,c.y);x.clip();figure(x,o,c,p);x.restore();});
      rr(x,p.edge,c.x-c.w/2-2,c.y-2,c.w+4,c.h+4);rr(x,p.wall,c.x-c.w/2,c.y,c.w,c.h);rr(x,"rgba(255,255,255,.18)",c.x-c.w/2,c.y,c.w,3);});}
};}

/* ---- mineração: clique nos minérios até quebrar (Minecraft) ---- */
const ORES={diamond:{pts:5,c:"#3fe0e0",hp:3},gold:{pts:3,c:"#ffd23f",hp:3},coal:{pts:1,c:"#1a1a1a",hp:2},tnt:{pts:-5,c:"#e8394b",hp:1}};
function mineTheme(){const C=8,R=3,S=48,X0=48,Y0=MH-R*S-6;let bg=null;
  const cell=o=>[X0+(o.cell%C)*S,Y0+Math.floor(o.cell/C)*S];
  function block(x,X,Y,base,dark,top){rr(x,base,X,Y,S,S);for(let k=0;k<40;k++)rr(x,dark,X+Math.floor(Math.random()*12)*4,Y+Math.floor(Math.random()*12)*4,4,4);
    if(top){rr(x,top,X,Y,S,10);for(let k=0;k<10;k++)rr(x,"#4ea832",X+Math.floor(Math.random()*12)*4,Y+Math.floor(Math.random()*3)*4,4,4);}
    rr(x,"rgba(0,0,0,.25)",X,Y+S-2,S,2);rr(x,"rgba(0,0,0,.25)",X+S-2,Y,2,S);}
  function paintBg(){const c=document.createElement("canvas");c.width=MW;c.height=MH;const x=c.getContext("2d");
    sky(x,"#6fb6ff","#d4ecff",Y0);rr(x,"#fff6a8",380,24,34,34);rr(x,"#ffffff",60,40,70,14);rr(x,"#ffffff",76,30,36,10);rr(x,"#ffffff",230,62,60,12);
    for(let r=0;r<R;r++)for(let col=-1;col<=C;col++){const X=X0+col*S,Y=Y0+r*S;
      if(r===0)block(x,X,Y,"#8a5a35","#6e4526","#5fbf3f");else if(r===1)block(x,X,Y,"#8a5a35","#6e4526");else block(x,X,Y,"#8c8c8c","#6f6f6f");}
    rr(x,"#6f6f6f",0,Y0+R*S,MW,MH);return c;}
  return{
  name:"Minerar",crosshair:false,
  info:"Clique várias vezes nos minérios brilhantes para quebrar: diamante vale 5, ouro 3 e carvão 1. Não clique no TNT!",
  every:el=>Math.max(.35,.8-el*.015),
  spawn(el,objs){const free=[...Array(C*R).keys()].filter(i=>!objs.some(o=>o.cell===i));if(!free.length)return null;
    const r=Math.random(),kind=r<.15?"tnt":r<.35?"diamond":r<.6?"gold":"coal";return{cell:mpick(free),kind,hp:ORES[kind].hp,life:mrand(1.6,2.6)-el*.02};},
  update(o,dt){if(o.gone)return false;o.life-=dt;return o.life>0;},
  hit(o,px,py){const[X,Y]=cell(o);return px>=X&&px<X+S&&py>=Y&&py<Y+S?"b":false;},
  onHit(o){const d=ORES[o.kind];o.hp--;
    if(o.kind==="tnt"){o.gone=true;return{pts:d.pts,label:"BOOM! -5",color:"#ff5555",burst:"#ff8a3d"};}
    if(o.hp>0)return{pts:0,hit:true,burst:"#8c8c8c",small:true};
    o.gone=true;return{pts:d.pts,label:"+"+d.pts,color:d.c==="#1a1a1a"?"#ffffff":d.c,hit:true,burst:d.c};},
  draw(x,objs,t){if(!bg)bg=paintBg();x.drawImage(bg,0,0);
    objs.forEach(o=>{const[X,Y]=cell(o),d=ORES[o.kind];if(o.life<.5&&Math.floor(t*10)%2)return;
      if(o.kind==="tnt"){rr(x,"#e8394b",X,Y,S,S);rr(x,"#f2f2f2",X,Y+16,S,16);x.fillStyle="#222";x.font="bold 13px Arial, sans-serif";x.textAlign="center";x.fillText("TNT",X+S/2,Y+29);}
      else{rr(x,"#8c8c8c",X,Y,S,S);for(let k=0;k<7;k++)rr(x,d.c,X+((o.cell*7+k*13)%11)*4,Y+((o.cell*5+k*7)%11)*4,8,6);}
      x.globalAlpha=.55+.45*Math.sin(t*8);x.strokeStyle=d.c==="#1a1a1a"?"#ffffff":d.c;x.lineWidth=3;x.strokeRect(X+1.5,Y+1.5,S-3,S-3);x.globalAlpha=1;
      for(let k=0;k<(d.hp-o.hp)*6;k++)rr(x,"#111",X+((k*17+o.cell*3)%11)*4,Y+((k*11+5)%11)*4,4,4);});}
};}

/* ---- último golpe: clique nos minions quando a vida estiver vermelha (League of Legends e Dota 2) ---- */
const LANE_PAL={lol:{grass:"#2a5e35",lane:"#a8875a",ally:"#3fa9f5",enemy:"#ff4f5e"},dota2:{grass:"#22301f",lane:"#6e5a3e",ally:"#5fd068",enemy:"#d6453d"}};
function lasthitTheme(pal){const p=LANE_PAL[pal],trees=[...Array(36)].map(()=>[mrand(0,MW),Math.random()<.5?mrand(0,120):mrand(245,MH)]);
  const tower=(x,X,c)=>{rr(x,"#333",X-10,130,20,50);rr(x,c,X-6,122,12,10);circle(x,c,X,118,5);};
  return{
  name:"Último golpe",crosshair:false,
  info:"Seus aliados estão atacando os minions inimigos. Dê o golpe final: clique quando a barra de vida ficar vermelha. Cedo demais não vale!",
  every:el=>Math.max(.45,1.1-el*.02),
  spawn(){return{x:MW+20,y:mrand(150,215),sp:mrand(28,45),hp:1,drain:mrand(.22,.4),b:Math.random()*6};},
  update(o,dt,api){if(o.gone)return false;o.x-=o.sp*dt;o.hp-=o.drain*dt;
    if(o.hp<=0){api.fx("perdeu","#9a9a9a",o.x,o.y-26);return false;}return o.x>40;},
  hit(o,px,py){return Math.abs(px-o.x)<17&&py>o.y-28&&py<o.y+14?"m":false;},
  onHit(o){if(o.hp<=.3){o.gone=true;return{pts:1,label:"+ouro",color:"#ffd23f",hit:true,burst:"#ffd23f"};}
    o.hp-=.06;return{pts:0,label:"cedo!",color:"#bbbbbb"};},
  draw(x,objs,t){rr(x,p.grass,0,0,MW,MH);trees.forEach(([a,b])=>circle(x,"rgba(0,0,0,.25)",a,b,10));
    rr(x,p.lane,0,135,MW,100);rr(x,"rgba(0,0,0,.15)",0,135,MW,4);tower(x,22,p.ally);tower(x,MW-22,p.enemy);
    objs.slice().sort((a,b)=>a.y-b.y).forEach(o=>{const y=o.y+Math.sin(t*10+o.b)*2,low=o.hp<=.3;
      circle(x,"rgba(0,0,0,.3)",o.x,o.y+11,10);circle(x,p.enemy,o.x,y,11);rr(x,"#ffffff",o.x-6,y-3,4,4);rr(x,"#ffffff",o.x+2,y-3,4,4);
      rr(x,"#000",o.x-15,o.y-25,30,6);rr(x,low?"#ff3b3b":"#5fd068",o.x-14,o.y-24,28*Math.max(0,o.hp),4);
      if(low){x.strokeStyle="#ffd23f";x.lineWidth=1.5;x.strokeRect(o.x-16.5,o.y-26.5,33,9);}});}
};}

/* ---- pega-moedas: clique nas moedas que caem, fuja das bombas (Roblox) ---- */
function coinsTheme(){const clouds=[[40,40],[200,25],[360,55]];return{
  name:"Pega-moedas",crosshair:false,
  info:"Clique nas moedas (+1) e nas joias (+3) antes que caiam no chão. Fuja das bombas!",
  every:el=>Math.max(.25,.6-el*.012),
  spawn(el){const r=Math.random();return{kind:r<.2?"bomb":r<.35?"gem":"coin",x:mrand(24,MW-24),y:-20,v:mrand(60,110)+el*3,a:Math.random()*6};},
  update(o,dt){if(o.gone)return false;o.y+=o.v*dt;o.a+=dt*4;return o.y<MH+20;},
  hit(o,px,py){return Math.hypot(px-o.x,py-o.y)<21?"c":false;},
  onHit(o){o.gone=true;
    if(o.kind==="bomb")return{pts:-3,label:"BUM! -3",color:"#ff5555",burst:"#ff8a3d"};
    return o.kind==="gem"?{pts:3,label:"+3",color:"#3fe0e0",hit:true,burst:"#3fe0e0"}:{pts:1,label:"+1",color:"#ffd23f",hit:true,burst:"#ffd23f",small:true};},
  draw(x,objs,t){sky(x,"#4a9eff","#bfe3ff",232);
    clouds.forEach(([a,b])=>{const X=(a+t*12)%(MW+80)-60;rr(x,"#ffffff",X,b,60,12);rr(x,"#ffffff",X+14,b-8,30,8);});
    rr(x,"#3f9b4a",0,232,MW,MH-232);for(let i=4;i<MW;i+=16)rr(x,"#368a40",i,238,8,4);
    rr(x,"#ffd23f",MW/2-8,182,16,16);rr(x,"#2f6fdd",MW/2-11,198,22,18);rr(x,"#ffd23f",MW/2-17,198,6,16);rr(x,"#ffd23f",MW/2+11,198,6,16);rr(x,"#3fbf5a",MW/2-10,216,9,16);rr(x,"#3fbf5a",MW/2+1,216,9,16);rr(x,"#1a1a1a",MW/2-4,187,3,3);rr(x,"#1a1a1a",MW/2+2,187,3,3);
    objs.forEach(o=>{if(o.kind==="coin"){x.fillStyle="#ffd23f";x.beginPath();x.ellipse(o.x,o.y,Math.abs(Math.cos(o.a))*14+2,16,0,0,7);x.fill();x.strokeStyle="#c98a00";x.lineWidth=2;x.stroke();}
      else if(o.kind==="gem"){x.fillStyle="#3fe0e0";x.beginPath();x.moveTo(o.x,o.y-16);x.lineTo(o.x+13,o.y-4);x.lineTo(o.x,o.y+16);x.lineTo(o.x-13,o.y-4);x.closePath();x.fill();
        x.fillStyle="rgba(255,255,255,.6)";x.beginPath();x.moveTo(o.x,o.y-16);x.lineTo(o.x+5,o.y-4);x.lineTo(o.x-5,o.y-4);x.fill();}
      else{circle(x,"#222",o.x,o.y,14);rr(x,"#666",o.x-2,o.y-20,4,7);circle(x,Math.floor(t*12)%2?"#ffd23f":"#ff5a1f",o.x,o.y-22,4);circle(x,"rgba(255,255,255,.3)",o.x-5,o.y-5,4);}});}
};}

/* ---- assalto na avenida: clique nos carros esportivos, nunca na polícia (GTA V) ---- */
function carsTheme(){const LANES=[184,212,240],city=[];let X=0;
  while(X<MW){const w=mrand(22,50),h=mrand(30,90),win=[];for(let wy=140-h+6;wy<134;wy+=9)for(let wx=X+4;wx<X+w-6;wx+=8)if(Math.random()>.6)win.push([wx,wy]);city.push([X,w,h,win]);X+=w+3;}
  function car(x,o,t){const X=o.x,Y=o.y,pol=o.kind==="police",body=pol?"#f2f2f2":o.col;
    rr(x,"rgba(0,0,0,.35)",X-28,Y+8,56,5);rr(x,body,X-28,Y-6,56,14);rr(x,pol?"#1a1a1a":body,X-14,Y-16,28,10);rr(x,"#7fd3ff",X-11,Y-14,22,7);
    if(pol){rr(x,"#1a1a1a",X-28,Y,56,3);rr(x,Math.floor(t*6)%2?"#ff3b3b":"#3b7bff",X-6,Y-21,12,5);}
    circle(x,"#111",X-17,Y+8,5);circle(x,"#111",X+17,Y+8,5);rr(x,"#fff3b0",o.dir>0?X+25:X-28,Y-3,3,4);}
  return{
  name:"Assalto na avenida",crosshair:false,
  info:"Clique nos carros esportivos (+1) e nos sacos de dinheiro (+2). Se clicar na polícia, você fica procurado e perde 3!",
  every:el=>Math.max(.35,.9-el*.018),
  spawn(el){const r=Math.random(),dir=Math.random()<.5?1:-1;
    if(r<.15)return{kind:"bag",dir,x:dir>0?-30:MW+30,y:150,v:mrand(50,80)};
    return{kind:r<.4?"police":"car",dir,x:dir>0?-60:MW+60,y:mpick(LANES),v:mrand(110,190)+el*3,col:mpick(["#e8394b","#ffd23f","#3fa9f5","#b98bff","#ff8a3d"])};},
  update(o,dt){if(o.gone)return false;o.x+=o.dir*o.v*dt;return o.x>-80&&o.x<MW+80;},
  hit(o,px,py){const bag=o.kind==="bag";return Math.abs(px-o.x)<(bag?14:30)&&py>o.y-(bag?16:20)&&py<o.y+(bag?14:14)?"c":false;},
  onHit(o){o.gone=true;
    if(o.kind==="police")return{pts:-3,label:"PROCURADO! -3",color:"#5aa9ff",burst:"#5aa9ff"};
    return o.kind==="bag"?{pts:2,label:"+$2",color:"#5fd068",hit:true,burst:"#5fd068"}:{pts:1,label:"ROUBOU! +1",color:"#ffd23f",hit:true,burst:o.col};},
  draw(x,objs,t){sky(x,"#1d0b3a","#ff7e5f",140);circle(x,"#ffd36b",360,128,40);
    city.forEach(([cx,w,h,win])=>{rr(x,"#140a26",cx,140-h,w,h);win.forEach(([a,b])=>rr(x,"#ffd23f",a,b,3,4));});
    rr(x,"#3a3550",0,140,MW,22);rr(x,"#1c1c24",0,162,MW,MH-162);rr(x,"#55506a",0,160,MW,2);
    const off=(t*120)%40;[198,226].forEach(y=>{for(let lx=-off;lx<MW;lx+=40)rr(x,"#ffd23f",lx,y,20,2);});
    objs.forEach(o=>{if(o.kind==="bag"){circle(x,"#3c8d3a",o.x,o.y,12);rr(x,"#2a6a28",o.x-5,o.y-16,10,6);x.fillStyle="#fff";x.font="bold 14px Arial, sans-serif";x.textAlign="center";x.fillText("$",o.x,o.y+5);}else car(x,o,t);});}
};}

const MG_THEMES={arena:()=>shooterTheme("arena"),cs2:()=>shooterTheme("cs2"),valorant:()=>shooterTheme("valorant"),pubg:()=>shooterTheme("pubg"),
  freefire:()=>shooterTheme("freefire"),fortnite:()=>shooterTheme("fortnite"),minecraft:mineTheme,roblox:coinsTheme,
  lol:()=>lasthitTheme("lol"),dota2:()=>lasthitTheme("dota2"),gta5:carsTheme};

/* ---- motor: tempo, pontuação, cliques e efeitos (textos que sobem e faíscas) ---- */
function createMiniGame(cv,key,ui){
  const th=MG_THEMES[key](),x=cv.getContext("2d");cv.width=MW;cv.height=MH;
  let objs=[],fx=[],score=0,shots=0,hits=0,time=0,running=false,spawnT=0,ptr=null,raf=0,last=0;
  const api={fx:(txt,c,X,Y)=>fx.push({kind:"text",txt,c,x:X,y:Y,t:0})};
  const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*MW/r.width,(e.clientY-r.top)*MH/r.height];};
  const kick=()=>{if(!raf){last=performance.now();raf=requestAnimationFrame(loop);}};
  const cross=(px,py)=>{x.beginPath();x.arc(px,py,9,0,7);x.moveTo(px-15,py);x.lineTo(px-5,py);x.moveTo(px+5,py);x.lineTo(px+15,py);x.moveTo(px,py-15);x.lineTo(px,py-5);x.moveTo(px,py+5);x.lineTo(px,py+15);x.stroke();};
  cv.addEventListener("pointermove",e=>{ptr=pos(e);kick();});
  cv.addEventListener("pointerleave",()=>{ptr=null;kick();});
  cv.addEventListener("pointerdown",e=>{if(!running)return;e.preventDefault();const[px,py]=pos(e);ptr=[px,py];shots++;fx.push({kind:"ring",x:px,y:py,t:0});
    for(let i=objs.length-1;i>=0;i--){const zone=th.hit(objs[i],px,py);if(!zone)continue;const res=th.onHit(objs[i],zone);
      if(res.hit)hits++;score=Math.max(0,score+res.pts);ui.score(score);
      if(res.label)api.fx(res.label,res.color,px,py-12);
      if(res.burst)for(let k=0;k<(res.small?5:12);k++){const a=Math.random()*6.28,s=mrand(40,140);fx.push({kind:"dot",x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s-40,c:res.burst,t:0});}
      return;}});
  function draw(){th.draw(x,objs,performance.now()/1000);
    fx.forEach(f=>{const k=f.t;
      if(f.kind==="text"){x.globalAlpha=Math.max(0,1-k/.9);x.font="bold 17px Rajdhani, Arial, sans-serif";x.textAlign="center";x.lineWidth=4;x.strokeStyle="#000";x.strokeText(f.txt,f.x,f.y-k*40);x.fillStyle=f.c;x.fillText(f.txt,f.x,f.y-k*40);}
      else if(f.kind==="dot"){x.globalAlpha=Math.max(0,1-k/.6);x.fillStyle=f.c;x.fillRect(f.x+f.vx*k-2,f.y+f.vy*k+160*k*k-2,4,4);}
      else{x.globalAlpha=Math.max(0,1-k/.25);x.strokeStyle="#ffffff";x.lineWidth=2;x.beginPath();x.arc(f.x,f.y,4+k*60,0,7);x.stroke();}
      x.globalAlpha=1;});
    if(th.crosshair&&ptr){x.strokeStyle="#000";x.lineWidth=4;cross(...ptr);x.strokeStyle="#39ff14";x.lineWidth=2;cross(...ptr);}}
  function loop(){const now=performance.now(),dt=Math.max(0,Math.min(.05,(now-last)/1000));last=now;
    fx.forEach(f=>f.t+=dt);fx=fx.filter(f=>f.t<1);
    if(running){time-=dt;spawnT-=dt;const el=30-time;
      if(spawnT<=0){const o=th.spawn(el,objs);if(o)objs.push(o);spawnT=th.every(el);}
      objs=objs.filter(o=>th.update(o,dt,api)!==false);
      if(time<=0){time=0;running=false;objs=[];ui.end(score,shots?Math.round(hits/shots*100):0);}
      ui.time(Math.ceil(time));}
    draw();raf=running||fx.length||(th.crosshair&&ptr)?requestAnimationFrame(loop):0;}
  draw();
  return{name:th.name,info:th.info,crosshair:th.crosshair,
    start(){objs=[];fx=[];score=shots=hits=0;time=30;spawnT=.4;running=true;ui.score(0);ui.time(30);kick();},
    stop(){running=false;cancelAnimationFrame(raf);raf=0;}};
}

// estrutura HTML de um mini-jogo (placar, tela e botão de começar)
const MG_MARKUP=`<div class="mg-hud"><span>⏱ <b class="mg-time">30</b>s</span><span>⭐ <b class="mg-score">0</b> pts</span><span>🏆 Recorde <b class="mg-best">0</b></span></div>
  <div class="mg-stage"><canvas></canvas><div class="mg-overlay"><p class="mg-msg"></p><button class="btn mg-start">▶ Jogar</button></div></div>`;

// liga a tela, o placar e o recorde (guardado só neste navegador) a um mini-jogo
function mountMiniGame(root,key){
  const $=s=>root.querySelector(s),ov=$(".mg-overlay"),msg=$(".mg-msg"),btn=$(".mg-start");
  let best=0;try{best=+localStorage.getItem("mg-best-"+key)||0;}catch(e){}
  $(".mg-best").textContent=best;
  const game=createMiniGame($("canvas"),key,{
    score:v=>{$(".mg-score").textContent=v;},time:v=>{$(".mg-time").textContent=v;},
    end:(s,acc)=>{const rec=s>best;if(rec){best=s;try{localStorage.setItem("mg-best-"+key,s);}catch(e){}$(".mg-best").textContent=s;}
      msg.innerHTML=`<b>Fim de jogo!</b><br>${s} pontos · precisão ${acc}%${rec?"<br>🏆 Novo recorde!":""}`;btn.textContent="↻ Jogar de novo";ov.hidden=false;}});
  if(game.crosshair)$("canvas").classList.add("aim");
  const nm=root.querySelector(".mg-name");if(nm)nm.textContent=game.name;
  msg.textContent=game.info;
  btn.onclick=()=>{ov.hidden=true;game.start();};
  return game;
}
