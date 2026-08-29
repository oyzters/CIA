# ITSON Wrap

Capa visual (reskin) para el portal **PeopleSoft** de ITSON
(`smartweb1/2.itson.edu.mx`). Le pone una interfaz limpia — tipografía Inter,
tarjetas, inputs y botones modernos, tablas legibles — **sobre tu propia
sesión**, ya iniciada con tu cuenta.

> **Importante — qué NO es esto:** no es un login alterno ni un proxy. Cada
> persona se conecta directo a ITSON con su cuenta; esto solo re-estiliza la
> página que ya tienes abierta, en tu navegador. **No maneja contraseñas, no
> hace peticiones de red, no cambia nada en el servidor de ITSON.**
>
> El portal corre en **HTTP sin SSL**: tu usuario y contraseña viajan sin
> cifrar. Eso solo lo puede arreglar el área de TI de ITSON en el servidor;
> ninguna capa del lado del cliente lo soluciona. Vale la pena reportarlo.

## Tres formas de usarlo

Todas hacen lo mismo (el mismo reskin); cambia cómo se activa y cómo se reparte.

| Forma | Instalación | Se activa | Repartir a otros |
|---|---|---|---|
| **Extensión** (`extension/`) | Cargar en el navegador | Sola, siempre | Publicar en la store |
| **Userscript** (`userscript/`) | Tampermonkey + pegar | Sola | Compartir el archivo |
| **Bookmarklet** (`bookmarklet/`) | Arrastrar un marcador | Clic en cada visita | Compartir un link |

---

### 1) Extensión (recomendada) — se activa sola

**Chrome / Edge / Brave:**
1. Ve a `chrome://extensions`.
2. Activa **Modo de desarrollador** (arriba a la derecha).
3. **Cargar descomprimida** → selecciona la carpeta `extension/`.
4. Entra a ITSON. La interfaz limpia se aplica sola; abajo a la derecha hay un
   botón **Wrap ON/OFF**, y también puedes prender/apagar desde el ícono de la
   extensión.

**Firefox:**
1. Ve a `about:debugging#/runtime/this-firefox`.
2. **Cargar complemento temporal…** → elige `extension/manifest.json`.
   (Temporal = se quita al cerrar Firefox. Para permanente hay que firmarlo en
   addons.mozilla.org.)

### 2) Userscript — se activa sola, sin cargar extensión

1. Instala [Tampermonkey](https://www.tampermonkey.net/) o Violentmonkey.
2. Panel → **Crear nuevo script** → pega el contenido de
   `userscript/itson-peoplesoft-wrap.user.js` → **Guardar**.

### 3) Bookmarklet — un link, cero instalación

- Abre `bookmarklet/itson-wrap-installer.html` en el navegador y **arrastra el
  botón azul** a tu barra de marcadores; o copia el código y crea el marcador a
  mano.
- Estando dentro del portal, haz clic en el marcador para activar/desactivar.
- El código fuente legible está en `bookmarklet/bookmarklet.js`.

---

## Ajustar el diseño

Los colores y el radio de las tarjetas están como variables `--w-*` al inicio de
`extension/content.css` (y replicados en el userscript). Cámbialos ahí y recarga.

## Afinar a las pantallas reales

El reskin apunta a las clases estándar de PeopleTools 8
(`PSEDITBOX`, `PSPUSHBUTTON`, `PSLEVEL1GRID`, `PAGROUPBOX`, …). ITSON tiene CSS
personalizado encima, así que algunas pantallas pueden necesitar reglas extra.
Para afinarlas, abre la pantalla ya logueada, inspecciona el elemento y agrega
la clase real a `content.css`.

## Estructura

```
itson-wrap/
├─ extension/     Extensión MV3 (Chrome/Edge/Brave/Firefox)
├─ userscript/    Versión Tampermonkey/Violentmonkey
├─ bookmarklet/   Bookmarklet + página instaladora
└─ README.md
```

## Licencia

MIT — ver `LICENSE`.
