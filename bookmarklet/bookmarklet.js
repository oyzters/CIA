/*
 * ITSON Wrap - bookmarklet (fuente legible).
 * Version "sin instalar nada": se guarda como marcador y se hace clic estando
 * dentro del portal. Inyecta el estilo en el documento y en los iframes del
 * mismo origen, y alterna la clase html.itson-wrap (clic = on, otro clic = off).
 *
 * Para el bookmarklet listo para arrastrar, abre installer/itson-wrap-installer.html
 * (genera el javascript: automaticamente).
 */
(function () {
  var ID = 'itson-wrap-style';
  var CSS = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');"
    + "html.itson-wrap,html.itson-wrap body{background:#eef1f6!important}"
    + "html.itson-wrap,html.itson-wrap body,html.itson-wrap td,html.itson-wrap th,html.itson-wrap span,html.itson-wrap div,html.itson-wrap a,html.itson-wrap label,html.itson-wrap input,html.itson-wrap select,html.itson-wrap textarea,html.itson-wrap button{font-family:'Inter',system-ui,'Segoe UI',Roboto,Arial,sans-serif!important;color:#1c2230}"
    + "html.itson-wrap table.PABACKGROUND,html.itson-wrap .PAGROUPBOX,html.itson-wrap .PSGROUPBOX,html.itson-wrap table[class*='GROUPBOX']{background:#fff!important;border:1px solid #e3e7ee!important;border-radius:12px!important;box-shadow:0 1px 2px rgba(20,30,55,.06),0 8px 24px rgba(20,30,55,.08)!important}"
    + "html.itson-wrap .PAPAGETITLE,html.itson-wrap .PATRANSACTIONTITLE,html.itson-wrap .PSGROUPBOXLABEL,html.itson-wrap .PAGROUPBOXLABEL{color:#1c2230!important;font-weight:600!important}"
    + "html.itson-wrap input.PSEDITBOX,html.itson-wrap textarea.PSLONGEDITBOX,html.itson-wrap select.PSDROPDOWNLIST,html.itson-wrap input[type='text'],html.itson-wrap input[type='password'],html.itson-wrap select,html.itson-wrap textarea{border:1px solid #e3e7ee!important;border-radius:8px!important;padding:7px 10px!important;background:#fff!important;color:#1c2230!important;outline:none!important}"
    + "html.itson-wrap input.PSEDITBOX:focus,html.itson-wrap textarea:focus,html.itson-wrap select:focus,html.itson-wrap input[type='text']:focus,html.itson-wrap input[type='password']:focus{border-color:#2f5bea!important;box-shadow:0 0 0 3px rgba(47,91,234,.15)!important}"
    + "html.itson-wrap input.PSPUSHBUTTON,html.itson-wrap input[type='button'],html.itson-wrap input[type='submit'],html.itson-wrap a.PSPUSHBUTTONTBLINK{background:#2f5bea!important;color:#fff!important;border:none!important;border-radius:8px!important;padding:8px 16px!important;font-weight:600!important;cursor:pointer!important}"
    + "html.itson-wrap a.PSHYPERLINK,html.itson-wrap a{color:#2f5bea!important}"
    + "html.itson-wrap table.PSLEVEL1GRID,html.itson-wrap table.PSLEVEL2GRID{border-collapse:separate!important;border-spacing:0!important;border:1px solid #e3e7ee!important;border-radius:10px!important;overflow:hidden!important;background:#fff!important}"
    + "html.itson-wrap th.PSLEVEL1GRIDCOLUMNHDR,html.itson-wrap .PSLEVEL1GRIDCOLUMNHDR{background:#f4f6fb!important;color:#5b6472!important;font-weight:600!important;text-transform:uppercase!important;font-size:11px!important;letter-spacing:.04em!important;padding:8px 10px!important;border-bottom:1px solid #e3e7ee!important}"
    + "html.itson-wrap .PSLEVEL1GRIDEVENROW{background:#fafbfe!important}";

  function inject(doc) {
    try {
      if (!doc.getElementById(ID)) {
        var s = doc.createElement('style');
        s.id = ID; s.textContent = CSS;
        (doc.head || doc.documentElement).appendChild(s);
      }
      doc.documentElement.classList.toggle('itson-wrap');
    } catch (e) {}
  }

  inject(document);
  var frames = document.getElementsByTagName('iframe');
  for (var i = 0; i < frames.length; i++) {
    try { if (frames[i].contentDocument) inject(frames[i].contentDocument); } catch (e) {}
  }
})();
