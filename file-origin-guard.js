// file:// guard. ES module loading and fetch() are blocked by every modern
// browser for the file:// origin (CORS, opaque origin), which means none of
// the tool renderers can mount and clicks appear to do nothing. Detect that
// and say how to get a copy that works. Has zero effect under http(s)://.
(function () {
  if (location.protocol !== 'file:') return;
  document.documentElement.setAttribute('data-file-origin', '1');
  document.addEventListener('DOMContentLoaded', function () {
    var b = document.createElement('div');
    b.id = 'file-origin-banner';
    b.setAttribute('role', 'alert');
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;padding:14px 18px;background:#5a1d1d;color:#fff;font:600 14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;border-bottom:2px solid #ff5d6c;box-shadow:0 4px 12px rgba(0,0,0,.5);text-align:center;';
    // spec-v1541 §6: written for the person holding the phone, not for a
    // developer. Running a local copy is in the README.
    b.appendChild(document.createTextNode(
      'This copy of Sophie Well was opened from a file, and it cannot run that way. Open sophiewell.com in Chrome once with a connection; after that it works without one.'
    ));
    document.body.insertBefore(b, document.body.firstChild);
    document.body.style.paddingTop = '96px';
  });
})();
