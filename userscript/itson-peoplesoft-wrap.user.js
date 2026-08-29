// ==UserScript==
// @name         ITSON PeopleSoft - Wrap UI
// @namespace    hyperdigital.mx/itson-wrap
// @version      0.1.0
// @description  Capa visual/UX moderna encima del PeopleSoft de ITSON. Corre en TU sesion ya logueada; no toca el servidor ni maneja credenciales.
// @author       manuel@hyperdigital.mx
// @match        *://smartweb1.itson.edu.mx:*/*
// @match        *://smartweb2.itson.edu.mx:*/*
// @run-at       document-end
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @noframes     false
// ==/UserScript==

/*
 * COMO USAR
 * 1. Instala Tampermonkey (o Violentmonkey) en tu navegador.
 * 2. Tampermonkey -> Panel -> pestana "Utilidades" -> importa este archivo,
 *    o crea un script nuevo y pega todo este contenido.
 * 3. Entra normal a http://smartweb2.itson.edu.mx:8400/... con TU cuenta.
 *    El wrap se aplica solo. Boton flotante abajo-derecha para prender/apagar.
 *
 * NOTA: es una capa de PRESENTACION sobre las clases clasicas de PeopleTools 8.
 * No cambia la logica del servidor. Todo pasa en tu maquina.
 */

