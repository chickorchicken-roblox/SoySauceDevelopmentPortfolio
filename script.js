(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var NS = 'http://www.w3.org/2000/svg';
  var clamp = function (v, a, b) { return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v)); };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  $('#year').textContent = new Date().getFullYear();

  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  function el(tag, attrs, parent) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  /* ---------- soy drip shapes (used for the hero word, the band and splats) ---------- */
  // A band of liquid from y=0 to `base`, with rounded drips hanging off it.
  function dripPath(w, base, minL, maxL, seed, every) {
    var r = rng(seed), d = 'M0 0L0 ' + base, x = 0, drips = [];
    while (x < w) {
      var gap = every * (0.5 + r()), dw = 8 + r() * 18;
      x += gap;
      if (x + dw > w) break;
      var L = minL + r() * (maxL - minL), rad = dw * 0.3;
      d += 'L' + x + ' ' + base +
        'Q' + (x + dw * .2) + ' ' + base + ' ' + (x + dw * .2) + ' ' + (base + L - rad) +
        'A' + rad + ' ' + rad + ' 0 0 0 ' + (x + dw * .8) + ' ' + (base + L - rad) +
        'Q' + (x + dw * .8) + ' ' + base + ' ' + (x + dw) + ' ' + base;
      drips.push({ x: x + dw * .5, y: base + L - rad, r: rad, w: dw, L: L });
      x += dw;
    }
    d += 'L' + w + ' ' + base + 'L' + w + ' 0Z';
    return { d: d, drips: drips };
  }

  // Hero word: cream letters with soy sauce poured over the top, clipped to the glyphs.
  function coatWord() {
    var word = $('#coat');
    var r = word.getBoundingClientRect();
    var w = Math.round(r.width), h = Math.round(r.height);
    if (!w || !h) return;
    var base = h * 0.23, p = dripPath(w, base, h * 0.06, h * 0.34, 5, w / 15);
    var s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
      '<rect width="' + w + '" height="' + h + '" fill="#f3e7cf"/>' +
      '<path d="' + p.d + '" fill="#3a1708"/>' +
      '<path d="' + p.d + '" fill="none" stroke="#c07a44" stroke-width="3"/>' +
      '<rect y="' + (base * 0.42) + '" width="' + w + '" height="' + Math.max(2, h * 0.025) + '" fill="#c07a44" opacity=".75"/>' +
      p.drips.map(function (d) { return '<ellipse cx="' + (d.x - d.r * .35) + '" cy="' + (d.y - d.r * .1) + '" rx="' + (d.r * .28) + '" ry="' + (d.r * .5) + '" fill="#fff" opacity=".45"/>'; }).join('') +
      '</svg>';
    word.style.backgroundImage = 'url("data:image/svg+xml,' + encodeURIComponent(s) + '")';
    if (!word.classList.contains('pour-in') && !reduce) word.classList.add('pour-in');
  }

  // Dripping soy band at the top of the work section
  function buildBand(svg) {
    svg.innerHTML = '';
    var w = svg.getBoundingClientRect().width || innerWidth;
    svg.setAttribute('viewBox', '0 0 ' + w + ' 140');
    var r = rng(+svg.dataset.seed || 1);
    var base = 26, x = 0;
    el('rect', { x: 0, y: 0, width: w, height: base + 1, fill: '#2a1207' }, svg);
    while (x < w) {
      var dw = 10 + r() * 26, L = 10 + r() * 90, rad = dw * .3;
      var d = 'M' + x + ' ' + base + 'Q' + (x + dw * .2) + ' ' + base + ' ' + (x + dw * .2) + ' ' + (base + L - rad) +
        'A' + rad + ' ' + rad + ' 0 0 0 ' + (x + dw * .8) + ' ' + (base + L - rad) + 'Q' + (x + dw * .8) + ' ' + base + ' ' + (x + dw) + ' ' + base + 'Z';
      var g = el('g', { class: 'drip', style: '--t:' + (4 + r() * 5) + 's;--dl:' + (-r() * 6) + 's' }, svg);
      el('path', { d: d, fill: '#2a1207', stroke: '#8a3f17', 'stroke-width': 1.5 }, g);
      el('ellipse', { cx: x + dw * .4, cy: base + L - rad, rx: rad * .25, ry: rad * .45, fill: '#fff', opacity: .4 }, g);
      x += dw + r() * 40;
    }
    el('rect', { x: 0, y: base - 2, width: w, height: 3, fill: '#8a3f17' }, svg);
    el('rect', { x: 0, y: 8, width: w, height: 2, fill: '#c07a44', opacity: .5 }, svg);
  }

  // Soy splat decorations
  function buildSplat(host) {
    var r = rng(+host.dataset.seed || 2), n = 14, pts = [], cx = 65, cy = 65;
    for (var i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2, rad = 30 + r() * 22;
      if (r() < .3) rad += 18;
      pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
    }
    var d = 'M' + pts[0];
    for (var j = 0; j < n; j++) {
      var p1 = pts[j], p2 = pts[(j + 1) % n], m = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
      d += 'Q' + p1[0] + ' ' + p1[1] + ' ' + m[0] + ' ' + m[1];
    }
    var s = el('svg', { viewBox: '0 0 130 130' }, host);
    el('path', { d: d + 'Z', fill: '#000', opacity: .3, transform: 'translate(4 6)' }, s);
    el('path', { d: d + 'Z', fill: '#2a1207', stroke: '#6b2f12', 'stroke-width': 2 }, s);
    for (var k = 0; k < 6; k++) {
      var aa = r() * Math.PI * 2, dd = 62 + r() * 20;
      el('circle', { cx: cx + Math.cos(aa) * dd, cy: cy + Math.sin(aa) * dd, r: 2 + r() * 5, fill: '#2a1207', stroke: '#6b2f12' }, s);
    }
    el('ellipse', { cx: 50, cy: 48, rx: 16, ry: 6, fill: '#fff', opacity: .18, transform: 'rotate(-25 50 48)' }, s);
  }
  $$('.splat').forEach(buildSplat);

  /* ---------- rooftop silhouettes ---------- */
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
      if (r() < .25 && h > 40) el('rect', { class: 'nore', x: x + w * .35, y: top + 8, width: w * .3, height: 16 }, g);
      var n = Math.floor(r() * 3);
      for (var i = 0; i < n; i++) if (r() < winChance) {
        el('rect', { class: 'win', x: x + 18 + r() * (w - 46), y: top + 26 + r() * Math.max(4, h - 50), width: 9, height: 11, style: 'animation-delay:' + (-r() * 4) + 's' }, g);
      }
      x += w - 4 + r() * 14;
    }
  }
  buildTown($('.town.far'), 7, 50, 70, .8, 980);
  buildTown($('.town.near'), 31, 20, 40, .5);
  buildTown($('footer .town'), 99, 30, 70, .7, 300);

  /* ---------- embers ---------- */
  var emb = $('.embers');
  if (!reduce) for (var e = 0; e < 30; e++) {
    var s = document.createElement('i');
    s.style.cssText = 'left:' + (Math.random() * 100) + '%;top:' + (50 + Math.random() * 50) + '%;--t:' + (6 + Math.random() * 8) + 's;--dl:' + (-Math.random() * 14) + 's;--dx:' + ((Math.random() - .5) * 120) + 'px';
    emb.appendChild(s);
  }

  /* ---------- reveal + counters ---------- */
  var revealSel = '.sec-head, .frame, .callout, .case-info, .case .tags, .tile, .map, .roar, .pack, .range, .facts, .ingredients, .post, .contact .huge, .contact .lead, .table, .contact .cta';
  $$(revealSel).forEach(function (n) { n.classList.add('reveal'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var t = en.target, delay = 0;
      if (t.classList.contains('tile') || t.classList.contains('map') || t.classList.contains('pack')) delay = [].indexOf.call(t.parentNode.children, t) * 120;
      setTimeout(function () { t.classList.add('in'); }, delay);
      io.unobserve(t);
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(function (n) { io.observe(n); });

  /* ---------- videos: play only while on screen, click to enlarge ---------- */
  var viewer = $('#viewer'), viewerVid = $('video', viewer);
  var vio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var v = $('video', en.target);
      if (en.isIntersecting && !reduce) {
        v.play().then(function () { en.target.classList.add('playing'); }).catch(function () {});
      } else { v.pause(); en.target.classList.remove('playing'); }
    });
  }, { threshold: 0.35 });
  $$('.frame[data-video]').forEach(function (f) {
    vio.observe(f);
    var open = function () {
      if (!viewer.showModal) return;
      viewer.classList.remove('img');
      viewerVid.src = $('source', f).getAttribute('src');
      viewer.showModal();
      viewerVid.play().catch(function () {});
    };
    $('.expand', f).addEventListener('click', open);
    $('video', f).addEventListener('click', open);
    // subtle 3D tilt toward the cursor
    if (!reduce) {
      f.addEventListener('mousemove', function (ev) {
        var b = f.getBoundingClientRect();
        f.style.setProperty('--ry', (((ev.clientX - b.left) / b.width) - .5) * 5 + 'deg');
        f.style.setProperty('--rx', -(((ev.clientY - b.top) / b.height) - .5) * 4 + 'deg');
      });
      f.addEventListener('mouseleave', function () { f.style.setProperty('--rx', '0deg'); f.style.setProperty('--ry', '0deg'); });
    }
  });
  function closeViewer() { viewerVid.pause(); viewerVid.removeAttribute('src'); viewerVid.load(); viewer.close(); }
  $('.close', viewer).addEventListener('click', closeViewer);
  viewer.addEventListener('click', function (ev) { if (ev.target === viewer) closeViewer(); });
  viewer.addEventListener('cancel', function (ev) { ev.preventDefault(); closeViewer(); });

  /* ---------- maps: view switcher + click to enlarge ---------- */
  var viewerImg = $('img', viewer);
  $$('[data-map]').forEach(function (m) {
    var imgs = $$('.shots img', m), btns = $$('.switch button', m);
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () {
        btns.forEach(function (x) { x.classList.toggle('on', x === b); });
        imgs.forEach(function (im, j) { im.classList.toggle('on', j === i); });
      });
    });
    $('.shots', m).addEventListener('click', function () {
      if (!viewer.showModal) return;
      var on = $('.shots img.on', m);
      viewerImg.src = on.src; viewerImg.alt = on.alt;
      viewer.classList.add('img');
      viewer.showModal();
    });
  });

  /* ---------- SFX players ---------- */
  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="i-play" d="M8 5v14l11-7z"/><path class="i-stop" d="M7 7h10v10H7z"/></svg>';
  var audio = new Audio(), current = null, peaks = {};
  audio.preload = 'none';
  function waveHTML(p) {
    var bars = (p || new Array(48).fill(.35)).map(function (h) { return '<i style="--h:' + h + '"></i>'; }).join('');
    return bars + '<div class="fill">' + bars + '</div>';
  }
  function fmt(d) { return d >= 1 ? d.toFixed(1) + 's' : Math.round(d * 1000) + 'ms'; }
  function stop() {
    audio.pause();
    if (current) { current.el.classList.remove('playing'); current.btn.classList.remove('playing'); current.wave.style.setProperty('--p', '0%'); }
    current = null;
  }
  function play(el, btn, wave, src, vol) {
    var same = current && current.el === el;
    stop();
    if (same) return;
    audio.src = src; audio.volume = vol || 0.8; audio.currentTime = 0;
    audio.play().catch(function () {});
    current = { el: el, btn: btn, wave: wave };
    el.classList.add('playing'); btn.classList.add('playing');
  }
  audio.addEventListener('ended', stop);
  (function tickAudio() {
    if (current && audio.duration) current.wave.style.setProperty('--p', (audio.currentTime / audio.duration * 100) + '%');
    requestAnimationFrame(tickAudio);
  })();

  $$('.sounds li').forEach(function (li) {
    var file = li.dataset.src, name = li.textContent;
    li.className = 'sound'; li.setAttribute('role', 'button'); li.tabIndex = 0;
    li.setAttribute('aria-label', 'Play ' + name);
    li.innerHTML = '<span class="pb">' + ICON + '</span><span class="nm"></span><div class="wave" data-wave="' + file + '"></div><span class="du"></span>';
    $('.nm', li).textContent = name;
    var go = function () { play(li, li, $('.wave', li), 'media/sfx/' + file, 0.8); };
    li.addEventListener('click', go);
    li.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } });
  });
  var roarBtn = $('.big-play'), roarWave = $('.roar .wave');
  roarBtn.addEventListener('click', function () { play(roarBtn, roarBtn, roarWave, roarBtn.dataset.src, +roarBtn.dataset.vol); });

  function drawWaves() {
    $$('[data-wave]').forEach(function (w) {
      var info = peaks[w.dataset.wave];
      w.innerHTML = waveHTML(info && info.p);
      var du = w.parentNode.querySelector('.du');
      if (du && info) du.textContent = fmt(info.d);
    });
  }
  drawWaves();
  fetch('media/sfx/peaks.json').then(function (r) { return r.json(); }).then(function (j) { peaks = j; drawWaves(); }).catch(function () {});

  /* ---------- Discord: copy the username ---------- */
  var copiedMsg = $('.copied');
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var txt = b.dataset.copy;
      var done = function () { copiedMsg.textContent = 'Copied "' + txt + '". Add me on Discord!'; setTimeout(function () { copiedMsg.textContent = ''; }, 3000); };
      if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () { copiedMsg.textContent = 'Discord: ' + txt; });
      else copiedMsg.textContent = 'Discord: ' + txt;
    });
  });

  /* ---------- the soy sauce pour ---------- */
  var svg = $('#pour');
  var lines = ['soyShadow', 'soyEdge', 'soy', 'soyHi', 'soyHi2'].map(function (id) { return document.getElementById(id); });
  var track = $('#track'), soy = $('#soy'), tip = $('#tip');
  var bottle = $('#bottle'), bottleWrap = $('.bottle-wrap');
  var liquid = $('#liquid'), liqBody = $('#liqBody'), liqDeep = $('#liqDeep'), surface = $('#surface');
  var nozzle = $('#nozzle'), dishFillG = $('#dishFillG'), dish = $('.dish');
  var nav = $('.nav');
  var glintG = $('#glints'), dropG = $('#drops');
  var glints = [], drops = [];
  for (var gi = 0; gi < 40; gi++) glints.push(el('ellipse', { rx: 1.5, ry: 5, opacity: 0 }, glintG));
  for (var di = 0; di < 18; di++) drops.push({ n: el('circle', { r: 3, opacity: 0 }, dropG), life: 0 });

  var TILT_IDLE = -14, TILT_POUR = -128, TILT_DIST = 240;
  var total = 1, lut = [], start = { x: 0, y: 0 }, cur = 0, docH = 0, lastT = 0, lastDrop = 0;
  var parallax = $$('[data-speed]'), depthEls = $$('[data-depth]'), mx = 0, my = 0, smx = 0, smy = 0;

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
    coatWord();
    $$('.drip-band').forEach(buildBand);
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
    $$('.pour-pt').forEach(function (p) {
      var b = p.getBoundingClientRect();
      pts.push({ x: Math.round(b.left), y: Math.round(b.top + scrollY) });
    });
    var d = smooth(pts);
    track.setAttribute('d', d);
    lines.forEach(function (p) { p.setAttribute('d', d); });
    total = soy.getTotalLength();
    lines.forEach(function (p) { p.style.strokeDasharray = total + ' ' + total; });
    lut = [];
    for (var l = 0; l <= total; l += 10) lut.push([l, soy.getPointAtLength(l).y]);
    lut.push([total, soy.getPointAtLength(total).y]);
    update(performance.now(), true);
  }

  function lengthAtY(y) {
    for (var i = 0; i < lut.length; i++) if (lut[i][1] >= y) return lut[i][0];
    return total;
  }

  function update(now, snap) {
    var dt = Math.min(0.05, (now - (lastT || now)) / 1000); lastT = now;
    var y = scrollY, vh = innerHeight;
    nav.classList.toggle('solid', y > 40);

    // hero parallax: scroll + mouse
    smx += (mx - smx) * 0.06; smy += (my - smy) * 0.06;
    if (!reduce && y < vh * 1.4) {
      parallax.forEach(function (n) {
        var m = +(n.dataset.mouse || 0);
        n.style.transform = 'translate3d(' + (smx * m) + 'px,' + (y * n.dataset.speed + smy * m * .5) + 'px,0)';
      });
    }
    // depth decor: beans and splats drift at different speeds
    if (!reduce) depthEls.forEach(function (n) {
      var b = n.parentNode.getBoundingClientRect();
      if (b.bottom < -200 || b.top > vh + 200) return;
      var off = (b.top + b.height / 2 - vh / 2) * -n.dataset.depth;
      n.style.transform = 'translate3d(0,' + off + 'px,0)';
    });

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
    var prevCur = cur;
    cur = (snap || reduce) ? target : cur + (target - cur) * 0.14;
    if (Math.abs(target - cur) < 0.5) cur = target;
    var speed = Math.abs(cur - prevCur);

    var off = total - cur;
    lines.forEach(function (p) { p.style.strokeDashoffset = off; });

    // tip droplet
    var tipP = null;
    if (cur > 4 && cur < total - 2) {
      tipP = soy.getPointAtLength(cur);
      var q = soy.getPointAtLength(Math.max(0, cur - 6));
      var ang = Math.atan2(tipP.y - q.y, tipP.x - q.x) * 180 / Math.PI - 90;
      var sc = 1 + Math.sin(now / 260) * 0.07 + Math.min(speed, 20) * 0.01;
      tip.setAttribute('transform', 'translate(' + tipP.x + ' ' + tipP.y + ') rotate(' + ang + ') scale(' + (1 / sc) + ' ' + sc + ')');
      tip.style.opacity = 1;
    } else tip.style.opacity = 0;

    // flowing glints: little highlights travelling down the poured stream
    var used = 0;
    if (cur > 30 && !reduce) {
      var l0 = Math.max(0, lengthAtY(y - 80) - 200), l1 = Math.min(cur - 10, lengthAtY(y + vh + 80) + 40);
      var SP = 64, flow = (now * 0.2) % SP;
      for (var L = Math.floor((l0 - flow) / SP) * SP + flow; L < l1 && used < glints.length; L += SP) {
        if (L < 0) continue;
        var p = soy.getPointAtLength(L), p2 = soy.getPointAtLength(Math.min(total, L + 5));
        var dx = p2.x - p.x, dy = p2.y - p.y, len = Math.hypot(dx, dy) || 1;
        var a = Math.atan2(dy, dx) * 180 / Math.PI - 90;
        var gx = p.x - (dy / len) * 3.2, gy = p.y + (dx / len) * 3.2;
        var g = glints[used++];
        g.setAttribute('transform', 'translate(' + gx + ' ' + gy + ') rotate(' + a + ')');
        g.setAttribute('opacity', (Math.min(1, (cur - L) / 80) * (0.45 + 0.35 * Math.sin(L * 0.05 + now * 0.004))).toFixed(2));
      }
    }
    for (var u = used; u < glints.length; u++) glints[u].setAttribute('opacity', 0);

    // droplets flicking off the tip while it moves, and slow drips while it rests
    if (tipP && !reduce) {
      var gapMs = speed > 2 ? 70 : 1100;
      if (now - lastDrop > gapMs) {
        lastDrop = now;
        var dpl = drops.filter(function (o) { return o.life <= 0; })[0];
        if (dpl) {
          dpl.x = tipP.x + (Math.random() - .5) * 6; dpl.y = tipP.y + 6;
          dpl.vx = speed > 2 ? (Math.random() - .5) * 90 : 0; dpl.vy = speed > 2 ? -20 - Math.random() * 60 : 10;
          dpl.max = dpl.life = speed > 2 ? .55 : .9; dpl.r = speed > 2 ? 1.5 + Math.random() * 2.5 : 3.2;
          dpl.n.setAttribute('r', dpl.r);
        }
      }
    }
    drops.forEach(function (o) {
      if (o.life <= 0) return;
      o.life -= dt; o.vy += 700 * dt; o.x += o.vx * dt; o.y += o.vy * dt;
      o.n.setAttribute('cx', o.x.toFixed(1)); o.n.setAttribute('cy', o.y.toFixed(1));
      o.n.setAttribute('opacity', Math.max(0, o.life / o.max).toFixed(2));
    });

    // bottle liquid stays level in the world while the bottle turns, and drains as the page fills
    var prog = cur / total;
    var level = 150 + prog * 95;
    liquid.setAttribute('transform', 'rotate(' + (-tilt) + ' 60 179.2)');
    liqBody.setAttribute('y', level);
    liqDeep.setAttribute('y', level + 40);
    surface.setAttribute('y', level);

    // the dish fills at the very end
    var f = clamp((cur - (total - 260)) / 260);
    dishFillG.setAttribute('transform', 'translate(100 41) scale(' + f + ') translate(-100 -41)');
    dish.classList.toggle('pouring', f > 0.02);
  }

  window.addEventListener('mousemove', function (ev) {
    mx = ev.clientX / innerWidth - .5; my = ev.clientY / innerHeight - .5;
  });

  function loop(t) { update(t, false); requestAnimationFrame(loop); }

  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(build, 150); });
  window.addEventListener('load', build);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
  build();
  requestAnimationFrame(loop);
})();
