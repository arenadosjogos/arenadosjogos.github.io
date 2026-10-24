// LÓGICA DO SITE: menu de categorias, banner do Top 5, cartões, ficha de cada jogo, Arena de Tiro, gráfico e créditos.
// Usa GAMES e STEAM (dados.js) e os mini-jogos (minigames.js).

const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
const ICONS={"Todos":"🏠","Criativo":"🧱","Battle Royale":"🪂","MOBA":"🗺️","Tiro tático":"🎯","Mundo aberto":"🌆"};
const imgOf=g=>`img/${g.id}.jpg`;
const byId=id=>GAMES.find(g=>g.id===id);

/* ---- logo: cada letra vira um pedaço para o come-come comer uma por uma ---- */
const logoWord=document.getElementById("logoWord"),words=logoWord.textContent.split(" ");let k=0;
logoWord.innerHTML=words.map((w,i)=>`<span class="w w${i}">${[...w].map(ch=>`<i>${ch}</i>`).join("")}</span>`).join(" ");
logoWord.querySelectorAll("i").forEach(el=>el.style.setProperty("--k",k++));
logoWord.style.setProperty("--n",k);

/* ---- banner: os 5 primeiros do ranking, trocando sozinho (a barrinha da aba marca o tempo) ---- */
const banner=document.getElementById("banner"),top5=GAMES.slice(0,5);
banner.innerHTML=`<div class="slides">${top5.map(g=>`
  <article class="slide">
    <img src="${imgOf(g)}" alt="">
    <div class="slide-text">
      <div class="kicker">👑 Top 5 · os mais jogados do mundo</div>
      <div class="slide-rank">#${g.rank}</div>
      <h2>${g.name}</h2>
      <p>${g.short}</p>
      <div class="slide-meta"><span class="pill">${g.genre}</span><span><b>${g.stat}</b> ${g.statLabel}</span></div>
      <button class="btn" data-id="${g.id}">Ver detalhes →</button>
    </div>
  </article>`).join("")}</div>
  <div class="tabs" role="tablist" aria-label="Escolher jogo do Top 5">${top5.map(g=>`
    <button class="tab" role="tab"><img src="${imgOf(g)}" alt=""><span class="tab-rank">${g.rank}</span><span class="tab-name">${g.name}</span><i class="tab-bar"></i></button>`).join("")}</div>`;
const slides=[...banner.querySelectorAll(".slide")],tabs=[...banner.querySelectorAll(".tab")];
let cur=0;
function show(i){cur=(i+top5.length)%top5.length;
  slides.forEach((s,k)=>{s.classList.toggle("on",k===cur);s.toggleAttribute("inert",k!==cur);});
  tabs.forEach((t,k)=>{t.classList.toggle("on",k===cur);t.setAttribute("aria-selected",k===cur);});}
top5.forEach((g,i)=>{slides[i].style.setProperty("--c",g.color);tabs[i].style.setProperty("--c",g.color);
  tabs[i].onclick=()=>show(i);tabs[i].querySelector(".tab-bar").addEventListener("animationend",()=>show(cur+1));});
banner.addEventListener("click",e=>{const b=e.target.closest("[data-id]");if(b)openSheet(byId(b.dataset.id));});
show(0);

// letreiro: duplica o conteúdo para a volta ficar contínua
const ticker=document.getElementById("ticker");ticker.innerHTML+=ticker.innerHTML;

/* ---- menu de categorias e cartões ---- */
const genres=["Todos",...new Set(GAMES.map(g=>g.genre))];
let cat="Todos";
const chips=document.getElementById("chips"),grid=document.getElementById("grid");
genres.forEach(gn=>{const n=gn==="Todos"?GAMES.length:GAMES.filter(g=>g.genre===gn).length,b=document.createElement("button");
  b.className="cat";b.innerHTML=`<span class="ico" aria-hidden="true">${ICONS[gn]||"🎮"}</span><span>${gn}</span><small>${n}</small>`;
  b.setAttribute("aria-pressed",gn===cat);
  b.onclick=()=>{cat=gn;[...chips.children].forEach(c=>c.setAttribute("aria-pressed",c===b));render();
    document.getElementById("jogos").scrollIntoView({behavior:reduce?"auto":"smooth",block:"start"});};
  chips.appendChild(b);});

