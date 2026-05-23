# spec-v50.md — Public-infrastructure commitments: codified non-degradation guarantees

> Status: proposed (2026-05-22). v50 is a governance and CI
> spec. It codifies the promises Sophie makes to its users —
> no ads, no login, no telemetry, no third-party fetch, no AI,
> no cookies, no paid tier, MIT-licensed forever — as
> **automated invariants** enforced on every commit. It also
> ships a public `/commitments` page that lists each guarantee
> in plain English alongside the automated check that enforces
> it.
>
> v50 adds **zero clinical tiles**. The `/commitments` page is
> not a tile (it does not consume a clinical input or compute a
> clinical output); it is a built static page like the audience
> hubs, governed by the build script. The scope test
> ([spec-v29](spec-v29.md) §3) is unaffected.
>
> Catalog effect at v50 close: **catalog count unchanged.**
>
> Every prior spec (v4 through v49) remains in force.

## 1. Why v50 exists

Sophie's positioning is *public infrastructure*. The
maintainer's framing on 2026-05-22 was explicit: this is the
OpenStreetMap of bedside math, not a product. That framing
imposes a duty the project has not yet discharged. Today the
guarantees that distinguish Sophie from MDCalc — no ads, no
login, no telemetry, no AI, no third-party fetch — live in
README prose, the CSP header in `_headers`, and the maintainer's
discipline at commit time. None of them are *invariants*.

A future maintainer, a future me, an acquisition (this is MIT;
forks are legal and expected), or an honest-mistake PR could in
a single commit:

- Add a `<script src="https://googletagmanager.com/...">` for
  "just basic analytics."
- Add an `import { OpenAI } from 'openai'` for "just a smart
  search box."
- Add a `fetch('https://api.example.com/lookup')` for "just live
  drug pricing."
- Add a `localStorage.setItem('userId', uuid())` for "just to
  remember preferences."

Each of those would silently turn Sophie into something other
than what its users were promised. The only thing standing in
the way today is code review. v50 makes the guarantees
testable, enforced on every commit, and *visible to the public*
as a list on a `/commitments` page.

The thesis: Sophie's clinical-citation discipline is rigorous
because it is enforced
([spec-v11](spec-v11.md) audits, [spec-v12](spec-v12.md)
integrity manifests, [spec-v46](spec-v46.md) catalog-truth
guards). Sophie's *posture* deserves the same rigor.

## 2. Non-goals

- **No retroactive change to existing tiles.** v50 enforces
  guarantees already in force; it does not introduce new
  restrictions on clinical content.
- **No new dependencies.** Every check is implemented in
  vanilla Node + the existing build pipeline.
- **No "trust score" or "transparency badge" theatre.** v50
  ships a single `/commitments` page with concrete machine-
  enforced rules. No marketing surface.
- **No CLA or contributor-license drama.** MIT in, MIT out;
  v50 codifies that the license cannot be changed without
  unanimous maintainer review (a process rule, not a code
  rule).
- **No content-moderation or "what tiles are allowed" policy.**
  That is the scope of [spec-v29](spec-v29.md). v50 governs
  *infrastructure posture*, not catalog content.

## 3. The eight commitments

Each commitment has (a) plain-English text on
`/commitments`, (b) an automated check that fails CI on
violation, and (c) a paragraph below in this spec that defines
the check.

### 3.1 No outbound network calls

**Public text:** "Sophie does not call any server, ever. Every
calculation runs in your browser. Closing the page or going
offline does not change what Sophie can do."

**Enforcement:**

1. The `_headers` file pins `Content-Security-Policy:
   connect-src 'self'` (already true; v50 asserts it).
2. A new integration test in `test/integration/no-network.test.js`
   boots a headless Playwright page with the production CSP,
   exercises every tile (one input per tile is enough to fire
   the compute path), and asserts that the browser made
   **zero** requests to any origin other than the page origin.
3. The build (`scripts/build.mjs`) parses `_headers` and fails
   if `connect-src` is anything other than `'self'`.

### 3.2 No third-party scripts

**Public text:** "Sophie loads no code from anyone else's
servers. All JavaScript is part of the page you downloaded."

**Enforcement:**

1. CSP `script-src 'self'` pinned in `_headers`.
2. A build-time scan of every emitted HTML asserts that every
   `<script>` tag is either inline (no `src`) or has `src`
   starting with `/` or `./`. Any other form fails the build.

