(function(){

const $=s=>document.querySelector(s);
/* rows = filas iniciales, k = colores, push = cada cuántos fallos baja una fila (0 = nunca) */
/* rows = filas iniciales, k = colores, push = cada cuántos fallos baja una fila (0 = nunca) */
const LEVELS=Array.from({length:50},(_,i)=>{
 const rows=Math.min(9,3+Math.floor(i/5)),k=i<4?3:i<12?4:i<28?5:6,push=i<8?0:Math.max(4,10-Math.floor((i-8)/6));
 return{name:`${k} colores, ${rows} filas`,rows,k,push};
});
const COLORS=['#E5484D','#3E8EF7','#F5C518','#2FB37A','#9B5DE5','#FF8A3D'];
const DARK=['#9E1F27','#1A55B0','#A87F00','#17744C','#5E2EA0','#B5501A'];
const COLS=9,LOSE_ROW=12,KEY='burbujas-v1';
let save={stars:{},sound:true};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.stars)save=Object.assign(save,s)}catch(e){}
const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(save))}catch(e){}};

/* Sonido */
let ac=null;
function tone(f=520,d=.12,type='sine',v=.15){if(!APP.sound)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();
 const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);
 o.frequency.exponentialRampToValueAtTime(f*1.5,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);
 o.connect(g).connect(ac.destination);o.start(t);o.stop(t+d)}catch(e){}}
const chime=()=>[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,.25),i*120));
const buzz=ms=>{try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}};

/* ---------- Inicio ---------- */
const unlocked=()=>{let u=1;while(u<=LEVELS.length&&save.stars[u])u++;return Math.min(u,LEVELS.length)};
const starStr=n=>'★'.repeat(n)+'☆'.repeat(3-n);
function drawHome(){
 const u=unlocked();$('#b-contTxt').textContent=`Nivel ${u} · ${LEVELS[u-1].name}`;
 $('#b-lvls').innerHTML=LEVELS.map((L,i)=>{const n=i+1,s=save.stars[n]||0,open=n<=u;
  return `<button class="lv ${s?'done':''}" data-n="${n}" ${open?'':'disabled'} aria-label="Nivel ${n}${open?'':', bloqueado'}">
  <span class="n">${n}</span><span class="t">${L.k} colores</span><span class="s">${open?(s?starStr(s):''):'🔒'}</span></button>`}).join('');
 $('#b-lvls').querySelectorAll('.lv').forEach(b=>b.onclick=()=>start(+b.dataset.n));
}
$('#b-contBtn').onclick=()=>start(unlocked());
function show(id){$('#b-home').hidden=id!=='home';$('#b-game').hidden=id!=='game';$('#b-over').hidden=true;window.scrollTo(0,0)}

/* ---------- Tablero ---------- */
const cv=$('#b-cv'),ctx=cv.getContext('2d');
let W,H,R,RH,SY,loseY;
let grid,shift,lvl,L,cur,nxt,shot,shots,misses,aim,state,fx,falls,initial,raf;
function resize(){
 const cw=$('#b-stage').clientWidth||340,avail=window.innerHeight-210;
 const ratio=(1+LOSE_ROW*1.7320508+4.2)/18;
 W=Math.max(260,Math.min(cw,avail/ratio,520));R=W/(COLS*2);RH=R*Math.sqrt(3);
 loseY=R+(LOSE_ROW-.5)*RH;H=Math.round(loseY+4.2*R);SY=H-2*R;
 const dpr=Math.min(window.devicePixelRatio||1,3);
 cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';ctx.setTransform(dpr,0,0,dpr,0,0);
}
const colsIn=r=>((r+shift)&1)?COLS-1:COLS;
const cellXY=(r,c)=>[R+c*2*R+(((r+shift)&1)?R:0),R+r*RH];
function neigh(r,c){
 const off=(r+shift)&1,out=[[r,c-1],[r,c+1]],dc=off?[c,c+1]:[c-1,c];
 for(const rr of[r-1,r+1])for(const cc of dc)out.push([rr,cc]);
 return out.filter(([rr,cc])=>rr>=0&&rr<grid.length&&cc>=0&&cc<colsIn(rr));
}
function present(){const s=new Set();grid.forEach(row=>row.forEach(v=>v!=null&&s.add(v)));return[...s]}
function pickColor(){const p=present();return p.length?p[Math.random()*p.length|0]:0}
function makeRow(r,k){
 const row=Array(colsIn(r)).fill(null);
 for(let c=0;c<row.length;c++){
  const left=row[c-1],up=r>0&&grid[r-1]?grid[r-1][Math.min(c,grid[r-1].length-1)]:null,src=[left,up].filter(v=>v!=null);
  row[c]=src.length&&Math.random()<.5?src[Math.random()*src.length|0]:Math.random()*k|0;
 }return row;
}
function start(n){
 lvl=n;L=LEVELS[n-1];shift=0;grid=[];
 for(let r=0;r<LOSE_ROW+2;r++)grid.push(r<L.rows?makeRow(r,L.k):Array(colsIn(r)).fill(null));
 initial=present().length?grid.flat().filter(v=>v!=null).length:0;
 cur=pickColor();nxt=pickColor();shot=null;shots=0;misses=0;aim=-Math.PI/2;state='play';fx=[];falls=[];
 $('#b-lvlNum').textContent=`Nivel ${n} de ${LEVELS.length}`;$('#b-lvlName').textContent=L.name;
 show('game');resize();hud();
 cancelAnimationFrame(raf);last=0;raf=requestAnimationFrame(loop);
}
function hud(){
 $('#b-shotsTxt').textContent='Tiros: '+shots;
 $('#b-pushTxt').textContent=L.push?`Fila nueva en ${L.push-misses} ${L.push-misses===1?'fallo':'fallos'}`:'Sin filas nuevas en este nivel';
}

