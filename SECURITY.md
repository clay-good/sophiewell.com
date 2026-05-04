# Security policy

Sophie Well is a static, client-side site. There is no application server,
no database, no user accounts, no telemetry, and no third-party JavaScript
loaded at runtime. The browser downloads only files committed in this
repository.

## Reporting a vulnerability

Please report security issues privately. **Do not open a public GitHub
issue.** Email `hi@claygood.com` with:

- A clear description of the vulnerability and its impact.
- Step-by-step reproduction instructions.
- The affected commit or deployed URL where you observed the behavior.

You will receive an acknowledgement within 72 hours. Confirmed issues will
be patched on `main` and deployed to `sophiewell.com` within 7 days for
high-severity findings, 30 days for medium-severity, and 90 days otherwise.
Security fixes are noted in [CHANGELOG.md](CHANGELOG.md) under a
`### Security` heading.

## Supported versions

The deployed site at `https://sophiewell.com` always tracks `main`. Older
commits are not maintained; security fixes are applied to the current
`main` only.

## Threat model

Documented in [docs/threat-model.md](docs/threat-model.md). High-level
summary:

- The site is static. There is no server-side code path to compromise.
- A strict Content Security Policy is set both via `<meta>` and via real
  HTTP response headers in [`_headers`](_headers) (Cloudflare Pages) and
  [`scripts/serve.mjs`](scripts/serve.mjs) (local dev). The deployed CSP
  is `default-src 'self'; script-src 'self'; style-src 'self'
  'unsafe-inline'; img-src 'self' data:; connect-src 'self'; form-action
  'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'`.
- All data shards under `data/` are integrity-verified at build time by
  [`scripts/verify-integrity.mjs`](scripts/verify-integrity.mjs)
  against SHA-256 hashes recorded in each dataset's `manifest.json`.
- No `localStorage`, `sessionStorage`, `IndexedDB`, or cookies are used.
  Calculator state is encoded in the URL fragment (`location.hash`).
- No outbound network requests. The CSP `connect-src 'self'` directive
  structurally prevents data exfiltration.

## Supply-chain posture

- **Zero runtime third-party dependencies.** The deployed bundle contains
  only files in this repository. No CDN, no fonts, no analytics, no
  trackers, no external scripts of any kind.
- **Pinned dev dependencies.** All entries in `package.json`
  `devDependencies` use exact versions (no `^` or `~`). Today: ESLint
  `9.17.0` and `@playwright/test` `1.49.1`.
- **Pinned runtime engine.** `engines.node` is constrained to
  `>=20.18.1 <21`; `.nvmrc` records the exact patch. Cloudflare Pages
  reads `.nvmrc` to lock the build's Node version.
- **Reproducible SBOM.** [`scripts/build-sbom.mjs`](scripts/build-sbom.mjs)
  emits a CycloneDX 1.5 [`sbom.json`](sbom.json) and a human-readable
  [`sbom.md`](sbom.md). Both include a per-build SHA-256-derived build
  ID and SHA-256s of every shipped runtime asset and every JS source
  module. Run `npm run sbom` to regenerate.
- **Data integrity.** `npm run data:verify` re-hashes every shard under
  `data/` and compares against the value in its dataset manifest. CI
  fails the build on any mismatch.

## Browser hardening

- HTTPS enforced site-wide; HSTS preloaded
  (`Strict-Transport-Security: max-age=31536000; includeSubDomains;
  preload`).
- `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: no-referrer`,
  `Cross-Origin-Opener-Policy: same-origin`,
  `Cross-Origin-Embedder-Policy: require-corp`,
  `Cross-Origin-Resource-Policy: same-origin`.
- `Permissions-Policy` denies camera, microphone, geolocation, payment,
  USB, and accelerometer.
- A service worker (`sw.js`) caches the bundle for offline use; cache
  keys include the `BUILD_HASH` so a new deploy invalidates old caches.

## Privacy

- No personal data is collected, processed, or transmitted.
- All calculator inputs stay on the user's device. The fragment-based
  state lives only in the URL and is never sent to any server.
- The footer links to `claygood.com` and `github.com` only when the user
  explicitly clicks. No automatic external requests are made.

## Disclosure history

See [CHANGELOG.md](CHANGELOG.md) entries marked `### Security`.
