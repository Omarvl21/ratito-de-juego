/* Cuentos para Escuchar
   Los cuentos están en js/cuentos-datos.js.
   Voz: si el cuento tiene "audio", se reproduce esa grabación; si no, lee la voz del celular.
   Para que la voz suene fluida, el cuento se manda completo a la voz del celular en trozos
   de varias frases; así lee de corrido, sin pausas entre frase y frase. */
(function(){
const LIST=window.CUENTOS||[];
const KEY='cuentos-v1';
let st={heard:{},voice:'',slow:true};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s)st=Object.assign(st,s)}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
const synth=window.speechSynthesis,canSpeak=!!(synth&&window.SpeechSynthesisUtterance);
const TIPOS=['Todos','Fábulas','Cuentos de casa','Para dormir'];
/* Voces preferidas, de la más natural a la más sencilla. Las "Natural"/"Online" (Edge, Windows) y las
   "mejoradas" de iPhone suenan mucho más humanas. */
const PREF=['Dalia Online','Natural','Online','Paulina (Mejorada)','Paulina (Enhanced)','Mónica (Mejorada)','Google español de Estados Unidos','Paulina','Sabina','Dalia','Mónica','Monica','Google español','Lucía','Helena','Laura','Elvira','Marisol','Ximena'];
let filtro='Todos',cur=null,chunks=[],ci=0,playing=false,gen=0,audio=null,wake=null,keep=null;

const root=document.createElement('div');root.className='gapp wrap';root.id='app-ct';root.hidden=true;
root.style.setProperty('--accent','var(--story)');
root.innerHTML=`
<section data-s="lib" class="wrap">
  <button class="hub-back" data-hub>‹ Todos los juegos</button>
  <header><h1>Cuentos para Escuchar</h1><p class="lead">Elija un cuento, póngase cómoda y escuche. Puede leer al mismo tiempo si quiere.</p></header>
  <div class="chips" data-k="tipos"></div>
  <div class="tales" data-k="list"></div>
</section>
<section data-s="story" class="wrap" hidden>
  <div class="top"><button class="icon" data-k="back" aria-label="Volver a los cuentos">‹</button>
    <div class="ttl"><small data-k="tipo"></small><b data-k="titulo"></b></div>
    <button class="icon" data-k="cfg" aria-label="Elegir la voz">⚙</button></div>
  <div class="voicebox" data-k="vbox" hidden>
    <label for="ct-voice"><b>Voz</b></label>
    <select id="ct-voice" data-k="voice"></select>
    <div class="seg" data-k="speed"><button data-v="1">Pausada</button><button data-v="0">Normal</button></div>
    <button class="btn ghost" data-k="test">Probar la voz</button>
    <p class="legend" data-k="vnote"></p>
  </div>
  <div class="player">
    <span class="tale-art" data-k="art"></span>
    <div class="pcontrols">
      <button class="icon big" data-k="prev" aria-label="Párrafo anterior">⏮</button>
      <button class="playbtn" data-k="play" aria-label="Escuchar">▶</button>
      <button class="icon big" data-k="next" aria-label="Párrafo siguiente">⏭</button>
    </div>
    <p class="calm-note" data-k="status"></p>
  </div>
  <article class="tale-text" data-k="text"></article>
  <div class="tale-end" data-k="end" hidden>
    <p class="phrase">Fin del cuento.</p>
    <button class="btn" data-k="another">Escuchar otro cuento</button>
  </div>
</section>`;
document.body.appendChild(root);
const k=n=>root.querySelector(`[data-k="${n}"]`);
const show=s=>{root.querySelectorAll('[data-s]').forEach(x=>x.hidden=x.dataset.s!==s);window.scrollTo(0,0)};
const mins=c=>Math.max(1,Math.round(c.texto.join(' ').split(/\s+/).length/140));

/* ---------- Biblioteca ---------- */
function drawLib(){
  k('tipos').innerHTML=TIPOS.map(t=>`<button class="chip ${t===filtro?'on':''}" data-t="${t}">${t}</button>`).join('');
  k('tipos').querySelectorAll('.chip').forEach(b=>b.onclick=()=>{filtro=b.dataset.t;drawLib()});
  const items=LIST.filter(c=>filtro==='Todos'||c.tipo===filtro);
  k('list').innerHTML=items.map(c=>`<button class="tale" data-id="${c.id}">
    <span class="tale-art sm">${c.dibujo}</span>
    <span class="tale-meta"><b>${c.titulo}</b><span>${c.tipo} · ${mins(c)} minutos${c.audio?' · voz grabada':''}</span>
    ${st.heard[c.id]?'<span class="heard">✓ Ya lo escuchó</span>':''}</span></button>`).join('');
  k('list').querySelectorAll('.tale').forEach(b=>b.onclick=()=>open(LIST.find(c=>c.id===b.dataset.id)));
}

