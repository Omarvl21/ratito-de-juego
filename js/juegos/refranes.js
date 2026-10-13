(function(){
/* Cada refrán: texto con ___ donde va la palabra, la respuesta y dos opciones falsas */
const R=[
 ['Al mal tiempo, buena ___.','cara','mesa','suerte'],
 ['Más vale tarde que ___.','nunca','mañana','temprano'],
 ['Perro que ladra no ___.','muerde','corre','come'],
 ['De tal palo, tal ___.','astilla','rama','hoja'],
 ['A falta de pan, ___.','tortillas','galletas','tamales'],

 ['Camarón que se duerme se lo lleva la ___.','corriente','marea','red'],
 ['El que madruga, Dios lo ___.','ayuda','bendice','cuida'],
 ['En boca cerrada no entran ___.','moscas','palabras','abejas'],
 ['Barriga llena, corazón ___.','contento','tranquilo','feliz'],
 ['Las apariencias ___.','engañan','cambian','mienten'],

 ['A caballo regalado no se le ve el ___.','colmillo','ojo','lomo'],
 ['Dime con quién andas y te diré quién ___.','eres','serás','vives'],
 ['Ojos que no ven, corazón que no ___.','siente','llora','late'],
 ['Zapatero, a tus ___.','zapatos','clavos','hilos'],
 ['Poco a poco se anda ___.','lejos','mucho','cerca'],

 ['Más vale pájaro en mano que cien ___.','volando','cantando','comiendo'],
 ['No hay mal que por bien no ___.','venga','llegue','pase'],
 ['Del dicho al hecho hay mucho ___.','trecho','camino','tiempo'],
 ['El que nada debe, nada ___.','teme','paga','pide'],
 ['Más vale maña que ___.','fuerza','prisa','dinero'],

 ['Agua que no has de beber, déjala ___.','correr','caer','enfriar'],
 ['Al que a buen árbol se arrima, buena sombra lo ___.','cobija','cubre','cuida'],
 ['Querer es ___.','poder','tener','saber'],
 ['Cuentas claras, amistades ___.','largas','buenas','sinceras'],
 ['A buen entendedor, pocas ___.','palabras','señas','razones'],

 ['Al que le quede el saco, que se lo ___.','ponga','lleve','quite'],
 ['Más sabe el diablo por viejo que por ___.','diablo','sabio','listo'],
 ['Cuando el río suena, es que agua ___.','lleva','trae','corre'],
 ['Quien mucho abarca, poco ___.','aprieta','gana','guarda'],
 ['Con paciencia y saliva, el elefante se comió a la ___.','hormiga','araña','mosca'],

 ['El que con lobos anda, a aullar se ___.','enseña','cansa','acostumbra'],
 ['Árbol que crece torcido, jamás su tronco ___.','endereza','levanta','cambia'],
 ['Donde hubo fuego, cenizas ___.','quedan','vuelan','sobran'],
 ['No por mucho madrugar amanece más ___.','temprano','pronto','claro'],
 ['Al pan, pan, y al vino, ___.','vino','agua','queso'],

 ['Lo que bien se aprende, nunca se ___.','olvida','pierde','deja'],
 ['El flojo y el mezquino, dos veces andan el ___.','camino','rancho','río'],
 ['Todo cabe en un jarrito sabiéndolo ___.','acomodar','llenar','mover'],
 ['El que es perico, dondequiera es ___.','verde','perico','alegre'],
 ['Hijo de tigre, ___.','pintito','gatito','tigrito'],
 ['Más vale prevenir que ___.','lamentar','llorar','curar'],
 ['Quien siembra vientos recoge ___.','tempestades','lluvias','cosechas'],
 ['El que busca, ___.','encuentra','pierde','cansa'],
 ['Haz el bien sin mirar a ___.','quién','cuál','dónde'],
 ['La práctica hace al ___.','maestro','sabio','experto'],
 ['Más vale solo que mal ___.','acompañado','casado','querido'],
 ['El que no oye consejo no llega a ___.','viejo','sabio','rico'],
 ['Tanto va el cántaro al agua, hasta que se ___.','rompe','llena','cae'],
 ['No dejes para mañana lo que puedes hacer ___.','hoy','ahora','temprano'],
 ['Caras vemos, corazones no ___.','sabemos','vemos','conocemos'],
 ['Gato con guantes no caza ___.','ratones','moscas','pájaros'],
 ['Una golondrina no hace ___.','verano','primavera','nido'],
 ['El hábito no hace al ___.','monje','cura','santo'],
 ['Cada oveja con su ___.','pareja','rebaño','pastor'],
 ['Al que no quiere caldo, se le dan dos ___.','tazas','platos','ollas'],
 ['Despacio que voy de ___.','prisa','viaje','paso'],
 ['Mucho ruido y pocas ___.','nueces','palabras','ganas'],
 ['Ver para ___.','creer','saber','entender'],
 ['Amor con amor se ___.','paga','cura','vive'],
 ['El tiempo es ___.','oro','dinero','vida'],
 ['Echando a perder se ___.','aprende','gana','sabe'],
 ['A palabras necias, oídos ___.','sordos','cerrados','tapados'],
 ['Hierba mala nunca ___.','muere','crece','seca'],
 ['No todo lo que brilla es ___.','oro','plata','luz'],
 ['Del árbol caído todos hacen ___.','leña','sombra','tablas'],
 ['A Dios rogando y con el mazo ___.','dando','pegando','trabajando'],
 ['Más vale paso que dure y no trote que ___.','canse','corra','duela'],
 ['Músico pagado toca mal ___.','son','rato','tono'],
 ['El que parte y reparte se queda con la mejor ___.','parte','tajada','pieza'],
 ['La esperanza es lo último que se ___.','pierde','acaba','olvida'],
 ['Nunca es tarde si la dicha es ___.','buena','grande','mucha'],
 ['Una mano lava la otra, y las dos lavan la ___.','cara','ropa','mesa'],
 ['Arrieros somos y en el camino ___.','andamos','vamos','seguimos'],
 ['Más vale una vez colorado que cien ___.','descolorido','apenado','amarillo'],
 ['El que tenga tienda, que la ___.','atienda','cuide','abra'],
 ['Quien con niños se acuesta, mojado ___.','amanece','despierta','termina'],
 ['Dando y dando, pajarito ___.','volando','cantando','comiendo'],
 ['Ni tanto que queme al santo, ni tanto que no lo ___.','alumbre','vea','caliente'],
 ['A mal paso, darle ___.','prisa','vuelta','tiempo'],
 ['Más vale llegar a tiempo que ser ___.','invitado','puntual','esperado'],
];
/* 50 niveles de 5 refranes. Los primeros usan los más conocidos y cada nivel abre más refranes.
   Desde el nivel 21 hay 4 opciones en lugar de 3. */
const TITLES=['Los más conocidos','De la vida diaria','De la abuela','Para pensar','Del rancho','De la cocina','Más difíciles','Para expertos'];
const LEVELS=Array.from({length:50},(_,i)=>({name:TITLES[Math.min(TITLES.length-1,Math.floor(i/6.25))],
 pool:Math.min(R.length,15+i*3),four:i>=20}));
let items,idx,mist,done,api,four=false;
APP.kit({
 id:'r',name:'Completa el Refrán',desc:'Elija la palabra que falta.',accent:'var(--olive)',key:'refranes-v1',levels:LEVELS,
 art:'<span class="art-r">“…”</span>',
 lead:'Elija la palabra que completa cada refrán. 50 niveles de 5 refranes cada uno.',
 body:`<div class="dots" data-k="dots"></div>
  <div class="qcard"><p class="phrase" data-k="phrase"></p></div>
  <p class="msg" aria-live="polite"></p>
  <div class="opts" data-k="opts"></div>
  <button class="btn" data-k="go" hidden>Siguiente refrán</button>`,
 start(L,n,a){api=a;four=L.four;items=APP.shuffle(R.slice(0,L.pool)).slice(0,5);idx=0;mist=0;show()},
 init(a){a.k('go').onclick=()=>{idx++;if(idx>=items.length){a.finish(APP.starsFor(mist),mist?`Completó los refranes con ${mist} ${mist===1?'error':'errores'}.`:'Completó todos los refranes sin errores.')}else show()}}
});
function extra(ans,bad){const pool=R.map(r=>r[1]).filter(w=>w!==ans&&!bad.includes(w));return pool[Math.random()*pool.length|0]}
function show(){
 const[t,ans,...bad]=items[idx];done=false;
 api.k('dots').innerHTML=items.map((_,i)=>`<i class="${i<idx?'on':''}"></i>`).join('');
 api.k('phrase').innerHTML=t.replace('___','<span class="blank">&nbsp;</span>');
 api.msg('','');api.k('go').hidden=true;
 const box=api.k('opts');box.innerHTML='';
 APP.shuffle([ans,...bad,...(four?[extra(ans,bad)]:[])]).forEach(w=>{const b=document.createElement('button');b.className='opt';b.textContent=w;
  b.onclick=()=>{if(done||b.classList.contains('bad'))return;
   if(w===ans){done=true;b.classList.add('good');api.k('phrase').innerHTML=t.replace('___',`<span class="blank">${ans}</span>`);
    api.msg('¡Muy bien!','ok');APP.tone(660,.15);setTimeout(()=>APP.tone(880,.2),100);APP.buzz(40);
    api.k('go').hidden=false;api.k('go').textContent=idx===items.length-1?'Ver resultado':'Siguiente refrán';
    api.k('dots').children[idx].classList.add('on')}
   else{b.classList.add('bad');mist++;api.msg('Esa no es. Pruebe con otra.','no');APP.tone(220,.18,'triangle')}};
  box.appendChild(b)});
}
})();
