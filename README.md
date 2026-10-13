# Ratito de Juegos

App de juegos y actividades tranquilas para adultos mayores, pensada para celular.
Es HTML, CSS y JavaScript puro: no necesita instalar nada ni compilar.

## Estructura

```
index.html              Pantallas y orden en que se cargan los juegos
css/estilos.css         Colores, letra y diseño de toda la app
js/app.js               Pantalla de inicio, sonido, letra grande, descanso y el "kit" de niveles
js/juegos/
  sopa-letras.js        Sopa de Letras (temas en THEMES, dificultad en TIERS)
  burbujas.js           Lluvia de Burbujas (niveles en LEVELS)
  memorama.js           Memorama (dibujos en SETS, niveles en LEVELS)
  refranes.js           Completa el Refrán (refranes en R)
  cuentas.js            Cuentas Rápidas (tramos en TRAMOS, productos en ITEMS)
  secuencia.js          Sigue la Secuencia (niveles en LEVELS)
  serpientes.js         Serpientes y Escaleras (tamaños de tablero en TIERS)
  cuentos.js            Lector de cuentos con voz
  calma.js              Rincón de Calma: respiración, mandalas, tres cosas buenas, jardín
  _plantilla.js         Ejemplo para crear un juego nuevo (no se carga)
js/cuentos-datos.js     Los cuentos (aquí se agregan cuentos nuevos)
js/inicio.js            Arranca la app (va al final)
audio/                  Grabaciones opcionales de los cuentos (mp3 o m4a)
```

## Probar en la computadora

1. Abra la carpeta en VS Code.
2. Instale la extensión **Live Server**.
3. Clic derecho en `index.html` → **Open with Live Server**.
4. Para verlo como celular: en el navegador presione F12 y active la vista de dispositivo móvil.

## Publicar cambios (GitHub Pages)

```bash
git add .
git commit -m "Agrego refranes nuevos"
git push
```

GitHub Pages actualiza el sitio en 1 o 2 minutos.

### Para que el celular vea el cambio
Los navegadores guardan una copia de los archivos. Cada vez que publique cambios,
suba el número `?v=1` → `?v=2` en las líneas de `index.html` de los archivos que cambió
(o en todas). Así el celular descarga la versión nueva al abrir la app.

## Cosas que NO hay que cambiar

- Las claves donde se guarda el avance: `sopa-letras-v1`, `burbujas-v1`, `memorama-v1`,
  `refranes-v1`, `cuentas-v1`, `secuencia-v1`, `serpientes-v1`, `cuentos-v1`, `mandalas-v1`, `gratitud-v1`, `ratito-app`.
  Si cambian, el celular pierde las estrellas y lo guardado.
- El orden de los `<script>` en `index.html`: `app.js` primero e `inicio.js` al final.

## Agregar contenido

- **Refrán:** en `refranes.js`, agregue una línea a `R`:
  `['Texto con ___ donde va la palabra.','respuesta','opción falsa','opción falsa'],`
- **Tema de sopa de letras:** en `sopa-letras.js`, agregue a `THEMES`:
  `['Nombre del tema','PALABRA1 PALABRA2 ...'],` (mayúsculas, sin acentos, máximo 10 letras).
- **Más niveles:** cambie `length:50` por el número que quiera. Los totales de estrellas se calculan solos.
- **Juego nuevo:** copie `js/juegos/_plantilla.js` y siga las instrucciones de arriba del archivo.

## Cuentos con voz grabada

Cada cuento se lee con la voz del celular. Para que se escuche con la voz de alguien de la familia:

1. Grabe el cuento con la app de grabadora del celular, leyendo despacio y con calma.
2. Copie el archivo a la carpeta `audio/` del proyecto, por ejemplo `audio/liebre-tortuga.m4a`.
3. En `js/cuentos-datos.js`, agregue al cuento la línea `audio:'audio/liebre-tortuga.m4a',`
4. Suba los cambios con `git push`.

Si el archivo no se encuentra, la app usa la voz del celular automáticamente.
