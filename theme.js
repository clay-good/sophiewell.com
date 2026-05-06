// Theme init + toggle. Loaded as an external script so CSP stays strict
// (no inline-script hashes / 'unsafe-inline' required). The init half must
// run before paint, so this file is included synchronously in <head>.
(function () {
  try {
    var stored = localStorage.getItem('sw-theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (_) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

document.addEventListener('DOMContentLoaded', function () {
  var btn = document.getElementById('topbar-theme-toggle');
  if (!btn) return;
  var root = document.documentElement;
  function sync() {
    var isLight = root.getAttribute('data-theme') === 'light';
    btn.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
    btn.setAttribute('aria-pressed', isLight ? 'true' : 'false');
  }
  sync();
  btn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('sw-theme', next); } catch (_) {}
    sync();
  });
});
