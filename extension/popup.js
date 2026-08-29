var api = (typeof browser !== 'undefined') ? browser : chrome;
var EK = 'itson_wrap_enabled', TK = 'itson_wrap_theme';

var sw = document.getElementById('sw');
var st = document.getElementById('st');
var segBtns = document.querySelectorAll('.seg button[data-theme]');

function paintEnabled(v){
  sw.setAttribute('aria-checked', v ? 'true' : 'false');
  st.textContent = v ? 'Activada' : 'Desactivada';
}
function paintTheme(v){
  document.documentElement.setAttribute('data-theme', v === 'light' ? 'light' : 'dark');
  segBtns.forEach(function(b){ b.classList.toggle('on', b.getAttribute('data-theme') === v); });
}

api.storage.local.get({ itson_wrap_enabled: true, itson_wrap_theme: 'dark' }, function(r){
  paintEnabled(r.itson_wrap_enabled);
  paintTheme(r.itson_wrap_theme);
});

function toggleEnabled(){
  var v = sw.getAttribute('aria-checked') !== 'true';
  api.storage.local.set({ itson_wrap_enabled: v });
  paintEnabled(v);
}
sw.addEventListener('click', toggleEnabled);
sw.addEventListener('keydown', function(e){ if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); toggleEnabled(); } });

segBtns.forEach(function(b){
  b.addEventListener('click', function(){
    var v = b.getAttribute('data-theme');
    api.storage.local.set({ itson_wrap_theme: v });
    paintTheme(v);
  });
});
