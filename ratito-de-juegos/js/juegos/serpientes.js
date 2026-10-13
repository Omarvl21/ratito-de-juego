/* Serpientes y Escaleras
   50 tableros. Cada tablero se genera siempre igual a partir de su número.
   Modos: contra la computadora o dos personas en el mismo celular.
   Regla sencilla: no hace falta sacar el número exacto para llegar a la meta. */
(function(){
/* Tramos: hasta qué nivel, columnas, filas, escaleras, serpientes */
const TIERS=[[10,6,5,3,1],[20,6,7,4,3],[30,8,7,5,4],[40,8,8,5,5],[50,10,10,7,7]];
const LEVELS=Array.from({length:50},(_,i)=>{const[,cols,rows,nl,ns]=TIERS.find(t=>i<t[0]);
  return{name:`Tablero de ${cols*rows}`,cols,rows,nl,ns,seed:i+1}});
const SNAKE=['#3E9B4F','#E07B39','#8E55D6','#2E7DDB','#C9A227'];
const PLAYERS=[{c:'#E5484D'},{c:'#2E7DDB'}];
const PIPS={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const MODE_KEY='serpientes-modo';
let api,L,C,ROWS,N,jumps,pos,turn,busy,moved,vsCPU=true,timers=[];
try{vsCPU=localStorage.getItem(MODE_KEY)!=='dos'}catch(e){}
const later=(f,ms)=>timers.push(setTimeout(f,ms));
const names=()=>vsCPU?['Usted','Computadora']:['Rojo','Azul'];

function rng(s){return()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}}
function makeBoard(lv){
  const R=rng(lv.seed*7919+11),total=lv.cols*lv.rows,used=new Set([1,total]),j={},segs=[];
  const rowOf=n=>Math.floor((n-1)/lv.cols),pick=(a,b)=>a+Math.floor(R()*(b-a+1));
  const at=n=>{const i=n-1,r=Math.floor(i/lv.cols);return[r%2===0?i%lv.cols:lv.cols-1-i%lv.cols,r]};
  /* ¿Se cruzan dos segmentos? (para que escaleras y serpientes no se encimen) */
  const cross=(p,q,r,s)=>{const d=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
    return d(p,q,r)*d(p,q,s)<0&&d(r,s,p)*d(r,s,q)<0};
  const near=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1])<1.1;
  const maxDx=Math.max(2,Math.floor(lv.cols/3));
  const add=up=>{for(let t=0;t<6000;t++){const a=pick(2,total-1),b=pick(2,total-1);
    if(up?b<=a:b>=a)continue;const dr=Math.abs(rowOf(b)-rowOf(a));
    if(dr<1||dr>Math.ceil(lv.rows*.6)||used.has(a)||used.has(b))continue;
    const A=at(a),B=at(b);if(Math.abs(A[0]-B[0])>maxDx)continue;
    if(segs.some(([P,Q])=>cross(A,B,P,Q)||near(A,P)||near(A,Q)||near(B,P)||near(B,Q)))continue;
    used.add(a);used.add(b);j[a]=b;segs.push([A,B]);return}};
  for(let k=0;k<lv.nl;k++)add(true);
  for(let k=0;k<lv.ns;k++)add(false);
  /* Si no cupieron todas, se prueba otra distribución (siempre la misma para ese tablero) */
  if(Object.keys(j).length<lv.nl+lv.ns&&(lv.try||0)<30)return makeBoard({...lv,seed:lv.seed+1000,try:(lv.try||0)+1});
  return j;
}
/* Centro de la casilla n en unidades de casilla (y desde arriba) */
function xy(n){const i=n-1,r=Math.floor(i/C),c=r%2===0?i%C:C-1-i%C;return[c+.5,ROWS-1-r+.5]}

