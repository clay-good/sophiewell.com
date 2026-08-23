# Public release runbook

Sophie Well is published at `https://sophiewell.com` through the `sophiewell`
Cloudflare Worker's Static Assets binding.
The build is fully reproducible: every byte the browser downloads is in
this repository, every dev tool is pinned to an exact version, and an
SBOM is committed to the repo on every release.

## One-time Cloudflare Worker setup

1. Create the `sophiewell` Worker and attach `sophiewell.com` as its custom
   domain. Keep `workers.dev` and preview URLs disabled.
2. Build with Node `22.23.2` from `.nvmrc`, npm `10.8.2`, and
   `SOPHIEWELL_OFFLINE=1` when running the offline production data build.
3. Confirm Cloudflare manages the TLS certificate and the custom domain is
   active.
4. Submit `sophiewell.com` to <https://hstspreload.org> after the first
   green production deploy. The site already serves
   `Strict-Transport-Security: max-age=31536000; includeSubDomains;
   preload` from `_headers`, so it qualifies on day one.

## Pre-release checklist

Run from a clean checkout:

```sh
nvm use            # honours .nvmrc -> Node 22.23.2
npm ci             # installs exactly what the lockfile pins
npm run release:check
```

`release:check` runs, in order:

1. `npm run lint` (ESLint + the project-specific grep-check that bans
   `innerHTML`, em/en-dashes, raw HTML, etc).
2. `npm run test:unit` (the full unit suite; node:test, no browser).
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
2. CI runs `unit`, `mcp`, and `e2e` jobs (see
   [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)).
3. Merge to `main`, build `dist`, and upload the static Worker version:

   ```sh
   npm run build
   npx wrangler deploy
   ```

4. Record the reported version ID. Because production targets are managed in
   Cloudflare, explicitly promote it:

   ```sh
   npx wrangler versions deploy VERSION_ID --name sophiewell --percentage 100 --yes
   ```

5. Verify `https://sophiewell.com`, then tag the release:

   ```sh
   git tag -s v$(jq -r .version package.json) -m "Sophie Well release"
   git push origin v$(jq -r .version package.json)
   ```

6. Attach `sbom.json` to the GitHub release.

## Supply-chain posture

- **Zero packaged runtime third-party dependencies.** The deployed bundle is
  `index.html`, `styles.css`, `app.js`, `sw.js`, `site.webmanifest`,
  five favicon files, and JSON shards under `data/`. Cloudflare Turnstile is
  the one external script and loads only after a user opens the report dialog.
  There are no fonts, analytics, or trackers.
- **Pinned dev dependencies.** `package.json` uses exact versions for
  every entry in `devDependencies`, including ESLint, Playwright, OpenLore,
  and Wrangler.
- **Pinned runtime engine.** `engines.node` is `>=22.23.2 <23`;
  `.nvmrc` records `22.23.2` for local and CI builds.
- **Reproducible SBOM.** `npm run sbom` writes a CycloneDX 1.5
  `sbom.json` plus a human-readable `sbom.md` with SHA-256 hashes for
  every runtime asset and every JS source module.
- **Data integrity.** Every shard under `data/` has its SHA-256
  recorded in its dataset's `manifest.json` and is re-verified by
  `npm run data:verify` (CI fails on mismatch).
- **HTTP security headers.** Set in [`_headers`](../_headers)
  for the production Static Assets Worker and in
  [`scripts/serve.mjs`](../scripts/serve.mjs) for local dev. Includes
  CSP `connect-src 'self'` plus the narrow Turnstile script/frame exception,
  HSTS preload, COOP/COEP/CORP isolation,
  Permissions-Policy denying camera/mic/geolocation/payment/USB.
- **Service worker** caches the bundle keyed to `BUILD_HASH`, so a new
  deploy invalidates the old cache.

## Rollback

Cloudflare keeps Worker version history. To roll back:

1. **Workers & Pages -> sophiewell -> Deployments**.
2. Find the last known good deployment.
3. Deploy that version to 100% of traffic.

This is instant and does not require a GitHub revert. Follow up with a
`git revert` of the offending commit on `main` so the dashboard and the
repo agree.

## Incident response

Security issues follow [`SECURITY.md`](../SECURITY.md). Operational
incidents (build failures, deploy outages) follow
[`docs/operations.md`](operations.md).
