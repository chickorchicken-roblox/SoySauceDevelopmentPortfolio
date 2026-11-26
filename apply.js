(function () {
  'use strict';
  // Application forms: open the visitor's email app with the answers filled in.
  // Nothing is stored on the site.
  document.querySelectorAll('form[data-mailto]').forEach(function (form) {
    var msg = form.querySelector('.form-msg');
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var fields = [].slice.call(form.querySelectorAll('input, textarea'));
      var missing = fields.filter(function (f) {
        if (!f.required) return false;
        return f.type === 'checkbox' ? !f.checked : !f.value.trim();
      });
      if (missing.length) { msg.textContent = 'Please fill in the required fields and tick both boxes.'; missing[0].focus(); return; }
      var link = form.querySelector('input[type=url]');
      if (link && link.value.trim() && !/^https?:\/\//i.test(link.value.trim())) {
        msg.textContent = 'The game link should start with https://'; link.focus(); return;
      }
      var lines = [form.dataset.subject, ''];
      fields.forEach(function (f) {
        if (f.type === 'checkbox') { if (f.checked) lines.push('Confirmed: ' + f.dataset.check); return; }
        lines.push(f.name + ': ' + (f.value.trim() || '(none)'));
      });
      var who = (form.querySelector('[name="Name"]') || {}).value || '';
      location.href = 'mailto:' + form.dataset.mailto + '?subject=' + encodeURIComponent(form.dataset.subject + (who ? ': ' + who.trim() : '')) + '&body=' + encodeURIComponent(lines.join('\n'));
      msg.textContent = 'Your email app should open with everything filled in. Just press send.';
    });
  });
})();
