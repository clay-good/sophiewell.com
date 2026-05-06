# sophiewell.com

Deterministic healthcare utilities, free forever, no servers, no accounts.

sophiewell.com is a single-page static website that helps people read their
medical bills and helps clinical, billing, and field-medicine staff get fast
deterministic answers to the everyday calculations and lookups their work
requires. Everything runs in the browser. There is no AI of any kind. The
data sources are public, bundled with the page, and refreshed on a schedule.
The site costs nothing to operate beyond the domain renewal, so it can be
free forever. It serves five overlapping audiences: patients trying to
understand a bill, an EOB, or an insurance card; billers and coders looking
up codes, modifiers, and edits; nurses and clinicians who need quick unit
conversions, dose math, and clinical scoring; healthcare educators who need
fast reference for licensing or board exams; and field-medicine workers
(EMS, prehospital, disaster response) who need offline-capable triage,
weight-based dosing, and protocol-aligned reference at the point of care.

## The problem

Medical bills, insurance cards, billing codes, and clinical math live in a
private vocabulary scattered across CMS spreadsheets, FDA databases, and
clinical literature. Ordinary access to that vocabulary is poor for patients
trying to read their own bills and inefficient for the clinicians, nurses,
billers, coders, and field-medicine workers who depend on it daily. The
information already exists in public files, but no one has put it in front
of the people who need it, in plain language, in one place.

The meta-problem is that existing consumer healthcare tools and clinical
reference apps either cost money, harvest data, or both. The workers and
patients who would benefit most from fast, free reference are the ones
least likely to have a paid app handy at the moment they need it.

## The solution

Take the public datasets and the published clinical formulas, ship them to
the browser, do the lookups and math locally, and never phone home. A
single static page, a Content Security Policy that forbids outbound network
connections, and a service worker that caches the page for offline use.

## Quick start

Visit https://sophiewell.com. Save the page for offline use if desired. To
run locally, clone the repository and run `npm run dev`, which starts a
zero-dependency static server on http://localhost:4173 that applies the
production security headers. Any static file server will also work.

## How it works and how to use it

The site is organized into fifteen categories containing 195 utilities. **Code
lookups** cover ICD-10-CM, HCPCS, NDC, CPT structural data, ICD-10-PCS,
RxNorm, MS-DRG, APC, NUBC TOB / revenue / condition / occurrence / value
codes, HCPCS modifiers, NCCI PTP, MUE, POS, and the related billing code
sets. **Pricing** covers the Medicare Physician Fee Schedule, NADAC, ASP,
CLFS, ASC, DMEPOS, wage index, GPCI, hospital price transparency, the
out-of-pocket cost estimator, FPL, ACA marketplace thresholds, HSA / FSA /
HDHP limits, IRMAA, Medicare deductibles, and IRS medical mileage.
**Patient tools** include a bill decoder, an EOB decoder, an MSN decoder,
an insurance card decoder, a No Surprises Act / IDR eligibility checker,
ABN explainer, appeal-letter and HIPAA right-of-access generators, the
birthday rule, COBRA timeline, Medicare enrollment period checker, and ACA
SEP eligibility. **Provider lookup** covers the NPI registry, OIG
exclusions, Medicare opt-out lists, the DEA registration validator, and
the NUCC provider taxonomy. **Clinical math** covers BMI, BSA suite, MAP
/ pulse pressure / shock index, anion gap and delta-delta, corrected Ca /
Na, osmolal gap, A-a gradient and P/F suite, Winter's formula, eGFR suite
(CKD-EPI 2021 / MDRD / Cockcroft-Gault), FENa / FEUrea, maintenance fluids
4-2-1, QTc suite, pregnancy dating, pack-years, and unit conversions.
**Medication and infusion** covers drip rate, weight-based dose,
concentration-to-rate, pediatric dose bounds, insulin drip, anticoagulant
reversal, high-alert reference, opioid MME, steroid / benzodiazepine
equivalence, antibiotic renal dose adjustment, vasopressor dose↔rate, TPN
macronutrient, and IV-to-PO conversion. **Scoring** covers GCS, APGAR,
NIHSS, Wells PE / DVT, CHA2DS2-VASc, HAS-BLED, ASA, Mallampati, Beers,
TIMI, GRACE, HEART, PERC, Geneva, CURB-65, PSI, qSOFA / SOFA, MELD-3.0 /
Child-Pugh, Ranson / BISAP, Centor / McIsaac, Caprini, Bishop, Alvarado /
PAS, mRS reference, PHQ-9, GAD-7, AUDIT-C, CAGE, EPDS, Mini-Cog, CIWA-Ar,
COWS, ASCVD PCE, and PREVENT 2023. **Workflow** adds the existing
appointment prep and prior-auth generators plus HIPAA authorization, ROI,
discharge instructions, specialty-visit questions, and a medication
wallet card. **Field Medicine** adds NEXUS / Canadian C-Spine,
DOT ERG hazmat lookup, NIOSH Pocket Guide, AHA CPR numeric reference,
TCCC tourniquet / wound packing, and CO / cyanide antidote dosing
alongside pediatric weight-to-dose, cardiac arrest references,
defibrillation energy, stroke scales, CDC Field Triage, START / JumpSTART,
burn surface area and fluid resuscitation, pediatric ETT sizing,
hypothermia / heat-illness staging, toxidromes, naloxone dosing, and the
EMS documentation helper. **Public Health & Travel** covers
ACIP routine adult / child / catch-up schedules, the CDC Yellow Book by
country, and decision trees for tetanus prophylaxis, rabies PEP,
bloodborne pathogen exposure, TB testing interpretation, and STI screening
intervals. **Lab Reference** bundles adult and pediatric
reference ranges, therapeutic drug levels, and toxicology levels. **Forms
& Numbers Literacy** decodes CMS-1500 and UB-04 field-by-field plus an
EOB jargon glossary. **Eligibility & Benefits** covers Medicaid by state,
VA priority groups, a TRICARE plan picker, and IHS eligibility.
**Literacy Helpers** offers a universal unit converter (lab + vitals +
basics), a time-to-dose helper, and a pediatric weight converter.
**Patient Safety** ships the ISMP-attributed high-alert wallet card, the
FDA drug recalls weekly snapshot, and a vaccine lot recall lookup.

