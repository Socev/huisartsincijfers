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