/* ---------- Voces ---------- */
function spanishVoices(){return canSpeak?synth.getVoices().filter(v=>/^es/i.test(v.lang)):[]}
function pickVoice(){
  const vs=spanishVoices();if(!vs.length)return null;
  const saved=vs.find(v=>v.name===st.voice);if(saved)return saved;
  for(const n of PREF){const v=vs.find(v=>v.name.includes(n)&&/es[-_]MX/i.test(v.lang))||vs.find(v=>v.name.includes(n)&&/es[-_](US|419)/i.test(v.lang))||vs.find(v=>v.name.includes(n));if(v)return v}
  return vs.find(v=>/es[-_]MX/i.test(v.lang))||vs.find(v=>/es[-_](US|419)/i.test(v.lang))||vs[0];
}
function drawVoices(){
  const vs=spanishVoices(),cv=pickVoice();
  k('voice').innerHTML=vs.length?vs.map(v=>`<option ${cv&&v.name===cv.name?'selected':''}>${v.name}</option>`).join(''):'<option>Voz del celular</option>';
  k('vnote').textContent=!canSpeak?'Este navegador no puede leer en voz alta. Puede leer el cuento en pantalla.':
    vs.length?'Elija la voz que más le guste a su mamá.':'Este celular no tiene voz en español. En Android: Ajustes → Idioma → Texto a voz, e instale el español.';
  k('speed').querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',(b.dataset.v==='1')===st.slow));
}
if(canSpeak&&'onvoiceschanged' in synth)synth.addEventListener('voiceschanged',drawVoices);
k('voice').onchange=()=>{st.voice=k('voice').value;save()};
k('speed').querySelectorAll('button').forEach(b=>b.onclick=()=>{st.slow=b.dataset.v==='1';save();drawVoices()});
k('cfg').onclick=()=>{k('vbox').hidden=!k('vbox').hidden;drawVoices()};
k('test').onclick=()=>{if(!canSpeak)return;stopAll();say('Hola. Le voy a contar un cuento muy bonito.',()=>{})};

function say(text,done){
  const u=new SpeechSynthesisUtterance(text),v=pickVoice();
  if(v){u.voice=v;u.lang=v.lang}else u.lang='es-MX';
  u.rate=st.slow?.9:1;u.pitch=1;u.volume=1;
  const g=gen;u.onend=()=>{if(g===gen)done()};u.onerror=e=>{if(g===gen&&e.error!=='interrupted'&&e.error!=='canceled')done()};
  synth.speak(u);return u;
}
/* Parte cada párrafo en trozos de 1 a 3 frases (máximo ~230 letras): lo bastante largos para
   sonar de corrido y lo bastante cortos para que ningún celular corte la voz a medio trozo. */