The user flow is simple: pick a tile from the home grid, enter input, read
output. Every utility shows the data sources or formula citations at the
bottom of its view, with a "Test with example" button that reproduces the
worked example from the citation. Calculator state is encoded in the URL
hash so any view can be bookmarked or shared as a permalink.

All computation happens in the browser. For the full picture, see
[docs/architecture.md](docs/architecture.md).

## System design and architecture overview

The application is one HTML file, one CSS file, one JavaScript module set,
a service worker, and a data folder of sharded JSON. There is no backend.
The browser receives static files from the same origin and runs everything
locally. Data shards are loaded only when a utility that needs them is
opened. Utilities that operate over large datasets (Medical Bill Decoder,
Hospital Price Transparency Lookup) run inside a Web Worker to keep the
main thread responsive. The service worker pre-caches the application
shell on first load and caches data shards on first access, keyed to the
build hash so new deployments invalidate old caches cleanly. The
application has zero runtime dependencies. A weekly CI job runs the data
refresh pipeline and opens a pull request with any updated data. For the
long version, see [docs/architecture.md](docs/architecture.md).

## Deterministic logic versus LLM usage

The product uses zero LLM inference and zero AI of any kind. All operations
are deterministic functions over public datasets and published formulas.
There is no model in the loop, no embedding, no inference call, no API
key. If a future sibling project explores AI-driven workflows, it will be
a separate, clearly labeled product. sophiewell.com itself never calls a
language model.

## Stability commitments

The site is stable and predictable by design. These commitments are hard
rules, not soft preferences.

- **No A/B testing, ever.** Every user sees the same version of every
  utility. A clinician who used a calculator on Monday and got one result,
  then got a slightly different result on Tuesday because they were in a
  treatment group, would correctly stop trusting the site.
- **No feature flags visible to users.** No "experimental" toggle, no
  "beta" feature. If something is on the site, it is for everyone.
- **No tracking.** No analytics script, no tracking pixel, no heatmap, no
  session replay, no error reporter, no third-party telemetry. The CSP
  enforces this with `connect-src 'self'`. The site never logs user-agent
  strings or IP addresses.
- **No notifications, no email capture.** The site never asks for an
  email address, never displays a notification permission request, never
  shows a "Sign up for updates" form. There is no newsletter and no
  account system, because there are no accounts.
- **Versioned releases.** Every release is tagged with a semantic version
  and described in [CHANGELOG.md](CHANGELOG.md), linked from the footer.

## CLI reference

| Command                  | Description                                                       |
|--------------------------|-------------------------------------------------------------------|
| `npm run dev`            | Serve the directory locally on http://localhost:4173              |
| `npm run build`          | Copy static files into `dist/` for deployment                     |
| `npm test`               | Run the full test suite (unit, a11y, grep, data integrity)        |
| `npm run test:unit`      | Run Node's built-in unit tests (191 tests)                        |
| `npm run test:e2e`       | Run Playwright integration tests against a real browser           |
| `npm run test:a11y`      | Run accessibility checks on every utility view                    |
| `npm run lint`           | Run ESLint with the project rules (bans innerHTML, eval, others)  |
| `npm run data:refresh`   | Re-fetch and re-shard every public dataset                        |
| `npm run data:verify`    | Verify shard SHA-256 hashes against the manifests                 |
| `npm run sbom`           | Regenerate the CycloneDX SBOM (`sbom.json`, `sbom.md`)            |
| `npm run release:check`  | One-shot pre-release gate: lint + test + sbom + build             |
| `npm run clean`          | Remove `dist/` and other build artifacts                          |

