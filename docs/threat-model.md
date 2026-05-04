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
- The Content Security Policy disallows inline script (`script-src 'self'`).
- The CSP disallows `eval` and the `Function` constructor by virtue of
  omitting `unsafe-eval`.

### T2. Network exfiltration of pasted user data

A user pastes a bill or an EOB. If the page could make outbound network
requests, an attacker who slipped script into the page (see T1) or a
maliciously crafted dependency could exfiltrate that text.

Mitigations:
- The CSP `connect-src 'self'` directive blocks outbound connections to any
  origin other than the page's own.
- The application makes no outbound network requests at runtime by design.
- Verified by attempting a `fetch` to a third-party URL from the console;
  the request must be blocked.

### T3. Supply-chain compromise via runtime dependencies

Compromised npm packages could ship malicious code into the bundle.

Mitigations:
- Zero runtime dependencies. The shipped application uses no JavaScript
  frameworks, no CSS frameworks, and no npm packages at runtime.
- Build-time dependencies are pinned by hash and audited at update time.
- Bundled data is hashed; the application verifies SHA-256 of each manifest
  on first read.

### T4. Tampered data shards in transit or storage

A network attacker, a CDN compromise, or an accidental file replacement
could substitute an attacker-controlled data shard.

Mitigations:
- Each `manifest.json` records a SHA-256 of every shard.
- A startup integrity check compares the SHA-256 of the loaded manifest
  against a hash recorded in `app.js`.
- If a data file has been tampered with, the application refuses to use it
  and surfaces a clear error.
- HSTS, HTTPS-only, and same-origin policy reduce the in-transit risk.

### T5. Stale data presented as authoritative

Healthcare data changes (annual ICD updates, quarterly NCCI, weekly NADAC,
daily NDC). Stale data presented without dates would mislead.

Mitigations:
- Visible data version stamps on each utility and in the footer.
- An automated weekly data refresh CI job opens a PR with updated data.
- The Limitations section of the README documents typical update cadence
  per dataset.

### T6. Misuse of clinical calculators as decision tools

A user might rely on a calculator to make a clinical decision the
calculator was not designed to make.

Mitigations:
- Per-utility inline notices: "This is a math aid for verification.
  Institutional protocols and clinician judgment govern any clinical
  decision."
- Universal footer disclaimer on every utility view.
- No utility produces a recommendation; only a computed value or a
  referenced fact.

### T7. Clickjacking and embedding

A hostile site could iframe the application to trick users into actions.

Mitigations:
- `frame-ancestors 'none'` in the CSP.
- `X-Frame-Options: DENY` header.

### T8. MIME confusion and content sniffing

A maliciously named file could be interpreted as a script.

Mitigations:
- `X-Content-Type-Options: nosniff` header.
- All shipped files have correct MIME types from the static host.

### T9. Cross-origin reads of sensitive page state

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
- The fragment never leaves the browser. CSP `connect-src 'self'`
  prevents any outbound transmission.
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
runtime itself, attacks on Cloudflare Pages infrastructure, and AMA
litigation are out of scope for this threat model. The CPT posture in
`legal.md` addresses the AMA content question as a legal matter rather than
as a technical control.