// "Todos" mostra os 10 do ranking, do 1º ao 10º; uma categoria mostra só os jogos dela
function render(){
  const all=cat==="Todos",list=all?GAMES:GAMES.filter(g=>g.genre===cat);
  document.getElementById("gridIco").textContent=all?"🏆":ICONS[cat];
  document.getElementById("gridTitle").textContent=all?"Todos os jogos":cat;
  document.getElementById("gridSub").textContent=all?"Ranking completo, do 1º ao 10º lugar":`${list.length} jogo${list.length>1?"s":""} nesta categoria`;
  grid.innerHTML="";
  list.forEach((g,i)=>{
    const el=document.createElement("button");el.className="card";el.style.setProperty("--c",g.color);el.style.setProperty("--i",i);
    el.setAttribute("aria-label",`Ver detalhes de ${g.name}`);
    el.innerHTML=`<div class="thumb"><img src="${imgOf(g)}" alt="" loading="lazy"><span class="rank">#${g.rank}</span><span class="tag">${g.genre}</span></div>
      <div class="info"><h3>${g.name}</h3><p>${g.short}</p>
      <div class="players"><b>${g.stat}</b><span>${g.statLabel}</span></div><span class="more">Ver detalhes →</span></div>`;
    el.onclick=()=>openSheet(g);
    grid.appendChild(el);
  });
}

/* ---- ficha do jogo, com o mini-jogo do tema dele ---- */
const ov=document.getElementById("overlay"),sheet=document.getElementById("sheet");let lastFocus=null,sheetGame=null;
function openSheet(g){
  lastFocus=document.activeElement;sheet.style.setProperty("--c",g.color);const f=g.foto;
  sheet.innerHTML=`<div class="sheet-img"><img src="${imgOf(g)}" alt=""><span class="tag">${g.genre}</span><button class="x" id="closeBtn" aria-label="Fechar">✕</button></div>
   <p class="credit">${imgCredit(f)}</p>
   <div class="in"><div class="kicker">#${g.rank} no ranking</div><h3 id="mTitle">${g.name}</h3>
   <p>${g.long}</p>
   <div class="facts">
     <div><small>Números</small><b>${g.stat}</b> ${g.statLabel}</div>
     <div><small>Lançamento</small><b>${g.year}</b></div>
     <div><small>Desenvolvedora</small><b>${g.dev}</b></div>
     <div><small>Onde jogar</small><b>${g.plat}</b> · ${g.price}</div>
   </div>
   <p class="why"><strong>Por que jogar:</strong> ${g.why}</p>
   <div class="mg"><h4>🎮 Desafio rápido: <span class="mg-name"></span></h4>${MG_MARKUP}</div>
   <div class="actions"><a class="btn" href="${g.site}" target="_blank" rel="noopener noreferrer">Site oficial ↗</a></div></div>`;
  ov.hidden=false;sheet.scrollTop=0;
  sheetGame=mountMiniGame(sheet.querySelector(".mg"),g.id);
  document.getElementById("closeBtn").onclick=closeSheet;document.getElementById("closeBtn").focus();
}
function closeSheet(){ov.hidden=true;if(sheetGame)sheetGame.stop();sheetGame=null;lastFocus&&lastFocus.focus();}
ov.addEventListener("click",e=>{if(e.target===ov)closeSheet();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!ov.hidden)closeSheet();});

/* ---- Arena de Tiro ---- */
const arena=document.getElementById("arenaGame");arena.innerHTML=MG_MARKUP;mountMiniGame(arena,"arena");

/* ---- gráfico: as barras crescem em blocos, como uma tela de loading, quando aparecem na tela ---- */
function countUp(el,to,fmt,ms=1400){if(reduce){el.textContent=fmt(to);return;}const t0=performance.now();
  const step=now=>{const k=Math.min(1,(now-t0)/ms);el.textContent=fmt(to*(1-Math.pow(1-k,3)));if(k<1)requestAnimationFrame(step);};requestAnimationFrame(step);}
const max=STEAM[0][1],rows=document.getElementById("rows");
STEAM.forEach(([n,v],i)=>{const d=document.createElement("div");d.className="row";
  d.innerHTML=`<span class="n">${n}</span><div class="track"><div class="fill"></div></div><span class="v">0 mi</span>`;
  const f=d.querySelector(".fill");f.style.setProperty("--w",`${(v/max*100).toFixed(1)}%`);f.style.setProperty("--i",i);
  rows.appendChild(d);});
const chartSeen=new IntersectionObserver(es=>{if(!es.some(e=>e.isIntersecting))return;chartSeen.disconnect();rows.classList.add("on");
  [...rows.children].forEach((d,i)=>countUp(d.querySelector(".v"),STEAM[i][1]/1e6,v=>v.toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})+" mi",1600));},{threshold:.3});
chartSeen.observe(rows);

/* ---- origem de cada imagem: arte oficial (políticas de fãs das empresas) ou ilustração própria ---- */
function imgCredit(f){return f.tipo==="oficial"?`Arte oficial © ${f.dono}, usada conforme a política de fãs da empresa`:"Ilustração original da Arena dos Jogos, inspirada no jogo";}
document.getElementById("credits").innerHTML=GAMES.map(g=>`<li><b>${g.name}</b> · ${g.foto.tipo==="oficial"?`arte oficial © ${g.foto.dono}`:"ilustração original"}</li>`).join("");

render();
