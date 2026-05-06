// file:// guard. ES module loading and fetch() are blocked by every modern
// browser for the file:// origin (CORS, opaque origin), which means none of
// the tool renderers can mount and clicks appear to do nothing. Detect that
// and surface a clear message before the user wastes time. Has zero effect
// under http(s)://.
(function () {
  if (location.protocol !== 'file:') return;
  document.documentElement.setAttribute('data-file-origin', '1');
  document.addEventListener('DOMContentLoaded', function () {
    var b = document.createElement('div');
    b.id = 'file-origin-banner';
    b.setAttribute('role', 'alert');
    b.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9999;padding:14px 18px;background:#5a1d1d;color:#fff;font:600 14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;border-bottom:2px solid #ff5d6c;box-shadow:0 4px 12px rgba(0,0,0,.5);text-align:center;';
    var codeStyle = 'background:#000;padding:2px 6px;border-radius:4px;';
    b.appendChild(document.createTextNode(
      'Sophie Well needs to run on a local web server. Browsers block ES modules and data fetches when the page is opened directly from disk (file://), so tool clicks will appear to do nothing.'
    ));
    b.appendChild(document.createElement('br'));
    b.appendChild(document.createElement('br'));
    b.appendChild(document.createTextNode('From the project folder run '));
    var c1 = document.createElement('code');
    c1.style.cssText = codeStyle;
    c1.textContent = 'npm run dev';
    b.appendChild(c1);
    b.appendChild(document.createTextNode(' and open '));
    var c2 = document.createElement('code');
    c2.style.cssText = codeStyle;
    c2.textContent = 'http://localhost:4173';
    b.appendChild(c2);
    document.body.insertBefore(b, document.body.firstChild);
    document.body.style.paddingTop = '128px';
  });
})();