function drawBoard(){
  const board=api.k('board');board.style.setProperty('--ar',`${C}/${ROWS}`);board.style.setProperty('--cols',C);
  let cells='';
  for(let d=0;d<ROWS;d++){const r=ROWS-1-d;for(let c=0;c<C;c++){const n=r*C+(r%2===0?c+1:C-c);
    cells+=`<div class="sl-cell ${(r+c)%2?'b':''} ${n===N?'goal':''}${n===1?' start':''}">${n===1?(C>7?'1':'Salida'):n===N?'Meta':n}</div>`}}
  let svg='';
  Object.entries(jumps).forEach(([a,b],k)=>{a=+a;b=+b;const[x1,y1]=xy(a),[x2,y2]=xy(b);
    if(b>a){/* escalera */
      const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),nx=-dy/len*.17,ny=dx/len*.17;let rungs='';
      for(let s=.35;s<len-.1;s+=.38){const t=s/len,px=x1+dx*t,py=y1+dy*t;rungs+=`<line x1="${px+nx}" y1="${py+ny}" x2="${px-nx}" y2="${py-ny}"/>`}
      svg+=`<g class="lad"><line x1="${x1+nx}" y1="${y1+ny}" x2="${x2+nx}" y2="${y2+ny}"/><line x1="${x1-nx}" y1="${y1-ny}" x2="${x2-nx}" y2="${y2-ny}"/>${rungs}</g>`;
    }else{/* serpiente: de la cabeza (a) a la cola (b) */
      const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy),px=-dy/len,py=dx/len,pts=[];
      for(let s=0;s<=28;s++){const t=s/28,w=Math.sin(t*Math.PI*3)*.28*(1-t*.5);pts.push(`${(x1+dx*t+px*w).toFixed(3)},${(y1+dy*t+py*w).toFixed(3)}`)}
      const col=SNAKE[k%SNAKE.length],p=pts.join(' ');
      svg+=`<polyline points="${p}" fill="none" stroke="rgba(0,0,0,.35)" stroke-width=".26" stroke-linecap="round" stroke-linejoin="round"/>
        <polyline points="${p}" fill="none" stroke="${col}" stroke-width=".2" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="${x1}" cy="${y1}" r=".2" fill="${col}" stroke="rgba(0,0,0,.35)" stroke-width=".03"/>
        <circle cx="${x1-.07}" cy="${y1-.05}" r=".055" fill="#fff"/><circle cx="${x1+.07}" cy="${y1-.05}" r=".055" fill="#fff"/>
        <circle cx="${x1-.07}" cy="${y1-.04}" r=".027" fill="#222"/><circle cx="${x1+.07}" cy="${y1-.04}" r=".027" fill="#222"/>
        <path d="M${x1-.08},${y1+.07} Q${x1},${y1+.14} ${x1+.08},${y1+.07}" fill="none" stroke="#222" stroke-width=".025"/>`;
    }});
  board.innerHTML=`<div class="sl-grid" style="grid-template-columns:repeat(${C},1fr);grid-template-rows:repeat(${ROWS},1fr)">${cells}</div>
    <svg class="sl-svg" viewBox="0 0 ${C} ${ROWS}" aria-hidden="true">${svg}</svg>
    ${PLAYERS.map((p,i)=>`<div class="sl-tok" data-p="${i}" style="background:${p.c}"></div>`).join('')}`;
  place();
}
function place(){
  api.k('board').querySelectorAll('.sl-tok').forEach(t=>{const i=+t.dataset.p,[x,y]=xy(pos[i]),off=pos[0]===pos[1]?(i?.2:-.2):0;
    t.style.left=((x+off)/C*100)+'%';t.style.top=(y/ROWS*100)+'%'});
  const nm=names();
  api.k('who').innerHTML=nm.map((n,i)=>`<span class="sl-chip ${i===turn?'on':''}"><i style="background:${PLAYERS[i].c}"></i><span><b>${n}</b><small>Casilla ${pos[i]}</small></span></span>`).join('');
}
function face(v){api.k('die').innerHTML=Array.from({length:9},(_,i)=>`<i class="${PIPS[v].includes(i)?'on':''}"></i>`).join('');api.k('die').setAttribute('aria-label','Dado: '+v)}
function setTurnUI(){
  const nm=names(),cpuTurn=vsCPU&&turn===1;
  api.k('turn').innerHTML=`<i style="background:${PLAYERS[turn].c}"></i>${cpuTurn?'Turno de la computadora':vsCPU?'Su turno':'Turno de '+nm[turn]}`;
  api.k('roll').disabled=busy||cpuTurn;
  api.k('mode').querySelectorAll('button').forEach(b=>b.disabled=moved);
}

