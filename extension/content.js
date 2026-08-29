/*
 * ITSON Wrap - content script.
 * Corre en cada frame de smartweb*.itson.edu.mx (all_frames), pone/quita la
 * clase html.itson-wrap y mantiene un boton flotante para prender/apagar.
 * No hace red (salvo el CSS remoto opcional de abajo), no lee credenciales;
 * solo usa storage local para recordar on/off.
 *
 * -------------------------------------------------------------------------
 * CSS REMOTO (opcional pero recomendado):
 * Si pones aqui la URL de un .css hospedado (GitHub Pages, etc.), la extension
 * lo carga en vivo. Asi editas el diseno en UN solo lugar y todos reciben el
 * cambio al recargar la pagina, SIN reinstalar la extension.
 *   - El CSS remoto debe tener sus reglas bajo  html.itson-wrap  (igual que content.css).
 *   - content.css (empaquetado) queda como base/fallback si la URL falla.
 *   - Debe ser https. (MV3 permite CSS remoto; NO permite JS remoto.)
 * Deja "" para usar solo el CSS empaquetado.
 */
var REMOTE_CSS_URL = "";
/* ------------------------------------------------------------------------- */

(function () {
  'use strict';

  var api = (typeof browser !== 'undefined') ? browser : chrome;
  var KEY = 'itson_wrap_enabled';
  var enabled = true;

  function apply() {
    document.documentElement.classList.toggle('itson-wrap', enabled);
  }

  // inyecta el <link> del CSS remoto una sola vez por documento (top + iframes)
  function injectRemoteCss() {
    if (!REMOTE_CSS_URL) return;
    if (document.getElementById('itson-wrap-remote')) return;
    var link = document.createElement('link');
    link.id = 'itson-wrap-remote';
    link.rel = 'stylesheet';
    link.href = REMOTE_CSS_URL;
    (document.head || document.documentElement).appendChild(link);
  }

  function paintFab() {
    var f = document.getElementById('itson-wrap-fab');
    if (!f) return;
    f.textContent = enabled ? 'Wrap ON' : 'Wrap OFF';
    f.style.background = enabled ? '#2f5bea' : '#8a93a5';
  }

  function mountFab() {
    if (window.top !== window.self) return;          // solo frame superior
    if (document.getElementById('itson-wrap-fab')) return;
    if (!document.body) return;
    var fab = document.createElement('button');
    fab.id = 'itson-wrap-fab';
    fab.type = 'button';
    fab.textContent = enabled ? 'Wrap ON' : 'Wrap OFF';
    fab.style.background = enabled ? '#2f5bea' : '#8a93a5';
    fab.addEventListener('click', function () { setEnabled(!enabled); });
    document.body.appendChild(fab);
  }

  function setEnabled(v) {
    enabled = v;
    try { api.storage.local.set({ itson_wrap_enabled: v }); } catch (e) {}
    apply();
    paintFab();
  }

  injectRemoteCss();

  // estado inicial
  try {
    api.storage.local.get({ itson_wrap_enabled: true }, function (r) {
      enabled = r.itson_wrap_enabled;
      apply();
      mountFab();
    });
  } catch (e) {
    apply();
    mountFab();
  }

  // sincroniza si se cambia desde el popup u otro frame
  try {
    api.storage.onChanged.addListener(function (ch, area) {
      if (area === 'local' && ch[KEY]) {
        enabled = ch[KEY].newValue;
        apply();
        paintFab();
      }
    });
  } catch (e) {}

  // PeopleSoft re-renderiza por postbacks; re-montamos boton, re-aplicamos y
  // re-inyectamos el <link> remoto si el postback limpio el head.
  var mo = new MutationObserver(function () {
    if (window.top === window.self && !document.getElementById('itson-wrap-fab')) mountFab();
    injectRemoteCss();
    document.documentElement.classList.toggle('itson-wrap', enabled);
  });
  try {
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
})();