/* Dibujo */
function shape(x,y,r,ci){
 ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(255,255,255,.55)';ctx.strokeStyle='rgba(255,255,255,.6)';ctx.lineWidth=r*.16;
 const s=r*.38;ctx.beginPath();
 if(ci===0){ctx.arc(0,0,s*.8,0,7);ctx.stroke()}
 else if(ci===1){ctx.moveTo(0,-s);ctx.lineTo(s*.95,s*.7);ctx.lineTo(-s*.95,s*.7);ctx.closePath();ctx.fill()}
 else if(ci===2){ctx.rect(-s*.72,-s*.72,s*1.44,s*1.44);ctx.fill()}
 else if(ci===3){ctx.moveTo(0,-s);ctx.lineTo(s*.8,0);ctx.lineTo(0,s);ctx.lineTo(-s*.8,0);ctx.closePath();ctx.fill()}
 else if(ci===4){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?s*.45:s*1.05;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.fill()}
 else{ctx.rect(-s*.25,-s,s*.5,s*2);ctx.rect(-s,-s*.25,s*2,s*.5);ctx.fill()}
 ctx.restore();
}
function bubble(x,y,r,ci,a=1){
 ctx.globalAlpha=a;
 const g=ctx.createRadialGradient(x-r*.35,y-r*.4,r*.1,x,y,r);
 g.addColorStop(0,'#fff');g.addColorStop(.22,COLORS[ci]);g.addColorStop(1,DARK[ci]);
 ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r*.96,0,7);ctx.fill();
 shape(x,y+r*.05,r,ci);
 ctx.fillStyle='rgba(255,255,255,.7)';ctx.beginPath();ctx.ellipse(x-r*.38,y-r*.45,r*.2,r*.12,-.6,0,7);ctx.fill();
 ctx.globalAlpha=1;
}
function guide(){
 let x=W/2,y=SY,vx=Math.cos(aim),vy=Math.sin(aim),bounces=0,d=0,next=R*1.1;const step=R/3;
 ctx.fillStyle='rgba(255,255,255,.85)';
 for(let i=0;i<900;i++){
  x+=vx*step;y+=vy*step;d+=step;
  if(x<R){x=R;vx=-vx;bounces++}if(x>W-R){x=W-R;vx=-vx;bounces++}
  if(y<R||hits(x,y)||bounces>2)break;
  if(d>=next){next+=R*1.1;ctx.beginPath();ctx.arc(x,y,R*.14,0,7);ctx.fill()}
 }
}
function hits(x,y){
 for(let r=0;r<grid.length;r++)for(let c=0;c<grid[r].length;c++)if(grid[r][c]!=null){
  const[cx,cy]=cellXY(r,c);if((cx-x)**2+(cy-y)**2<(2*R*.86)**2)return true}
 return false;
}
function draw(){
 const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#123A73');bg.addColorStop(1,'#2A7BD1');
 ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
 const glow=ctx.createRadialGradient(W/2,SY,R,W/2,SY,H*.7);glow.addColorStop(0,'rgba(255,255,255,.22)');glow.addColorStop(1,'rgba(255,255,255,0)');
 ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);
 ctx.setLineDash([R*.4,R*.3]);ctx.strokeStyle='rgba(255,255,255,.45)';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(0,loseY);ctx.lineTo(W,loseY);ctx.stroke();ctx.setLineDash([]);
 for(let r=0;r<grid.length;r++)for(let c=0;c<grid[r].length;c++)if(grid[r][c]!=null){const[x,y]=cellXY(r,c);bubble(x,y,R,grid[r][c])}
 fx.forEach(f=>bubble(f.x,f.y,R*(1+f.t*.8),f.ci,1-f.t));
 falls.forEach(f=>bubble(f.x,f.y,R,f.ci));
 if(state==='play'&&!shot)guide();
 if(shot)bubble(shot.x,shot.y,R,shot.ci);
 else if(state==='play')bubble(W/2,SY,R,cur);
 // próxima burbuja
 bubble(R*2.2,SY+R*.3,R*.72,nxt);
 ctx.fillStyle='rgba(255,255,255,.9)';ctx.font=`700 ${Math.round(R*.55)}px Atkinson Hyperlegible, Verdana, sans-serif`;ctx.textAlign='center';
 ctx.fillText('sigue',R*2.2,SY-R*.75);
}

