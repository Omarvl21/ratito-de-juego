/* PLANTILLA PARA UN JUEGO NUEVO
   1. Copie este archivo con otro nombre, por ejemplo js/juegos/adivinanzas.js
   2. Cambie id, name, key y el contenido.
   3. En index.html agregue antes de js/inicio.js:
        <script src="js/juegos/adivinanzas.js?v=1"></script>
   El juego aparece solo en la pantalla de inicio, con sus niveles, estrellas y avance guardado.

   Reglas:
   - id: una o dos letras que no use otro juego (ya se usan s, b, m, r, c, q, sl, x1-x4).
   - key: nombre donde se guarda el avance. NO lo cambie después de publicar, o se pierde el avance.
*/
(function(){
const LEVELS=Array.from({length:50},(_,i)=>({name:`Nivel ${i+1}`, preguntas:3+Math.floor(i/10)}));
let api,L,ronda,errores;

APP.kit({
  id:'z', name:'Mi Juego Nuevo', desc:'Descripción corta.', accent:'var(--teal)', key:'mi-juego-v1',
  levels:LEVELS,
  art:'<span class="art-c">?</span>',
  lead:'Explique en una frase cómo se juega.',
  body:`<div class="qcard"><p class="phrase" data-k="texto"></p></div>
        <p class="msg" aria-live="polite"></p>
        <div class="opts" data-k="opts"></div>`,
  start(level,n,a){api=a;L=level;ronda=0;errores=0;mostrar()},
  stop(){}   // detenga aquí timers o animaciones si el juego los usa
});

function mostrar(){
  api.k('texto').textContent=`Pregunta ${ronda+1} de ${L.preguntas}: ¿cuánto es 1 + 1?`;
  const box=api.k('opts');box.innerHTML='';
  APP.shuffle([2,3,4]).forEach(v=>{
    const b=document.createElement('button');b.className='opt';b.textContent=v;
    b.onclick=()=>{
      if(v===2){b.classList.add('good');APP.tone(660,.15);ronda++;
        if(ronda>=L.preguntas) api.finish(APP.starsFor(errores),'¡Lo logró!');
        else setTimeout(mostrar,800);
      }else{b.classList.add('bad');errores++;api.msg('Intente otra vez.','no')}
    };
    box.appendChild(b);
  });
}
})();