### 3.3 No cookies

**Public text:** "Sophie sets no cookies, ever. There is no
cookie banner because there is nothing to consent to."

**Enforcement:**

1. The integration test in §3.1 also asserts that after every
   tile interaction `document.cookie === ''`.
2. A grep-check rule denies the substrings
   `document.cookie =`, `Set-Cookie`, and `cookie:` (case-
   insensitive) in source files outside test files that test
   *this commitment*.

### 3.4 No persistent storage outside an allowlist

**Public text:** "Sophie remembers your theme and your offline
cache, and nothing else. No identifiers, no usage data, no
'recently used' list, no preferences sync."

**Enforcement:**

1. The allowlist lives in `scripts/storage-allowlist.json` and
   today contains:
   - `sophiewell-theme` (light/dark/system)
   - `sophiewell-sw-version` (service-worker cache invalidation)
   - The service-worker's cache namespace itself (`sophiewell-cache-vN`)
2. A source-scan check in `scripts/check-commitments.mjs`
   greps every source file for `localStorage.setItem(` and
   `sessionStorage.setItem(` and asserts that every key
   argument is a string literal present in the allowlist.
3. The integration test asserts the same at runtime by
   snapshotting `localStorage` and `sessionStorage` keys after
   every tile interaction.

### 3.5 No analytics, telemetry, or beaconing

**Public text:** "Sophie does not measure you. No analytics, no
session recording, no error reporting to anyone else's server,
no 'anonymous usage data.'"

**Enforcement:**

1. A grep-check rule denies, in any file emitted to `dist/` or
   present in `lib/` and `scripts/`, the substring set:
   `googletagmanager`, `google-analytics`, `analytics.google`,
   `segment.com`, `segment.io`, `mixpanel`, `posthog`,
   `amplitude`, `plausible`, `fathom`, `simpleanalytics`,
   `heap.io`, `hotjar`, `fullstory`, `sentry.io`, `bugsnag`,
   `datadog-rum`, `newrelic`, `logrocket`, `rollbar`.
2. The integration test in §3.1 also asserts no `sendBeacon`,
   no `navigator.sendBeacon`, no `Image()`-pixel pattern fires.
3. The CSP `connect-src 'self'` from §3.1 already blocks the
   network half; this rule catches the *intent* before it
   reaches CSP.

### 3.6 No AI / LLM dependencies

**Public text:** "Sophie has no AI. Every number Sophie shows
you is the output of a deterministic formula with a
peer-reviewed citation. There is no model, no embedding, no
'AI-assisted' anything."

**Enforcement:**

1. A grep-check rule denies, in any file in the repository
   outside `docs/`, the substring set: `openai`, `anthropic`
   (case-insensitive; the project name is a substring but the
   rule is scoped to `import`/`require` and string-literal
   contexts), `langchain`, `huggingface`, `transformers.js`,
   `tensorflow`, `onnxruntime`, `gemini-api`, `bedrock-runtime`,
   `azure-cognitive`, `cohere`.
2. The package.json check asserts `dependencies` and
   `devDependencies` do not contain any package whose name
   starts with `@openai/`, `openai`, `@anthropic-ai/`,
   `@huggingface/`, `langchain`, `@google-ai/`.
3. The `/commitments` page text is explicit that this rule is
   intentional and not a hedge: "Sophie will never add AI; if
   it does, it is a fork, not Sophie."

### 3.7 No login, account, or paid tier

**Public text:** "Sophie has no login, no account, and no paid
features. The site has one tier. It is free. It will stay
free."

**Enforcement:**

1. A grep-check rule denies the substring set: `oauth`,
   `signin`, `signup`, `auth0`, `clerk.dev`, `@clerk`,
   `supabase-auth`, `firebase/auth`, `okta`, `stripe`,
   `subscription`, `premium`, `pro-tier`, `upgrade-to-pro`,
   `paywall`, `lemonsqueezy`, `paddle.com`.
2. The package.json check asserts the same against the
   dependency tree.

### 3.8 MIT-licensed forever; SBOM published every build

**Public text:** "Sophie is MIT-licensed. The license never
changes. Every build publishes a Software Bill of Materials
listing every runtime file, every source file, and every
development dependency."

**Enforcement:**

1. A test asserts `package.json` `license` field equals `"MIT"`
   and `LICENSE` first line begins with `MIT License`.
