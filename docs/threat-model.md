# Threat Model

The application has a small attack surface by design. Each threat below is
paired with the controls that mitigate it. Controls that appear in section 7
of `spec.md` (security headers, CSP, no client storage, integrity checks)
are referenced rather than reproduced.

## Threats and Mitigations

### T1. Cross-site scripting via pasted bill, EOB, or clinical input

Pasted text from a user could in principle contain script-like content. If
the application inserted that content as HTML, an attacker could persuade a
user to paste a hostile string and run script in the page origin.

Mitigations:
- All user input is treated as text. The DOM is updated using `textContent`
  or `createTextNode` for any user-derived value.
- `innerHTML` is forbidden in the codebase, enforced by an ESLint rule and a
  CI grep check.
- The Content Security Policy disallows inline script
  (`script-src 'self' 'wasm-unsafe-eval'`). The `'wasm-unsafe-eval'` token
  permits only same-origin WebAssembly compilation — required by the vendored
  on-device OCR engine (`lib/pa/ocr.js`, tesseract) — and does **not** permit
  inline `<script>` or string evaluation.
- The CSP disallows `eval` and the `Function` constructor by virtue of
  omitting `unsafe-eval` (`wasm-unsafe-eval` gates only WASM, not `eval`).

### T2. Network exfiltration of pasted user data

A user pastes a bill or an EOB. If the page could make outbound network
requests, an attacker who slipped script into the page (see T1) or a
maliciously crafted dependency could exfiltrate that text.

Mitigations:
- The CSP `connect-src 'self'` directive blocks outbound connections to any
  origin other than the page's own.
- Ordinary tool use makes no outbound requests. The deliberate report POST is
  same-origin, strictly bounded, and validated by an API-only Worker.
- Verified by attempting a `fetch` to a third-party URL from the console;
  the request must be blocked.

### T3. Abuse or disclosure through tool reports

A public write endpoint could be flooded, or a clinician could accidentally
include patient identifiers in feedback.

Mitigations:
- Turnstile is verified server-side for the exact action and hostname.
- A zone WAF rate limit runs before the Worker; D1 enforces global and
  privacy-preserving per-reporter daily ceilings plus duplicate suppression.
- The body and every stored field are bounded. Encoded bodies, unknown keys,
  unsafe control characters, unknown tool IDs, and mismatched URLs are rejected.
- Every report sends only a canonical tool URL, never query parameters or URL
  state. Inputs and results are omitted by default and require explicit opt-in.
  Sensitive tools and patient-document generators cannot attach form fields or
  generated output; identity/contact/file controls are skipped; the dialog
  explicitly forbids patient identifiers.
- Raw IP addresses, user agents, identities, and Turnstile tokens are not stored
  by the application in D1.
- Daily D1 cleanup bounds counter retention to 14 days, resolved or `wont_fix`
  reports to 90 days, and all reports to 180 days.

### T4. Supply-chain compromise via runtime dependencies

Compromised npm packages could ship malicious code into the bundle.

Mitigations:
- Zero runtime dependencies. The shipped application uses no JavaScript
  frameworks, no CSS frameworks, and no npm packages at runtime.
- Build-time dependencies are pinned by hash and audited at update time.
- Bundled data is hashed; the application verifies SHA-256 of each manifest
  on first read.

### T5. Tampered data shards in transit or storage

A network attacker, a CDN compromise, or an accidental file replacement
could substitute an attacker-controlled data shard.

Mitigations:
- Each `manifest.json` records a SHA-256 of every shard.
- A startup integrity check compares the SHA-256 of the loaded manifest
  against a hash recorded in `app.js`.
- If a data file has been tampered with, the application refuses to use it
  and surfaces a clear error.
- HSTS, HTTPS-only, and same-origin policy reduce the in-transit risk.

### T6. Stale data presented as authoritative

Healthcare data changes (annual ICD updates, quarterly NCCI, weekly NADAC,
daily NDC). Stale data presented without dates would mislead.

Mitigations:
- Visible data version stamps on each utility and in the footer.
- An automated weekly data refresh CI job opens a PR with updated data.
- The Limitations section of the README documents typical update cadence
  per dataset.

### T7. Misuse of clinical calculators as decision tools

A user might rely on a calculator to make a clinical decision the
calculator was not designed to make.

Mitigations:
- Per-utility inline notices: "This is a math aid for verification.
  Institutional protocols and clinician judgment govern any clinical
  decision."
- Universal footer disclaimer on every utility view.
- No utility produces a recommendation; only a computed value or a
  referenced fact.

### T8. Clickjacking and embedding

A hostile site could iframe the application to trick users into actions.

Mitigations:
- `frame-ancestors 'none'` in the CSP.
- `X-Frame-Options: DENY` header.

### T9. MIME confusion and content sniffing

A maliciously named file could be interpreted as a script.

