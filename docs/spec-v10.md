# spec-v10.md — sophiewell.com: clinical-first positioning, bounded dependency budget, v7 §4 wind-down

> Status: proposed (2026-05-17). This is a **positioning spec**, not a
> feature spec. It does not add tiles, change renderers, or move bytes.
> It fixes in writing what sophiewell.com is *for*, what it is *not*,
> what it will and will not depend on, and which previously-proposed
> work is formally dropped. Every prior spec (v4 through v9) remains in
> force; v10 narrows scope, it does not amend their hard rules.

## 1. The thesis

sophiewell.com is **the calculator a nurse pulls up at 2 a.m. on
shift**. It is MDCalc with no ads, no login, no upsell, no cookie
banner, no email capture, no "premium" tier, no app store, and no
network call after first paint. It will be free forever because it is
cheap forever: a single static page on a CDN, no servers, no per-user
state, no per-user cost.

The audience is **clinical and allied healthcare staff** — nurses,
clinicians, billers, coders, pharmacists, EMS / field-medicine
workers, and the healthcare educators who train them. Patients are a
welcome secondary audience for the simple decoder tiles that already
exist (bill, EOB, MSN, insurance card, ABN, COBRA timeline), but
patient artifact decoding is **not** the product. Patients who need a
conversational walk-through of a complex bill, a denial letter, or a
discharge packet are already well served by general-purpose AI
assistants; Sophie does not compete in that lane.

What Sophie offers the clinician that MDCalc and friends do not:

1. **No friction at 2 a.m.** No login wall, no cookie banner, no
   in-app upsell, no "create a free account to see this result."
2. **No data exfiltration.** The CSP forbids outbound network calls
   after first paint. Inputs never leave the tab. This matters for
   any tool a clinician might type a real patient value into, even
   though that value alone is not PHI.
3. **Inline citations and snapshot dates on every result.** The
   formula or table the result came from is visible without a click;
   the dataset stamp says when the bundled snapshot was taken.
4. **Offline-capable.** The service worker caches the page; the site
   keeps working when the hospital Wi-Fi does not.
5. **Stable over time** ([docs/stability.md](stability.md)). No
   experimentation framework, no A/B tests, no remote config. A
   calculator that returned 0.94 on Monday returns 0.94 on Friday.
6. **Deterministic.** No probabilistic model in the loop. Same input,
   same output, on every device, on every page load.

These are mundane properties, individually. Together they describe a
product that does not exist anywhere else in the clinical reference
market today.

## 2. What v10 commits

### 2.1 Audience, in priority order

1. **Bedside clinicians** — nurses, residents, attendings,
   respiratory therapists, pharmacists. The 2 a.m. user.
2. **Billers and coders** — ICD-10-CM, HCPCS, modifiers, place-of-
   service, CARC, RARC, MS-DRG, NUBC TOB / revenue codes, the
   CMS-1500 and UB-04 form-locator decoders.
3. **EMS and field-medicine workers** — offline triage, weight-based
   pediatric dosing, protocol-aligned reference.
4. **Healthcare educators and trainees** — board / licensing
   reference; the calculator catalog doubles as a teaching surface.
5. **Patients with the simple existing decoders** — bill, EOB, MSN,
   insurance card, ABN, COBRA, ACA SEP, Medicare enrollment, birthday
   rule, HIPAA right-of-access. These tiles stay because they already
   exist and they work. Sophie does **not** add new patient-artifact
   decoding past this surface.

If a proposal cannot name an audience in this list it does not ship.

### 2.2 Dependency budget

Sophie ships **zero runtime dependencies today**. v10 commits a
*budget*, not a license to spend it:

- **Up to two pinned, exact-version runtime dependencies** may be
  bundled if and only if each one unlocks a clinical use case that
  cannot be served without it and cannot be hand-rolled at small
  cost. "Nicer to have" does not qualify. "This use case is dead
  without it" does.
- Every runtime dependency must: pin an exact version (no `^`, no
  `~`); appear in [sbom.json](../sbom.json) and [sbom.md](../sbom.md)
  with a content hash; be reviewed against
  [docs/threat-model.md](threat-model.md) before merge; ship under a
  license compatible with the site's MIT license; and not introduce
  a new CSP `connect-src` entry.
- **devDependencies remain unbudgeted** (eslint, playwright today).
  Test and lint tooling does not count.
- Adding the first runtime dependency is a spec-amending event. The
  PR that introduces it must cite the clinical use case, name the
  alternatives considered, and update this section with the budget
  remaining.

### 2.3 What is permanently out of scope

The list below is **negative space** — feature areas that will not
ship on sophiewell.com regardless of future demand. Anything not on
this list may still be proposed in a future spec; anything on this
list requires v10 to be amended first.

- **AI of any kind.** No models, embeddings, inference, API keys,
  vector stores, fine-tunes, RAG, or "local small language models."
  Restates [spec-v7 §5.1](spec-v7.md), spec-v5 rule 3.
