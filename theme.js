// Theme init + toggle. Loaded as an external script so CSP stays strict
// (no inline-script hashes / 'unsafe-inline' required). The init half must
// run before paint, so this file is included synchronously in <head>.
// spec-v73: keep the mobile browser-chrome bar (<meta name="theme-color">) in
// sync with the active theme. The static meta can only carry one value, so a
// light-mode visitor saw a dark address bar; this sets it to match --bg-primary
// (#0a0a0a dark / #ffffff light) and finds-or-creates the tag so it works on
// the pre-rendered static pages too (which omit the meta).
function swSetThemeColor(theme) {
  try {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'theme-color');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', theme === 'light' ? '#ffffff' : '#0a0a0a');
  } catch (_) { /* head not ready / blocked: chrome falls back to the static meta */ }
}

(function () {
  try {
    var stored = localStorage.getItem('sw-theme');
    var theme = stored === 'light' || stored === 'dark'
      ? stored
      : (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    swSetThemeColor(theme);
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
    swSetThemeColor(next);
    try { localStorage.setItem('sw-theme', next); } catch (_) {}
    sync();
  });
});

// A closed <details> does not print its contents, so the collapsed citation
// (and the derivation block) would silently drop out of a page printed for the
// chart. Open every disclosure for the print, then put each one back exactly as
// the reader left it. CSS cannot do this: a closed details is hidden by the UA's
// own content-visibility, not by a `display` rule a stylesheet can override.
// Lives here rather than in app.js so the pre-rendered /tools/<id>/ pages, which
// load only this script, get the same behavior.
(function () {
  var reopened = [];
  window.addEventListener('beforeprint', function () {
    reopened = Array.prototype.slice.call(document.querySelectorAll('details:not([open])'));
    for (var i = 0; i < reopened.length; i++) reopened[i].open = true;
  });
  window.addEventListener('afterprint', function () {
    for (var i = 0; i < reopened.length; i++) reopened[i].open = false;
    reopened = [];
  });
})();