2. The existing `scripts/build-sbom.mjs` runs on every build
   ([spec-v12](spec-v12.md)); v50 asserts it remains wired into
   `npm run build`.
3. A future spec that proposes a license change must amend this
   spec by name; the maintainer process is documented in
   `CONTRIBUTING.md`.

## 4. The `/commitments` page

Built by a new script `scripts/build-commitments-page.mjs`
(wired into `scripts/build.mjs`). The page:

- Lives at `/commitments/` in `dist/`.
- Lists each commitment from §3 with its public text and a
  one-line description of the automated check.
- Links to the relevant check script in the repository.
- Is reachable from the footer of every page (one new link).
- Carries no separate JavaScript; pure HTML + the site stylesheet.
- Carries no clinical content (it is not a tile and is exempt
  from the catalog-truth check in [spec-v46](spec-v46.md)).

## 5. `CONTRIBUTING.md`

A new file `CONTRIBUTING.md` at the repo root documenting:

- How to add a new tile (link to the wave-spec template).
- How to add a new commitment (the §3 structure; both prose
  and check must land in the same PR).
- How to propose a change to an existing commitment (requires
  amendment of v50 by name; maintainer process).
- How to file a defect against a commitment (e.g., "I found a
  way to bypass the no-network check").
- The bus-factor expectation: Sophie aims for ≥ 3 maintainers
  with merge rights; v50 does not enforce that but documents
  it as a goal.

## 6. Files touched (Wave 50-1)

```
docs/spec-v50.md                          (this file)
scripts/check-commitments.mjs             (new: enforces §3.4, §3.5, §3.6, §3.7, §3.8)
scripts/grep-check.mjs                    (+ rules for §3.3, §3.5, §3.6, §3.7)
scripts/build-commitments-page.mjs        (new: emits /commitments/)
scripts/build.mjs                         (+ wires commitments page; asserts _headers shape)
scripts/storage-allowlist.json            (new)
test/integration/no-network.test.js       (new: Playwright headless test)
_headers                                  (assert CSP shape; no change expected)
package.json                              (+ commitments check in lint pipeline)
CONTRIBUTING.md                           (new)
README.md                                 (+ link to /commitments)
CHANGELOG.md                              (Unreleased: v50 entry)
docs/scope-mdcalc-parity.md               (note: posture invariants now codified)
LICENSE                                   (no change; asserted by test)
index.html                                (+ footer link to /commitments)
```

## 7. Acceptance criteria

v50 is fully shipped when:

- This file exists.
- Every check in §3 is implemented, wired into `npm run lint`
  or `npm run test`, and green on the current main.
- The `/commitments/` page exists in `dist/` after
  `npm run build`, is reachable from the footer, and lists all
  eight commitments.
- `CONTRIBUTING.md` exists.
- A deliberate violation of each commitment (e.g., adding
  `localStorage.setItem('unauthorized-key', 'x')` to any source
  file) fails CI locally. (Tested by the maintainer; not part
  of the committed test suite.)
- `npm run lint`, `npm run test`, `npm run sbom`, and
  `npm run build` are all green.
- The CHANGELOG records v50 with the eight commitments
  enumerated.

## 8. Out of scope for v50

- **Commitments that are not yet enforceable.** A future
  commitment might be "Sophie's data manifests are reproducibly
  built from public sources" — true today, but the *automated
  check* for it is a separate spec.
- **Adversarial security review.** v50 enforces the *intent* of
  the commitments via deny-list and CSP checks. A determined
  contributor could find a substring not in the deny list. The
  defense is code review + maintainer process, not regex
  perfection.
- **Audit by an external body.** Sophie is small; external
  audit costs money. The maintainer may pursue this later; v50
  does not require it.
- **Hosting / DNS commitments.** Sophie's static-page posture is
  hostable anywhere; the commitments page does not promise a
  specific host. A future spec may commit to "always available
  at sophiewell.com" or to a mirror policy.
- **Reproducibility of clinical computations across browsers.**
  Implicit in the deterministic-math design and verified by the
  test suite; not a new v50 commitment.
- **Anything about AI tools used during *development*.** v50
  governs what ships, not what the maintainer types at. Claude
  Code, Copilot, ChatGPT, etc. may be used to write Sophie's
  code; the resulting artifact must satisfy the v50 checks like
  any other artifact.
