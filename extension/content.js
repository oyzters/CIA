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
  var TKEY = 'itson_wrap_theme';
  var enabled = true;
  var theme = 'dark';   // default: oscuro (paleta del mockup)

  function themeIcon(){
    return ic(theme === 'dark'
      ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>'
      : '<path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/>');
  }
  function applyTheme(){ document.documentElement.classList.toggle('iw-dark', enabled && theme === 'dark'); }
  function paintThemeBtns(){ document.querySelectorAll('[data-theme-toggle]').forEach(function(b){ b.innerHTML = themeIcon(); }); }
  function setTheme(v){ theme = v; try { api.storage.local.set({ itson_wrap_theme: v }); } catch (e) {} applyTheme(); paintThemeBtns(); paintLogos(); }

  // logo (PotroNET) empaquetado en la extension
  var LOGO_DARK = '', LOGO_LIGHT = '';
  try { LOGO_DARK = api.runtime.getURL('assets/logo-dark.png'); LOGO_LIGHT = api.runtime.getURL('assets/logo-light.png'); } catch (e) {}
  function logoSrc(){ return theme === 'dark' ? LOGO_DARK : LOGO_LIGHT; }
  function paintLogos(){}
  // marca: badge con monograma academico + wordmark
  function brandBadge(){ return '<div class="iw-badge">'+ic('<path d="M12 3 2 8l10 5 8-4"/><path d="M6 11v5c0 1.5 2.7 2.6 6 2.6s6-1.1 6-2.6v-5"/>')+'</div>'; }

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
  // color por categoría (energía tipo dashboard, duotono suave sobre oscuro)
  function colorFor(name){
    var t=(name||'').toLowerCase();
    if(t.indexOf('autoservicio')>=0) return ['#5b9dff','rgba(91,157,255,.15)'];
    if(t.indexOf('inscrip')>=0) return ['#a78bfa','rgba(167,139,250,.16)'];
    if(t.indexOf('finanz')>=0||t.indexOf('pago')>=0||t.indexOf('cuenta')>=0) return ['#2dd4bf','rgba(45,212,191,.15)'];
    if(t.indexOf('datos')>=0||t.indexOf('personal')>=0||t.indexOf('direccion')>=0) return ['#38bdf8','rgba(56,189,248,.15)'];
    if(t.indexOf('registro')>=0||t.indexOf('calific')>=0||t.indexOf('académic')>=0||t.indexOf('academic')>=0) return ['#f59e0b','rgba(245,158,11,.16)'];
    if(t.indexOf('progreso')>=0||t.indexOf('gradua')>=0) return ['#34d399','rgba(52,211,153,.15)'];
    if(t.indexOf('convalida')>=0) return ['#f472b6','rgba(244,114,182,.16)'];
    if(t.indexOf('admisi')>=0) return ['#818cf8','rgba(129,140,248,.15)'];
    if(t.indexOf('trámite')>=0||t.indexOf('tramite')>=0) return ['#fb923c','rgba(251,146,60,.16)'];
    if(t.indexOf('seguro')>=0) return ['#10b981','rgba(16,185,129,.15)'];
    if(t.indexOf('alumnado')>=0||t.indexOf('alumno')>=0||t.indexOf('tutor')>=0) return ['#60a5fa','rgba(96,165,250,.15)'];
    if(t.indexOf('comunidad')>=0) return ['#f472b6','rgba(244,114,182,.15)'];
    if(t.indexOf('informe')>=0) return ['#38bdf8','rgba(56,189,248,.15)'];
    return ['#5b9dff','rgba(91,157,255,.15)'];
  }
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

  /* ---------- paginas de seccion (frameset) ---------- */
  function frameName(){ try { return window.name || ''; } catch (e) { return ''; } }

  // Rol del frame por su URL (FIJA), no por window.name (PeopleSoft lo muta al navegar).
  //   TOP     = documento superior (frameset)
  //   NAV     = arbol de navegacion  (IScript_PT_NAV_INFRAME)
  //   HDR     = cabecera             (IScript_UniHeader_Frame)
  //   CONTENT = contenido real       (el resto)
  function frameRole(){
    if(window.top === window.self) return 'TOP';
    var u=''; try { u = location.href || ''; } catch (e) {}
    if(u.indexOf('IScript_PT_NAV_INFRAME') >= 0) return 'NAV';
    if(u.indexOf('IScript_UniHeader_Frame') >= 0) return 'HDR';
    return 'CONTENT';
  }

  // cada frame se marca segun su rol para que el CSS lo skinne como sidebar/topbar/contenido
  function applyRoles(){
    // OJO: PeopleSoft reasigna window.name del doc superior al navegar; los roles
    // (y sus reglas de ocultamiento) solo deben aplicar en FRAMES HIJOS reales.
    var r = frameRole(), de = document.documentElement;
    de.classList.toggle('iw-nav', enabled && r === 'NAV');
    de.classList.toggle('iw-hdr', enabled && r === 'HDR');
    de.classList.toggle('iw-content', enabled && r === 'CONTENT');
  }

  // ensancha el sidebar UNA SOLA VEZ por documento (solo el doc superior).
  // OJO: hacerlo en cada mutacion (observer) corrompia la geometria -> aqui es idempotente.
  function tuneFrameset(){
    if (frameRole() !== 'TOP' || !enabled) return;
    var de = document.documentElement;
    if (de.classList.contains('iw-tuned')) return;
    var inner = document.querySelector('frameset[cols]');
    if (!inner) return;
    try { inner.cols = '240,*'; de.classList.add('iw-tuned'); } catch (e) {}
  }

  /* ---------- SHELL nivel B (solo homepage) ---------- */
  // Navega DIRECTO a la URL del link (evita addExtraParam/saveWarning de PeopleSoft,
  // que rompen entre frames de distintos puertos por CSP y document.domain).
  function relay(orig){
    return function(e){
      e.preventDefault();
      var href=''; try{ href = orig.href || orig.getAttribute('href') || ''; }catch(err){}
      if(href && href.indexOf('javascript:')!==0){
        try{ window.top.location.href = href; return; }catch(err){}
        try{ location.href = href; return; }catch(err){}
      }
      try{ orig.click(); }catch(err){}   // ultimo recurso (href javascript:)
    };
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
    var side='<aside id="iw-side"><div id="iw-brand">'+brandBadge()+'<div class="iw-bt"><b>CIA ITSON</b><span>Autoservicio</span></div></div><nav id="iw-nav">';
    if(nav.folders.length){
      side+='<div class="g">Menú principal</div>';
      nav.folders.forEach(function(f,i){ var col=colorFor(f.text); side+='<a data-k="f'+i+'" style="--c:'+col[0]+'"><span class="iw-ico">'+ic(iconFor(f.text))+'</span><span>'+f.text+'</span></a>'; });
    }
    if(nav.leaves.length){
      side+='<div class="g">Sistema</div>';
      nav.leaves.forEach(function(f,i){ var col=colorFor(f.text); side+='<a data-k="l'+i+'" style="--c:'+col[0]+'"><span class="iw-ico">'+ic(iconFor(f.text))+'</span><span>'+f.text+'</span></a>'; });
    }
    side+='</nav></aside>';

    /* topbar */
    var top='<div id="iw-top">'
      + '<div id="iw-search">'+ic('<circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/>')+'<input id="iw-q" type="text" placeholder="Buscar en el portal…" autocomplete="off"></div>'
      + '<div class="sp"></div>'
      + '<a class="tl" data-hdr="inicio">'+ic('<path d="M3 9.5 12 3l9 6.5V21H3z"/>')+'<span>Inicio</span></a>'
      + '<a class="tl" data-hdr="favorito">'+ic('<path d="M12 3l2.9 6 6.6.6-5 4.4 1.5 6.5L12 17l-6 3.5L7.5 14l-5-4.4 6.6-.6z"/>')+'<span>Favoritos</span></a>'
      + '<button class="ic" data-theme-toggle title="Tema claro/oscuro">'+themeIcon()+'</button>'
      + '<a class="tl" data-hdr="desconex">'+ic('<path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4"/><path d="M10 17l5-5-5-5M15 12H3"/>')+'<span>Salir</span></a>'
      + '<div class="av">'+ic('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/>')+'</div>'
      + '</div>';

    /* main (hero + tarjetas de carpetas) */
    var main='<main id="iw-main"><p class="eyebrow">Menú principal</p>'
      + '<h1>¿Qué necesitas hacer hoy?</h1>'
      + '<p class="lede">Accede a tu información y actividades de autoservicio: inscripciones, calificaciones, pagos y trámites, todo desde aquí.</p>'
      + '<h2 class="sect">Secciones <span class="c">'+nav.folders.length+'</span></h2><div id="iw-grid">';
    nav.folders.forEach(function(f,i){
      var col=colorFor(f.text);
      main+='<a class="card" data-k="f'+i+'" style="--c:'+col[0]+';--cs:'+col[1]+'"><div class="top"><div class="tile">'+ic(iconFor(f.text))+'</div>'
        + '<div class="iw-cardhd"><h3>'+f.text+'</h3></div>'
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
    shell.querySelectorAll('[data-theme-toggle]').forEach(function(b){
      b.addEventListener('click', function(){ setTheme(theme==='dark'?'light':'dark'); });
    });

    hideOriginals();
    document.documentElement.classList.add('iw-shell');
  }

  function removeShell(){
    var s=document.getElementById('iw-shell'); if(s) s.remove();
    document.documentElement.classList.remove('iw-shell');
    document.querySelectorAll('.iw-orig').forEach(function(el){ el.classList.remove('iw-orig'); });
  }

  /* ---------- SIDEBAR del frame NAV (paginas de seccion) ---------- */
  // firma de la navegacion actual: si cambia (otra seccion), reconstruimos
  function navSignature(){
    var sel=document.querySelector('a.PTNAVSELPARENTLINK');
    var n=document.querySelectorAll('a.PSNAVPARENTLINK, a.PTNAVLINK').length;
    return (sel?(sel.getAttribute('name')||''):'') + '#' + n;
  }

  function buildNavSidebar(){
    if(frameRole()!=='NAV' || !enabled) return;  // solo el frame de navegacion (por URL)
    var sig = navSignature();
    var existings = document.querySelectorAll('#iw-navwrap');
    if(existings.length === 1 && existings[0].getAttribute('data-sig') === sig) return; // misma seccion: nada
    existings.forEach(function(e){ e.remove(); });          // limpiar cualquier duplicado antes de reconstruir

    var anchors = document.querySelectorAll('a.PTNAVSELPARENTLINK, a.PSNAVPARENTLINK, a.PTNAVLINK');
    var items=[], seen={};
    anchors.forEach(function(a){
      var t=txt(a); if(!t) return;                       // saltar anclas de solo icono
      var nm=a.getAttribute('name')||t, key=nm+'|'+t;
      if(seen[key]) return; seen[key]=1;
      var row=a.closest('tr');
      items.push({
        text:t, el:a, name:nm,
        indented: !!(row && row.querySelector('td[width="12"]')),
        selected: a.classList.contains('PTNAVSELPARENTLINK')
      });
    });
    if(!items.length) return;

    var current = items.filter(function(i){return i.selected;})[0];
    var children = items.filter(function(i){return i.indented;});
    var others   = items.filter(function(i){return !i.indented && !i.selected;});

    function itemHtml(it,k){
      var col=colorFor(it.text);
      return '<a class="iw-item'+(it.selected?' on':'')+'" data-k="'+k+'" style="--c:'+col[0]+'">'
        + '<span class="iw-ico">'+ic(iconFor(it.text))+'</span><span>'+it.text+'</span></a>';
    }

    var h='<div class="iw-brand">'+brandBadge()+'<div class="iw-brandtxt"><b>CIA ITSON</b><span>'
      + (current?current.text:'Portal') + '</span></div>'
      + '<button class="iw-themebtn" data-theme-toggle title="Tema claro/oscuro">'+themeIcon()+'</button></div>';
    h+='<div class="iw-search">'+ic('<circle cx="11" cy="11" r="7"/><path d="m21 21-4-4"/>')
      + '<input id="iw-navq" placeholder="Buscar…" autocomplete="off"></div>';
    h+='<nav class="iw-navlist">';
    var map={};
    if(children.length){ h+='<div class="iw-g">En esta sección</div>';
      children.forEach(function(it,i){ map['c'+i]=it.el; h+=itemHtml(it,'c'+i); }); }
    if(others.length){ h+='<div class="iw-g">Portal</div>';
      others.forEach(function(it,i){ map['o'+i]=it.el; h+=itemHtml(it,'o'+i); }); }
    h+='</nav>';

    var wrap=document.createElement('div'); wrap.id='iw-navwrap'; wrap.innerHTML=h;
    wrap.setAttribute('data-sig', sig);
    document.body.appendChild(wrap);

    wrap.querySelectorAll('[data-k]').forEach(function(n){
      var o=map[n.getAttribute('data-k')]; if(o) n.addEventListener('click', relay(o));
    });
    wrap.querySelectorAll('[data-theme-toggle]').forEach(function(b){
      b.addEventListener('click', function(){ setTheme(theme==='dark'?'light':'dark'); });
    });
    var q=wrap.querySelector('#iw-navq');
    if(q) q.addEventListener('keydown', function(e){
      if(e.key!=='Enter' || !q.value.trim()) return;
      var form=document.querySelector('form[name="srchnav"]');
      var action=form ? (form.getAttribute('action')||'') : '';
      if(action){ window.top.location.href = action + (action.indexOf('?')<0?'?':'&') + 'SEARCH_TEXT=' + encodeURIComponent(q.value); }
    });

    document.documentElement.classList.add('iw-nav-built');
  }

  function removeNavSidebar(){
    document.querySelectorAll('#iw-navwrap').forEach(function(w){ w.remove(); });
    document.documentElement.classList.remove('iw-nav-built');
  }

  /* ---------- TOPBAR del frame UniversalHeader (paginas de seccion) ---------- */
  function buildHeaderBar(){
    if(frameRole()!=='HDR' || !enabled) return;  // solo el frame de cabecera (por URL)
    if(document.getElementById('iw-topbar')) return;

    var links=[];
    document.querySelectorAll('a.headerLinkActive').forEach(function(a){
      var t=txt(a); if(t) links.push({t:t, el:a});
    });

    var h='<div class="iw-sp"></div>';   // topbar sin marca (la marca vive en el sidebar)
    var map={};
    links.forEach(function(it,i){ map[i]=it.el; h+='<a class="iw-tl" data-h="'+i+'">'+it.t+'</a>'; });
    h+='<button class="iw-tb-theme" data-theme-toggle title="Tema claro/oscuro">'+themeIcon()+'</button>';

    var bar=document.createElement('div'); bar.id='iw-topbar'; bar.innerHTML=h;
    document.body.appendChild(bar);

    bar.querySelectorAll('[data-h]').forEach(function(n){
      var o=map[n.getAttribute('data-h')]; if(o) n.addEventListener('click', relay(o));
    });
    bar.querySelectorAll('[data-theme-toggle]').forEach(function(b){
      b.addEventListener('click', function(){ setTheme(theme==='dark'?'light':'dark'); });
    });

    document.documentElement.classList.add('iw-hdr-built');
  }
  function removeHeaderBar(){
    document.querySelectorAll('#iw-topbar').forEach(function(b){ b.remove(); });
    document.documentElement.classList.remove('iw-hdr-built');
  }

  /* ---------- TILES del contenido (AppHP) -> tarjetas ---------- */
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // navega a un tile: carpetas -> recargan el frameset (psp); componentes -> abren el componente
  function tileNav(href, isFolder){
    if(!href) return;
    if(isFolder){
      try{
        var u=new URL(href, location.href);
        var pt=u.searchParams.get('pt_fname')||u.searchParams.get('fname')||'';
        var fp=u.searchParams.get('FolderPath')||'';
        if(pt){
          var base=u.origin+u.pathname.replace('/psc/','/psp/');
          window.top.location.href = base+'?pt_fname='+encodeURIComponent(pt)+'&FolderPath='+encodeURIComponent(fp)+'&IsFolder=true';
          return;
        }
      }catch(e){}
    }
    window.top.location.href = href;
  }

  function buildTiles(){
    if(frameRole()!=='CONTENT' || !enabled) return;
    var u=''; try{ u=location.href; }catch(e){}
    if(u.indexOf('IScript_AppHP')<0) return;              // solo paginas de tiles, no componentes con datos
    var nodes=document.querySelectorAll('td.EOPP_SCSECTIONFOLDER, td.EOPP_SCSECTIONCONTENT');
    var sig=String(nodes.length)+'|'+u.slice(-48);
    var ex=document.getElementById('iw-tiles');
    if(ex){ if(ex.getAttribute('data-sig')===sig) return; ex.remove(); }
    if(!nodes.length) return;

    var pageTitle=txt(document.querySelector('.EOPP_SCPAGETITLESECTION'))||'Autoservicio';
    var pageDesc=txt(document.querySelector('.EOPP_SCPAGEDESCRSECTION'))||'';

    var cardsHtml='', quick=[];
    [].forEach.call(nodes, function(td){
      var isFolder=td.classList.contains('EOPP_SCSECTIONFOLDER');
      var head=td.querySelector(isFolder?'a.EOPP_SCSECTIONFOLDERLINK':'a.EOPP_SCSECTIONCONTENTLINK');
      if(!head) return;
      var title=txt(head); if(!title) return;
      var desc=txt(td.querySelector('.EOPP_SCADDITIONALTEXT'))||head.getAttribute('title')||'';
      var links='', seen={}, kc=0;
      [].forEach.call(td.querySelectorAll('a.EOPP_SCCHILDCONTENTLINK'), function(a){
        var t=txt(a); if(!t||seen[a.href]) return; seen[a.href]=1; kc++;
        links+='<a class="iw-link" data-h="'+esc(a.href)+'" data-f="0" href="'+esc(a.href)+'"><span class="iw-dot"></span>'+esc(t)+'</a>';
      });
      var more=td.querySelector('a.EOPP_SCMORELINK');
      var moreN=more ? (parseInt((txt(more).match(/\d+/)||[0])[0],10)||0) : 0;
      var totalN=kc+moreN;
      if(more){ links+='<a class="iw-morelink" data-h="'+esc(more.href)+'" data-f="1" href="'+esc(more.href)+'">'+esc(txt(more))+' →</a>'; }
      var col=colorFor(title), iconHtml=ic(iconFor(title));
      // acceso rápido: primer sub-link real de la carpeta, o el componente directo
      if(isFolder){
        var fk=null, kk=td.querySelectorAll('a.EOPP_SCCHILDCONTENTLINK');
        for(var qi=0; qi<kk.length; qi++){ if(txt(kk[qi])){ fk=kk[qi]; break; } }
        if(fk) quick.push({ t:txt(fk), href:fk.href, c:col, ic:iconHtml });
      } else {
        quick.push({ t:title, href:head.href, c:col, ic:iconHtml });
      }
      cardsHtml+='<div class="card" style="--c:'+col[0]+';--cs:'+col[1]+'">'
        + '<div class="top" data-h="'+esc(head.href)+'" data-f="'+(isFolder?'1':'0')+'">'
        + '<div class="tile">'+ic(iconFor(title))+'</div>'
        + '<div class="iw-cardhd"><h3>'+esc(title)+'</h3>'
        + (totalN?'<span class="iw-count"><i></i>'+totalN+(totalN===1?' acceso':' accesos')+'</span>':'')
        + '</div>'
        + '<svg class="arrow" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17 17 7M9 7h8v8"></path></svg>'
        + '</div>'
        + (desc?'<p class="desc">'+esc(desc)+'</p>':'')
        + (links?'<div class="iw-links">'+links+'</div>':'')
        + '</div>';
    });
    if(!cardsHtml) return;

    var quickHtml='';
    quick.slice(0,6).forEach(function(q){
      quickHtml+='<a class="iw-qcard" data-h="'+esc(q.href)+'" data-f="0" href="'+esc(q.href)+'" style="--c:'+q.c[0]+';--cs:'+q.c[1]+'">'
        + '<span class="iw-qi">'+q.ic+'</span>'
        + '<span class="iw-qt"><b>'+esc(q.t)+'</b><em>Acceso directo</em></span>'
        + '<svg class="iw-qa" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg></a>';
    });

    var main=document.createElement('main'); main.id='iw-tiles'; main.setAttribute('data-sig',sig);
    main.innerHTML='<p class="eyebrow">Menú principal</p><h1>'+esc(pageTitle)+'</h1>'
      + (pageDesc?'<p class="lede">'+esc(pageDesc)+'</p>':'')
      + (quickHtml?'<div class="iw-qlabel">Accesos rápidos</div><div class="iw-quick">'+quickHtml+'</div>':'')
      + '<h2 class="iw-gridlabel">Todas las secciones</h2>'
      + '<div id="iw-grid">'+cardsHtml+'</div>';
    document.body.appendChild(main);

    main.querySelectorAll('[data-h]').forEach(function(el){
      el.addEventListener('click', function(e){ e.preventDefault(); tileNav(el.getAttribute('data-h'), el.getAttribute('data-f')==='1'); });
    });
    document.documentElement.classList.add('iw-tiles-built');
  }
  function removeTiles(){
    document.querySelectorAll('#iw-tiles').forEach(function(m){ m.remove(); });
    document.documentElement.classList.remove('iw-tiles-built');
  }

  /* ---------- estado ---------- */
  function apply(){
    injectRemoteCss();
    applyReskin();
    applyTheme();
    applyRoles();
    tuneFrameset();
    if(enabled){ buildShell(); buildNavSidebar(); buildHeaderBar(); buildTiles(); }
    else { removeShell(); removeNavSidebar(); removeHeaderBar(); removeTiles(); }
  }

  function paintFab(){ var f=document.getElementById('itson-wrap-fab'); if(f){ f.textContent=enabled?'Wrap ON':'Wrap OFF'; f.style.background=enabled?'#2f5bea':'#8a93a5'; } }
  // el fab va: en la homepage (top con body normal) o, en paginas frameset, dentro del frame TargetContent
  function canMountFab(){
    if(frameRole()==='CONTENT') return true;
    if(window.top===window.self && document.body && document.body.tagName!=='FRAMESET') return true;
    return false;
  }
  function mountFab(){
    if(!canMountFab() || document.getElementById('itson-wrap-fab') || !document.body) return;
    var fab=document.createElement('button'); fab.id='itson-wrap-fab'; fab.type='button';
    fab.textContent=enabled?'Wrap ON':'Wrap OFF'; fab.style.background=enabled?'#2f5bea':'#8a93a5';
    fab.style.zIndex='2147483600';
    fab.addEventListener('click', function(){ setEnabled(!enabled); });
    document.body.appendChild(fab);
  }
  function setEnabled(v){ enabled=v; try{ api.storage.local.set({ itson_wrap_enabled:v }); }catch(e){} apply(); paintFab(); }

  try{ api.storage.local.get({ itson_wrap_enabled:true, itson_wrap_theme:'dark' }, function(r){ enabled=r.itson_wrap_enabled; theme=r.itson_wrap_theme; apply(); mountFab(); }); }
  catch(e){ apply(); mountFab(); }

  try{ api.storage.onChanged.addListener(function(ch,area){
    if(area!=='local') return;
    if(ch[KEY]){ enabled=ch[KEY].newValue; apply(); paintFab(); }
    if(ch[TKEY]){ theme=ch[TKEY].newValue; applyTheme(); paintThemeBtns(); }
  }); }catch(e){}

  /* PeopleSoft re-renderiza por postbacks: re-aplicar de forma idempotente */
  var mo=new MutationObserver(function(){
    if(!document.getElementById('itson-wrap-fab')) mountFab();
    injectRemoteCss();
    document.documentElement.classList.toggle('itson-wrap', enabled);
    applyRoles();
    if(enabled && document.getElementById('MENU')){
      if(!document.getElementById('iw-shell')) buildShell();
      else hideOriginals();   // re-ocultar lo que un postback haya re-dibujado
    }
    if(enabled && frameRole()==='NAV') buildNavSidebar();  // se auto-protege por firma
    if(enabled && frameRole()==='HDR') buildHeaderBar();
    if(enabled && frameRole()==='CONTENT') buildTiles();
    if(document.querySelector('frameset') && document.getElementById('iw-shell')) removeShell(); // nunca el shell fijo sobre un frameset
  });
  try{ mo.observe(document.documentElement, { childList:true, subtree:true }); }catch(e){}

  /* ---- CAPTURA TEMPORAL (debug): Ctrl+Shift+Y copia el DOM del frame enfocado ---- */
  function iwCopyText(s){
    try{
      var ta=document.createElement('textarea'); ta.value=s;
      ta.style.cssText='position:fixed;top:0;left:0;opacity:0;z-index:2147483647';
      document.body.appendChild(ta); ta.focus(); ta.select();
      var ok=document.execCommand('copy'); ta.remove(); return ok;
    }catch(e){ return false; }
  }
  document.addEventListener('keydown', function(e){
    if(!(e.ctrlKey && e.shiftKey && (e.key==='Y'||e.key==='y'))) return;
    e.preventDefault();
    try{
      var c=document.body.cloneNode(true);
      c.querySelectorAll('script,style,noscript,link,img,#iw-shell,#iw-navwrap,#iw-topbar,#itson-wrap-fab,#screenity-ui').forEach(function(el){ el.remove(); });
      c.querySelectorAll('input,textarea,select').forEach(function(el){ el.removeAttribute('value'); try{el.value='';}catch(_){}} );
      var out='### '+(location.href||'')+'\n'+c.innerHTML.slice(0,55000);
      var ok=iwCopyText(out);
      var f=document.getElementById('itson-wrap-fab');
      if(f){ var old=f.textContent; f.textContent = ok?'DOM copiado ✓':'copia falló'; setTimeout(function(){ paintFab(); }, 1500); }
      console.log('ITSON Wrap capture: '+(ok?'copiado '+out.length+' chars':'fallo'));
    }catch(err){ console.log('ITSON Wrap capture error', err); }
  }, true);
})();