/* Movimiento */
let last=0;
function loop(t){
 const dt=Math.min(40,t-(last||t))/1000;last=t;
 if(shot){
  const dist=W*1.5*dt,steps=Math.ceil(dist/(R/3));
  for(let i=0;i<steps&&shot;i++){
   shot.x+=shot.vx*dist/steps;shot.y+=shot.vy*dist/steps;
   if(shot.x<R){shot.x=R;shot.vx*=-1}if(shot.x>W-R){shot.x=W-R;shot.vx*=-1}
   if(shot.y<=R||hits(shot.x,shot.y))land();
  }
 }
 fx.forEach(f=>f.t+=dt*4);fx=fx.filter(f=>f.t<1);
 falls.forEach(f=>{f.vy+=H*2.2*dt;f.y+=f.vy*dt;f.x+=f.vx*dt});falls=falls.filter(f=>f.y<H+R);
 draw();raf=requestAnimationFrame(loop);
}
function land(){
 const{x,y,ci}=shot;shot=null;
 const rEst=Math.round((y-R)/RH);let best=null,bd=1e9;
 for(let pass=0;pass<2&&!best;pass++)
 for(let r=Math.max(0,rEst-1);r<=Math.min(grid.length-1,rEst+1);r++)for(let c=0;c<colsIn(r);c++){
  if(grid[r][c]!=null)continue;
  if(pass===0&&r>0&&!neigh(r,c).some(([a,b])=>grid[a][b]!=null))continue;
  const[cx,cy]=cellXY(r,c),d=(cx-x)**2+(cy-y)**2;if(d<bd){bd=d;best=[r,c]}
 }
 if(!best){state='play';return}
 const[r,c]=best;grid[r][c]=ci;resolve(r,c);
}
function resolve(r,c){
 const ci=grid[r][c],seen=new Set([r+','+c]),group=[[r,c]];
 for(let i=0;i<group.length;i++)for(const[a,b]of neigh(...group[i])){const k=a+','+b;
  if(!seen.has(k)&&grid[a][b]===ci){seen.add(k);group.push([a,b])}}
 if(group.length>=3){
  group.forEach(([a,b])=>{const[x,y]=cellXY(a,b);fx.push({x,y,ci,t:0});grid[a][b]=null});
  // burbujas que quedan colgando
  const keep=new Set(),q=[];
  grid[0].forEach((v,cc)=>{if(v!=null){keep.add('0,'+cc);q.push([0,cc])}});
  for(let i=0;i<q.length;i++)for(const[a,b]of neigh(...q[i])){const k=a+','+b;if(!keep.has(k)&&grid[a][b]!=null){keep.add(k);q.push([a,b])}}
  let dropped=0;
  for(let a=0;a<grid.length;a++)for(let b=0;b<grid[a].length;b++)if(grid[a][b]!=null&&!keep.has(a+','+b)){
   const[x,y]=cellXY(a,b);falls.push({x,y,ci:grid[a][b],vy:-R*3,vx:(Math.random()-.5)*R*4});grid[a][b]=null;dropped++}
  group.forEach((_,i)=>setTimeout(()=>tone(500+i*60,.1),i*45));
  if(dropped)setTimeout(()=>tone(300,.3,'triangle',.12),200);
  buzz(30);misses=0;
 }else{
  tone(260,.08,'triangle',.08);
  if(L.push){misses++;if(misses>=L.push){misses=0;addRow()}}
 }
 hud();
 if(!present().length){state='won';setTimeout(()=>finish(true),700);return}
 if(grid.some((row,a)=>a>=LOSE_ROW&&row.some(v=>v!=null))){state='lost';setTimeout(()=>finish(false),500);return}
 const p=present();if(!p.includes(cur))cur=pickColor();if(!p.includes(nxt))nxt=pickColor();
 state='play';
}
function addRow(){
 shift^=1;const p=present(),row=Array(colsIn(0)).fill(null).map(()=>p[Math.random()*p.length|0]);
 grid.unshift(row);grid.pop();tone(180,.35,'sawtooth',.06);buzz(80);
}
function fire(){
 if(state!=='play'||shot)return;
 shot={x:W/2,y:SY,vx:Math.cos(aim),vy:Math.sin(aim),ci:cur};state='flying';
 cur=nxt;nxt=pickColor();shots++;hud();tone(700,.06,'sine',.08);
}
function swap(){if(state!=='play'||shot)return;[cur,nxt]=[nxt,cur];tone(600,.06)}

