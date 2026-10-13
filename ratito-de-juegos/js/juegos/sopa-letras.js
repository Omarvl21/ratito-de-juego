(function(){

const $=s=>document.querySelector(s);
/* Direcciones: H derecha, V abajo, D diagonal abajo-derecha, R = también al revés y diagonal subiendo */
const H=[0,1],V=[1,0],D=[1,1],D2=[-1,1];
/* Temas: palabras sin acentos. Los niveles toman un tema y una dificultad según su número */
const THEMES=[
 ['Frutas','PERA UVA MANGO KIWI MELON SANDIA FRESA LIMON NARANJA GUAYABA PAPAYA CEREZA DURAZNO'],
 ['Colores','ROJO AZUL VERDE GRIS CAFE ROSA BLANCO NEGRO MORADO NARANJA AMARILLO DORADO'],
 ['Animales de granja','VACA GALLO CERDO OVEJA PATO CABALLO BURRO GALLINA CHIVO TORO CONEJO POLLITO'],
 ['En la cocina','OLLA COMAL JARRO PLATO TAZA CUCHARA SARTEN CAZO VASO MOLCAJETE LICUADORA ESTUFA'],
 ['Flores','ROSA GIRASOL LIRIO CLAVEL TULIPAN DALIA ORQUIDEA GERANIO MARGARITA AZUCENA NOCHEBUENA VIOLETA'],
 ['Antojitos','TAMAL ELOTE SOPE POZOLE TACO GORDITA TOSTADA QUESADILLA TLACOYO ESQUITES CHALUPA TORTA'],
 ['Oficios','MAESTRO DOCTOR PANADERO CARTERO SASTRE CHOFER CARPINTERO PLOMERO HERRERO MECANICO ENFERMERA COCINERO'],
 ['Música','GUITARRA TROMPETA VIOLIN TAMBOR CORNETA ARPA PIANO FLAUTA MARIMBA ACORDEON CLARINETE SAXOFON'],
 ['Fiestas','POSADA CUETES MARIACHI BAILE PONCHE VELAS BANDA CONFETI GLOBOS PASTEL REGALOS SERENATA'],
 ['El clima','LLUVIA NUBE SOL VIENTO GRANIZO NEBLINA ARCOIRIS TRUENO RAYO NIEVE CALOR FRIO'],
 ['La familia','ABUELA NIETO PRIMA SOBRINO MADRINA TIO HERMANO PADRINO ABUELO TIA SUEGRA COMPADRE'],
 ['Estados de México','TLAXCALA PUEBLA OAXACA SONORA YUCATAN JALISCO CHIAPAS COLIMA HIDALGO TABASCO DURANGO SINALOA'],
 ['La ropa','CAMISA FALDA REBOZO SOMBRERO ZAPATOS VESTIDO CHAMARRA CALCETIN SUETER BLUSA HUARACHES PANTALON'],
 ['El cuerpo','MANO PIE OJO NARIZ BOCA OREJA RODILLA CODO HOMBRO CABEZA ESPALDA DEDO'],
 ['La casa','SALA COCINA PATIO PUERTA VENTANA TECHO RECAMARA ESCALERA JARDIN AZOTEA COCHERA PARED'],
 ['Verduras','PAPA CEBOLLA AJO CHILE NOPAL CALABAZA ZANAHORIA PEPINO LECHUGA JITOMATE CHAYOTE EJOTE'],
 ['El mercado','PUESTO BASCULA KILO MARCHANTE CANASTA BOLSA PRECIO CAMBIO FRUTA CARNE QUESO CREMA'],
 ['Bebidas','CAFE ATOLE AGUA CHOCOLATE HORCHATA JAMAICA TEPACHE LECHE TE REFRESCO PONCHE JUGO'],
 ['Animales del campo','VENADO CONEJO COYOTE AGUILA ZORRO TLACUACHE ARDILLA LECHUZA CUERVO VIBORA LAGARTIJA COLIBRI'],
 ['Árboles','PINO ROBLE SAUCE OCOTE CEDRO NOGAL AGUACATE MANZANO FRESNO OLIVO PALMA ENCINO'],
 ['Transporte','CAMION TREN BICI CARRO AVION BARCO METRO TAXI COMBI MOTO CARRETA LANCHA'],
 ['Juegos de antes','CANICAS TROMPO YOYO LOTERIA BALERO MATATENA RAYUELA DOMINO BARAJA PAPALOTE ESCONDIDAS RONDA'],
 ['Dulces mexicanos','CAJETA ALEGRIA PALANQUETA COCADA JAMONCILLO OBLEA MAZAPAN CHICLE GLORIAS ATE PEPITORIA BORRACHITO'],
 ['El campo','MILPA SURCO ARADO TIERRA SEMILLA COSECHA MAIZ FRIJOL TRIGO ESTABLO POZO CERCA'],
 ['Días y meses','LUNES MARTES JUEVES VIERNES SABADO DOMINGO ENERO MARZO ABRIL MAYO JUNIO JULIO'],
 ['Herramientas','MARTILLO PINZAS SERRUCHO CLAVO TALADRO METRO PALA PICO MACHETE TIJERAS LIJA BROCHA'],
 ['Mar y playa','PEZ OLA ARENA CONCHA BARCO RED PLAYA CANGREJO TORTUGA DELFIN BALLENA PULPO'],
 ['Cosas bonitas','AMOR ALEGRIA PAZ CALMA ESPERANZA FE GUSTO RISA ABRAZO TERNURA ORGULLO AMISTAD'],
];
/* Dificultad por tramos: tamaño del tablero, direcciones, palabras al revés y cuántas palabras */
const TIERS=[[5,6,[H],0,4],[10,7,[H],0,5],[15,7,[H,V],0,5],[20,8,[H,V],0,6],[28,8,[H,V,D],0,6],[36,9,[H,V,D],0,7],[43,10,[H,V,D,D2],1,7],[50,10,[H,V,D,D2],1,8]];
let prevT='';
const LEVELS=Array.from({length:50},(_,i)=>{
 const[,n,d,r,count]=TIERS.find(t=>i<t[0]);
 for(let k=0;k<THEMES.length;k++){const[t,ws]=THEMES[(i+k)%THEMES.length],w=ws.split(' ').filter(x=>x.length<=n);
  if(t!==prevT&&w.length>=count+2){prevT=t;return{t,n,d,r,count,w}}}
});
const FILL='AAAEEEIIOOOUURRSSNNLLTTCCDMMPBGVHF';
const COLORS=['#FFD27A','#8FDCCB','#F5A7AC','#A9C4F2','#C2E39A','#D9B8F2','#FFB98A','#9FE0E8'];
const KEY='sopa-letras-v1';
let save={stars:{},sound:true};
try{const s=JSON.parse(localStorage.getItem(KEY));if(s&&s.stars)save=Object.assign(save,s)}catch(e){}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(save))}catch(e){}}

