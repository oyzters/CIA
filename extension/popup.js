var api = (typeof browser !== 'undefined') ? browser : chrome;
var KEY = 'itson_wrap_enabled';
var btn = document.getElementById('t');

function render(v) {
  btn.textContent = v ? 'Activado' : 'Desactivado';
  btn.setAttribute('data-on', v ? '1' : '0');
}

api.storage.local.get({ itson_wrap_enabled: true }, function (r) { render(r.itson_wrap_enabled); });

btn.addEventListener('click', function () {
  api.storage.local.get({ itson_wrap_enabled: true }, function (r) {
    var v = !r.itson_wrap_enabled;
    api.storage.local.set({ itson_wrap_enabled: v });
    render(v);
  });
});
