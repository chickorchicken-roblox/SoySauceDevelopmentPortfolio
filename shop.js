(function () {
  'use strict';

  /* ------------------------------------------------------------------
     GUMROAD LINKS: paste your product links here once they're created.
     Leave a link empty ('') and its buy button explains how to order instead.
     The promo video has no public link on purpose: you send the buyer a
     private Gumroad link after you accept their application.
  ------------------------------------------------------------------- */
  var GUMROAD = {
    review: ''   // e.g. 'https://yourname.gumroad.com/l/game-review'
  };
  var EMAIL = 'looftstop@gmail.com';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  $$('.year').forEach(function (y) { y.textContent = new Date().getFullYear(); });

  /* ---------- buy buttons stay locked until the terms box is ticked ---------- */
  $$('[data-buy]').forEach(function (btn) {
    var key = btn.dataset.buy, box = $('[data-agree="' + key + '"]'), note = $('[data-note="' + key + '"]');
    var link = GUMROAD[key];
    function sync() {
      var ok = box.checked;
      btn.setAttribute('aria-disabled', ok ? 'false' : 'true');
      btn.classList.toggle('locked', !ok);
      note.textContent = ok ? (link ? '' : 'Checkout opens soon. For now, message me to order.') : 'Tick the box above to continue.';
    }
    box.addEventListener('change', sync);
    btn.addEventListener('click', function (ev) {
      ev.preventDefault();
      if (!box.checked) { box.focus(); note.textContent = 'Please tick the box above first.'; return; }
      if (link) window.open(link, '_blank', 'noopener');
      else location.hash = '#contact';
    });
    sync();
  });

  /* ---------- estimator ---------- */
  var money = function (n) { return '$' + n.toFixed(2); };
  function estSfx() {
    var raw = parseFloat($('#est-sfx').value) || 0, secs = Math.max(0, Math.floor(raw));
    $('[data-out="sfx-usd"]').textContent = money(secs * 0.25);
    $('[data-out="sfx-rbx"]').textContent = 'or R$' + (secs * 35).toLocaleString();
    $('[data-out="sfx-note"]').textContent = secs + (secs === 1 ? ' second' : ' seconds') + ' billed';
  }
  function estModels() {
    var n = Math.max(0, Math.floor(parseFloat($('#est-models').value) || 0));
    var bundles = Math.floor(n / 10), rest = n % 10;
    var total = bundles * 25 + rest * 3;
    if ($('#est-tex').checked) total *= 1.25;
    $('[data-out="mdl-usd"]').textContent = money(total);
    var parts = [];
    if (bundles) parts.push(bundles + (bundles === 1 ? ' bundle of 10' : ' bundles of 10'));
    if (rest) parts.push(rest + (rest === 1 ? ' single model' : ' single models'));
    $('[data-out="mdl-note"]').textContent = (parts.join(' + ') || 'no models') + ($('#est-tex').checked ? ' · textured +25%' : '');
  }
  ['#est-sfx'].forEach(function (s) { $(s).addEventListener('input', estSfx); });
  ['#est-models', '#est-tex'].forEach(function (s) { $(s).addEventListener('input', estModels); $(s).addEventListener('change', estModels); });
  estSfx(); estModels();

  /* ---------- promo application: opens an email, nothing is stored here ---------- */
  var form = $('.apply-form'), msg = $('.form-msg');
  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var bad = $$('[required]', form).filter(function (f) { return f.type === 'checkbox' ? !f.checked : !f.value.trim(); });
    if (bad.length) { msg.textContent = 'Please fill in every required field and tick both boxes.'; bad[0].focus(); return; }
    var linkField = form.elements.link;
    if (!/^https?:\/\//i.test(linkField.value.trim())) { msg.textContent = 'The game link should start with https://'; linkField.focus(); return; }
    var f = form.elements;
    var body = [
      'Promotional Video application', '',
      'Name: ' + f.name.value.trim(),
      'Contact: ' + f.contact.value.trim(),
      'Game: ' + f.game.value.trim(),
      'Link: ' + f.link.value.trim(), '',
      'What to promote:', f.promote.value.trim(), '',
      'Anything else:', f.extra.value.trim() || '(nothing)', '',
      'Confirmed: 18+ or has parent/guardian permission; has read the Terms and Privacy Policy.'
    ].join('\n');
    location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Promo application: ' + f.game.value.trim()) + '&body=' + encodeURIComponent(body);
    msg.textContent = 'Your email app should open with everything filled in. Just press send.';
  });

  /* ---------- Discord: copy the username ---------- */
  var copied = $('.copied');
  $$('[data-copy]').forEach(function (b) {
    b.addEventListener('click', function () {
      var t = b.dataset.copy;
      var done = function () { copied.textContent = 'Copied "' + t + '". Add me on Discord!'; setTimeout(function () { copied.textContent = ''; }, 3000); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done, function () { copied.textContent = 'Discord: ' + t; });
      else copied.textContent = 'Discord: ' + t;
    });
  });
})();