/* Sonido */
let ac=null;
function tone(f=520,d=.15,type='sine'){if(!APP.sound)return;try{ac=ac||new(window.AudioContext||window.webkitAudioContext)();
 const o=ac.createOscillator(),g=ac.createGain(),t=ac.currentTime;o.type=type;o.frequency.setValueAtTime(f,t);
 g.gain.setValueAtTime(.16,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+d)}catch(e){}}
function chime(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,.25),i*120))}
function buzz(ms){try{navigator.vibrate&&navigator.vibrate(ms)}catch(e){}}

/* ---------- Pantalla de inicio ---------- */
const unlocked=()=>{let u=1;while(u<=LEVELS.length&&save.stars[u])u++;return Math.min(u,LEVELS.length)};
const starStr=n=>'★'.repeat(n)+'☆'.repeat(3-n);
function drawHome(){
 const u=unlocked();
 $('#s-contTxt').textContent=`Nivel ${u} · ${LEVELS[u-1].t}`;
 $('#s-lvls').innerHTML=LEVELS.map((L,i)=>{const n=i+1,s=save.stars[n]||0,open=n<=u;
  return `<button class="lv ${s?'done':''}" data-n="${n}" ${open?'':'disabled'} aria-label="Nivel ${n}, ${L.t}${open?'':', bloqueado'}">
   <span class="n">${n}</span><span class="t">${L.t}</span><span class="s">${open?(s?starStr(s):''):'🔒'}</span></button>`}).join('');
 $('#s-lvls').querySelectorAll('.lv').forEach(b=>b.onclick=()=>start(+b.dataset.n));
}
$('#s-contBtn').onclick=()=>start(unlocked());
function show(id){$('#s-home').hidden=id!=='home';$('#s-game').hidden=id!=='game';$('#s-over').hidden=true;window.scrollTo(0,0)}