- **PDF parsing in the browser.** No pdf.js, no hand-rolled PDF
  reader. PDFs are the dominant patient artifact format, and
  patient-artifact decoding is not the product (§2.1).
- **DOCX parsing in the browser** (mammoth, etc.). Same reasoning.
- **Browser OCR** (Tesseract.js, ONNX vision models). Same.
- **Server-side processing of clinical or billing data.** No
  backends, no Workers that touch user input, no edge functions that
  see inputs. Cloudflare Pages serves static files only.
- **Accounts, login, sessions, OAuth.** Sophie has no concept of a
  user.
- **Email capture, newsletters, "get updates" forms.** Restates
  [docs/stability.md](stability.md).
- **Persistent client storage** (localStorage, sessionStorage,
  cookies, IndexedDB). Restates spec-v5 rule 9 / spec-v8 §2 rule 9.
- **Analytics, telemetry, error reporting, session replay, heatmaps,
  feature flagging services, remote config, experimentation
  frameworks.** Restates [docs/stability.md](stability.md).
- **Ads of any kind**, sponsored placements, affiliate links,
  partner badges, "powered by" pixels.
- **Subscriptions, paid tiers, "pro" features, donations UI.**
  Sophie is funded by domain renewal, not users. A donate link is
  not a paid tier but it also is not the product; this spec does
  not add one.
- **Native apps, app-store submissions, push notifications.** The
  site is a PWA; that is enough.
- **Multi-tool bundles, shareable session URLs beyond a single
  tile's hash state, "my saved calculators," recently-used lists.**
  Restates [spec-v8 §3.2](spec-v8.md).
- **Recommendation strips** ("after this you might want…"),
  cross-sell between tiles. Restates spec-v8 §3.2.
- **Patient artifact decoders past what already ships.** No new
  bill-PDF parser, no lab-PDF parser, no denial-letter NLP, no
  pharmacy printout OCR, no discharge-packet extraction, no
  insurance-card image OCR. See §3 for the formal v7 §4 wind-down.

### 2.4 Tile-add criteria

A new tile is in scope when **all** of these hold:

1. It serves an audience in §2.1.
2. Its underlying source is a public, stable dataset or a published
   formula with a citable reference.
3. It can be expressed as a pure function of its inputs without a
   model, an external call, or persistent state.
4. It can be tested with a deterministic example
   ([spec-v8 §3.3](spec-v8.md)) and cited with a primary reference
   ([spec-v8 §3.4](spec-v8.md), enforced in hard mode by
   [spec-v9](spec-v9.md)).
5. Its data shard fits the existing
   [lib/data.js](../lib/data.js) loader and the
   [docs/operations.md](operations.md) data-refresh cadence.

Tiles that fail any of these criteria are dropped. There is no
"experimental" tray.

## 3. v7 §4 wind-down

[spec-v7](spec-v7.md) §4 proposed six artifact-decoder pages (bill /
EOB / MSN → annotated DOCX, lab PDF → DOCX, denial → appeal packet,
pharmacy printout → interactions, discharge paperwork → summary,
insurance card → benefits cheat sheet). All six are formally **dropped
in v10** for the following reasons:

1. **Architecture incompatibility.** Five of the six require PDF
   parsing; the insurance-card flow also requires browser OCR. All
   four candidate libraries (pdf.js, mammoth, docx, Tesseract.js)
   exceed the dependency budget in §2.2 individually, let alone
   together. A hand-rolled PDF parser is not credible solo-dev work.
2. **Audience mismatch.** v7 §4 targets patients holding artifacts.
   §2.1 puts patient-artifact decoding outside Sophie's wedge:
   general-purpose AI assistants already serve patients on this task
   and serve them well enough that Sophie cannot meaningfully
   improve on the patient experience without violating its own
   architecture rules.
3. **Maintenance load.** Six PDF / DOCX / OCR pipelines, each with
   a fixture corpus that needs to keep up with format drift, is a
   solo-developer death march. The site's existing 178 tiles are
   small, citable, and stable — that profile is what makes the
   project survivable.
4. **What v7 §4 was actually solving** — *"the patient does not
   know Sophie's vocabulary"* — is already addressed by the v7 §3.2
   synonym-routed prompt, the v8 §4.3 three-pass matcher, and the
   existing simple patient decoders (§2.1 item 5). v7 §4 was the
   ambitious extension; the foundation is enough.

### 3.1 What stays from v7

- §3.1 dropzone shell, §3.2 synonym-routed prompt, §3.3 artifact-
  detect classifier, §3.4 collapsed tile-grid disclosure — **all
  retained** (shipped 2026-05-14 through 2026-05-17, see
  [spec-v7](spec-v7.md) status header).