## Safety guarantees

- The application makes no outbound network requests at runtime.
- The application does not store user input anywhere.
- The application is read-only with respect to all bundled data.
- The application does not write to any storage location other than the
  service worker's own cache of its own static files.
- Pasted bill, EOB, and clinical input is processed in memory and
  discarded when the page is closed.
- There is no `localStorage`, no `sessionStorage`, no cookies, and no
  IndexedDB. All four are verified empty by the integration test suite.
- `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, and the
  `Function` constructor are banned by the ESLint config and a grep
  check; the `el()` DOM helper throws on any attempt to set raw HTML.
- A CycloneDX SBOM (`sbom.json`, `sbom.md`) is regenerated on every
  build and ships with the site, hashing every runtime asset and source
  module with SHA-256 plus a per-build buildId.

## Limitations

- CPT descriptors are owned by the American Medical Association and are
  not bundled. The CPT Code Reference utility shows the structural
  Medicare data plus an original plain-English category summary, with a
  link to the AMA's free public CPT lookup tool. See
  [docs/legal.md](docs/legal.md).
- The original plain-English category summaries are written by the
  project author without reference to AMA copyrighted material. They are
  reviewed periodically for non-derivation.
- The Field Medicine layer reproduces only the *numeric facts* (drug
  doses, intervals, energy levels, weight ranges) from AHA ACLS/PALS/BLS
  guidelines, with attribution to the AHA guideline edition. AHA
  algorithm flowcharts are *not* reproduced. The Broselow-Luten
  color-band system is *not* bundled (licensed by Vital Signs); the
  pediatric dose calculator works in straight kilograms instead. See
  [docs/field-medicine-citations.md](docs/field-medicine-citations.md).
- Data freshness lags behind upstream releases by up to one week.
  ICD-10-CM is updated annually, MPFS annually, NCCI and MUE quarterly,
  NADAC weekly, NDC daily, NPI monthly, OIG and opt-out monthly. The
  footer shows the bundled version date for each dataset.
- The Bill Decoder relies on regex extraction and cannot read scanned
  image bills. Paste the bill text.
- The Appointment Prep Question Generator uses deterministic keyword
  matching against a hand-curated bank, not language understanding.
- The Hospital Price Transparency utility's coverage is intentionally
  partial. The full federal dataset is too large to bundle. The included
  hospitals are listed in `data/hospital-prices/manifest.json`.
- The site is not medical, legal, or financial advice. It does not
  replace clinician judgment, institutional protocols, professional
  billing review, or legal counsel.
- Clinical calculators are math aids only. Institutional protocols
  govern any clinical decision. Field-medicine utilities additionally
  defer to local protocols and online medical direction.
- Medicare fee comparisons are reference points, not predictions of what
  any specific commercial insurance plan will pay.

## Security

Vulnerability reports: see [SECURITY.md](SECURITY.md) for the private
disclosure channel and the threat model summary. The CSP, security
headers, and supply-chain posture (pinned dev deps, SBOM on every
build, integrity-verified data shards) are documented in
[docs/threat-model.md](docs/threat-model.md).

## Documentation

- [docs/architecture.md](docs/architecture.md) — runtime architecture,
  data flow, no-backend rationale
- [docs/data-sources.md](docs/data-sources.md) — every bundled dataset
  with canonical URL and refresh cadence
- [docs/clinical-citations.md](docs/clinical-citations.md) — every
  formula and scoring system with citations
- [docs/field-medicine-citations.md](docs/field-medicine-citations.md) —
  Group I citations, including AHA non-derivation posture
- [docs/legal.md](docs/legal.md) — data sourcing posture, AMA CPT
  handling, attributions
- [docs/accessibility.md](docs/accessibility.md) — WCAG 2.2 AA checklist
- [docs/threat-model.md](docs/threat-model.md) — threats considered and
  the controls that mitigate each
- [docs/stability.md](docs/stability.md) — full stability policy
- [docs/performance.md](docs/performance.md) — performance budget and
  measurement methodology
- [docs/operations.md](docs/operations.md) — data refresh workflow,
  manifest format, integrity verification
- [docs/release.md](docs/release.md) — Cloudflare Pages release runbook
- [docs/deployment.md](docs/deployment.md) — deployment configuration
- [CHANGELOG.md](CHANGELOG.md) — every release with date, version, and
  user-visible changes
- [SECURITY.md](SECURITY.md) — vulnerability disclosure policy