/* Apuntar con el dedo */
let aiming=false;
function setAim(e){
 const b=cv.getBoundingClientRect(),px=e.clientX-b.left,py=e.clientY-b.top,dx=px-W/2,dy=py-SY;
 if(dy>-R*.6)return;aim=Math.max(-Math.PI+.17,Math.min(-.17,Math.atan2(dy,dx)));
}
cv.addEventListener('pointerdown',e=>{
 const b=cv.getBoundingClientRect(),px=e.clientX-b.left,py=e.clientY-b.top;
 if(Math.hypot(px-R*2.2,py-(SY+R*.3))<R*1.3){swap();return}
 e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}aiming=true;setAim(e);
});
cv.addEventListener('pointermove',e=>{if(aiming)setAim(e)});
cv.addEventListener('pointerup',e=>{if(!aiming)return;aiming=false;
 const b=cv.getBoundingClientRect();if(e.clientY-b.top<SY-R*.6)fire()});
cv.addEventListener('pointercancel',()=>aiming=false);
$('#b-swapBtn').onclick=swap;
window.addEventListener('resize',()=>{if(!$('#b-game').hidden&&grid)resize()});

function finish(won){
 cancelAnimationFrame(raf);draw();
 const lastLvl=lvl===LEVELS.length;
 if(won){
  const par=Math.ceil(initial/2.6),st=shots<=par?3:shots<=par*1.5?2:1;
  save.stars[lvl]=Math.max(save.stars[lvl]||0,st);persist();chime();
  $('#b-winT').textContent=lastLvl?'¡Terminó todo!':'¡Muy bien!';
  $('#b-winStars').innerHTML=[0,1,2].map(i=>`<span>${i<st?'★':'☆'}</span>`).join('');
  $('#b-winTxt').textContent=lastLvl?`Completó los ${LEVELS.length} niveles. Puede repetirlos para ganar más estrellas.`:`Limpió el tablero en ${shots} tiros.`;
  $('#b-nextBtn').textContent='Siguiente nivel';$('#b-nextBtn').hidden=lastLvl;
  $('#b-nextBtn').onclick=()=>start(lvl+1);
 }else{
  tone(220,.4,'triangle');
  $('#b-winT').textContent='¡Casi lo logra!';$('#b-winStars').innerHTML='';
  $('#b-winTxt').textContent='Las burbujas llegaron a la línea. Inténtelo otra vez, con calma.';
  $('#b-nextBtn').textContent='Intentar otra vez';$('#b-nextBtn').hidden=false;
  $('#b-nextBtn').onclick=()=>start(lvl);
 }
 $('#b-over').hidden=false;
}
const goHome=()=>{cancelAnimationFrame(raf);drawHome();show('home')};
$('#b-toHome').onclick=goHome;$('#b-backBtn').onclick=goHome;$('#b-resetBtn').onclick=()=>start(lvl);
drawHome();

APP.add({id:'b',name:'Lluvia de Burbujas',desc:'Junte 3 del mismo color.',accent:'var(--blue)',key:KEY,max:LEVELS.length*3,art:'<span class="art-b"><span style="left:4px;top:6px;background:#E5484D"></span><span style="left:36px;top:6px;background:#F5C518"></span><span style="left:20px;top:34px;background:#2FB37A"></span></span>',open(){cancelAnimationFrame(raf);drawHome();show('home')}});

})();
