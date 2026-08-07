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

/* Bronnenpagina: zoeken en filteren op status. De pagina werkt zonder dit
   script — dan staat alles er en blijft de filterbalk verborgen. */
(function () {
  var balk = document.getElementById('filters');
  if (!balk) return;
  balk.hidden = false;

  var zoekveld = document.getElementById('zoek');
  var telling  = document.getElementById('telling');
  var niets    = document.getElementById('niets');
  var wissen   = document.getElementById('wissen');
  var knoppen  = [].slice.call(balk.querySelectorAll('.chips button'));
  var params   = [].slice.call(document.querySelectorAll('.par:not(.kop)'));
  var secties  = [].slice.call(document.querySelectorAll('details.parsectie'));
  var status   = 'alle';

  function pas() {
    var q = (zoekveld.value || '').trim().toLowerCase();
    var raak = 0;
    params.forEach(function (el) {
      var s = el.getAttribute('data-status') || '';
      /* "afgeleid" moet ook "afgeleid, bevat schatting" vangen; op status
         schatting willen we die samengestelde vorm er juist bij. */
      var statusOk = status === 'alle' || s.indexOf(status) === 0 ||
                     (status === 'schatting' && s.indexOf('schatting') >= 0);
      var zoekOk = !q || (el.getAttribute('data-zoek') || '').indexOf(q) >= 0;
      var toon = statusOk && zoekOk;
      el.hidden = !toon;
      if (toon) raak++;
    });

    /* Een sectie zonder zichtbare parameters heeft geen reden om open te staan. */
    secties.forEach(function (sec) {
      var over = sec.querySelectorAll('.par:not(.kop):not([hidden])').length;
      sec.hidden = over === 0;
      var teller = sec.querySelector('summary i');
      if (teller) teller.textContent = over;
    });

    telling.textContent = raak + ' van ' + params.length + ' parameters';
    niets.hidden = raak !== 0;
  }

  zoekveld.addEventListener('input', pas);
  knoppen.forEach(function (k) {
    k.addEventListener('click', function () {
      status = k.getAttribute('data-status');
      knoppen.forEach(function (a) { a.setAttribute('aria-pressed', String(a === k)); });
      pas();
    });
  });
  if (wissen) wissen.addEventListener('click', function () {
    zoekveld.value = ''; status = 'alle';
    knoppen.forEach(function (a) { a.setAttribute('aria-pressed', String(a.getAttribute('data-status') === 'alle')); });
    pas(); zoekveld.focus();
  });
  pas();
})();

/* Inhoudsopgave: markeert de sectie waar je bent. Zonder dit script blijft de
   lijst gewoon een lijst met werkende links. */
(function () {
  var opzij = document.querySelector('.opzij');
  if (!opzij || !('IntersectionObserver' in window)) return;
  var links = {};
  [].forEach.call(opzij.querySelectorAll('a'), function (a) {
    links[a.getAttribute('href').slice(1)] = a;
  });
  var secties = Object.keys(links).map(function (id) { return document.getElementById(id); })
                      .filter(Boolean);
  if (!secties.length) return;

  var zichtbaar = {};
  var waarnemer = new IntersectionObserver(function (rijen) {
    rijen.forEach(function (r) { zichtbaar[r.target.id] = r.isIntersecting; });
    /* De bovenste zichtbare sectie is waar de lezer is. */
    var actief = secties.filter(function (s) { return zichtbaar[s.id]; })[0];
    Object.keys(links).forEach(function (id) {
      if (actief && id === actief.id) links[id].setAttribute('aria-current', 'true');
      else links[id].removeAttribute('aria-current');
    });
  }, { rootMargin: '-90px 0px -70% 0px' });

  secties.forEach(function (s) { waarnemer.observe(s); });
})();

/* Rondleiding: pijltoetsen als optionele navigatie tussen de stappen. De
   knoppen en de URL-hash werken zonder dit script; dit is alleen gemak. */
(function () {
  var stappen = [].slice.call(document.querySelectorAll('section[id^="stap-"]'));
  if (stappen.length < 2) return;
  function huidige() {
    var mid = window.innerHeight / 2, best = 0, afstand = Infinity;
    stappen.forEach(function (s, i) {
      var r = s.getBoundingClientRect();
      var d = Math.abs(r.top + Math.min(r.height, window.innerHeight) / 2 - mid);
      if (d < afstand) { afstand = d; best = i; }
    });
    return best;
  }
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    var i = huidige() + (e.key === 'ArrowRight' ? 1 : -1);
    if (i < 0 || i >= stappen.length) return;
    e.preventDefault();
    var rustig = matchMedia('(prefers-reduced-motion: reduce)').matches;
    stappen[i].scrollIntoView({ behavior: rustig ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', '#' + stappen[i].id);
  });
})();
