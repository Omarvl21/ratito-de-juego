(function(){
const $=s=>document.querySelector(s);
const SETS={
 'Frutas':['🍎','🍌','🍇','🍉','🍓','🍍','🍐','🍒','🍑','🥝','🍋','🥭'],
 'La granja':['🐮','🐷','🐔','🐴','🐑','🐰','🦆','🐶','🐱','🐐','🦃','🐝'],
 'El jardín':['🌻','🌹','🌷','🌼','🌵','🍄','🌳','🍀','🦋','🐞','🐌','🌺'],
 'La cocina':['☕','🌽','🥑','🌶️','🍅','🥕','🧅','🍞','🥚','🧀','🍯','🥛'],
 'El mar':['🐟','🐙','🦀','🐬','🐳','🐚','🦈','🐠','🐢','⛵','🦞','🐡'],
 'Transporte':['🚗','🚌','🚲','🚂','✈️','🚢','🚕','🏍️','🚜','🚑','🚒','🚁'],
};
SETS['Revoltijo']=Object.values(SETS).flat();
/* p = parejas, c = columnas, prev = segundos para memorizar al inicio */
const NAMES=Object.keys(SETS).filter(k=>k!=='Revoltijo');
const colsFor=c=>c%4===0?4:c%5===0?5:c===6?3:c===18?6:4;
const LEVELS=Array.from({length:50},(_,i)=>{
 const p=Math.min(12,3+Math.floor(i/4)),s=i>=40&&i%2?'Revoltijo':NAMES[i%NAMES.length];
 return{s,p,c:colsFor(p*2),prev:Math.max(0,5-Math.floor(i/5))};
});
const KEY='memorama-v1';
let save={stars:{}};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.stars)save=s}catch(e){}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(save))}catch(e){}};
let ac=null;
function tone(f=520,d=.15,type='sine'){if(!APP.sound)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();
 const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);
 g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+d)}catch(e){}}
const chime=()=>[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,.25),i*120));
const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};

const unlocked=()=>{let u=1;while(u<=LEVELS.length&&save.stars[u])u++;return Math.min(u,LEVELS.length)};
const starStr=n=>'★'.repeat(n)+'☆'.repeat(3-n);
function drawHome(){
 const u=unlocked();$('#m-contTxt').textContent=`Nivel ${u} · ${LEVELS[u-1].s}`;
 $('#m-lvls').innerHTML=LEVELS.map((L,i)=>{const n=i+1,s=save.stars[n]||0,open=n<=u;
  return `<button class="lv ${s?'done':''}" data-n="${n}" ${open?'':'disabled'} aria-label="Nivel ${n}, ${L.p} parejas${open?'':', bloqueado'}">
  <span class="n">${n}</span><span class="t">${L.s}<br>${L.p} parejas</span><span class="s">${open?(s?starStr(s):''):'🔒'}</span></button>`}).join('');
 $('#m-lvls').querySelectorAll('.lv').forEach(b=>b.onclick=()=>start(+b.dataset.n));
}
$('#m-contBtn').onclick=()=>start(unlocked());
function show(id){$('#m-home').hidden=id!=='home';$('#m-game').hidden=id!=='game';$('#m-over').hidden=true;window.scrollTo(0,0)}

let lvl,L,open=[],tries=0,pairs=0,lock=false,timer=null;
function start(n){
 clearTimeout(timer);lvl=n;L=LEVELS[n-1];open=[];tries=0;pairs=0;
 const pics=[...SETS[L.s]].sort(()=>Math.random()-.5).slice(0,L.p),deck=[...pics,...pics].sort(()=>Math.random()-.5);
 $('#m-lvlNum').textContent=`Nivel ${n} de ${LEVELS.length}`;$('#m-lvlName').textContent=`${L.s} · ${L.p} parejas`;
 const box=$('#m-cards');box.style.gridTemplateColumns=`repeat(${L.c},1fr)`;box.style.maxWidth=(L.c*110)+'px';
 const fs=L.c>=5?'clamp(1.6rem,8vw,2.4rem)':'clamp(2rem,10vw,3rem)';
 box.innerHTML='';
 deck.forEach(p=>{const b=document.createElement('button');b.className='card';b.dataset.p=p;b.innerHTML=`<span style="font-size:${fs}">${p}</span>`;
  b.setAttribute('aria-label','Tarjeta boca abajo');b.onclick=()=>flip(b);box.appendChild(b)});
 counts();show('game');
 if(L.prev){lock=true;box.querySelectorAll('.card').forEach(c=>c.classList.add('open'));
  let left=L.prev;const tick=()=>{if(left<=0){box.querySelectorAll('.card').forEach(c=>c.classList.remove('open'));lock=false;msg('¡Ahora sí! Voltee dos tarjetas.','ok');return}
   msg(`Memorice las tarjetas… ${left}`,'');left--;timer=setTimeout(tick,1000)};tick();
 }else{lock=false;msg('Voltee dos tarjetas.','')}
}
function msg(t,c){const m=$('#m-msg');m.textContent=t;m.className='msg '+(c||'')}
function counts(){$('#m-pairs').textContent=`${pairs} de ${L.p}`;$('#m-tries').textContent='Intentos: '+tries}
function flip(b){
 if(lock||b.classList.contains('open')||b.classList.contains('match'))return;
 b.classList.add('open');b.setAttribute('aria-label','Tarjeta '+b.dataset.p);open.push(b);tone(480,.06);
 if(open.length<2)return;
 tries++;const[a,c]=open;
 if(a.dataset.p===c.dataset.p){
  a.classList.add('match');c.classList.add('match');open=[];pairs++;tone(660,.15);setTimeout(()=>tone(880,.2),100);buzz(40);
  msg('¡Pareja encontrada!','ok');
  if(pairs===L.p)setTimeout(finish,600);
 }else{
  lock=true;msg('No son iguales. Fíjese bien dónde están.','no');
  timer=setTimeout(()=>{[a,c].forEach(x=>{x.classList.remove('open');x.setAttribute('aria-label','Tarjeta boca abajo')});open=[];lock=false},1500);
 }
 counts();
}
function finish(){
 const st=tries<=L.p+2?3:tries<=L.p*2?2:1;save.stars[lvl]=Math.max(save.stars[lvl]||0,st);persist();chime();
 const lastLvl=lvl===LEVELS.length;
 $('#m-winT').textContent=lastLvl?'¡Terminó todo!':'¡Muy bien!';
 $('#m-winStars').innerHTML=[0,1,2].map(i=>`<span>${i<st?'★':'☆'}</span>`).join('');
 $('#m-winTxt').textContent=lastLvl?`Completó los ${LEVELS.length} niveles. Puede repetirlos para ganar más estrellas.`:`Encontró las ${L.p} parejas en ${tries} intentos.`;
 $('#m-nextBtn').hidden=lastLvl;$('#m-over').hidden=false;
}
$('#m-nextBtn').onclick=()=>start(lvl+1);
const toLevels=()=>{clearTimeout(timer);drawHome();show('home')};
$('#m-toHome').onclick=toLevels;$('#m-backBtn').onclick=toLevels;$('#m-resetBtn').onclick=()=>start(lvl);
APP.add({id:'m',name:'Memorama',desc:'Encuentre las parejas.',accent:'var(--plum)',key:KEY,max:LEVELS.length*3,open:toLevels,
 art:'<span class="art-m"><span>🌻</span><span class="c"></span></span>'});
drawHome();
})();