- The text-paste handoff in [lib/artifact-handoff.js](../lib/artifact-handoff.js)
  → existing decoder tiles — **retained** as the final artifact-
  ingestion surface. Plain text in, existing tile out. No DOCX
  output.

### 3.2 What is removed or rewritten

No code is removed by this spec. The dropzone shell already operates
in the text-only mode v10 commits to. The follow-on work that v10
cancels is **doc-only**: the v7 §4 narrative no longer represents the
roadmap. [spec-v7](spec-v7.md) gets a status note pointing here.

### 3.3 What if the audience asks for it anyway

If clinicians (not patients) repeatedly ask for a specific PDF/DOCX
input flow on a *clinical* tile — for example, a nurse pasting a lab
panel from an EHR export and wanting structured parsing — that
specific request is re-evaluated against §2.2 and §2.4 on its own
merits. v10 does not pre-approve it; it only closes the patient-
artifact branch.

## 4. The MDCalc comparison, made explicit

MDCalc is the closest reference product. v10 commits Sophie to the
properties below, each of which is something MDCalc either does not
do or does worse:

| Property                         | Sophie                  | MDCalc                                |
|----------------------------------|-------------------------|---------------------------------------|
| Account required                 | No                      | Yes for some content                  |
| Ads or sponsored content         | No                      | Yes                                   |
| Cookie banner                    | No                      | Yes                                   |
| Email capture                    | No                      | Yes (newsletter, account)             |
| Native app push                  | No                      | Yes                                   |
| Outbound network after paint     | No                      | Yes (analytics, content updates)      |
| Works offline after first visit  | Yes (service worker)    | Partial                               |
| Inline citation visible by default | Yes (every tile)      | Yes (varies by tool)                  |
| Dataset snapshot stamp           | Yes (lookup tiles)      | No                                    |
| Source open                      | Yes (MIT, public repo)  | No                                    |
| Determinism guarantee in writing | Yes (spec + tests)      | Implicit                              |
| A/B testing                      | No (forbidden)          | Likely (standard for commercial sites)|

Sophie is not trying to be a *better-funded* MDCalc. It is trying to
be the version of MDCalc that does not depend on funding at all.
That is the whole strategic position: a product that survives because
it cannot be killed by losing a funding round.

## 5. What v10 does *not* change

- Every hard rule in spec-v4, spec-v5, spec-v6, spec-v7, spec-v8,
  and spec-v9 remains in force.
- The existing 178 tiles continue to ship. None are removed by v10.
- The dropzone shell, prompt matcher, audience chips, collapsed
  grid, and four-region tile contract are unchanged.
- The data-refresh cadence in [docs/operations.md](operations.md)
  is unchanged.
- The CSP, SBOM, accessibility, and threat-model commitments are
  unchanged.

## 6. Acceptance criteria

v10 is shippable as a doc release when:

- This file exists and is linked from [docs/spec-v7.md](spec-v7.md)
  and the README's documentation index.
- [docs/stability.md](stability.md) carries a "Client-side
  processing of clinical and billing data" commitment and a
  "Bounded runtime-dependency budget" commitment.
- [docs/spec-v7.md](spec-v7.md) carries a status note recording that
  §4.1–§4.6 are dropped per spec-v10 §3.
- [README.md](../README.md) leads with the clinical-staff audience.
- [CHANGELOG.md](../CHANGELOG.md) `[Unreleased]` carries a spec-v10
  entry.
- `npm run lint`, `npm run test`, and `npm run build` all pass.

No code changes are required for v10. The first code change that
follows v10 is the next clinical tile or the next CI guard, whichever
comes first.

## 6a. Companion specs and scope document

- [spec-v11](spec-v11.md) is the correctness floor v10 implies but
  does not specify: a per-tile audit protocol, the rename of the
  internal group letters to specialty-named labels, and an
  optional source-quoted `interpretation` field.
- [docs/scope-mdcalc-parity.md](scope-mdcalc-parity.md) is the
  long-horizon scope statement: Sophie intends to eventually
  carry every actionable clinical calculator a healthcare worker
  would otherwise reach for MDCalc to find, shipped slowly at the
  v11 quality bar. v10 sets *what* Sophie is; the scope document
  sets *where Sophie is going*; v11 sets *how good Sophie must be*
  along the way.

## 7. Open questions

1. **Donate / "support the domain renewal" link.** v10 does not add
   one. Future spec may, if and only if it does not become a UI
   surface (no badge in the header, no modal, no nag). Deferred.
2. **Optional offline install banner.** The PWA is installable today
   without a prompt. A one-time install hint is consistent with §1
   property 4 but is also a UI surface; deferred.
3. **Tile-level "report a bug" link.** A `mailto:` link is not
   telemetry and not email capture (the user types the address into
   their own mail client). Worth considering in a future spec for
   clinician-reported corrections. Deferred.

These are the only open questions v10 leaves; everything else in §2
is intended to be closed.