function makeChunks(c){
  const out=[];
  c.texto.forEach((par,pi)=>{
    const ss=(par.match(/[^.!?…]+[.!?…]+(?:["»”][.,;:]?)?\s*|[^.!?…]+$/g)||[par]).map(x=>x.trim()).filter(Boolean);
    let buf='';
    ss.forEach(x=>{if(buf&&(buf+' '+x).length>230){out.push({p:pi,t:buf});buf=x}else buf=buf?buf+' '+x:x});
    if(buf)out.push({p:pi,t:buf});
  });
  return out;
}

/* ---------- Lectura ---------- */
function open(c){
  stopAll();cur=c;chunks=makeChunks(c);ci=0;
  k('tipo').textContent=c.tipo;k('titulo').textContent=c.titulo;k('art').textContent=c.dibujo;
  k('text').innerHTML=c.texto.map((t,i)=>`<p data-i="${i}">${t}</p>`).join('');
  k('text').querySelectorAll('p').forEach(el=>el.onclick=()=>jump(+el.dataset.i));
  k('end').hidden=true;k('vbox').hidden=true;
  k('status').textContent=c.audio?'Toque ▶ para escuchar la grabación.':canSpeak?'Toque ▶ para escuchar el cuento.':'Este navegador no puede leer en voz alta; puede leerlo aquí abajo.';
  k('play').disabled=!c.audio&&!canSpeak;setPlayIcon();mark();show('story');
}
const curP=()=>chunks[Math.min(ci,chunks.length-1)]?.p??0;
function mark(){const p=curP();k('text').querySelectorAll('p').forEach((el,i)=>el.classList.toggle('now',playing&&i===p&&!cur.audio))}
function setPlayIcon(){k('play').textContent=playing?'❚❚':'▶';k('play').setAttribute('aria-label',playing?'Pausar':'Escuchar')}
async function keepAwake(on){try{if(on&&!wake&&navigator.wakeLock)wake=await navigator.wakeLock.request('screen');else if(!on&&wake){wake.release();wake=null}}catch(e){wake=null}}

/* Manda todos los trozos que faltan de una vez: la voz los lee seguidos, sin huecos */
function speakFrom(i){
  gen++;synth.cancel();const g=gen;let lastP=-1;
  for(let n=i;n<chunks.length;n++){
    const u=say(chunks[n].t,()=>{if(n===chunks.length-1)finish()});
    u.onstart=()=>{if(g!==gen)return;ci=n;mark();
      if(chunks[n].p!==lastP){lastP=chunks[n].p;const el=k('text').children[lastP];if(el)el.scrollIntoView({behavior:'smooth',block:'center'})}};
  }
  /* Algunos navegadores de computadora se quedan "en pausa" solos con textos largos; esto los reanima */
  clearInterval(keep);keep=setInterval(()=>{if(playing&&synth.paused)synth.resume()},5000);
}
function play(){
  if(cur.audio){
    if(!audio){audio=new Audio(cur.audio);audio.onended=finish;
      audio.onerror=()=>{audio=null;cur={...cur,audio:null};k('status').textContent='No se encontró la grabación; la leerá la voz del celular.';if(canSpeak)play()}}
    audio.play().catch(()=>{});playing=true;setPlayIcon();keepAwake(true);k('status').textContent='Escuchando…';return;
  }
  if(!canSpeak)return;
  playing=true;setPlayIcon();keepAwake(true);k('end').hidden=true;
  if(ci>=chunks.length)ci=0;mark();
  k('status').textContent='Escuchando… toque un párrafo para ir a esa parte.';speakFrom(ci);
}
function pause(){
  playing=false;gen++;clearInterval(keep);
  if(audio)audio.pause();else if(canSpeak)synth.cancel();
  setPlayIcon();mark();keepAwake(false);k('status').textContent='En pausa. Toque ▶ para seguir donde se quedó.';
}
function jump(i){
  if(cur.audio)return;
  const was=playing;pause();const p=Math.max(0,Math.min(cur.texto.length-1,i));ci=chunks.findIndex(x=>x.p===p);mark();
  if(was)play();else{k('text').children[p].scrollIntoView({behavior:'smooth',block:'center'});k('status').textContent=`Párrafo ${p+1} de ${cur.texto.length}. Toque ▶ para escuchar.`}
}
function finish(){
  playing=false;gen++;clearInterval(keep);ci=chunks.length;setPlayIcon();mark();keepAwake(false);
  st.heard[cur.id]=true;save();
  k('status').textContent='';k('end').hidden=false;k('end').scrollIntoView({behavior:'smooth',block:'center'});APP.chime();
}
function stopAll(){playing=false;gen++;clearInterval(keep);if(canSpeak)synth.cancel();if(audio){audio.pause();audio=null}keepAwake(false)}

k('play').onclick=()=>playing?pause():play();
k('prev').onclick=()=>jump(curP()-1);
k('next').onclick=()=>jump(curP()+1);
k('back').onclick=()=>{stopAll();drawLib();show('lib')};
k('another').onclick=()=>{stopAll();drawLib();show('lib')};
document.addEventListener('click',e=>{if(e.target.closest('#app-ct [data-hub]'))stopAll()},true);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing&&!cur.audio)pause()});

APP.games.ct={name:'Cuentos para Escuchar',open(){stopAll();drawLib();drawVoices();show('lib')}};
APP.tales=[{id:'ct',name:'Cuentos para Escuchar',desc:`${LIST.length} cuentos leídos en voz alta.`,accent:'var(--story)',art:'<span class="art-ct">📖</span>'}];
})();
