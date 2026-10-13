/* APP: registro de juegos, ajustes y utilidades compartidas */
window.APP={sound:true,big:false,last:null,games:{},order:[],
  add(g){this.games[g.id]=g;this.order.push(g.id)},
  open(id){document.getElementById('hub').hidden=true;document.querySelectorAll('.gapp').forEach(x=>x.hidden=x.id!=='app-'+id);
    this.last=id;this.savePrefs();this.games[id].open();window.scrollTo(0,0)},
  goHub(){document.querySelectorAll('.gapp').forEach(x=>x.hidden=true);document.getElementById('hub').hidden=false;this.renderHub();window.scrollTo(0,0)},
  savePrefs(){try{localStorage.setItem('ratito-app',JSON.stringify({sound:this.sound,big:this.big,last:this.last}))}catch(e){}},
  starsOf(g){let n=0;try{const s=JSON.parse(localStorage.getItem(g.key));if(s&&s.stars)n=Object.values(s.stars).reduce((a,b)=>a+b,0)}catch(e){}return n},
  renderHub(){
    const h=new Date().getHours();document.getElementById('greet').textContent=h<12?'Buenos días':h<19?'Buenas tardes':'Buenas noches';
    let all=0,max=0;
    document.getElementById('hubGames').innerHTML=this.order.map(id=>{const g=this.games[id],n=this.starsOf(g);all+=n;max+=g.max;
      return `<button class="tile" data-go="${id}" style="--accent:${g.accent}"><span class="art">${g.art}</span><b>${g.name}</b><span class="d">${g.desc}</span><span class="p"><i>★</i> ${n} de ${g.max}</span></button>`}).join('');
    document.querySelectorAll('#hubGames [data-go]').forEach(b=>b.onclick=()=>APP.open(b.dataset.go));
    const plain=(list,id)=>{const el=document.getElementById(id);if(!el)return;
      el.innerHTML=(list||[]).map(g=>`<button class="tile" data-go="${g.id}" style="--accent:${g.accent}"><span class="art">${g.art}</span><b>${g.name}</b><span class="d">${g.desc}</span></button>`).join('');
      el.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>APP.open(b.dataset.go))};
    plain(this.tales,'hubTales');plain(this.calm,'hubCalm');
    const r=document.getElementById('hubResume'),lg=this.last&&this.games[this.last];
    r.hidden=!lg;if(lg){document.getElementById('hubResumeTxt').textContent=lg.name;r.onclick=()=>APP.open(lg.id)}
    document.getElementById('hubSnd').textContent='Sonido: '+(this.sound?'sí':'no');
    document.getElementById('hubBig').textContent='Letra: '+(this.big?'grande':'normal');
    document.getElementById('hubTotal').textContent=`Lleva ${all} de ${max} estrellas. Su avance se guarda en este celular.`;
  },
  applyBig(){document.documentElement.classList.toggle('big',this.big)},
  ac:null,
  tone(f=520,d=.15,type='sine',v=.15){if(!APP.sound)return;try{APP.ac=APP.ac||new(window.AudioContext||window.webkitAudioContext)();const ac=APP.ac;
    const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+d)}catch(e){}},
  chime(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>APP.tone(f,.25),i*120))},
  buzz(ms){try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}},
  rnd:(a,b)=>a+Math.floor(Math.random()*(b-a+1)),
  shuffle:a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]]}return a},
  starsFor:m=>m<=1?3:m<=3?2:1,
  boot(){this.applyBig();this.renderHub()}
};
try{const s=JSON.parse(localStorage.getItem('ratito-app'));if(s){if(typeof s.sound==='boolean')APP.sound=s.sound;APP.big=!!s.big;APP.last=s.last||null}}catch(e){}
document.getElementById('hubSnd').onclick=()=>{APP.sound=!APP.sound;APP.savePrefs();APP.renderHub()};
document.getElementById('hubBig').onclick=()=>{APP.big=!APP.big;APP.applyBig();APP.savePrefs();APP.renderHub()};
document.addEventListener('click',e=>{if(e.target.closest('[data-hub]'))APP.goHub()});

/* Pedir un segundo toque antes de reiniciar o borrar, para evitar accidentes */
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-confirm],[aria-label="Reiniciar nivel"]');if(!b)return;
  if(b.dataset.armed==='1'){clearTimeout(b._t);b.dataset.armed='';b.classList.remove('arm');b.innerHTML=b._html;return}
  e.preventDefault();e.stopPropagation();
  b._html=b.innerHTML;b.dataset.armed='1';b.classList.add('arm');b.textContent=b.classList.contains('icon')?'¿Sí?':'Toque otra vez para confirmar';
  b._t=setTimeout(()=>{b.dataset.armed='';b.classList.remove('arm');b.innerHTML=b._html},3500);
},true);

