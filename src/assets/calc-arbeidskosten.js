(function () {
  var D = JSON.parse(document.getElementById('calcdata').textContent);
  var el = function (id) { return document.getElementById(id); };
  var jaar = '2025';
  var START = el('i-week').value;
  var nl = function (n, o) { return n.toLocaleString('nl-NL', o); };
  var eur = function (n) { return '€ ' + nl(n, {minimumFractionDigits:2, maximumFractionDigits:2}); };
  var num = function (n) { return nl(n, {maximumFractionDigits:0}); };
  var pct = function (n) { return nl(n*100, {minimumFractionDigits:1, maximumFractionDigits:1}) + '%'; };

  function bereken() {
    var j = D.jaren[jaar];
    var wk = +el('i-week').value;                 // netto uren per week, dienst er al af
    var nacFte = j.ing / D.pf;                    // aantal nac's in de tariefonderbouwing
    var uren = j.ph * wk * D.wkn;                 // alle uren van alle praktijkhouders
    var bruto = nacFte * j.nac / uren;
    return {
      bruto: bruto, urenPerNac: uren / nacFte, wk: wk, ph: j.ph,
      delen: [bruto*D.b100*D.tg, bruto*D.b100*(1-D.tg), bruto*D.sb, bruto*D.sp]
    };
  }

  function teken(r) {
    var bar = el('calcbar'), leg = el('calcleg');
    bar.innerHTML = ''; leg.innerHTML = '';
    D.bronnen.forEach(function (b, i) {
      var v = r.delen[i], aandeel = v / r.bruto;
      var seg = document.createElement('div');
      seg.className = 'seg';
      seg.style.width = (aandeel * 100).toFixed(3) + '%';
      seg.style.background = 'var(--series-' + (i + 1) + ')';
      seg.setAttribute('data-tip', '<b>' + b.naam + '</b><br>' + eur(v) + ' · ' + pct(aandeel) +
        '<br><span style="color:var(--text-secondary)">' + b.toelichting + '</span>');
      if (aandeel > 0.16) seg.innerHTML = '<span class="inl">' + eur(v) + '</span>';
      bar.appendChild(seg);
      var lg = document.createElement('div');
      lg.className = 'lg';
      lg.innerHTML = '<span class="sw" style="background:var(--series-' + (i+1) + ')"></span>' +
                     b.kort + ' <b>' + eur(v) + '</b>';
      leg.appendChild(lg);
    });
  }

  function update() {
    var r = bereken();
    el('v-week').textContent = nl(r.wk, {minimumFractionDigits:1, maximumFractionDigits:1});
    el('v-ph').textContent   = num(r.ph);
    el('o-tot').textContent  = eur(r.bruto);
    el('o-tar').textContent  = eur(r.delen[0]);
    el('o-uur').textContent  = num(r.urenPerNac);
    el('calcmax').textContent = eur(r.bruto);
    Array.prototype.forEach.call(document.querySelectorAll('.rt button'), function (b) {
      b.setAttribute('aria-pressed', String(+b.dataset.week === r.wk));
    });
    teken(r);
  }

  el('i-week').addEventListener('input', update);

  document.querySelector('.rt').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    el('i-week').value = b.dataset.week; update();
  });

  el('i-jaar').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    jaar = b.dataset.jaar;
    Array.prototype.forEach.call(el('i-jaar').children, function (x) {
      x.setAttribute('aria-pressed', String(x === b));
    });
    update();
  });

  el('reset').addEventListener('click', function () { el('i-week').value = START; update(); });
  update();
})();
