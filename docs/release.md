# Public release runbook

Sophie Well is published at `https://sophiewell.com` via Cloudflare Pages.
The build is fully reproducible: every byte the browser downloads is in
this repository, every dev tool is pinned to an exact version, and an
SBOM is committed to the repo on every release.

## One-time Cloudflare Pages setup

1. Sign in to the Cloudflare dashboard, go to **Workers & Pages -> Create
   application -> Pages -> Connect to Git**, and select the
   `clay-good/sophiewell.com` GitHub repository.
2. Configure the build:

   | Field | Value |
   |---|---|
   | Production branch | `main` |
   | Framework preset | None |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | (leave blank) |

3. Set environment variables (Pages -> Settings -> Environment variables):

   | Name | Value | Scope |
   |---|---|---|
   | `NODE_VERSION` | `20.18.1` | Production + Preview |
   | `NPM_VERSION` | `10.8.2` | Production + Preview |
   | `SOPHIEWELL_OFFLINE` | `1` | Production + Preview |

   The `.nvmrc` file already pins Node to `20.18.1`; setting
   `NODE_VERSION` in the dashboard belt-and-braces the lock so a Pages
   image upgrade cannot silently change runtimes.

4. Add the custom domain in **Pages -> Custom domains**:
   - Apex: `sophiewell.com`
   - Subdomain: `www.sophiewell.com` (optional, redirect to apex)
   - Cloudflare manages the TLS cert. Confirm it goes Active before
     submitting to the HSTS preload list.

5. Submit `sophiewell.com` to <https://hstspreload.org> after the first
   green production deploy. The site already serves
   `Strict-Transport-Security: max-age=31536000; includeSubDomains;
   preload` from `_headers`, so it qualifies on day one.

## Pre-release checklist

Run from a clean checkout:

```sh
nvm use            # honours .nvmrc -> Node 20.18.1
npm ci             # installs exactly what the lockfile pins
npm run release:check
```

`release:check` runs, in order:

1. `npm run lint` (ESLint + the project-specific grep-check that bans
   `innerHTML`, em/en-dashes, raw HTML, etc).
2. `npm run test:unit` (191 unit tests; node:test, no browser).
3. `npm run test:a11y` (static accessibility lint).
4. `node scripts/grep-check.mjs`.
5. `npm run data:verify` (SHA-256 every shard under `data/` against its
   manifest).
6. `npm run sbom` (regenerates `sbom.json` and `sbom.md`).
7. `npm run build` (regenerates favicons, JSON-LD, sitemap, then copies
   `dist/`).

If any step fails, the release does not ship. Commit the regenerated
`sbom.json`, `sbom.md`, and `sitemap.xml` along with the source change
that triggered them.

## End-to-end smoke (recommended before promoting)

```sh
npm run dev   # http://localhost:4173
npm run test:e2e
```

The Playwright suite (`test/integration/smoke.spec.js`) drives a real
browser through the home page, several tool views, the breadcrumb,
keyboard shortcuts, the pinning system, and the CSP/storage assertions.

## Promotion to production

1. Open a PR from `develop` (or a topic branch) into `main`.
2. CI runs `unit`, `e2e`, and `lighthouse` jobs (see
   [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)).
3. Cloudflare Pages builds a preview deploy on push.
4. Manually verify the preview URL: tool clicks land, breadcrumb works,
   footer badges go to the right URLs, favicon is "Sophie Well".
5. Merge to `main`. Cloudflare Pages auto-deploys to production.
6. After a successful production deploy, tag the release:

   ```sh
   git tag -s v$(jq -r .version package.json) -m "Sophie Well release"
   git push origin v$(jq -r .version package.json)
   ```

7. Attach `sbom.json` to the GitHub release.

## Supply-chain posture

- **Zero runtime third-party dependencies.** The deployed bundle is
  `index.html`, `styles.css`, `app.js`, `sw.js`, `site.webmanifest`,
  five favicon files, and JSON shards under `data/`. No CDN, no fonts,
  no analytics, no trackers.
- **Pinned dev dependencies.** `package.json` uses exact versions for
  every entry in `devDependencies`. Today: `eslint` `9.17.0` and
  `@playwright/test` `1.49.1`.
- **Pinned runtime engine.** `engines.node` is `>=20.18.1 <21`;
  `.nvmrc` records `20.18.1`. Cloudflare Pages reads `.nvmrc`.
- **Reproducible SBOM.** `npm run sbom` writes a CycloneDX 1.5
  `sbom.json` plus a human-readable `sbom.md` with SHA-256 hashes for
  every runtime asset and every JS source module.
- **Data integrity.** Every shard under `data/` has its SHA-256
  recorded in its dataset's `manifest.json` and is re-verified by
  `npm run data:verify` (CI fails on mismatch).
- **HTTP security headers.** Set in [`_headers`](../_headers)
  for production (Cloudflare Pages) and in
  [`scripts/serve.mjs`](../scripts/serve.mjs) for local dev. Includes
  CSP `connect-src 'self'`, HSTS preload, COOP/COEP/CORP isolation,
  Permissions-Policy denying camera/mic/geolocation/payment/USB.
- **Service worker** caches the bundle keyed to `BUILD_HASH`, so a new
  deploy invalidates the old cache.

## Rollback

Cloudflare Pages keeps deployment history. To roll back:

1. **Workers & Pages -> sophiewell.com -> Deployments**.
2. Find the last known good deployment.
3. **... menu -> Rollback to this deployment**.

This is instant and does not require a GitHub revert. Follow up with a
`git revert` of the offending commit on `main` so the dashboard and the
repo agree.

## Incident response

Security issues follow [`SECURITY.md`](../SECURITY.md). Operational
incidents (build failures, deploy outages) follow
[`docs/operations.md`](operations.md).
