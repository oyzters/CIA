/*
 * ITSON Wrap - content script (reskin + shell Nivel B).
 * Corre en cada frame de smartweb*.itson.edu.mx.
 * - Reskin (content.css): re-estiliza en su lugar todas las pantallas.
 * - Shell (shell.css): SOLO en la homepage clásica (donde existe el pagelet
 *   #MENU) reconstruye un sidebar + topbar + tarjetas reusando los links
 *   reales de PeopleSoft (clic = original.click(), la navegación no cambia).
 * No hace red (salvo REMOTE_CSS_URL opcional), no lee credenciales; solo usa
 * storage local para recordar on/off.
 */
var REMOTE_CSS_URL = "";

(function () {
  'use strict';
  var api = (typeof browser !== 'undefined') ? browser : chrome;
  var KEY = 'itson_wrap_enabled';
  var enabled = true;

  /* ---------- iconos ---------- */
  function ic(p){ return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'; }
  var ICON = {
    home:'<path d="M3 9.5 12 3l9 6.5V21H3z"/><path d="M9 21v-7h6v7"/>',
    self:'<path d="M12 3 2 8l10 5 8-4"/><path d="M6 11v5c0 1 2.7 2.5 6 2.5s6-1.5 6-2.5v-5"/>',
    community:'<circle cx="9" cy="8" r="3"/><path d="M15 11a3 3 0 100-6"/><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5"/><path d="M17 15c2.5 0 4 1.7 4 4"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 13a7.6 7.6 0 000-2l2-1.5-2-3.4-2.3 1a7 7 0 00-1.7-1L14.8 3H9.2L8.6 5.1a7 7 0 00-1.7 1l-2.3-1-2 3.4L4.6 11a7.6 7.6 0 000 2l-2 1.5 2 3.4 2.3-1a7 7 0 001.7 1l.6 2.1h5.6l.6-2.1a7 7 0 001.7-1l2.3 1 2-3.4z"/>',
    report:'<path d="M4 4h13l3 3v13H4z"/><path d="M8 13h8M8 17h5M8 9h5"/>',
    tools:'<path d="M14 7a4 4 0 01-5 5L4 17l3 3 5-5a4 4 0 005-5l-3 3-2-2z"/>',
    lock:'<rect x="4" y="10" width="16" height="10" rx="2"/><path d="M8 10V7a4 4 0 018 0v3"/>',
    user:'<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/>',
    book:'<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 19a2 2 0 012-2h13"/>',
    folder:'<path d="M3 7h6l2 2h10v11H3z"/>'
  };
  function iconFor(name){
    var t=(name||'').toLowerCase();
    if(t.indexOf('autoservicio')>=0) return ICON.self;
    if(t.indexOf('comunidad')>=0) return ICON.community;
    if(t.indexOf('sacr')>=0||t.indexOf('definici')>=0) return ICON.gear;
    if(t.indexOf('informe')>=0) return ICON.report;
    if(t.indexOf('peopletools')>=0) return ICON.tools;
    if(t.indexOf('contrase')>=0) return ICON.lock;
    if(t.indexOf('personaliza')>=0) return ICON.gear;
    if(t.indexOf('perfil')>=0) return ICON.user;
    if(t.indexOf('diccionario')>=0) return ICON.book;
    return ICON.folder;
  }

  /* ---------- CSS remoto opcional ---------- */
  function injectRemoteCss(){
    if(!REMOTE_CSS_URL || document.getElementById('itson-wrap-remote')) return;
    var l=document.createElement('link'); l.id='itson-wrap-remote'; l.rel='stylesheet'; l.href=REMOTE_CSS_URL;
    (document.head||document.documentElement).appendChild(l);
  }

  /* ---------- reskin base ---------- */
  function applyReskin(){ document.documentElement.classList.toggle('itson-wrap', enabled); }

  /* ---------- SHELL nivel B (solo homepage) ---------- */
  function relay(orig){ // dispara la navegación real de PeopleSoft
    return function(e){ e.preventDefault(); try{ orig.click(); }catch(err){ if(orig.href) location.href=orig.href; } };
  }
  function txt(el){ return (el.textContent||'').replace(/\s+/g,' ').trim(); }

  function collectNav(){
    var folders=[], leaves=[], seen={};
    document.querySelectorAll('#MENU a.PSNAVPARENTLINK').forEach(function(a){
      var t=txt(a); if(!t || seen['f'+t]) return; seen['f'+t]=1;
      folders.push({ text:t, desc:a.getAttribute('title')||'', el:a });
    });
    document.querySelectorAll('#MENU a.PTNAVLINK').forEach(function(a){
      var t=txt(a); if(!t || seen['l'+t]) return; seen['l'+t]=1;
      leaves.push({ text:t, desc:a.getAttribute('title')||'', el:a });
    });
    return { folders:folders, leaves:leaves };
  }

  function hideOriginals(){
    var mark=function(el){ if(el) el.classList.add('iw-orig'); };
    var q=function(s){ return document.querySelector(s); };
    var closestTable=function(el){ return el ? el.closest('table') : null; };
    mark(closestTable(q('.globeBar')));                                   // header Oracle
    mark(closestTable(q('a.PSHYPERLINK[href*="PORTAL_HOMEPAGE"]')));      // barra Personalizar
    mark(closestTable(q('.PSSTATICIMAGE')));                              // Powered by
    var menu=document.getElementById('MENU'); if(menu) mark(menu.closest('table')||menu); // pagelet Menú
    // "Ayuda" suelto arriba a la derecha
    document.querySelectorAll('a.SMALL[href*="htmldoc"]').forEach(function(a){ mark(closestTable(a)); });
  }

  function buildShell(){
    if(window.top!==window.self) return;
    if(!document.getElementById('MENU')) return;          // solo homepage clásica
    if(document.getElementById('iw-shell')) return;
    var nav=collectNav();
    if(!nav.folders.length && !nav.leaves.length) return;

    var shell=document.createElement('div'); shell.id='iw-shell';

    /* sidebar */
    var side='<aside id="iw-side"><div id="iw-brand"><div class="m">iT</div>'
      + '<div><b>ITSON</b><span>Autoservicio</span></div></div><nav id="iw-nav">';
    if(nav.folders.length){
      side+='<div class="g">Menú principal</div>';
      nav.folders.forEach(function(f,i){ side+='<a data-k="f'+i+'"'+(i===0?' class="on"':'')+'>'+ic(iconFor(f.text))+'<span>'+f.text+'</span></a>'; });
    }
    if(nav.leaves.length){
      side+='<div class="g">Sistema</div>';
      nav.leaves.forEach(function(f,i){ side+='<a data-k="l'+i+'">'+ic(iconFor(f.text))+'<span>'+f.text+'</span></a>'; });
    }
    side+='</nav></aside>';

    /* topbar */
    var top='<div id="iw-top">'
      + '<div id="iw-search">'+ic('<circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/>')+'<input id="iw-q" type="text" placeholder="Buscar en el portal…" autocomplete="off"></div>'
      + '<div class="sp"></div>'
      + '<a class="tl" data-hdr="inicio">'+ic('<path d="M3 9.5 12 3l9 6.5V21H3z"/>')+'<span>Inicio</span></a>'
      + '<a class="tl" data-hdr="favorito">'+ic('<path d="M12 3l2.9 6 6.6.6-5 4.4 1.5 6.5L12 17l-6 3.5L7.5 14l-5-4.4 6.6-.6z"/>')+'<span>Favoritos</span></a>'
      + '<button class="ic" id="iw-theme" title="Tema">'+ic('<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>')+'</button>'
      + '<a class="tl" data-hdr="desconex">'+ic('<path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/>')+'<span>Salir</span></a>'
      + '<div class="av">'+ic('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/>')+'</div>'
      + '</div>';

    /* main (hero + tarjetas de carpetas) */
    var main='<main id="iw-main"><p class="eyebrow">Menú principal</p>'
      + '<h1>Hola de nuevo 👋 ¿Qué necesitas hacer hoy?</h1>'
      + '<p class="lede">Accede a tu información y actividades de autoservicio: inscripciones, calificaciones, pagos y trámites, todo desde aquí.</p>'
      + '<h2 class="sect">Secciones <span class="c">'+nav.folders.length+'</span></h2><div id="iw-grid">';
    nav.folders.forEach(function(f,i){
      main+='<a class="card" data-k="f'+i+'"><div class="top"><div class="tile">'+ic(iconFor(f.text))+'</div>'
        + '<div><h3>'+f.text+'</h3></div>'
        + '<svg class="arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M9 7h8v8"/></svg></div>'
        + (f.desc?'<p class="desc">'+f.desc+'</p>':'') + '</a>';
    });
    main+='</div></main>';

    shell.innerHTML=side+top+main;
    document.body.appendChild(shell);

    /* wiring: cada item nuevo dispara el link real */
    var byKey={};
    nav.folders.forEach(function(f,i){ byKey['f'+i]=f.el; });
    nav.leaves.forEach(function(f,i){ byKey['l'+i]=f.el; });
    shell.querySelectorAll('[data-k]').forEach(function(node){
      var orig=byKey[node.getAttribute('data-k')];
      if(orig) node.addEventListener('click', relay(orig));
    });
    // links del header
    var hdr=document.querySelectorAll('a.headerLinkActive');
    shell.querySelectorAll('[data-hdr]').forEach(function(node){
      var key=node.getAttribute('data-hdr'), match=null;
      hdr.forEach(function(a){ if(txt(a).toLowerCase().indexOf(key)>=0) match=a; });
      if(match) node.addEventListener('click', relay(match));
    });
    // buscador -> reusa el form nativo
    var q=shell.querySelector('#iw-q');
    if(q) q.addEventListener('keydown', function(e){
      if(e.key!=='Enter') return;
      var oi=document.querySelector('input[name="SEARCH_TEXT"]'), go=document.querySelector('a[name="Go"]');
      if(oi && go){ oi.value=q.value; go.click(); }
    });
    // tema
    var tb=shell.querySelector('#iw-theme');
    if(tb) tb.addEventListener('click', function(){ document.documentElement.classList.toggle('iw-dark'); });

    hideOriginals();
    document.documentElement.classList.add('iw-shell');
  }

  function removeShell(){
    var s=document.getElementById('iw-shell'); if(s) s.remove();
    document.documentElement.classList.remove('iw-shell');
    document.querySelectorAll('.iw-orig').forEach(function(el){ el.classList.remove('iw-orig'); });
  }

  /* ---------- estado ---------- */
  function apply(){
    injectRemoteCss();
    applyReskin();
    if(enabled) buildShell(); else removeShell();
  }

  function paintFab(){ var f=document.getElementById('itson-wrap-fab'); if(f){ f.textContent=enabled?'Wrap ON':'Wrap OFF'; f.style.background=enabled?'#2f5bea':'#8a93a5'; } }
  function mountFab(){
    if(window.top!==window.self || document.getElementById('itson-wrap-fab') || !document.body) return;
    var fab=document.createElement('button'); fab.id='itson-wrap-fab'; fab.type='button';
    fab.textContent=enabled?'Wrap ON':'Wrap OFF'; fab.style.background=enabled?'#2f5bea':'#8a93a5';
    fab.style.zIndex='2147483600';
    fab.addEventListener('click', function(){ setEnabled(!enabled); });
    document.body.appendChild(fab);
  }
  function setEnabled(v){ enabled=v; try{ api.storage.local.set({ itson_wrap_enabled:v }); }catch(e){} apply(); paintFab(); }

  try{ api.storage.local.get({ itson_wrap_enabled:true }, function(r){ enabled=r.itson_wrap_enabled; apply(); mountFab(); }); }
  catch(e){ apply(); mountFab(); }

  try{ api.storage.onChanged.addListener(function(ch,area){ if(area==='local'&&ch[KEY]){ enabled=ch[KEY].newValue; apply(); paintFab(); } }); }catch(e){}

  /* PeopleSoft re-renderiza por postbacks: re-aplicar de forma idempotente */
  var mo=new MutationObserver(function(){
    if(window.top===window.self && !document.getElementById('itson-wrap-fab')) mountFab();
    injectRemoteCss();
    document.documentElement.classList.toggle('itson-wrap', enabled);
    if(enabled && document.getElementById('MENU')){
      if(!document.getElementById('iw-shell')) buildShell();
      else hideOriginals();   // re-ocultar lo que un postback haya re-dibujado
    }
  });
  try{ mo.observe(document.documentElement, { childList:true, subtree:true }); }catch(e){}
})();
