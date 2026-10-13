(function(){
/* 50 niveles en tramos de 5. Cada tramo: nombre, tipos de pregunta y rangos.
   t: add suma, sub resta, mul tabla, div división, compra mercado, cambio billete */
const TRAMOS=[
 ['Sumas sencillas',{t:['add'],max:10},{t:['add'],max:20}],
 ['Restas sencillas',{t:['sub'],max:10},{t:['sub'],max:20}],
 ['Sumas y restas',{t:['add','sub'],max:30},{t:['add','sub'],max:100}],
 ['Tablas de multiplicar',{t:['mul'],lo:2,hi:5},{t:['mul'],lo:2,hi:10}],
 ['En el mercado',{t:['compra'],qmax:3},{t:['compra'],qmax:6}],
 ['El cambio',{t:['cambio'],bills:[20,50]},{t:['cambio'],bills:[100,200,500]}],
 ['Divisiones',{t:['div'],lo:2,hi:5},{t:['div'],lo:2,hi:10}],
 ['Números grandes',{t:['add','sub'],max:200},{t:['add','sub','mul'],max:500,lo:2,hi:12}],
 ['Dinero de todo',{t:['compra','cambio'],qmax:5,bills:[50,100,200]},{t:['compra','cambio'],qmax:8,bills:[100,200,500]}],
 ['De todo un poco',{t:['add','sub','mul','div','compra','cambio'],max:100,lo:2,hi:9,qmax:5,bills:[50,100,200]},{t:['add','sub','mul','div','compra','cambio'],max:300,lo:3,hi:12,qmax:8,bills:[100,200,500]}],
];
const LEVELS=Array.from({length:50},(_,i)=>{
 const[name,a,b]=TRAMOS[Math.floor(i/5)],f=(i%5)/4,lerp=(x,y)=>x==null?y:Math.round(x+(y-x)*f);
 return{name,t:f<.5?a.t:b.t,max:lerp(a.max,b.max),lo:lerp(a.lo,b.lo),hi:lerp(a.hi,b.hi),qmax:lerp(a.qmax,b.qmax),bills:f<.5?a.bills:b.bills,four:i>=25};
});
const ITEMS=[['kilos de tortilla',22],['piezas de pan',6],['litros de leche',28],['kilos de jitomate',30],['refrescos',18],['tamales',15],['tortas',35],['kilos de frijol',40],['kilos de naranja',20],['elotes',12]];
const Q=8,{rnd,shuffle}=APP;
let qs,idx,mist,done,api,timer=null,LV;
const box4=L=>api.k('opts').classList.toggle('two',L.four);
function make(L){
 const t=L.t[Math.random()*L.t.length|0];
 if(t==='add'){const a=rnd(1,L.max-1),b=rnd(1,L.max-a);return{math:`${a} + ${b}`,ans:a+b}}
 if(t==='sub'){const a=rnd(2,L.max),b=rnd(1,a-1);return{math:`${a} − ${b}`,ans:a-b}}
 if(t==='div'){const b=rnd(L.lo,L.hi),r=rnd(1,10);return{math:`${b*r} ÷ ${b}`,ans:r}}
 if(t==='mul'){const a=rnd(L.lo,L.hi),b=rnd(1,10);return{math:`${a} × ${b}`,ans:a*b}}
 if(t==='compra'){const[it,p]=ITEMS[Math.random()*ITEMS.length|0],n=rnd(2,L.qmax||5);return{story:`Compra ${n} ${it} a $${p} cada uno. ¿Cuánto paga?`,ans:n*p,money:1}}
 const bl=L.bills||[20,50,100,200],pay=bl[rnd(0,bl.length-1)],spent=rnd(Math.ceil(pay*.3),pay-1);
 return{story:`Paga con un billete de $${pay} y gasta $${spent}. ¿Cuánto le dan de cambio?`,ans:pay-spent,money:1};
}
function options(ans,n){
 const set=new Set([ans]),deltas=shuffle([1,-1,2,-2,10,-10,5,-5,3,-3]);
 for(const d of deltas){if(set.size>=n)break;if(ans+d>=0)set.add(ans+d)}
 return shuffle([...set]);
}
APP.kit({
 id:'c',name:'Cuentas Rápidas',desc:'Sumas, tablas y cambio.',accent:'var(--indigo)',key:'cuentas-v1',levels:LEVELS,
 art:'<span class="art-c">2+3</span>',
 lead:'Resuelva las cuentas eligiendo la respuesta correcta. 50 niveles de 8 preguntas.',
 legend:'Hay niveles de dinero: compras en el mercado y cambio de billetes. Menos errores, más estrellas.',
 body:`<div class="dots" data-k="dots"></div>
  <div class="qcard" data-k="qbox"></div>
  <p class="msg" aria-live="polite"></p>
  <div class="opts row" data-k="opts"></div>`,
 start(L,n,a){api=a;LV=L;box4(L);qs=Array.from({length:Q},()=>make(L));idx=0;mist=0;show()},
 stop(){clearTimeout(timer)}
});
function show(){
 const q=qs[idx],fmt=v=>q.money?'$'+v:v;done=false;
 api.k('dots').innerHTML=qs.map((_,i)=>`<i class="${i<idx?'on':''}"></i>`).join('');
 api.k('qbox').innerHTML=q.math?`<p class="math">${q.math} = ?</p>`:`<p class="story">${q.story}</p>`;
 api.msg('Pregunta '+(idx+1)+' de '+Q,'');
 const box=api.k('opts');box.innerHTML='';
 options(q.ans,LV.four?4:3).forEach(v=>{const b=document.createElement('button');b.className='opt';b.textContent=fmt(v);
  b.onclick=()=>{if(done||b.classList.contains('bad'))return;
   if(v===q.ans){done=true;b.classList.add('good');api.msg('¡Correcto!','ok');APP.tone(660,.15);setTimeout(()=>APP.tone(880,.2),100);APP.buzz(40);
    if(q.math)api.k('qbox').innerHTML=`<p class="math">${q.math} = ${q.ans}</p>`;
    timer=setTimeout(()=>{idx++;if(idx>=Q)api.finish(APP.starsFor(mist),mist?`Resolvió las ${Q} cuentas con ${mist} ${mist===1?'error':'errores'}.`:`Resolvió las ${Q} cuentas sin errores.`);else show()},1100)}
   else{b.classList.add('bad');mist++;api.msg('Esa no es. Inténtelo otra vez.','no');APP.tone(220,.18,'triangle')}};
  box.appendChild(b)});
}
})();
