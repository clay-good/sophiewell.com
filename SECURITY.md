# Security policy

Sophie Well calculations are static and client-side. There are no user
accounts or telemetry. The sole hosted write path is an isolated, user-initiated
tool-report Worker backed by D1. Cloudflare Turnstile loads only after a user
opens the report dialog.

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

- Normal tool and asset traffic is static. The report Worker is API-only,
  separately routed, rate-limited, and has no asset binding.
- A strict Content Security Policy is set both via `<meta>` and via real
  HTTP response headers in [`_headers`](_headers) (Cloudflare Static Assets) and
  [`scripts/serve.mjs`](scripts/serve.mjs) (local dev). The deployed CSP
  allows only same-origin resources plus `challenges.cloudflare.com` in
  `script-src` and `frame-src` for the user-opened Turnstile widget. The
  `'wasm-unsafe-eval'` token permits only same-origin
  WebAssembly compilation for the vendored on-device OCR engine
  (`lib/pa/ocr.js`); it does not permit `eval`, `Function`, or inline scripts.
- All data shards under `data/` are integrity-verified at build time by
  [`scripts/verify-integrity.mjs`](scripts/verify-integrity.mjs)
  against SHA-256 hashes recorded in each dataset's `manifest.json`.
- No `localStorage`, `sessionStorage`, `IndexedDB`, or cookies are used.
  Calculator state is encoded in the URL fragment (`location.hash`).
- `connect-src 'self'` prevents arbitrary off-origin data exfiltration. The
  report POST is same-origin and the Worker validates its exact origin, body,
  tool ID, URL, Turnstile token, and size before storage.

## Supply-chain posture

- **One bounded runtime exception.** Cloudflare Turnstile is fetched only after
  a user opens the report dialog. There are no analytics, trackers, fonts, or
  other external scripts.
- **Pinned dev dependencies.** All entries in `package.json`
  `devDependencies` use exact versions (no `^` or `~`), including ESLint,
  Playwright, OpenLore, and Wrangler.
- **Pinned runtime engine.** `engines.node` is constrained to
  `>=20.18.1 <21`; `.nvmrc` records the exact patch for local and CI builds.
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

- Calculation is local. A report is sent only after the user opens the dialog,
  is told which context categories will be attached, completes Turnstile, and
  chooses **Send report**.
- Reports contain the tool URL, bounded input rows, results,
  and an optional note. Sensitive tools and patient-document generators attach
  no form fields, generated output, query parameters, or URL state.
- Raw IP addresses, user agents, identities, email addresses, and Turnstile
  tokens are not stored by the application in D1. A secret-keyed daily HMAC
  supports rate limiting and cannot be used to track a reporter across days.
- The footer links to `claygood.com` and `github.com` only when the user
  explicitly clicks. Ordinary tool use makes no automatic external requests;
  opening the report dialog deliberately loads Cloudflare Turnstile.

## Disclosure history

See [CHANGELOG.md](CHANGELOG.md) entries marked `### Security`.