function roll(){
  if(busy)return;busy=true;moved=true;setTurnUI();
  const die=api.k('die');die.classList.add('roll');let k=0;
  const spin=()=>{face(1+Math.floor(Math.random()*6));APP.tone(500+k*30,.04,'sine',.05);if(++k<8)later(spin,70);else{
    die.classList.remove('roll');const v=1+Math.floor(Math.random()*6);face(v);
    api.msg(`${names()[turn]} sacó ${v}.`,'');later(()=>move(v),450)}};
  spin();
}
function move(v){
  let left=v;
  const step=()=>{if(pos[turn]>=N||left===0){land();return}
    pos[turn]++;left--;place();APP.tone(380+pos[turn]%8*25,.06,'sine',.06);later(step,220)};
  step();
}
function land(){
  const p=pos[turn],to=jumps[p],nm=names()[turn],you=vsCPU&&turn===0;
  if(to){
    if(to>p){api.msg(`¡Escalera! ${you?'Sube':nm+' sube'} de la casilla ${p} a la ${to}.`,'ok');[523,659,784].forEach((f,i)=>later(()=>APP.tone(f,.15),i*90))}
    else{api.msg(`¡Ups! Una serpiente ${you?'lo baja':'baja a '+nm} de la casilla ${p} a la ${to}.`,'no');[392,330,262].forEach((f,i)=>later(()=>APP.tone(f,.18,'triangle',.08),i*110))}
    later(()=>{pos[turn]=to;place();after()},900);
  }else after();
}
function after(){
  if(pos[turn]>=N){pos[turn]=N;place();later(()=>end(turn),600);return}
  turn=1-turn;busy=false;place();setTurnUI();
  if(vsCPU&&turn===1){busy=true;setTurnUI();later(()=>{busy=false;roll()},1200)}
}
function end(w){
  if(vsCPU)api.finish(w===0?3:1,w===0?'¡Llegó primero a la meta!':'Esta vez la computadora llegó primero. Gana 1 estrella por terminar y puede intentarlo otra vez.');
  else api.finish(2,`Ganó ${names()[w]}. ¡Buena partida!`);
}

APP.kit({
  id:'sl',name:'Serpientes y Escaleras',desc:'El clásico, con dado.',accent:'var(--grass)',key:'serpientes-v1',levels:LEVELS,
  art:'<svg class="art-sl" viewBox="0 0 3 3" aria-hidden="true"><rect width="3" height="3" fill="#FFF4D6"/><rect x="1" width="1" height="1" fill="#E7F2DA"/><rect y="1" width="1" height="1" fill="#E7F2DA"/><rect x="2" y="1" width="1" height="1" fill="#E7F2DA"/><rect x="1" y="2" width="1" height="1" fill="#E7F2DA"/><g stroke="#9A6A3A" stroke-width=".09"><line x1=".35" y1="2.7" x2="1.15" y2=".4"/><line x1=".7" y1="2.8" x2="1.5" y2=".5"/><line x1=".45" y1="2.4" x2=".8" y2="2.5"/><line x1=".65" y1="1.85" x2="1" y2="1.95"/><line x1=".85" y1="1.3" x2="1.2" y2="1.4"/><line x1="1.05" y1=".75" x2="1.4" y2=".85"/></g><polyline points="2.5,.5 2.2,1 2.6,1.5 2.2,2 2.5,2.6" fill="none" stroke="#3E9B4F" stroke-width=".22" stroke-linecap="round" stroke-linejoin="round"/><circle cx="2.5" cy=".5" r=".2" fill="#3E9B4F"/></svg>',
  lead:'Tire el dado y avance. Las escaleras lo suben y las serpientes lo bajan. 50 tableros.',
  how:'<p>Puede jugar contra la computadora o con otra persona en el mismo celular, tomando turnos. Gana quien llegue primero a la meta; no hace falta el número exacto.</p>',
  legend:'Ganar a la computadora da 3 estrellas. Si pierde, gana 1 estrella y se abre el siguiente tablero.',
  body:`<div class="seg" data-k="mode"><button data-v="cpu">Contra la compu</button><button data-v="dos">Dos personas</button></div>
    <div class="sl-who" data-k="who"></div>
    <div class="sl-board" data-k="board"></div>
    <p class="msg" aria-live="polite"></p>
    <div class="sl-bar">
      <div class="sl-turn" data-k="turn"></div>
      <div class="die" data-k="die" role="img"></div>
    </div>
    <button class="btn" data-k="roll">Tirar el dado</button>`,
  start(lv,n,a){api=a;L=lv;C=lv.cols;ROWS=lv.rows;N=C*ROWS;jumps=makeBoard(lv);pos=[1,1];turn=0;busy=false;moved=false;
    drawBoard();face(1);setMode();setTurnUI();a.msg(vsCPU?'Usted empieza. Toque "Tirar el dado".':'Empieza Rojo. Toque "Tirar el dado".','')},
  stop(){timers.forEach(clearTimeout);timers=[];busy=false},
  init(a){
    a.k('roll').onclick=roll;
    a.k('mode').querySelectorAll('button').forEach(b=>b.onclick=()=>{if(moved)return;vsCPU=b.dataset.v==='cpu';
      try{localStorage.setItem(MODE_KEY,vsCPU?'cpu':'dos')}catch(e){}setMode();place();setTurnUI();
      a.msg(vsCPU?'Usted empieza. Toque "Tirar el dado".':'Empieza Rojo. Toque "Tirar el dado".','')});
  }
});
function setMode(){api.k('mode').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.v==='cpu')===vsCPU))}
})();
