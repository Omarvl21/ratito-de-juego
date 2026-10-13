(function(){
const $=id=>document.getElementById(id);
const PENTA=[262,294,330,392,440,523,587,659];
const soft=(f,d=.6,v=.07)=>APP.tone(f,d,'sine',v);

/* ---------- Respira Conmigo ---------- */
const RITMOS={tranquilo:[['Tome aire',4,1],['Sostenga',2,null],['Suelte el aire',6,.55]],
              parejo:[['Tome aire',4,1],['Sostenga',4,null],['Suelte el aire',4,.55],['Sostenga',4,null]]};
let ritmo='tranquilo',mins=3,tick=null,phase=0,left=0,elapsed=0,breaths=0,running=false;
function seg(id,set){$(id).querySelectorAll('button').forEach(b=>b.onclick=()=>{if(running)return;$(id).querySelectorAll('button').forEach(x=>x.setAttribute('aria-pressed',x===b));set(b.dataset.v)})}
seg('br-ritmo',v=>ritmo=v);seg('br-min',v=>mins=+v);
function setPhase(){const[w,s,scale]=RITMOS[ritmo][phase];left=s;$('br-word').textContent=w;$('br-num').textContent=s;
  const ball=$('br-ball');if(scale!=null){ball.style.transitionDuration=s+'s';ball.style.transform=`scale(${scale})`}
  soft(phase===0?330:phase===2?262:294,.8,.05)}
function stopBreath(msg){clearInterval(tick);running=false;$('br-go').textContent='Empezar';const b=$('br-ball');b.style.transitionDuration='1.5s';b.style.transform='scale(.55)';
  $('br-word').textContent='Listo';$('br-num').textContent='';if(msg)$('br-note').textContent=msg}
$('br-go').onclick=()=>{
  if(running){stopBreath('Pausa. Puede seguir cuando quiera.');return}
  running=true;phase=0;elapsed=0;breaths=0;$('br-go').textContent='Pausar';$('br-note').textContent='Respire por la nariz, sin forzar.';setPhase();
  tick=setInterval(()=>{elapsed++;left--;
    if(left>0){$('br-num').textContent=left;return}
    const seq=RITMOS[ritmo];if(seq[phase][0]==='Suelte el aire')breaths++;
    phase=(phase+1)%seq.length;
    if(phase===0&&elapsed>=mins*60){APP.chime();stopBreath(`Muy bien. Hizo ${breaths} respiraciones lentas. Quédese un momento así antes de levantarse.`);return}
    $('br-note').textContent=breaths?`Respiraciones: ${breaths}`:'Respire por la nariz, sin forzar.';setPhase()},1000);
};
APP.games.x1={name:'Respira Conmigo',open(){stopBreath('Siéntese cómodo y relaje los hombros.')}};

/* ---------- Mandalas ---------- */
const MCOL=['#F4A6A6','#F7C98B','#F6E27F','#B5DFA6','#8FD1C4','#9CC0EE','#C3AEEB','#ECA9CF','#6FAF95','#E58C6E','#B98B5E'];
const N_MD=12;let mdIdx=0,mdColor=MCOL[5],mdSave={};
try{const s=JSON.parse(localStorage.getItem('mandalas-v1'));if(s){mdSave=s.fills||{};mdIdx=s.idx||0}}catch(e){}
const mdPersist=()=>{try{localStorage.setItem('mandalas-v1',JSON.stringify({fills:mdSave,idx:mdIdx}))}catch(e){}};
function rng(seed){return()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646}}
const petal=(r0,r1,w)=>`M0,${-r0} Q${w},${-(r0+r1)/2} 0,${-r1} Q${-w},${-(r0+r1)/2} 0,${-r0}Z`;
function sector(r0,r1,a0,a1){const p=(r,a)=>`${(r*Math.sin(a)).toFixed(2)},${(-r*Math.cos(a)).toFixed(2)}`;
  return `M${p(r0,a0)} L${p(r1,a0)} A${r1},${r1} 0 0 1 ${p(r1,a1)} L${p(r0,a1)} A${r0},${r0} 0 0 0 ${p(r0,a0)}Z`}
function design(d){
  const R=rng(d*97+13),pick=a=>a[Math.floor(R()*a.length)],out=[];
  const nOut=pick([16,20,24]),nBig=pick([6,8,10,12]),nIn=pick([6,8,12]);
  for(let i=0;i<nOut;i++)out.push(`<path d="${sector(84,96,i*2*Math.PI/nOut,(i+1)*2*Math.PI/nOut)}"/>`);
  for(let i=0;i<nBig;i++)out.push(`<path d="${petal(38,82,14+R()*14)}" transform="rotate(${i*360/nBig})"/>`);
  if(R()<.6)for(let i=0;i<nBig;i++)out.push(`<path d="${petal(40,64,6+R()*6)}" transform="rotate(${i*360/nBig+180/nBig})"/>`);
  else for(let i=0;i<nBig;i++)out.push(`<circle cx="0" cy="-72" r="${5+R()*3}" transform="rotate(${i*360/nBig+180/nBig})"/>`);
  for(let i=0;i<nIn;i++)out.push(`<path d="${sector(24,38,i*2*Math.PI/nIn,(i+1)*2*Math.PI/nIn)}"/>`);
  for(let i=0;i<nIn;i++)out.push(`<path d="${petal(8,24,6+R()*5)}" transform="rotate(${i*360/nIn+180/nIn})"/>`);
  out.push('<circle cx="0" cy="0" r="8"/>');
  return out;
}
function drawMd(){
  const svg=$('md-svg'),fills=mdSave[mdIdx]||{};
  svg.innerHTML=`<circle cx="0" cy="0" r="96" fill="#FFFFFF"/>`+design(mdIdx).join('');
  [...svg.children].forEach((el,i)=>{if(i===0){el.style.pointerEvents='none';return}const k=i;el.setAttribute('fill',fills[k]||'#FFFFFF');
    el.onclick=()=>{el.setAttribute('fill',mdColor);(mdSave[mdIdx]=mdSave[mdIdx]||{})[k]=mdColor;if(mdColor==='#FFFFFF')delete mdSave[mdIdx][k];mdPersist();soft(PENTA[k%PENTA.length],.4,.04)}});
  $('md-label').textContent=`Dibujo ${mdIdx+1} de ${N_MD}`;
}
$('md-sw').innerHTML=MCOL.map(c=>`<button class="sw" style="--c:${c}" data-c="${c}" aria-pressed="${c===mdColor}" aria-label="Color"></button>`).join('')+`<button class="sw erase" data-c="#FFFFFF" aria-pressed="false" aria-label="Borrador">✕</button>`;
$('md-sw').querySelectorAll('.sw').forEach(b=>b.onclick=()=>{mdColor=b.dataset.c;$('md-sw').querySelectorAll('.sw').forEach(x=>x.setAttribute('aria-pressed',x===b))});
$('md-clear').onclick=()=>{delete mdSave[mdIdx];mdPersist();drawMd()};
$('md-next').onclick=()=>{mdIdx=(mdIdx+1)%N_MD;mdPersist();drawMd();window.scrollTo(0,0)};
APP.games.x2={name:'Mandalas para Colorear',open:drawMd};

/* ---------- Tres Cosas Buenas ---------- */
const QS=['¿Qué le hizo sonreír hoy?','¿Con quién platicó hoy?','¿Qué comió rico hoy?','¿Qué cosa bonita vio hoy?','¿Qué logró hacer hoy, aunque sea pequeño?','¿A quién le agradece algo hoy?'];
const CHIPS=['Hablé con mi familia','Comí algo rico','Salí a caminar','Vi el sol','Descansé bien','Alguien me ayudó','Escuché música','Recé o medité','Cuidé mis plantas','Me reí'];
let gd={};try{gd=JSON.parse(localStorage.getItem('gratitud-v1'))||{}}catch(e){}
const gdSave=()=>{try{localStorage.setItem('gratitud-v1',JSON.stringify(gd))}catch(e){}};
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const fmtDate=k=>{const[y,m,d]=k.split('-').map(Number);return new Date(y,m-1,d).toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long'})};
const esc=t=>t.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function drawGd(){
  const k=today(),items=gd[k]||[];
  $('gd-date').textContent='Hoy es '+fmtDate(k)+'.';
  $('gd-list').innerHTML=[0,1,2].map(i=>items[i]?`<li><i>${i+1}</i><span>${esc(items[i])}</span></li>`:`<li class="empty"><i>${i+1}</i><span>Pendiente</span></li>`).join('');
  $('gd-field').hidden=items.length>=3;
  $('gd-q').textContent=QS[(items.length+new Date().getDate())%QS.length];
  $('gd-chips').innerHTML=CHIPS.filter(c=>!items.includes(c)).slice(0,6).map(c=>`<button class="chip">${c}</button>`).join('');
  $('gd-chips').querySelectorAll('.chip').forEach(b=>b.onclick=()=>add(b.textContent));
  if(items.length>=3)$('gd-msg').textContent='Listo por hoy. Vuelva mañana a anotar tres cosas buenas más.';
  const past=Object.keys(gd).filter(x=>x!==k).sort().reverse().slice(0,7);
  $('gd-past').innerHTML=past.length?past.map(p=>`<div><b>${fmtDate(p)}</b><p>${gd[p].map(esc).join(' · ')}</p></div>`).join(''):'<p class="legend">Aquí aparecerán sus días anteriores.</p>';
}
function add(t){t=t.trim();if(!t)return;const k=today();gd[k]=gd[k]||[];if(gd[k].length>=3)return;gd[k].push(t.slice(0,140));gdSave();$('gd-txt').value='';
  const n=gd[k].length;$('gd-msg').textContent=n<3?`Guardado. Lleva ${n} de 3.`:'';soft(PENTA[n+2],.5,.06);if(n===3)APP.chime();drawGd()}
$('gd-add').onclick=()=>add($('gd-txt').value);
APP.games.x3={name:'Tres Cosas Buenas',open(){$('gd-msg').textContent='';drawGd()}};

/* ---------- Jardín Tranquilo ---------- */
const cv=$('jd-cv'),ctx=cv.getContext('2d');let W=0,H=0,flowers=[],drops=[],motes=[],raf=null,rain=false,rainNode=null;
const FC=['#F28CA6','#F6C04E','#B58CE8','#F59A6B','#7EB6F0','#F2F2F2','#E8607A'];
function size(){const w=cv.parentElement.clientWidth||340;W=w;H=Math.min(Math.round(w*1.25),Math.round(window.innerHeight*.62));const d=Math.min(devicePixelRatio||1,3);
  cv.width=W*d;cv.height=H*d;cv.style.width=W+'px';cv.style.height=H+'px';ctx.setTransform(d,0,0,d,0,0)}
function ground(){return H*.7}
cv.addEventListener('pointerdown',e=>{const b=cv.getBoundingClientRect();let x=e.clientX-b.left,y=e.clientY-b.top;y=Math.max(ground(),y);
  flowers.push({x,y,t:0,h:H*(.18+Math.random()*.22),c:FC[Math.random()*FC.length|0],n:5+(Math.random()*3|0),s:1+Math.random()*.5,sway:Math.random()*6});
  if(flowers.length>40)flowers.shift();soft(PENTA[Math.random()*PENTA.length|0],1.2,.06)});
function draw(t){
  const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,rain?'#9FB3C4':'#BFE3F2');sky.addColorStop(.7,rain?'#C9D6DE':'#EAF6EF');
  ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  if(!rain){ctx.fillStyle='rgba(255,214,102,.85)';ctx.beginPath();ctx.arc(W*.82,H*.14,H*.07,0,7);ctx.fill()}
  ctx.fillStyle='#6B4F3A';ctx.fillRect(0,ground(),W,H);ctx.fillStyle='#7DA35A';ctx.fillRect(0,ground()-6,W,10);
  flowers.forEach(f=>{f.t=Math.min(1,f.t+.006);const g=f.t<.6?f.t/.6:1,top=f.y-f.h*g,sw=Math.sin(t/1400+f.sway)*4*g;
    ctx.strokeStyle='#3F7D3A';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(f.x,f.y);ctx.quadraticCurveTo(f.x+sw*2,(f.y+top)/2,f.x+sw,top);ctx.stroke();
    if(g>.5){ctx.fillStyle='#5A9B4C';ctx.beginPath();ctx.ellipse(f.x+sw*.6+7,(f.y+top)/2,9,4,-.5,0,7);ctx.fill()}
    const b=f.t<.6?0:Math.min(1,(f.t-.6)/.4),r=11*f.s*b;
    if(b>0){ctx.fillStyle=f.c;for(let i=0;i<f.n;i++){const a=i*2*Math.PI/f.n+t/9000;ctx.beginPath();ctx.ellipse(f.x+sw+Math.cos(a)*r,top+Math.sin(a)*r,r*.75,r*.45,a,0,7);ctx.fill()}
      ctx.fillStyle='#F7D35B';ctx.beginPath();ctx.arc(f.x+sw,top,r*.45,0,7);ctx.fill()}});
  if(rain){if(drops.length<90)drops.push({x:Math.random()*W,y:-10,v:3+Math.random()*2});
    ctx.strokeStyle='rgba(255,255,255,.7)';ctx.lineWidth=1.5;drops.forEach(d=>{d.y+=d.v;ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-1,d.y+9);ctx.stroke()});drops=drops.filter(d=>d.y<ground())}
  else{if(motes.length<14)motes.push({x:Math.random()*W,y:ground()-Math.random()*H*.5,p:Math.random()*6});
    ctx.fillStyle='rgba(255,255,255,.75)';motes.forEach(m=>{m.y-=.15;m.p+=.01;ctx.beginPath();ctx.arc(m.x+Math.sin(m.p)*6,m.y,2,0,7);ctx.fill()});motes=motes.filter(m=>m.y>0)}
  if(!flowers.length){ctx.fillStyle='rgba(40,60,40,.7)';ctx.font='700 18px Atkinson Hyperlegible, Verdana, sans-serif';ctx.textAlign='center';ctx.fillText('Toque aquí para plantar',W/2,ground()+40)}
  raf=requestAnimationFrame(draw);
}
function rainSound(on){try{if(on){APP.ac=APP.ac||new(window.AudioContext||window.webkitAudioContext)();const ac=APP.ac,len=ac.sampleRate*2,buf=ac.createBuffer(1,len,ac.sampleRate),d=buf.getChannelData(0);
  for(let i=0;i<len;i++)d[i]=Math.random()*2-1;const src=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();src.buffer=buf;src.loop=true;f.type='lowpass';f.frequency.value=900;g.gain.value=APP.sound?.06:0;
  src.connect(f).connect(g).connect(ac.destination);src.start();rainNode=src}else if(rainNode){rainNode.stop();rainNode=null}}catch(e){}}
