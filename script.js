(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var clamp = function (v, a, b) { return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v)); };

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- rooftop silhouettes (generated so every layer has detail) ---------- */
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }
  function roof(g, x, top, w, rh) {
    el('path', { class: 'roof', d: 'M' + x + ' ' + (top + 5) + 'Q' + (x + w * .22) + ' ' + (top - 1) + ' ' + (x + w * .32) + ' ' + (top - rh) +
      'L' + (x + w * .68) + ' ' + (top - rh) + 'Q' + (x + w * .78) + ' ' + (top - 1) + ' ' + (x + w) + ' ' + (top + 5) + 'Z' }, g);
  }
  function buildTown(svg, seed, minH, rangeH, winChance, pagodaAt) {
    var r = rng(seed), W = 1440, H = 260, g = el('g', {}, svg);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    el('rect', { class: 'roof', x: 0, y: H - 14, width: W, height: 14 }, g);
    var x = -30;
    while (x < W + 30) {
      var w = 70 + r() * 90, h = minH + r() * rangeH, top = H - h;
      if (pagodaAt && Math.abs(x - pagodaAt) < 60) {
        var pw = 120, py = H;
        for (var t = 0; t < 5; t++) {
          var tw = pw - t * 16, th = 30, tx = x + (pw - tw) / 2;
          el('rect', { class: 'roof', x: tx + 14, y: py - th, width: tw - 28, height: th }, g);
          roof(g, tx - 6, py - th, tw + 12, 12);
          if (r() < .7) el('rect', { class: 'win', x: tx + tw / 2 - 4, y: py - th + 10, width: 8, height: 10, style: 'animation-delay:' + (-r() * 4) + 's' }, g);
          py -= th + 6;
        }
        el('rect', { class: 'roof', x: x + pw / 2 - 2, y: py - 34, width: 4, height: 40 }, g);
        x += pw + 10; continue;
      }
      el('rect', { class: 'roof', x: x + 8, y: top, width: w - 16, height: h }, g);
      roof(g, x, top, w, 14 + r() * 12);
      var n = Math.floor(r() * 3);
      for (var i = 0; i < n; i++) if (r() < winChance) {
        el('rect', { class: 'win', x: x + 18 + r() * (w - 46), y: top + 14 + r() * Math.max(4, h - 40), width: 9, height: 11, style: 'animation-delay:' + (-r() * 4) + 's' }, g);
      }
      x += w - 4 + r() * 14;
    }
  }
  buildTown(document.querySelector('.town.far'), 7, 50, 70, .8, 980);
  buildTown(document.querySelector('.town.near'), 31, 20, 40, .5);
  buildTown(document.querySelector('footer .town'), 99, 30, 70, .7, 300);

  /* ---------- embers ---------- */
  var emb = document.querySelector('.embers');
  if (!reduce) for (var e = 0; e < 26; e++) {
    var s = document.createElement('i');
    s.style.cssText = 'left:' + (Math.random() * 100) + '%;top:' + (50 + Math.random() * 50) + '%;--t:' + (6 + Math.random() * 8) + 's;--dl:' + (-Math.random() * 14) + 's;--dx:' + ((Math.random() - .5) * 120) + 'px';
    emb.appendChild(s);
  }

  /* ---------- reveal, counters, filters ---------- */
  var revealSel = '.sec-head, .note, .stat, .board, .facts, .ingredients, .post, .contact .huge, .contact .lead, .table, .contact .cta';
  document.querySelectorAll(revealSel).forEach(function (n) { n.classList.add('reveal'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var t = en.target;
      setTimeout(function () { t.classList.add('in'); }, (t.classList.contains('board') ? [].indexOf.call(t.parentNode.children, t) * 120 : 0));
      if (t.classList.contains('stat')) countUp(t.querySelector('b'));
      io.unobserve(t);
    });
  }, { threshold: 0.18 });
  document.querySelectorAll('.reveal').forEach(function (n) { io.observe(n); });

  function countUp(b) {
    var end = +b.dataset.count, suf = b.dataset.suffix || '', t0 = performance.now();
    if (reduce) { b.textContent = end + suf; return; }
    (function step(t) {
      var p = Math.min((t - t0) / 1600, 1);
      b.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suf : '');
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  var chips = document.querySelectorAll('.chip');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (x) { x.classList.remove('active'); });
      chip.classList.add('active');
      document.querySelectorAll('.board').forEach(function (b) {
        b.classList.toggle('hide', chip.dataset.f !== 'all' && b.dataset.cat !== chip.dataset.f);
      });
      setTimeout(build, 50);
    });
  });

  /* ---------- the soy sauce pour ---------- */
  var svg = document.getElementById('pour');
  var paths = ['track', 'soyEdge', 'soy', 'soyHi'].map(function (id) { return document.getElementById(id); });
  var soy = document.getElementById('soy');
  var tip = document.getElementById('tip');
  var bottle = document.getElementById('bottle');
  var bottleWrap = document.querySelector('.bottle-wrap');
  var liquid = document.getElementById('liquid');
  var surface = document.getElementById('surface');
  var nozzle = document.getElementById('nozzle');
  var dishFill = document.getElementById('dishFill');
  var dishShine = document.getElementById('dishShine');
  var nav = document.querySelector('.nav');

  var TILT_IDLE = -14, TILT_POUR = -128, TILT_DIST = 240;
  var total = 1, lut = [], start = { x: 0, y: 0 }, cur = 0, docH = 0;

  function smooth(pts) {
    var d = 'M' + pts[0].x + ' ' + pts[0].y;
    for (var i = 0; i < pts.length - 1; i++) {
      var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      d += 'C' + (p1.x + (p2.x - p0.x) / 6) + ' ' + (p1.y + (p2.y - p0.y) / 6) + ' ' +
        (p2.x - (p3.x - p1.x) / 6) + ' ' + (p2.y - (p3.y - p1.y) / 6) + ' ' + p2.x + ' ' + p2.y;
    }
    return d;
  }

  function build() {
    svg.setAttribute('width', 0); svg.setAttribute('height', 0);
    var W = document.documentElement.clientWidth;
    docH = document.documentElement.scrollHeight;
    svg.setAttribute('width', W); svg.setAttribute('height', docH);
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + docH);

    // measure the nozzle with the bottle fully tipped
    bottleWrap.classList.remove('idle');
    var prev = bottle.style.getPropertyValue('--tilt');
    bottle.style.setProperty('--tilt', TILT_POUR + 'deg');
    var r = nozzle.getBoundingClientRect();
    start = { x: r.left + r.width / 2, y: r.top + r.height / 2 + scrollY };
    bottle.style.setProperty('--tilt', prev);

    var pts = [start, { x: start.x, y: start.y + 110 }];
    document.querySelectorAll('.pour-pt').forEach(function (p) {
      var b = p.getBoundingClientRect();
      pts.push({ x: Math.round(b.left), y: Math.round(b.top + scrollY) });
    });
    var d = smooth(pts);
    paths.forEach(function (p) { p.setAttribute('d', d); });
    total = soy.getTotalLength();
    ['soyEdge', 'soy', 'soyHi'].forEach(function (id) {
      var p = document.getElementById(id);
      p.style.strokeDasharray = total + ' ' + total;
    });
    lut = [];
    for (var l = 0; l <= total; l += 10) lut.push([l, soy.getPointAtLength(l).y]);
    lut.push([total, soy.getPointAtLength(total).y]);
    update(true);
  }

  function lengthAtY(y) {
    for (var i = 0; i < lut.length; i++) if (lut[i][1] >= y) return lut[i][0];
    return total;
  }

  function update(snap) {
    var y = scrollY, vh = innerHeight;
    nav.classList.toggle('solid', y > 40);

    // hero parallax
    if (!reduce && y < vh * 1.4) {
      document.querySelectorAll('[data-speed]').forEach(function (n) {
        n.style.transform = 'translate3d(0,' + (y * n.dataset.speed) + 'px,0)';
      });
    }

    // bottle tips over as you start scrolling
    var tp = clamp(y / TILT_DIST);
    var ease = 1 - Math.pow(1 - tp, 3);
    var tilt = TILT_IDLE + (TILT_POUR - TILT_IDLE) * ease;
    bottleWrap.classList.toggle('idle', tp === 0 && !reduce);
    bottle.style.setProperty('--tilt', tilt + 'deg');

    // how far the stream should have travelled
    var target = 0;
    if (tp >= 1) {
      var tipY = Math.min(y + vh * 0.62, start.y + 110 + (y - TILT_DIST) * 2.6);
      target = lengthAtY(tipY);
      if (y + vh >= docH - 4) target = total;
    }
    cur = (snap || reduce) ? target : cur + (target - cur) * 0.14;
    if (Math.abs(target - cur) < 0.5) cur = target;

    var off = total - cur;
    paths[1].style.strokeDashoffset = off;
    paths[2].style.strokeDashoffset = off;
    paths[3].style.strokeDashoffset = off;

    if (cur > 4 && cur < total - 2) {
      var p = soy.getPointAtLength(cur);
      var q = soy.getPointAtLength(Math.max(0, cur - 6));
      var ang = Math.atan2(p.y - q.y, p.x - q.x) * 180 / Math.PI - 90;
      tip.setAttribute('transform', 'translate(' + p.x + ' ' + p.y + ') rotate(' + ang + ')');
      tip.style.opacity = 1;
    } else tip.style.opacity = 0;

    // liquid stays level in the world while the bottle turns, and drains as the page fills
    var prog = cur / total;
    var level = 150 + prog * 95;
    liquid.setAttribute('transform', 'rotate(' + (-tilt) + ' 60 179.2)');
    liquid.firstElementChild.setAttribute('y', level);
    surface.setAttribute('y', level);

    // the dish fills at the very end
    var f = clamp((cur - (total - 220)) / 220);
    dishFill.setAttribute('transform', 'translate(100 41) scale(' + f + ') translate(-100 -41)');
    dishShine.setAttribute('opacity', f * 0.35);
  }

  function loop() { update(false); requestAnimationFrame(loop); }

  var t;
  window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 150); });
  window.addEventListener('load', build);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  build();
  requestAnimationFrame(loop);
})();