/* ---------- Juego ---------- */
let lvl,L,N,G,words,pos,found,owner,hints,drag=null,tapFirst=null;
function build(){
 for(let a=0;a<80;a++){
  G=Array.from({length:N},()=>Array(N).fill(''));pos={};
  const order=[...words].sort((x,y)=>y.length-x.length);
  if(order.every(w=>place(w)))break;
 }
 words=words.filter(w=>pos[w]);
 for(let r=0;r<N;r++)for(let c=0;c<N;c++)if(!G[r][c])G[r][c]=FILL[Math.random()*FILL.length|0];
}
function place(w){
 for(let k=0;k<300;k++){
  let[dr,dc]=L.d[Math.random()*L.d.length|0];
  let word=w;if(L.r&&Math.random()<.4)word=[...w].reverse().join('');
  const rs=dr===1?N-w.length:dr===-1?w.length-1:N-1, r0=dr===-1?w.length-1:0;
  const r=r0+(Math.random()*(rs-r0+1)|0), c=Math.random()*(N-(dc?w.length-1:0))|0;
  let ok=true;for(let i=0;i<w.length;i++){const ch=G[r+dr*i][c+dc*i];if(ch&&ch!==word[i]){ok=false;break}}
  if(ok){for(let i=0;i<w.length;i++)G[r+dr*i][c+dc*i]=word[i];pos[w]={r,c,dr,dc,rev:word!==w};return true}
 }return false;
}
function start(n){
 lvl=n;L=LEVELS[n-1];N=L.n;words=[...new Set(L.w)].sort(()=>Math.random()-.5).slice(0,L.count);found=new Set();owner={};hints=0;drag=null;tapFirst=null;
 build();
 $('#s-lvlNum').textContent=`Nivel ${n} de ${LEVELS.length}`;$('#s-lvlTheme').textContent=L.t;
 const dirTxt=L.r?'Ojo: aquí hay palabras al revés y en diagonal.':L.d.length>2?'Las palabras pueden ir en diagonal.':L.d.length>1?'Las palabras van hacia la derecha o hacia abajo.':'Todas las palabras van de izquierda a derecha.';
 $('#s-help').textContent=dirTxt+' Deslice el dedo o toque la primera y la última letra.';
 msg('', '');show('game');drawGrid();drawWords();
}
function drawGrid(){
 const g=$('#s-grid');g.style.gridTemplateColumns=`repeat(${N},1fr)`;
 const fs=N<=6?'1.7rem':N<=8?'1.35rem':N<=9?'1.15rem':'1.05rem';
 g.innerHTML='';
 for(let r=0;r<N;r++)for(let c=0;c<N;c++){
  const b=document.createElement('div');b.className='cell';b.textContent=G[r][c];b.dataset.r=r;b.dataset.c=c;b.style.fontSize=fs;
  g.appendChild(b);
 }
 paintFound();
}
const cellEl=(r,c)=>$('#s-grid').children[r*N+c];
function paintFound(){
 for(let r=0;r<N;r++)for(let c=0;c<N;c++){const e=cellEl(r,c),k=owner[r+','+c];
  e.classList.toggle('found',k!==undefined);e.style.background=k!==undefined?COLORS[k%COLORS.length]:''}
}
function drawWords(){
 $('#s-words').innerHTML=words.map(w=>`<li class="${found.has(w)?'done':''}">${w}</li>`).join('');
 $('#s-count').textContent=`${found.size} de ${words.length}`;
 $('#s-hintBtn').disabled=found.size===words.length;
}
function msg(t,cls){const m=$('#s-msg');m.textContent=t;m.className='msg '+(cls||'')}

