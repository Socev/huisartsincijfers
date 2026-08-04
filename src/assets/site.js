/* Gedeeld gedrag: tooltips op elk element met data-tip, en de themaknop. */
(function () {
  var tip = document.getElementById('tip');
  function toon(e) {
    var el = e.target.closest('[data-tip]');
    if (!el) return;
    tip.innerHTML = el.getAttribute('data-tip');
    tip.style.opacity = 1;
    tip.style.left = e.clientX + 'px';
    tip.style.top = e.clientY + 'px';
  }
  document.addEventListener('pointermove', function (e) {
    if (e.target.closest('[data-tip]')) toon(e); else tip.style.opacity = 0;
  });
  document.addEventListener('pointerleave', function () { tip.style.opacity = 0; }, true);

  var tt = document.getElementById('tt');
  if (!tt) return;
  var mq = matchMedia('(prefers-color-scheme: dark)');
  function donker() {
    var s = document.documentElement.getAttribute('data-theme');
    return s ? s === 'dark' : mq.matches;
  }
  function sync() { tt.textContent = donker() ? 'licht' : 'donker'; }
  tt.addEventListener('click', function () {
    var n = donker() ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', n);
    try { localStorage.setItem('thema', n); } catch (e) {}
    sync();
  });
  mq.addEventListener('change', sync);
  sync();
})();

/* Menu. De <details>-elementen werken zonder dit script; dit sluit alleen de
   andere groepen, vangt Escape af en klapt de lade dicht als je ernaast klikt. */
(function () {
  var kop = document.querySelector('header.site');
  if (!kop) return;
  var lade = document.getElementById('drawer');
  var groepen = Array.prototype.slice.call(kop.querySelectorAll('details.grp'));

  groepen.forEach(function (g) {
    g.addEventListener('toggle', function () {
      if (!g.open) return;
      groepen.forEach(function (a) { if (a !== g) a.open = false; });
    });
  });

  function sluitAlles() {
    groepen.forEach(function (g) { g.open = false; });
    if (lade && window.innerWidth < 900) lade.open = false;
  }

  document.addEventListener('click', function (e) {
    if (!kop.contains(e.target)) sluitAlles();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') sluitAlles();
  });
  /* Op desktop hoort het menu altijd zichtbaar te zijn. De CSS regelt dat al,
     maar door het <details>-element daar ook echt open te zetten is de site
     niet afhankelijk van hoe een browser een gesloten details verbergt. */
  function stemAfOpBreedte() {
    if (!lade) return;
    lade.open = window.innerWidth >= 900;
  }
  addEventListener('resize', stemAfOpBreedte);
  stemAfOpBreedte();
})();
