# Deployment

sophiewell.com deploys its application through the `sophiewell` Cloudflare
Worker's Static Assets binding. A separate API-only Worker accepts tool reports
at `/api/reports*`; it does not serve or compute tools. The output of
`npm run build` is a directory of static files served from the same origin. The
repository's `_headers` file applies the security headers.
Report launch and D1 maintenance are in
[calculator-reports.md](calculator-reports.md).

## One-time Cloudflare Worker setup

1. Create the `sophiewell` Worker and attach `sophiewell.com` as its production
   custom domain. Keep `workers.dev` and preview URLs disabled, as declared in
   `wrangler.toml`.
2. Build with the Node version in `.nvmrc` and `SOPHIEWELL_OFFLINE=1` where
   required. Production consumes the committed `data/` folder.
3. Keep the `sophiewell-reports` Worker on the more-specific
   `https://sophiewell.com/api/reports*` route.
4. HTTPS:
   - "Always use HTTPS" enabled at the zone level.
   - "HTTP Strict Transport Security" enforced via `_headers`.
   - HSTS preload submission via https://hstspreload.org once the
     production deploy is verified.

## Build pipeline

`npm run build` runs [scripts/build.mjs](../scripts/build.mjs):

- Copies `index.html`, `styles.css`, `app.js`, `sw.js`, `_headers`,
  `robots.txt`, `sitemap.xml`, `site.webmanifest` to `dist/`.
- Recursively copies `lib/`, `views/`, and `data/`.
- Computes a 12-character `BUILD_HASH` from the shipped files and stamps
  it into `dist/sw.js`. New builds invalidate old service-worker caches
  cleanly without code changes.

## Header verification

After every production deploy, verify in a browser developer tools panel
or with `curl -I https://sophiewell.com/`:

- `Content-Security-Policy` allows same-origin app resources plus
  `challenges.cloudflare.com` only in `script-src` and `frame-src` for the
  user-opened Turnstile widget. `connect-src` remains `'self'`.
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`
- `Cross-Origin-Resource-Policy: same-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=()`

External grades to check:
- https://observatory.mozilla.org/analyze/sophiewell.com (target A+)
- https://securityheaders.com/?q=sophiewell.com (target A+)
- https://hstspreload.org/?domain=sophiewell.com (after deploy)

## Manual smoke test

1. Visit https://sophiewell.com.
2. Use the hero search or the browse-by-category links to find a tile.
3. Open a clinical calculator (BMI, drip rate); confirm the inline notice
   from spec section 9 is visible.
4. Open a billing tile (e.g. `em-time` or `ndc-convert`); enter inputs and
   verify the computed code/units and inline notice render.
5. Open `em-mdm` (2021 E/M level by medical decision-making); confirm the
   AMA notice is shown and no verbatim AMA descriptors appear.
6. In the developer tools console:
   - Run `await fetch('https://example.com/')` and verify it is blocked by CSP.
   - Run `localStorage.length`, `sessionStorage.length`, `document.cookie`
     and verify all three are zero / empty.
7. Toggle the network panel offline and reload; the page should still
   render via the service-worker shell cache.
8. Open a calculator, send one report, and verify the row through the query in
   `docs/calculator-reports.md`.

## Rollback

Cloudflare keeps every uploaded Worker version. To roll back, select a known
good `sophiewell` version in Workers & Pages and deploy it to 100% of traffic.
DNS does not need to change.

## Cost

Workers, Turnstile, and D1 free tiers cover the bounded expected traffic.
The hard 200-report daily ceiling limits D1 writes.