$('jd-rain').onclick=()=>{rain=!rain;$('jd-rain').textContent='Lluvia suave: '+(rain?'sí':'no');rainSound(rain)};
$('jd-clear').onclick=()=>{flowers=[]};
const stopGarden=()=>{cancelAnimationFrame(raf);raf=null;if(rain){rain=false;rainSound(false);$('jd-rain').textContent='Lluvia suave: no'}};
APP.games.x4={name:'Jardín Tranquilo',open(){size();cancelAnimationFrame(raf);raf=requestAnimationFrame(draw)}};
document.addEventListener('click',e=>{if(e.target.closest('#app-x4 [data-hub]'))stopGarden();if(e.target.closest('#app-x1 [data-hub]'))stopBreath()},true);
window.addEventListener('resize',()=>{if(!$('app-x4').hidden)size()});

APP.calm=[
 {id:'x1',name:'Respira Conmigo',desc:'Respiración lenta guiada.',accent:'var(--sage)',art:'<span class="art-br"></span>'},
 {id:'x2',name:'Mandalas para Colorear',desc:'Colorear con un toque.',accent:'var(--lav)',art:'<svg class="art-md" viewBox="-50 -50 100 100"><g fill="rgba(255,255,255,.85)">'+[0,1,2,3,4,5,6,7].map(i=>`<path d="${petal(10,46,10)}" transform="rotate(${i*45})"/>`).join('')+'</g><circle r="9" fill="#F6E27F"/></svg>'},
 {id:'x3',name:'Tres Cosas Buenas',desc:'Anote lo bueno del día.',accent:'var(--amber)',art:'<span class="art-gr">1·2·3</span>'},
 {id:'x4',name:'Jardín Tranquilo',desc:'Plante flores en calma.',accent:'var(--sage)',art:'<span class="art-jd">🌷🌼</span>'},
];
})();
