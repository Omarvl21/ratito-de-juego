(function(){
/* len = largo final de la secuencia, pads = cuántos colores, ms = qué tan rápido se ilumina */
const LEVELS=Array.from({length:50},(_,i)=>{
 const len=Math.min(14,3+Math.floor(i/4)),pads=i>=12&&i%3===2?6:i>=30&&i%2?6:4,ms=Math.max(500,900-i*8);
 return{name:`${len} pasos${pads>4?', 6 colores':''}`,len,pads,ms};
});
const PADS=[['#D93F46','●',330],['#2E7DDB','▲',392],['#D9A300','■',440],['#2A9A64','◆',523],['#8E55D6','★',587],['#E0712A','✚',659]];
let L,seq,cur,pos,mist,busy,timers=[],api;
const later=(f,ms)=>timers.push(setTimeout(f,ms));
APP.kit({
 id:'q',name:'Sigue la Secuencia',desc:'Repita el orden de los colores.',accent:'var(--crimson)',key:'secuencia-v1',levels:LEVELS,
 art:'<span class="art-x"><i></i><i></i><i></i><i></i></span>',
 lead:'Mire qué colores se iluminan y tóquelos en el mismo orden. 50 niveles.',
 how:'<p>La secuencia empieza con 2 colores y crece de uno en uno hasta completar el nivel. Si se equivoca, se la mostramos otra vez.</p>',
 body:`<p class="turn" data-k="turn">Mire con atención</p>
  <div class="pads wait" data-k="pads"></div>
  <p class="msg" aria-live="polite"></p>
  <button class="btn ghost" data-k="again">Ver otra vez</button>`,
 start(l,n,a){api=a;L=l;mist=0;cur=2;seq=Array.from({length:L.len},()=>Math.random()*L.pads|0);
  const box=a.k('pads');box.classList.toggle('many',L.pads>4);
  box.innerHTML=PADS.slice(0,L.pads).map((p,i)=>`<button class="pad" data-i="${i}" style="--c:${p[0]}" aria-label="Color ${i+1}">${p[1]}</button>`).join('');
  box.querySelectorAll('.pad').forEach(b=>b.onpointerdown=e=>{e.preventDefault();tap(+b.dataset.i)});
  a.msg('','');later(play,700)},
 stop(){timers.forEach(clearTimeout);timers=[]},
 init(a){a.k('again').onclick=()=>{if(!busy){mist++;play()}}}
});
function light(i,ms){const b=api.k('pads').children[i];if(!b)return;b.classList.add('lit');APP.tone(PADS[i][2],ms/1000*.8,'sine',.18);later(()=>b.classList.remove('lit'),ms*.8)}
function play(){
 busy=true;pos=0;api.k('pads').classList.add('wait');api.k('turn').textContent=`Mire con atención · ${cur} de ${L.len}`;
 for(let i=0;i<cur;i++)later(()=>light(seq[i],L.ms),i*L.ms+300);
 later(()=>{busy=false;api.k('pads').classList.remove('wait');api.k('turn').textContent='Su turno';api.msg(`Toque los ${cur} colores en orden.`,'')},cur*L.ms+400);
}
function tap(i){
 if(busy)return;light(i,420);
 if(seq[pos]!==i){mist++;busy=true;api.k('pads').classList.add('wait');api.msg('Casi. Mire otra vez con calma.','no');APP.buzz(80);later(play,1300);return}
 pos++;
 if(pos<cur)return;
 busy=true;api.k('pads').classList.add('wait');APP.buzz(40);
 if(cur>=L.len){later(()=>api.finish(APP.starsFor(mist),mist?`Recordó la secuencia de ${L.len} pasos con ${mist} ${mist===1?'repetición':'repeticiones'}.`:`Recordó la secuencia de ${L.len} pasos sin equivocarse.`),600);return}
 cur++;api.msg('¡Muy bien! Ahora uno más.','ok');later(play,1100);
}
})();