/* Recordatorio de descanso: cada 30 minutos de juego con la pantalla encendida */
let playMin=0;
setInterval(()=>{if(document.visibilityState!=='visible'||!document.getElementById('hub').hidden)return;
  playMin++;if(playMin>=30){playMin=0;document.getElementById('restOver').hidden=false;APP.tone(392,.5,'sine',.06)}},60000);
document.getElementById('restOk').onclick=()=>{document.getElementById('restOver').hidden=true};

/* Kit de niveles: pantalla de niveles, barra de juego y ventana de fin, para los juegos nuevos */
APP.kit=function(c){
  const root=document.createElement('div');root.className='gapp wrap';root.id='app-'+c.id;root.hidden=true;root.style.setProperty('--accent',c.accent);
  root.innerHTML=`<section data-s="home" class="wrap">
    <button class="hub-back" data-hub>‹ Todos los juegos</button>
    <header><h1>${c.name}</h1><p class="lead">${c.lead}</p></header>
    <button class="btn cont" data-k="cont"><small>Continuar</small><b data-k="contTxt"></b></button>
    ${c.how?`<div class="how">${c.how}</div>`:''}
    <h2 class="sec">Niveles</h2><div class="lvls" data-k="lvls"></div>
    <p class="legend">${c.legend||'Menos errores, más estrellas. Al terminar un nivel se abre el siguiente.'}</p>
  </section>
  <section data-s="game" class="wrap" hidden>
    <div class="top"><button class="icon" data-k="back" aria-label="Volver a niveles">‹</button>
      <div class="ttl"><small data-k="num"></small><b data-k="name"></b></div>
      <button class="icon" data-k="reset" aria-label="Reiniciar nivel">↻</button></div>
    ${c.body}
  </section>
  <div class="over" data-k="over" hidden><div class="win" role="dialog">
    <h2 data-k="winT"></h2><div class="stars" data-k="winStars"></div><p data-k="winTxt"></p>
    <button class="btn" data-k="next"></button><button class="btn ghost" data-k="toHome">Ver niveles</button></div></div>`;
  document.body.appendChild(root);
  const q=s=>root.querySelector(s),k=n=>root.querySelector(`[data-k="${n}"]`);
  let save={stars:{}};try{const s=JSON.parse(localStorage.getItem(c.key));if(s&&s.stars)save=s}catch(e){}
  const persist=()=>{try{localStorage.setItem(c.key,JSON.stringify(save))}catch(e){}};
  const N=c.levels.length,unlocked=()=>{let u=1;while(u<=N&&save.stars[u])u++;return Math.min(u,N)};
  const api={q,k,root,lvl:1,
    show(s){root.querySelectorAll('[data-s]').forEach(x=>x.hidden=x.dataset.s!==s);k('over').hidden=true;window.scrollTo(0,0)},
    drawHome(){const u=unlocked();k('contTxt').textContent=`Nivel ${u} · ${c.levels[u-1].name}`;
      k('lvls').innerHTML=c.levels.map((L,i)=>{const n=i+1,s=save.stars[n]||0,open=n<=u;
        return `<button class="lv ${s?'done':''}" data-n="${n}" ${open?'':'disabled'} aria-label="Nivel ${n}, ${L.name}${open?'':', bloqueado'}"><span class="n">${n}</span><span class="t">${L.name}</span><span class="s">${open?(s?'★'.repeat(s)+'☆'.repeat(3-s):''):'🔒'}</span></button>`}).join('');
      k('lvls').querySelectorAll('.lv').forEach(b=>b.onclick=()=>api.start(+b.dataset.n))},
    start(n){c.stop&&c.stop();api.lvl=n;const L=c.levels[n-1];k('num').textContent=`Nivel ${n} de ${N}`;k('name').textContent=L.name;api.show('game');c.start(L,n,api)},
    msg(t,cls){const m=q('.msg');if(m){m.textContent=t;m.className='msg '+(cls||'')}},
    finish(st,text){c.stop&&c.stop();save.stars[api.lvl]=Math.max(save.stars[api.lvl]||0,st);persist();APP.chime();const last=api.lvl===N;
      k('winT').textContent=last?'¡Terminó todo!':'¡Muy bien!';k('winStars').innerHTML=[0,1,2].map(i=>`<span>${i<st?'★':'☆'}</span>`).join('');
      k('winTxt').textContent=last?`Completó los ${N} niveles. Puede repetirlos para ganar más estrellas.`:text;
      k('next').textContent='Siguiente nivel';k('next').hidden=last;k('next').onclick=()=>api.start(api.lvl+1);k('over').hidden=false}
  };
  const toLevels=()=>{c.stop&&c.stop();api.drawHome();api.show('home')};
  k('cont').onclick=()=>api.start(unlocked());k('back').onclick=toLevels;k('toHome').onclick=toLevels;k('reset').onclick=()=>api.start(api.lvl);
  APP.add({id:c.id,name:c.name,desc:c.desc,accent:c.accent,art:c.art,key:c.key,max:N*3,open:toLevels});
  if(c.init)c.init(api);
  return api;
};
