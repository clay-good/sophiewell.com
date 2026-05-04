# Deployment

sophiewell.com deploys to Cloudflare Pages. There is no application server.
The output of `npm run build` is a directory of static files served from
the same origin. The repository's `_headers` file applies the security
headers from spec section 7.

## One-time Cloudflare Pages setup

1. Sign in to the Cloudflare dashboard and create a new Pages project.
2. Connect the project to the `clay-good/sophiewell.com` GitHub repository.
3. Build configuration:
   - Framework preset: None
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Node version: pull from `.nvmrc` (Node 20 LTS)
   - Environment variable for the data-refresh and CI builds:
     `SOPHIEWELL_OFFLINE=1` for the production build (data is committed to
     the repo by the weekly data-refresh workflow, not fetched at deploy
     time). Production deploys consume the committed `data/` folder.
4. Branch deployments:
   - `main` → production environment, custom domain `sophiewell.com`.
   - `develop` → preview environment, automatic Cloudflare preview URL.
5. Custom domain:
   - Add `sophiewell.com` to the project.
   - Set DNS for the root and `www` to Cloudflare's Pages targets per
     dashboard instructions. Cloudflare manages the certificate.
6. HTTPS:
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

- `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; form-action 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'`
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
2. Filter by audience and group; search for a tile.
3. Open a clinical calculator (BMI, drip rate); confirm the inline notice
   from spec section 9 is visible.
4. Open the Bill Decoder; paste a test bill; verify codes resolve.
5. Open the CPT Code Reference; confirm the AMA notice is shown and no
   AMA descriptors appear.
6. In the developer tools console:
   - Run `await fetch('https://example.com/')` and verify it is blocked
     by CSP.
   - Run `localStorage.length`, `sessionStorage.length`, `document.cookie`
     and verify all three are zero / empty.
7. Toggle the network panel offline and reload; the page should still
   render via the service-worker shell cache.

## Rollback

Cloudflare Pages keeps every prior build as a deployment. To roll back,
open the Pages dashboard, select the project, choose a previous
deployment, and click "Promote to production." DNS does not need to
change.

## Cost

Cloudflare Pages free tier covers the expected traffic. The only ongoing
cost is the domain registration (approximately ten dollars per year).