(function () {
  'use strict';

  var STORE_KEY = 'itson_wrap_enabled';

  // ---- persistencia del toggle (GM_* si existe, si no localStorage) ----
  function readEnabled() {
    try {
      if (typeof GM_getValue === 'function') return GM_getValue(STORE_KEY, true);
    } catch (e) {}
    try {
      var v = localStorage.getItem(STORE_KEY);
      return v === null ? true : v === '1';
    } catch (e) {}
    return true;
  }
  function writeEnabled(v) {
    try { if (typeof GM_setValue === 'function') GM_setValue(STORE_KEY, v); } catch (e) {}
    try { localStorage.setItem(STORE_KEY, v ? '1' : '0'); } catch (e) {}
  }

  var enabled = readEnabled();

  // ---- CSS del wrap ----------------------------------------------------
  // Variables faciles de ajustar. Estetica: Inter + tarjeta limpia.
  var CSS = [
    "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');",
    ":root{",
    "  --w-bg:#eef1f6; --w-card:#ffffff; --w-ink:#1c2230; --w-muted:#5b6472;",
    "  --w-line:#e3e7ee; --w-accent:#2f5bea; --w-accent-ink:#ffffff;",
    "  --w-radius:12px; --w-shadow:0 1px 2px rgba(20,30,55,.06),0 8px 24px rgba(20,30,55,.08);",
    "  --w-font:'Inter',system-ui,-apple-system,'Segoe UI',Roboto,Arial,sans-serif;",
    "}",

    /* base tipografia / fondo */
    "html.itson-wrap, html.itson-wrap body{background:var(--w-bg)!important;}",
    "html.itson-wrap, html.itson-wrap body, html.itson-wrap td, html.itson-wrap th,",
    "html.itson-wrap span, html.itson-wrap div, html.itson-wrap a, html.itson-wrap label,",
    "html.itson-wrap input, html.itson-wrap select, html.itson-wrap textarea, html.itson-wrap button{",
    "  font-family:var(--w-font)!important; color:var(--w-ink);",
    "}",
    "html.itson-wrap body{-webkit-font-smoothing:antialiased;}",

    /* contenedor principal PS clasico -> tarjeta */
    "html.itson-wrap .PSPAGECONTAINER, html.itson-wrap .PABACKGROUND_SCROLL,",
    "html.itson-wrap .PSPGWRP, html.itson-wrap #ptifrmcontent{",
    "  background:var(--w-bg)!important;",
    "}",
    "html.itson-wrap table.PABACKGROUND, html.itson-wrap .PATRANSACTION,",
    "html.itson-wrap .PAGROUPBOX, html.itson-wrap .PSGROUPBOX,",
    "html.itson-wrap table[class*='GROUPBOX']{",
    "  background:var(--w-card)!important; border:1px solid var(--w-line)!important;",
    "  border-radius:var(--w-radius)!important; box-shadow:var(--w-shadow)!important;",
    "}",

    /* titulos / encabezados */
    "html.itson-wrap .PAPAGETITLE, html.itson-wrap .PATRANSACTIONTITLE,",
    "html.itson-wrap .PSGROUPBOXLABEL, html.itson-wrap .PAGROUPBOXLABEL,",
    "html.itson-wrap .PAGROUPDIVIDER{",
    "  color:var(--w-ink)!important; font-weight:600!important; letter-spacing:-.01em;",
    "}",

    /* inputs */
    "html.itson-wrap input.PSEDITBOX, html.itson-wrap input.PSEDITBOXFOCUS,",
    "html.itson-wrap textarea.PSLONGEDITBOX, html.itson-wrap select.PSDROPDOWNLIST,",
    "html.itson-wrap input[type='text'], html.itson-wrap input[type='password'],",
    "html.itson-wrap select, html.itson-wrap textarea{",
    "  border:1px solid var(--w-line)!important; border-radius:8px!important;",
    "  padding:7px 10px!important; background:#fff!important; color:var(--w-ink)!important;",
    "  outline:none!important; transition:border-color .12s,box-shadow .12s;",
    "}",
    "html.itson-wrap input.PSEDITBOX:focus, html.itson-wrap textarea:focus,",
    "html.itson-wrap select:focus, html.itson-wrap input[type='text']:focus,",
    "html.itson-wrap input[type='password']:focus{",
    "  border-color:var(--w-accent)!important; box-shadow:0 0 0 3px rgba(47,91,234,.15)!important;",
    "}",

    /* botones */
    "html.itson-wrap input.PSPUSHBUTTON, html.itson-wrap input[type='button'],",
    "html.itson-wrap input[type='submit'], html.itson-wrap .SSSBUTTON_CONFIRMLINK,",
    "html.itson-wrap a.PSPUSHBUTTONTBLINK{",
    "  background:var(--w-accent)!important; color:var(--w-accent-ink)!important;",
    "  border:none!important; border-radius:8px!important; padding:8px 16px!important;",
    "  font-weight:600!important; cursor:pointer!important; box-shadow:none!important;",
    "  transition:filter .12s,transform .02s;",
    "}",
    "html.itson-wrap input.PSPUSHBUTTON:hover, html.itson-wrap input[type='submit']:hover{",
    "  filter:brightness(1.06)!important;",
    "}",
    "html.itson-wrap input.PSPUSHBUTTON:active{transform:translateY(1px)!important;}",

    /* links */
    "html.itson-wrap a.PSHYPERLINK, html.itson-wrap a{color:var(--w-accent)!important;}",
    "html.itson-wrap a.PSHYPERLINK:hover{text-decoration:underline!important;}",

    /* grids / tablas */
    "html.itson-wrap table.PSLEVEL1GRID, html.itson-wrap table.PSLEVEL1GRIDWBO,",
    "html.itson-wrap table.PSLEVEL2GRID{",
    "  border-collapse:separate!important; border-spacing:0!important;",
    "  border:1px solid var(--w-line)!important; border-radius:10px!important;",
    "  overflow:hidden!important; background:#fff!important;",
    "}",
    "html.itson-wrap th.PSLEVEL1GRIDCOLUMNHDR, html.itson-wrap .PSLEVEL1GRIDCOLUMNHDR,",
    "html.itson-wrap .PSLEVEL2GRIDCOLUMNHDR{",
    "  background:#f4f6fb!important; color:var(--w-muted)!important; font-weight:600!important;",
    "  text-transform:uppercase!important; font-size:11px!important; letter-spacing:.04em!important;",
    "  padding:8px 10px!important; border-bottom:1px solid var(--w-line)!important;",
    "}",
    "html.itson-wrap tr.PSLEVEL1GRIDODDROW td, html.itson-wrap .PSLEVEL1GRIDODDROW,",
    "html.itson-wrap tr.PSLEVEL1GRIDEVENROW td, html.itson-wrap .PSLEVEL1GRIDEVENROW{",
    "  padding:8px 10px!important; border-bottom:1px solid var(--w-line)!important;",
    "}",
    "html.itson-wrap .PSLEVEL1GRIDEVENROW{background:#fafbfe!important;}",

    /* barra de nav / header PS */
    "html.itson-wrap #pthdr2container, html.itson-wrap #PT_HEADER,",
    "html.itson-wrap .PSHEADERBAR, html.itson-wrap #ptifrmtgtframe{",
    "  box-shadow:none!important;",
    "}",

    /* mensajes de error/aviso PeopleSoft */
    "html.itson-wrap .PSERROR, html.itson-wrap .PSWARNING{",
    "  border-radius:8px!important; padding:10px 12px!important;",
    "}",
  ].join('\n');

  var styleEl = null;
  function injectStyle() {
    if (styleEl) return;
    try {
      if (typeof GM_addStyle === 'function') {
        styleEl = GM_addStyle(CSS);
      } else {
        styleEl = document.createElement('style');
        styleEl.textContent = CSS;
        (document.head || document.documentElement).appendChild(styleEl);
      }
    } catch (e) {
      styleEl = document.createElement('style');
      styleEl.textContent = CSS;
      (document.head || document.documentElement).appendChild(styleEl);
    }
  }

  function apply() {
    injectStyle();
    document.documentElement.classList.toggle('itson-wrap', enabled);
  }

  // ---- boton flotante (solo en la ventana superior) --------------------
  function mountToggle() {
    if (window.top !== window.self) return;      // solo frame superior
    if (document.getElementById('itson-wrap-fab')) return;

    var fab = document.createElement('button');
    fab.id = 'itson-wrap-fab';
    fab.type = 'button';
    fab.textContent = enabled ? 'Wrap ON' : 'Wrap OFF';
    fab.style.cssText = [
      'position:fixed', 'right:16px', 'bottom:16px', 'z-index:2147483647',
      'font-family:Inter,system-ui,sans-serif', 'font-size:12px', 'font-weight:600',
      'padding:8px 14px', 'border-radius:999px', 'border:none', 'cursor:pointer',
      'box-shadow:0 4px 14px rgba(20,30,55,.25)',
      'color:#fff', 'background:' + (enabled ? '#2f5bea' : '#8a93a5'),
    ].join(';');

    fab.addEventListener('click', function () {
      enabled = !enabled;
      writeEnabled(enabled);
      apply();
      fab.textContent = enabled ? 'Wrap ON' : 'Wrap OFF';
      fab.style.background = enabled ? '#2f5bea' : '#8a93a5';
    });

    (document.body || document.documentElement).appendChild(fab);
  }

  // ---- arranque + re-aplicar en repaints de PeopleSoft -----------------
  apply();
  mountToggle();

  // PeopleSoft re-renderiza mucho por postbacks/partial refresh; observamos
  // el DOM para re-inyectar el toggle si se pierde. El CSS persiste solo.
  var mo = new MutationObserver(function () {
    if (!document.getElementById('itson-wrap-fab')) mountToggle();
    document.documentElement.classList.toggle('itson-wrap', enabled);
  });
  try {
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();