/* Selección: arrastrar o tocar dos letras */
function lineCells(r0,c0,r,c){
 const dr=r-r0,dc=c-c0;if(!dr&&!dc)return[[r0,c0]];
 const oct=Math.round(Math.atan2(dr,dc)/(Math.PI/4));
 const map={0:[0,1],1:[1,1],2:[1,0],3:[1,-1],4:[0,-1],'-4':[0,-1],'-1':[-1,1],'-2':[-1,0],'-3':[-1,-1]};
 const[ur,uc]=map[oct];let len=Math.max(Math.abs(dr),Math.abs(dc))+1,out=[];
 for(let i=0;i<len;i++){const rr=r0+ur*i,cc=c0+uc*i;if(rr<0||cc<0||rr>=N||cc>=N)break;out.push([rr,cc])}
 return out;
}
function markSel(cells){$('#s-grid').querySelectorAll('.sel').forEach(e=>e.classList.remove('sel'));cells.forEach(([r,c])=>cellEl(r,c).classList.add('sel'))}
function cellAt(x,y){const e=document.elementFromPoint(x,y);const c=e&&e.closest&&e.closest('.cell');return c&&$('#s-grid').contains(c)?[+c.dataset.r,+c.dataset.c]:null}
const grid=$('#s-grid');
grid.addEventListener('pointerdown',e=>{
 const p=cellAt(e.clientX,e.clientY);if(!p)return;e.preventDefault();
 try{grid.setPointerCapture(e.pointerId)}catch(_){}
 drag={start:p,cells:[p],moved:false};
 if(!tapFirst)markSel([p]);
});
grid.addEventListener('pointermove',e=>{
 if(!drag)return;const p=cellAt(e.clientX,e.clientY);if(!p)return;
 if(p[0]!==drag.start[0]||p[1]!==drag.start[1]){drag.moved=true;tapFirst=null}
 if(drag.moved){drag.cells=lineCells(drag.start[0],drag.start[1],p[0],p[1]);markSel(drag.cells)}
});
function endDrag(){
 if(!drag)return;const d=drag;drag=null;
 if(d.moved){check(d.cells);return}
 const p=d.start;
 if(!tapFirst){tapFirst=p;markSel([p]);tone(440,.06);return}
 if(tapFirst[0]===p[0]&&tapFirst[1]===p[1]){tapFirst=null;markSel([]);return}
 const cells=lineCells(tapFirst[0],tapFirst[1],p[0],p[1]);tapFirst=null;
 const last=cells[cells.length-1];
 if(last[0]!==p[0]||last[1]!==p[1]){markSel([]);msg('Las letras deben estar en línea recta.','no');tone(220,.18,'triangle');return}
 markSel(cells);setTimeout(()=>check(cells),120);
}
grid.addEventListener('pointerup',endDrag);
grid.addEventListener('pointercancel',()=>{drag=null;markSel(tapFirst?[tapFirst]:[])});

function check(cells){
 const s=cells.map(([r,c])=>G[r][c]).join(''),rev=[...s].reverse().join('');
 const w=cells.length>1&&words.find(x=>!found.has(x)&&(x===s||x===rev));
 markSel([]);
 if(w){
  const idx=words.indexOf(w);found.add(w);cells.forEach(([r,c])=>owner[r+','+c]=idx);
  paintFound();drawWords();tone(660,.18);setTimeout(()=>tone(880,.2),110);buzz(40);
  if(found.size===words.length)setTimeout(finish,500);
  else msg(`¡Muy bien! Encontró ${w}.`,'ok');
 }else if(cells.length>1){msg('Esa no es. Intente de nuevo con calma.','no');tone(220,.18,'triangle')}
}
$('#s-hintBtn').onclick=()=>{
 const left=words.filter(w=>!found.has(w));if(!left.length)return;
 const w=left[Math.random()*left.length|0],p=pos[w];hints++;
 const r=p.rev?p.r+p.dr*(w.length-1):p.r, c=p.rev?p.c+p.dc*(w.length-1):p.c;
 const e=cellEl(r,c);e.classList.remove('hint');void e.offsetWidth;e.classList.add('hint');
 setTimeout(()=>e.classList.remove('hint'),3000);
 msg(`La palabra ${w} empieza en la letra marcada.`,'');tone(520,.12);
};
function finish(){
 const st=Math.max(1,3-hints);save.stars[lvl]=Math.max(save.stars[lvl]||0,st);persist();chime();
 const lastLvl=lvl===LEVELS.length;
 $('#s-winT').textContent=lastLvl?'¡Terminó todo!':'¡Muy bien!';
 $('#s-winStars').innerHTML=[0,1,2].map(i=>`<span>${i<st?'★':'☆'}</span>`).join('');
 $('#s-winTxt').textContent=lastLvl?`Completó los ${LEVELS.length} niveles. Puede repetir cualquiera para ganar más estrellas.`:
   hints?`Encontró todas las palabras usando ${hints} ${hints===1?'pista':'pistas'}.`:'Encontró todas las palabras sin pistas.';
 $('#s-nextBtn').hidden=lastLvl;$('#s-over').hidden=false;
}
$('#s-nextBtn').onclick=()=>start(lvl+1);
$('#s-toHome').onclick=()=>{drawHome();show('home')};
$('#s-backBtn').onclick=()=>{drawHome();show('home')};
$('#s-resetBtn').onclick=()=>start(lvl);
drawHome();

APP.add({id:'s',name:'Sopa de Letras',desc:'Busque palabras escondidas.',accent:'var(--teal)',key:KEY,max:LEVELS.length*3,art:'<span class="art-s"><span class="f">S</span><span class="f">O</span><span class="f">L</span><span>M</span><span>A</span><span>R</span><span>P</span><span>E</span><span>Z</span></span>',open(){drawHome();show('home')}});

})();