Mitigations:
- `X-Content-Type-Options: nosniff` header.
- All shipped files have correct MIME types from the static host.

### T10. Cross-origin reads of sensitive page state

Another origin could try to read window state if the page allowed it.

Mitigations:
- `Cross-Origin-Opener-Policy: same-origin`.
- `Cross-Origin-Embedder-Policy: require-corp`.
- `Cross-Origin-Resource-Policy: same-origin`.
- `Referrer-Policy: no-referrer`.

### T10. Unwanted device permissions

A misbehaving script could prompt for camera, microphone, or geolocation.

Mitigations:
- `Permissions-Policy` disables camera, microphone, geolocation, payment,
  USB, and accelerometer.

### T11. Persistent client storage of user data

A future code change might inadvertently store user input in
`localStorage`, `sessionStorage`, `IndexedDB`, or cookies.

Mitigations:
- The application uses none of these by policy.
- A CI grep check rejects new occurrences.
- The service worker cache stores only the application's own static files,
  not user input.

### T12. URL-hash state used as a covert exfiltration channel (spec-v2)

The spec-v2 layer encodes calculator inputs and pinned-tile lists in
the URL fragment (`#bmi&q=w=70;h=1.75`, `#&p=icd10,bmi`). A user
could share a URL containing clinical inputs without realizing the
recipient sees those values.

Mitigations:
- Stateful fragment content never leaves the browser. Reports send only the
  canonical `/#tool-id`; CSP `connect-src 'self'` prevents off-origin
  transmission.
- The Stability Commitments doc and the per-utility view make
  explicit that nothing the user types is sent anywhere; what they
  bookmark is what they share.
- No inputs are populated from the hash for routes the user did not
  intentionally open.

### T13. Clipboard misuse (spec-v2)

The Copy buttons write computed results to the system clipboard via
the Clipboard API.

Mitigations:
- The clipboard payload is only what was visible in the result
  region; no hidden payload is appended.
- Format is plain text only; no HTML, no markdown.
- Browser clipboard prompts are surfaced by the browser itself; the
  site cannot bypass them.

### T14. Field-medicine reference misuse (spec-v3)

A field medic, paramedic, or fire-medical responder might rely on a
Group I utility to make a treatment decision the calculator was not
designed to make.

Mitigations:
- Every Group I clinical utility renders the spec-v3 6.5 expanded
  notice: "This is a math aid for verification. Local protocols,
  medical direction, and clinician judgment govern any clinical
  decision."
- AHA, CDC, and FDA materials carry explicit attribution and
  reference-only framing.
- The AHA non-derivation CI test fails the build on any reproduction
  of AHA algorithm flowchart language, narrowing the surface to
  numeric facts only.
- The Universal Disclaimer in the footer applies on every utility
  view.

## Out of Scope Threats

Physical attacks on the user's device, attacks on the user's browser
runtime itself, attacks on Cloudflare Workers infrastructure, and AMA
litigation are out of scope for this threat model. The CPT posture in
`legal.md` addresses the AMA content question as a legal matter rather than
as a technical control.

## v4 review (no new threat surface)

<!-- catalog-truth:historical -->
The spec-v4 expansion (utilities 82-197 across groups A-O) introduces no
new threat surface. Verification:

- **No new outbound network calls at runtime.** Every v4 tile loads its
  data via the existing same-origin `lib/data.js` against bundled JSON
  shards. CSP `connect-src 'self'` is unchanged.
- **No new storage.** The v4 tiles do not introduce localStorage,
  sessionStorage, cookies, or IndexedDB. The integration test suite
  asserts these remain empty.
- **No new banned APIs.** The v4 modules use `el()` from `lib/dom.js`.
  `innerHTML` / `outerHTML` / `insertAdjacentHTML` / `eval` /
  `Function` constructor remain banned by ESLint and the grep check.
- **No new licensed content bundled.** The CPT non-AMA test
  (`test/unit/cpt-no-ama.test.js`) and AHA non-flowchart test
  (`test/unit/aha-no-flowchart.test.js`) cover the existing constraints;
  the AHA test was extended in v4.1 to also scan
  `data/cpr-aha-numeric/cpr.json`. Both were deleted by the spec-v29
  prune along with the tiles that used them, while the data they guard
  stayed in the repo, and both are restored (spec-v995).
  `test/unit/restricted-source-attribution.test.js` covers the whole
  category rather than the two datasets those tests were written for:
  every dataset declaring `numeric-facts-with-attribution` must state
  what it does and does not reproduce, and a dataset cannot join that
  status without being added to the guard deliberately.
- **SBOM regenerates.** `sbom.json` and `sbom.md` are regenerated by
  `npm run sbom`, hashing every runtime asset and source module with
  SHA-256 plus a content-derived buildId. Since spec-v991 the build no
  longer restamps them on every run, so regenerating after a clean
  checkout and comparing hashes -- which is what the document tells you
  to do -- actually works.
