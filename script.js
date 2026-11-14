(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  // Theme toggle (remembered if storage is available)
  try { var saved = localStorage.getItem('theme'); if (saved) root.dataset.theme = saved; } catch (e) {}
  document.getElementById('theme').addEventListener('click', function () {
    var next = root.dataset.theme === 'light' ? 'dark' : 'light';
    root.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  document.getElementById('year').textContent = new Date().getFullYear();

  // Typing effect
  var words = ['love to play.', 'feel amazing.', 'look crafted.', 'keep you coming back.'];
  var el = document.getElementById('type'), w = 0, c = 0, del = false;
  function tick() {
    var word = words[w];
    el.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(tick, 1400); }
    if (del && c === 0) { del = false; w = (w + 1) % words.length; }
    c += del ? -1 : 1;
    setTimeout(tick, del ? 35 : 75);
  }
  if (reduce) el.textContent = words[0]; else tick();

  // Scroll reveal + skill bars + counters
  document.querySelectorAll('section h2, .card, .about, .skills, .tools, .stats, #contact .lead, #contact .cta')
    .forEach(function (n) { n.classList.add('reveal'); });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      e.target.querySelectorAll && e.target.querySelectorAll('.skill').forEach(function (s) { s.classList.add('in'); });
      if (e.target.classList.contains('stats')) countUp(e.target);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach(function (n) { io.observe(n); });

  function countUp(box) {
    box.querySelectorAll('[data-count]').forEach(function (b) {
      var end = +b.dataset.count, suf = b.dataset.suffix || '', t0 = performance.now();
      (function step(t) {
        var p = Math.min((t - t0) / 1400, 1);
        b.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suf : '');
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }

  // Project filters
  var chips = document.querySelectorAll('.chip');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (x) { x.classList.remove('active'); });
      chip.classList.add('active');
      document.querySelectorAll('.card').forEach(function (card) {
        card.classList.toggle('hide', chip.dataset.f !== 'all' && card.dataset.cat !== chip.dataset.f);
      });
    });
  });

  if (reduce) return;

  // Card tilt
  document.querySelectorAll('.tilt').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = 'perspective(700px) rotateY(' + x * 10 + 'deg) rotateX(' + -y * 10 + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function () { card.style.transform = ''; });
  });

  // Cursor glow
  var glow = document.querySelector('.cursor-glow');
  window.addEventListener('mousemove', function (e) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; });

  // Particle background
  var cv = document.getElementById('bg'), ctx = cv.getContext('2d'), pts = [], mouse = { x: -999, y: -999 };
  function size() { cv.width = innerWidth; cv.height = innerHeight; }
  size(); addEventListener('resize', size);
  for (var i = 0; i < 70; i++) pts.push({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35 });
  addEventListener('mousemove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; });
  function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    var col = getComputedStyle(root).getPropertyValue('--accent').trim() || '#ff9f1c';
    ctx.fillStyle = col; ctx.strokeStyle = col;
    pts.forEach(function (p, i) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > cv.width) p.vx *= -1;
      if (p.y < 0 || p.y > cv.height) p.vy *= -1;
      ctx.globalAlpha = .5; ctx.beginPath(); ctx.arc(p.x, p.y, 1.6, 0, 6.283); ctx.fill();
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) { ctx.globalAlpha = (1 - d / 120) * .18; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke(); }
      }
      var dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 160) { ctx.globalAlpha = (1 - dm / 160) * .35; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke(); }
    });
    requestAnimationFrame(draw);
  }
  draw();
})();
