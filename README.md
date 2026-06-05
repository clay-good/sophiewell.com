<p align="center">
  <img src="logo.png" alt="Sophie Well logo" width="120" height="120">
</p>

<h1 align="center">sophiewell.com</h1>

<p align="center">
  <strong>255 deterministic healthcare calculators tuned to the nurse on shift.</strong><br>
  Free forever. No servers, no accounts, no telemetry, no AI, no network call after first paint.
</p>

<p align="center">
  <a href="https://sophiewell.com">Live site</a> ·
  <a href="docs/spec-v29.md">Scope &amp; audience</a> ·
  <a href="https://sophiewell.com/commitments/">8 commitments</a> ·
  <a href="CHANGELOG.md">Changelog</a>
</p>

Deterministic healthcare utilities, free forever, no servers, no accounts.

sophiewell.com is a single-page static website built for the **nurse on
shift** — primarily ICU and acute-care RN (CCRN / PCCN), then ED RN
(CEN), then floor / med-surg RN, then OR / PACU RN, then L&D / NICU RN —
with every relevant tile still served to doctors, pharmacists, RTs,
billers, coders, and EMS providers. It is, in posture, MDCalc with no
ads, no login, no upsell, no cookie banner, no email capture, and no
network call after first paint. Everything runs in the browser. There
is no AI of any kind. The data sources are public, bundled with the
page, and refreshed on a schedule. The site costs nothing to operate
beyond the domain renewal, so it can be free forever. The product
thesis, in one sentence: **MDCalc, but free, login-less, ad-less,
offline-capable, with a catalog tuned to the nurse on shift**
(see [docs/spec-v29.md](docs/spec-v29.md)). The one-line scope test:
a tile must consume at least one user input and produce a computed
output; "searchable lookup of static facts" does not qualify. See
[docs/spec-v10.md](docs/spec-v10.md) for the audience and
dependency-budget commitments and
[docs/spec-v29.md](docs/spec-v29.md) for the nurse-first pivot
and the v29 catalog ledger. At v52 close the catalog is 255
deterministic tiles — every one of them computes from at least
one user input (the new `pa-lint` tile in spec-v52 consumes
dropped files instead of form fields and produces a
deterministic findings report, the first instance of the
`shape: 'document-linter'` tile shape). Catalog-truth invariants
([docs/spec-v46.md](docs/spec-v46.md)) fail CI on any drift
between `UTILITIES.length` and the public marketing copy.
Sophie's eight posture commitments
([docs/spec-v50.md](docs/spec-v50.md)) — no ads, no login, no
telemetry, no third-party fetch, no AI, no cookies, no paid
tier, MIT-licensed forever — are listed at
[/commitments/](https://sophiewell.com/commitments/) and
enforced by automated checks on every commit. Select tiles
expose a collapsed "where does this come from?" derivation
block ([docs/spec-v48.md](docs/spec-v48.md)) with the verbatim
source formula, study cohort, and limits of validity.

## The problem

Bedside math — drug dose, drip rate, anion gap, eGFR adjustment,
sepsis-bundle clock, restraint re-check, Braden re-score —
lives in published clinical literature and institutional protocols.
The nurse on shift, the resident at 3 a.m., the medic in the
ambulance, and the pharmacist verifying a renal dose all reach
for the same calculators and arrive at the same number from the
same inputs. Existing options are paywalled, ad-laden, login-
gated, account-tied, or quietly telemetered — every one of which
adds friction to a 30-second decision at the bedside.

The meta-problem is that the workers who would benefit most from
fast, free, deterministic math are the ones least likely to have
a paid app handy at the moment they need it.

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

After the spec-v29 nurse-first prune (plus the spec-v30
thermal-emergency decision tiles, the spec-v31 Beers
deprescribing checker, the spec-v32 non-verbal pain scales, the
spec-v33 opioid-sedation + neonatal-pain extensions, the
spec-v34 pediatric-ICU bedside extensions, the spec-v35
SOS withdrawal companion, the spec-v36 MEOWS maternal
track-and-trigger, the spec-v37 CPSS + LAMS prehospital stroke
triage scales, the spec-v38 RACE prehospital LVO predictor, and
the spec-v39 ROSIER ED stroke-recognition scale, and the
spec-v40 GUSS post-stroke bedside dysphagia screen, and the
spec-v41 FOUR Score ICU coma scale, and the spec-v42 Katz ADL
discharge-planning functional-status index, and the spec-v43
Lawton IADL instrumental-ADL companion, and the spec-v44 Barthel
Index rehab-nursing weighted ADL, and the spec-v45 C-SSRS
bedside suicide-risk screener added on top), the
site organizes 255 deterministic calculators
across the bedside-shift surfaces a
nurse, doctor, pharmacist, RT, EMS provider, biller-coder, or
educator actually reaches for. Every tile takes at least one
user input and produces a computed output; searchable indexes
of static facts are explicitly out of scope (see
[docs/spec-v29.md §3](docs/spec-v29.md) and
[docs/spec-v10.md §2.3](docs/spec-v10.md)).

**Clinical math & conversions** covers BMI, BSA suite, MAP /
pulse pressure / shock index, anion gap with delta-delta,
corrected Ca / Na, osmolal gap, A-a gradient and P/F suite,
Winter's formula, eGFR suite (CKD-EPI 2021 / MDRD / Cockcroft-
Gault), FENa / FEUrea, maintenance fluids (4-2-1), QTc suite,
pregnancy dating, pack-years, the universal unit converter,
sodium-correction planner (Adrogue-Madias), free water deficit,
predicted body weight + ARDSnet tidal volume, and RSBI.
**Medication & infusion** covers drip rate, weight-based dose,
concentration-to-rate, pediatric dose bounds, insulin drip,
anticoagulant reversal, opioid MME (CDC 2022), steroid and
benzodiazepine equivalence, antibiotic renal-dose adjustment,
vasopressor dose-to-rate (with VIS / Wernovsky IS), TPN
macronutrient, iron deficit (Ganzoni), and the v29 nursing-
shift additions for insulin correction, electrolyte
replacement ladders, CRRT dose, ECMO titration, and the MTP
ratio tracker.
**Clinical scoring & risk** covers GCS, APGAR, NIHSS / mNIHSS,
Wells PE / DVT, CHA2DS2-VASc, HAS-BLED, TIMI, GRACE, HEART,
PERC, Geneva, CURB-65, PSI, qSOFA / SOFA, MELD-3.0 / Child-
Pugh, Ranson / BISAP, Centor / McIsaac, Caprini, Bishop,
Alvarado / PAS, PHQ-9, GAD-7, AUDIT-C, CAGE, EPDS, Mini-Cog,
CIWA-Ar, COWS, ASCVD PCE, PREVENT 2023, Light's criteria,
Mentzer index, SAAG, R-factor liver injury, KDIGO AKI, ICH
Score, Hunt-Hess / WFNS, plus modified Sgarbossa, revised
cardiac risk index, PEWS / NEWS2 / NEWS2-escalation, every
v17-v28 risk-score tile, and the v29 bedside nursing screens
(Braden, Morse, Hendrich II, RASS, BPS, CPOT, ICDSC, CAM,
CAM-ICU, Aldrete / PADSS).
**Clinical criteria & diagnostic bundles** packages NPIAP
pressure-injury staging, Norton / PUSH wound assessment, the
VIP / INS extravasation criteria, ABO / Rh blood-product
compatibility, and the v17-v28 diagnostic bundles.
**Workflow & templates** carries the patient-visit generators
that survive v29 (appeal letter, HIPAA Right of Access, HIPAA
authorization, ROI request, discharge instructions, specialty-
visit questions, the wallet-card generator, and the SBAR
handoff template), plus the v29 nursing-shift workflow timers:
restraint timer, sepsis-bundle clock, code-blue clock, device-
day counter, Bristol / abdominal-girth tracker, and the vent
SBT readiness / ARDSnet PEEP-FiO2 ladder.
**Field medicine** covers NEXUS / Canadian C-Spine, CDC Field
Triage, START / JumpSTART, peds-weight-dose, burn surface area
and fluid resuscitation (Parkland / modified Brooke),
pediatric ETT sizing, naloxone dosing, the EMS documentation
helper, and the AVPU / GCS quick reference.
**Public health & infectious disease** covers tetanus
prophylaxis, rabies PEP, bloodborne pathogen exposure, TB
testing interpretation, and STI screening intervals. **Billing
& coding** is now sparse — the time-based E/M code selector,
the NDC 10 ↔ 11 digit converter, and the HIPAA 60-day breach
clock. Every static index (ICD-10-CM, HCPCS, CPT, NDC, POS,
modifier, revenue, CARC / RARC, NUBC, DRG, APC, ICD-10-PCS,
RxNorm, NDC↔RxNorm) was retired in spec-v29 wave 29-2 §2.1;
use your EHR, CMS, FDA, or NUBC source instead.

The user flow is simple: type what you need into the hero search
("wells PE", "CHA2DS2-VASc", "ICD-10", "magnesium replacement") or
pick a tile from the disclosure-collapsible home grid, enter input,
read output. The hero consults a hand-curated synonym table
(`data/synonyms.json`, spec-v7 section 3.2) before falling back to
fuzzy matching, and shows a one-line breadcrumb explaining why a
tile is recommended. (The spec-v7 §3.1 patient-artifact dropzone was
retired in the 2026-05-18 clinical-staff-first pivot; the
deterministic classifier under `lib/artifact-*.js` is retained for
possible future reuse on a clinical-input surface, but the home view
no longer wears it.) Every utility opens with its
inputs pre-filled from a worked example so the empty state is never
empty (a "Reset to example" link restores them after editing), and
the References region at the bottom shows the formula citation or
dataset stamp the result came from (spec-v9). Calculator state is
encoded in the URL hash so any view can be bookmarked or shared as
a permalink.

All computation happens in the browser. For the full picture, see
[docs/architecture.md](docs/architecture.md).

## System design and architecture overview

The application is one HTML file, one CSS file, one JavaScript module set,
a service worker, and a data folder of sharded JSON. There is no backend.
The browser receives static files from the same origin and runs everything
locally. Data shards are loaded only when a utility that needs them is
opened. The service worker pre-caches the application shell on first load and
caches data shards on first access, keyed to the build hash so new
deployments invalidate old caches cleanly. The
application has zero runtime dependencies. A weekly CI job runs the data
refresh pipeline and opens a pull request with any updated data. For the
long version, see [docs/architecture.md](docs/architecture.md).

```
            BUILD TIME (CI)                          RUNTIME (browser, offline-capable)
 ┌───────────────────────────────┐         ┌──────────────────────────────────────────┐
 │ public datasets (CMS, FDA,    │         │  index.html  +  styles.css  +  app.js      │
 │ AMA, NPPES, …)                │         │        │                                   │
 │        │  scripts/build-data  │         │        ▼                                   │
 │        ▼                      │  ship   │   router (URL hash)  ──►  tile view        │
 │  sharded JSON  + SHA-256      │ ──────► │        │                     │             │
 │  manifests (data/)            │  static │        ▼                     ▼             │
 │        │  scripts/build       │  files  │   lazy-load data shard   pure compute      │
 │        ▼                      │         │   (verified vs manifest)  (lib/*.js)       │
 │  dist/  (255 tool pages,      │         │        │                     │             │
 │  OG cards, sitemap, SBOM)     │         │        ▼                     ▼             │
 └───────────────────────────────┘         │   service worker cache    result + cite   │
                                            │   (keyed to build hash)                    │
   CSP: connect-src 'self'  ───────────────►│   NO outbound network · NO storage · NO AI │
                                            └──────────────────────────────────────────┘
```

The trust boundary is the CSP `connect-src 'self'` directive: once the static
shell is served, the page cannot open a network connection, so user input
physically cannot leave the device. Everything below the router is a pure
function of (URL hash + bundled data); there is no mutable server state, no
session, and nothing to log.

### Repository layout

```
index.html          single-page shell (hero search, home grid, tile mount)
styles.css          one stylesheet (responsive, no horizontal scroll by design)
app.js              router, filters, view wiring (zero runtime deps)
sw.js               service worker — precache shell, cache shards by build hash
theme.js            light/dark theme toggle (no storage)
lib/                pure compute modules, one per tile family
  ├─ data.js        the UTILITIES catalog (255 tiles, the single source of truth)
  ├─ clinical*.js   clinical math / scoring / criteria
  └─ pa/            the prior-auth linter: extract · classify · payer · rules ·
                    engine · report · docx · staleness  (spec-v52)
views/              per-group view renderers (group-*.js, pa-lint.js)
data/               sharded public datasets + SHA-256 manifests (46 datasets)
scripts/            build-*, check-*, audit-* (build + the CI lint gates)
docs/               specs (spec-v4 … spec-v52) + architecture / threat-model / …
test/               unit/ (node:test) · integration/ (Playwright) · fixtures/
dist/               build output (255 tool pages, OG cards, sitemap, SBOM)
```

## The Prior-Auth Packet Linter (`pa-lint`)

`pa-lint` (spec-v52) is the catalog's first `document-linter` tile: instead
of form fields it consumes dropped files (PDF / DOCX / TXT) and produces a
deterministic findings report. It checks the *procedural completeness* of a
prior-authorization packet — is the member ID present, is the ordering NPI
Luhn-valid, is a clinical note attached, does an inpatient Aetna,
UnitedHealthcare, Anthem, Cigna, Humana, HCSC, Highmark, Florida Blue, BCBSM,
Blue Shield of California, Independence Blue Cross, CareFirst, Blue Cross NC,
Horizon, BCBS Tennessee, BCBS Massachusetts, or BCBS Alabama request carry a
discharge plan — **not** clinical
coverage criteria, which are the reviewer's judgment.
Everything runs in the browser; the packet never leaves the tab.

The pipeline is a pure, byte-deterministic function of the input bytes
(spec-v52 §4.10): the same packet always yields the same report, which is
what makes the golden-fixture CI gate possible.

```
 drop files (PDF/DOCX/TXT/scanned-PDF/image)
        │
        ▼
 ┌──────────────┐   pdf.js / mammoth.js (vendored, no network)
 │   ingest     │── extract text, SHA-256 each file
 └──────┬───────┘   scanned PDF / image? → "Run on-device OCR" button →
        │           tesseract.js (vendored, lazy, same-origin, in-worker)
        │           → text → re-run pipeline   (spec-v52 §4.3.1)
        ▼
 ┌──────────────┐   lib/pa/extract.js  → codes, dates, NPIs, POS, signatures
 │   extract    │   lib/pa/classify.js → per-document role (clinical-note,
 └──────┬───────┘                         imaging-report, lab-result, …)
        ▼
 ┌──────────────┐   lib/pa/payer.js → one bucket: cms-medicare-ffs |
 │ detect payer │     cms-medicare-advantage | medicaid | medicaid-ca |
 └──────┬───────┘     medicaid-ny | medicaid-tx | medicaid-fl | medicaid-oh |
        ▼               medicaid-il | medicaid-wa | medicaid-ga | medicaid-nc |
        ▼               medicaid-pa | medicaid-mi | medicaid-nj | medicaid-az |
        ▼               aetna | uhc | anthem | cigna |
        ▼               humana | hcsc | highmark | florida-blue | bcbsm |
        ▼               blue-shield-ca | ibx | carefirst | bcbsnc | horizon |
        ▼               bcbst | bcbsma | bcbsal | bcbssc | arkbcbs | bluekc |
        ▼               bcbsmn | bcbsla | hmsa | commercial | unknown
 ┌──────────────┐   lib/pa/rules.js → 855 rules, each a pure check(bundle).
 │  run engine  │   Overlay rules self-gate on the detected payer and
 └──────┬───────┘   vacuously pass off-bucket.
        ▼
 ┌──────────────┐   lib/pa/report.js → severity-sorted findings + evidence
 │ build report │   Three downloads, all built in-tab:
 └──────────────┘     • full JSON   • PHI-redacted JSON   • DOCX (§4.6/§4.7)
```

Severities follow spec-v52 §4.4: `block` (packet cannot be reviewed as-is),
`flag` (likely denial / RFI), `info` (nice-to-have), `pass`. A finding never
guarantees an approval or a denial — it reports only what the ruleset checks.

### Ruleset at a glance (855 rules)

| Family            | Count | Scope                                                        | Ledger source              |
|-------------------|-------|--------------------------------------------------------------|----------------------------|
| `R-PA-NNN`        | 60    | §4.5.1 core, payer-agnostic completeness (IDs, codes, NPI, dates, signatures, PHI minimization) | AMA CPT / CMS HCPCS / ICD-10-CM / POS / NCCI / NPPES |
| `R-PA-CMS-NNN`    | 25    | §4.5.2 Medicare FFS DME / oxygen / PAP / mobility            | CMS IOM 100-08, NCD/LCD     |
| `R-PA-MA-NNN`     | 15    | §4.5.3 Medicare Advantage                                    | CMS MA 422                  |
| `R-PA-MCD-NNN`    | 10    | §4.5.4 Medicaid state-agnostic core                          | Medicaid core              |
| `R-PA-RAD-NNN`    | 5     | §4.5.5 radiology / advanced imaging                          | ACR Appropriateness        |
| `R-PA-INF-NNN`    | 5     | §4.5.5 infusion / biologics                                  | FDA labeling               |
| `R-PA-SURG-NNN`   | 5     | §4.5.5 surgery (conservative trial, imaging, ASA, consent)   | Surgical-indication policy  |
| `R-PA-BH-NNN`     | 5     | §4.5.5 behavioral health (DSM-5-TR, LOC, risk)               | DSM-5-TR                   |
| `R-PA-GEN-NNN`    | 5     | §4.5.5 genetic testing                                       | NCCN / ACMG                |
| `R-PA-AETNA-NNN`  | 20    | §4.5.7 Aetna commercial overlay — the first named-payer set  | `aetna-precert`            |
| `R-PA-UHC-NNN`    | 20    | §4.5.8 UnitedHealthcare commercial overlay — the second named-payer set | `uhc-precert`   |
| `R-PA-ANTHEM-NNN` | 20    | §4.5.9 Anthem BCBS / Elevance commercial overlay — the third named-payer set | `anthem-precert` |
| `R-PA-CIGNA-NNN`  | 20    | §4.5.10 Cigna commercial overlay — the fourth named-payer set | `cigna-precert`            |
| `R-PA-HUMANA-NNN` | 20    | §4.5.11 Humana commercial overlay — the fifth named-payer set | `humana-precert`           |
| `R-PA-HCSC-NNN`   | 20    | §4.5.12 HCSC / Blue Cross Blue Shield (IL/TX/MT/NM/OK) — the sixth named-payer set | `hcsc-precert` |
| `R-PA-HIGHMARK-NNN` | 20  | §4.5.13 Highmark / Blue Cross Blue Shield (PA/WV/DE/NY) — the seventh named-payer set | `highmark-precert` |
| `R-PA-FLBLUE-NNN` | 20  | §4.5.14 Florida Blue / GuideWell (Blue Cross and Blue Shield of Florida) — the eighth named-payer set | `floridablue-precert` |
| `R-PA-BCBSM-NNN` | 20  | §4.5.15 BCBSM / Blue Cross Blue Shield of Michigan (+ Blue Care Network) — the ninth named-payer set | `bcbsm-precert` |
| `R-PA-BSCA-NNN` | 20  | §4.5.16 Blue Shield of California — the tenth named-payer set | `blueshieldca-precert` |
| `R-PA-IBX-NNN` | 20  | §4.5.17 Independence Blue Cross (southeastern PA / Philadelphia) — the eleventh named-payer set | `ibx-precert` |
| `R-PA-CAREFIRST-NNN` | 20 | §4.5.18 CareFirst BlueCross BlueShield (MD / DC / Northern VA) — the twelfth named-payer set | `carefirst-precert` |
| `R-PA-BCBSNC-NNN` | 20 | §4.5.19 Blue Cross Blue Shield of North Carolina (Blue Cross NC) — the thirteenth named-payer set | `bcbsnc-precert` |
| `R-PA-HORIZON-NNN` | 20 | §4.5.20 Horizon Blue Cross Blue Shield of New Jersey — the fourteenth named-payer set | `horizon-precert` |
| `R-PA-BCBST-NNN` | 20 | §4.5.21 Blue Cross Blue Shield of Tennessee — the fifteenth named-payer set | `bcbst-precert` |
| `R-PA-BCBSMA-NNN` | 20 | §4.5.22 Blue Cross Blue Shield of Massachusetts — the sixteenth named-payer set | `bcbsma-precert` |
| `R-PA-BCBSAL-NNN` | 20 | §4.5.23 Blue Cross Blue Shield of Alabama — the seventeenth named-payer set | `bcbsal-precert` |
| `R-PA-BCBSSC-NNN` | 20 | §4.5.24 Blue Cross Blue Shield of South Carolina — the eighteenth named-payer set | `bcbssc-precert` |
| `R-PA-ARKBCBS-NNN` | 20 | §4.5.25 Arkansas Blue Cross and Blue Shield — the nineteenth named-payer set | `arkbcbs-precert` |
| `R-PA-BLUEKC-NNN` | 20 | §4.5.26 Blue Cross and Blue Shield of Kansas City — the twentieth named-payer set | `bluekc-precert` |
| `R-PA-BCBSMN-NNN` | 20 | §4.5.27 Blue Cross and Blue Shield of Minnesota — the twenty-first named-payer set | `bcbsmn-precert` |
| `R-PA-BCBSLA-NNN` | 20 | §4.5.28 Blue Cross and Blue Shield of Louisiana — the twenty-second named-payer set | `bcbsla-precert` |
| `R-PA-HMSA-NNN` | 20 | §4.5.29 HMSA / Blue Cross Blue Shield of Hawaii — the twenty-third named-payer set | `hmsa-precert` |
| `R-PA-MCAL-NNN` | 20 | §4.5.30 Medi-Cal (California Medicaid) — first per-state Medicaid overlay | `medi-cal-precert` |
| `R-PA-MCNY-NNN` | 20 | §4.5.31 New York State Medicaid | `ny-medicaid-precert` |
| `R-PA-MCTX-NNN` | 20 | §4.5.32 Texas Medicaid | `tx-medicaid-precert` |
| `R-PA-MCFL-NNN` | 20 | §4.5.33 Florida Medicaid | `fl-medicaid-precert` |
| `R-PA-MCOH-NNN` | 20 | §4.5.34 Ohio Medicaid | `oh-medicaid-precert` |
| `R-PA-MCIL-NNN` | 20 | §4.5.35 Illinois Medicaid | `il-medicaid-precert` |
| `R-PA-MCWA-NNN` | 20 | §4.5.36 Washington Apple Health (Medicaid) | `wa-medicaid-precert` |
| `R-PA-MCGA-NNN` | 20 | §4.5.37 Georgia Medicaid | `ga-medicaid-precert` |
| `R-PA-MCNC-NNN` | 20 | §4.5.38 North Carolina Medicaid | `nc-medicaid-precert` |
| `R-PA-MCPA-NNN` | 20 | §4.5.40 Pennsylvania Medicaid (Medical Assistance / PROMISe / HealthChoices) | `pa-medicaid-precert` |
| `R-PA-MCMI-NNN` | 20 | §4.5.41 Michigan Medicaid (MDHHS / CHAMPS / Healthy Michigan Plan) | `mi-medicaid-precert` |
| `R-PA-MCNJ-NNN` | 20 | §4.5.42 New Jersey Medicaid (DMAHS / NJ FamilyCare / NJMMIS) | `nj-medicaid-precert` |
| `R-PA-MCAZ-NNN` | 20 | §4.5.43 Arizona Medicaid (AHCCCS / AHCCCS Complete Care / AHCCCS Online) | `az-medicaid-precert` |

The twenty-three commercial overlays (§4.5.7 Aetna, §4.5.8 UnitedHealthcare, §4.5.9
Anthem, §4.5.10 Cigna, §4.5.11 Humana, §4.5.12 HCSC, §4.5.13 Highmark, §4.5.14
Florida Blue, §4.5.15 BCBSM, §4.5.16 Blue Shield of California, §4.5.17
Independence Blue Cross, §4.5.18 CareFirst, §4.5.19 Blue Cross NC, §4.5.20
Horizon, §4.5.21 BCBS Tennessee, §4.5.22 BCBS Massachusetts, §4.5.23 BCBS
Alabama, §4.5.24 BCBS South Carolina, §4.5.25 Arkansas BCBS, §4.5.26 BCBS
Kansas City, §4.5.27 BCBS Minnesota, §4.5.28 BCBS Louisiana, §4.5.29 HMSA)
are each keyed to a single named payer and ship 20 rules
apiece. They are deliberately structurally parallel — same families, same
severities — so a packet linted under any one payer is auditable against the
others. The payer-specific routing names differ where each payer actually differs
(Aetna's CPB / NME; UHC's Provider Portal / Optum; Anthem's Availity ICR /
Carelon / Blue Distinction Centers; Cigna's CignaforHCP / eviCore / Express
Scripts / LifeSOURCE; Humana's Availity / CenterWell / National Transplant
Network; HCSC's Availity / Prime Therapeutics / Blue Distinction Centers;
Highmark's Availity / Provider Resource Center / Blue Distinction Centers; Florida
Blue's Availity / provider portal / Blue Distinction Centers; BCBSM's Availity /
Blue Care Network / Blue Distinction Centers; Blue Shield of California's Availity
/ provider connection / Blue Distinction Centers; Independence Blue Cross's
Availity / PEAR portal / Blue Distinction Centers; CareFirst's CareFirst Direct /
iEXchange / Blue Distinction Centers; Blue Cross NC's Blue e / Availity / Blue
Distinction Centers; Horizon's NaviNet / Availity / Blue Distinction Centers;
BCBST's Availity / BlueAccess / Blue Distinction Centers; BCBSMA's Provider
Central / Availity / Blue Distinction Centers; BCBSAL's ProviderAccess / Availity
/ Blue Distinction Centers; BCBSSC's My Insurance Manager / Availity / Blue
Distinction Centers; Arkansas Blue Cross's AHIN / Availity / Blue Distinction
Centers; Blue KC's Availity / Blue KC provider portal / Blue Distinction Centers;
BCBSMN's Availity / provider portal / Blue Distinction Centers; BCBSLA's
iLinkBlue / Availity / Blue Distinction Centers; HMSA's HHIN / Blue Distinction
Centers —
both Humana's and HCSC's
imaging programs are named generically since the vendor names collide with a
barred AI-vendor substring, spec-v50 §3.6). The first five are the largest
commercial / MA plans by national PA volume; HCSC, Highmark, Florida Blue, BCBSM,
Blue Shield of California, Independence Blue Cross, CareFirst, Blue Cross NC,
Horizon, BCBS Tennessee, BCBS Massachusetts, BCBS Alabama, BCBS South Carolina,
Arkansas BCBS, BCBS Kansas City, BCBS Minnesota, BCBS Louisiana, and HMSA are
the eighteen
largest independent Blue Cross Blue Shield licensees and the first of the §9
"Blues plans by state" candidates. Two same-state pairs are deliberately
disambiguated by precedence: Blue Shield of California vs. Anthem Blue Cross of
California, and Independence Blue Cross (southeastern PA) vs. Highmark (western
PA) — in each case the `anthem` / `highmark` bucket is checked first. A third
collision is handled by anchor choice, not order: `bcbsm` (Michigan) is a
substring of `bcbsma` (Massachusetts), so the Massachusetts bucket anchors on the
spelled-out plan name and never the bare acronym:

| Rules     | Aetna / UHC / Anthem / Cigna / Humana / HCSC / Highmark / Florida Blue / BCBSM / Blue Shield of CA / IBX / CareFirst / Blue Cross NC / Horizon / BCBST / BCBSMA / BCBSAL / BCBSSC / Arkansas / Blue KC / BCBSMN / BCBSLA / HMSA |
|-----------|-------------------------------------------------------------------------|
| 001–005   | Coverage criteria, supporting records, submission channel, prior-auth-list stub, questionnaire / advance notification / auth-before-service |
| 006–010   | Review *modes*: concurrent / continued-stay, advanced-imaging site-of-care, expedited urgency, objective evidence / surgery site-of-care, J-code NDC |
| 011–015   | Step therapy, bariatric / specialty-drug diagnosis, genetic-testing program, retrospective review, DME written order |
| 016–020   | DME or behavioral-health LOC, transplant Centers-of-Excellence / Blue Distinction routing, experimental-service evidence, appeal reference, out-of-network gap |

Every overlay rule self-gates on `bundle.payer === '<payer>'` and vacuously
passes on any other packet, so the 135 non-commercial rules, the twenty-three
20-rule commercial overlays, and the thirteen per-state Medicaid overlays coexist
without false positives — a Medicare FFS
packet never trips a Humana rule, and vice versa. Each rule's
source URL is tracked in
[pa-staleness-ledger.json](pa-staleness-ledger.json) and re-verified on the
§4.5.6 maintenance cadence; `npm run lint` fails CI on any ledger ↔ ruleset
drift, and `scripts/audit-pa.mjs` diffs the full pipeline output against
forty-three committed golden reports so any rule, extractor, or classifier change
that moves a byte is caught.

**Payer detection is first-match-wins, in a deliberate order.** The buckets
are nested — "Aetna Medicare Advantage" is *both* an MA plan and an Aetna plan —
so `lib/pa/payer.js` checks them in a fixed precedence and stops at the first
anchor hit. This is the cheat sheet:

```
 1. cms-medicare-advantage   "medicare advantage", "mapd", "humana gold plus", …
 2. medicaid-ca              "medi-cal", "denti-cal", "california medicaid"
 3. medicaid-ny              "new york state medicaid", "nys medicaid", "emedny"
 4. medicaid-tx              "texas medicaid", "tmhp"
 5. medicaid-fl              "florida medicaid", "statewide medicaid managed care"
 6. medicaid-oh              "ohio medicaid", "ohio department of medicaid"
 7. medicaid-il              "illinois medicaid", "hfs medicaid"
 8. medicaid-wa              "washington apple health", "apple health", "washington medicaid"
 9. medicaid-ga              "georgia medicaid", "gammis"
10. medicaid-nc              "north carolina medicaid", "nc medicaid", "nctracks"
11. medicaid-pa              "pennsylvania medicaid", "pa medicaid", "pennsylvania medical assistance", "healthchoices"
12. medicaid-mi              "michigan medicaid", "mi medicaid", "healthy michigan plan", "champs"
13. medicaid-nj              "new jersey medicaid", "nj medicaid", "nj familycare", "njmmis"
14. medicaid-az              "arizona medicaid", "az medicaid", "ahcccs", "arizona health care cost containment"
15. medicaid                 "medicaid", "masshealth", "chip", "state medicaid", …
16. cms-medicare-ffs         "medicare part a/b", "noridian", "palmetto gba", …
17. aetna                    "aetna"
18. uhc                      "unitedhealthcare", "optumrx", "umr", "oxford health"
19. anthem                   "anthem", "elevance"
20. cigna                    "cigna", "evernorth"
21. humana                   "humana", "centerwell"
22. hcsc                     "blue cross [and] blue shield of il/tx/mt/nm/ok", "hcsc"
23. highmark                 "highmark"
24. florida-blue             "florida blue", "guidewell", "bcbs of florida"
25. bcbsm                    "blue cross [and] blue shield of michigan", "bcbsm", "blue care network"
26. blue-shield-ca           "blue shield of california", "blue shield of ca"
27. ibx                      "independence blue cross", "independence administrators", "ibx"
28. carefirst                "carefirst", "care first"
29. bcbsnc                   "blue cross [and] blue shield of north carolina", "blue cross nc", "bcbsnc"
30. horizon                  "horizon blue cross", "horizon bcbs", "horizon healthcare services"
31. bcbst                    "blue cross [and] blue shield of tennessee", "bcbst"
32. bcbsma                   "blue cross [and] blue shield of massachusetts", "bcbs of massachusetts"
33. bcbsal                   "blue cross [and] blue shield of alabama", "bcbsal"
34. bcbssc                   "blue cross [and] blue shield of south carolina", "bcbssc"
35. arkbcbs                  "arkansas blue cross [and blue shield]", "arkansas bcbs"
36. bluekc                   "blue cross [and] blue shield of kansas city", "blue kc"
37. bcbsmn                   "blue cross [and] blue shield of minnesota", "blue cross of minnesota"
38. bcbsla                   "blue cross [and] blue shield of louisiana", "bcbsla"
39. hmsa                     "hmsa", "hawaii medical service association", "blue cross blue shield of hawaii"
40. commercial               "blue cross", "blue shield", "kaiser", "tricare"
41. unknown                  (no anchor hit)
```

Government lines of business win first so an MA or Medicaid packet never routes
to a commercial overlay on a stray brand string. **Per-state Medicaid** buckets
(2–14: `medicaid-ca` / `-ny` / `-tx` / `-fl` / `-oh` / `-il` / `-wa` / `-ga` /
`-nc` / `-pa` / `-mi` / `-nj` / `-az`) are checked before the generic `medicaid`
bucket (15), so a named program (Medi-Cal, "Texas Medicaid", eMedNY, "Florida
Medicaid", "Ohio Medicaid", "Illinois Medicaid", "Apple Health", GAMMIS, NCTracks,
PROMISe / HealthChoices, CHAMPS / Healthy Michigan Plan, NJ FamilyCare / NJMMIS,
AHCCCS / AHCCCS Complete Care)
routes to its overlay
while a state-agnostic Medicaid packet falls through to the generic bucket — and
the §4.5.4 Medicaid core (`R-PA-MCD-*`) keeps firing on every state bucket via
the `isMedicaid()` predicate, so the core and the per-state overlay compose on
the same packet. The hyphen in `medi-cal` is load-bearing: it prevents a false
match on the common word "medical"; the state-Medicaid buckets are also
deliberately disjoint from their same-state Blues commercial buckets
(`medicaid-fl` vs. `florida-blue`, `medicaid-il` vs. `hcsc`/BCBS-of-Illinois,
`medicaid-nc` vs. `bcbsnc`/Blue-Cross-NC, `medicaid-pa` vs.
`highmark`/`ibx`/Pennsylvania-Blues, `medicaid-mi` vs. `bcbsm`/BCBS-of-Michigan,
`medicaid-nj` vs. `horizon`/Horizon-BCBS-NJ —
each pair unit-tested; Arizona / `medicaid-az` has no modeled same-state Blues,
so its `ahcccs` anchor needs no such disambiguation). The
named-commercial buckets (17–39) sit above the generic `commercial` fall-through
(40) and match only *unambiguous* anchors, so independent Blues licensees that
aren't yet modeled (Premera, Regence, Wellmark, Excellus, Capital BlueCross) stay
in `commercial` rather than being misrouted. Two same-state pairs are
disambiguated purely by order: `anthem` (bucket 19) is checked before
`blue-shield-ca` (26), so "Anthem Blue Cross of California" routes to Anthem, not
Blue Shield of California; and `highmark` (23) is checked before `ibx` (27), so a
western-Pennsylvania Highmark packet never routes to the Philadelphia-region
Independence Blue Cross overlay.
Horizon's `'horizon'` bucket (30) matches only the disambiguated brand anchors
(`horizon blue cross` / `horizon bcbs` / `horizon healthcare services`), never
the bare common word `horizon`. A substring collision is handled by anchor choice
rather than order: `bcbsm` (Michigan, bucket 25) is a prefix of `bcbsma`
(Massachusetts, bucket 32), so the Massachusetts bucket anchors only on the
spelled-out plan name and the `bcbs of massachusetts` short form — never the bare
`bcbsma` acronym, which would otherwise be swallowed by Michigan. The same applies
to `bcbsmn` (Minnesota, bucket 37), which also anchors only on its spelled-out
name.
A per-packet majority vote
(`detectPacketPayer`) aggregates multi-document bundles, with ties broken by
this same order.

**Design decisions baked into the linter.** (1) *Deterministic, not
probabilistic* — the linter is a pure function of input bytes, so the same
packet always yields the same report; this is what makes a golden-fixture CI
gate possible and is the opposite of the LLM-on-top-of-rules direction the
PA-automation SaaS vendors took (spec-v52 §1.1). (2) *Self-gating overlays* —
adding a payer is additive: a new bucket plus a prefix → ledger-source map,
never an edit to an existing rule, so the 855-rule set grows without
regression risk. (3) *Procedural completeness only* — the linter never
asserts medical necessity; it checks whether the mechanically-detectable
pieces a reviewer needs are present, which keeps it on the right side of the
"not medical advice" line. (4) *OCR is an input adapter, not the substrate*
(spec-v52 §4.3.1) — a scanned PDF or image can be turned into text with
**optional, user-triggered, on-device** OCR (tesseract.js, vendored), but OCR
only does what a human typist would; the deterministic rule engine still makes
every determination. The engine is **lazy** (~9 MB, loaded only on the user's
click, so idle weight is unchanged), runs **in-worker and same-origin** (no
network, no AI service, the image never leaves the tab), and is **upstream of
the audited surface** (the golden fixtures feed the engine text directly, so
determinism is preserved). The one cost is a narrow CSP relaxation —
`script-src 'self' 'wasm-unsafe-eval'` — which permits same-origin WebAssembly
compilation and nothing else (no general `eval`, no third-party origin;
`connect-src 'self'` is unchanged).

## Deterministic logic versus LLM usage

The product uses zero LLM inference and zero AI *service* of any kind. All
operations are deterministic functions over public datasets and published
formulas. There is no model in the loop, no embedding, no inference call, no API
key, and no network call to any AI vendor. If a future sibling project explores
AI-driven workflows, it will be a separate, clearly labeled product.
sophiewell.com itself never calls a language model.

The one nuance is the `pa-lint` tile's **optional, on-device OCR**
(spec-v52 §4.3.1): tesseract.js is a local, offline, deterministic
text-extraction kernel — not an LLM and not a cloud-AI vendor (the
`check-commitments.mjs` "no AI" deny-list targets OpenAI/Anthropic/onnxruntime/…,
none of which appears here). It runs entirely in the browser tab, fetches
nothing off-origin, and only converts a scan's pixels into the text a human
would otherwise type. It is an input adapter to the deterministic engine, not a
decision-maker — so the "deterministic, not probabilistic" posture is intact.

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
| `npm run test:unit`      | Run Node's built-in unit tests (2,182 tests)                      |
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
- Clinical input is processed in memory and discarded when the page
  is closed.
- There is no `localStorage`, no `sessionStorage`, no cookies, and no
  IndexedDB. All four are verified empty by the integration test suite.
- `innerHTML`, `outerHTML`, `insertAdjacentHTML`, `eval`, and the
  `Function` constructor are banned by the ESLint config and a grep
  check; the `el()` DOM helper throws on any attempt to set raw HTML.
- A CycloneDX SBOM (`sbom.json`, `sbom.md`) is regenerated on every
  build and ships with the site, hashing every runtime asset and source
  module with SHA-256 plus a per-build buildId.

## Limitations

- The Field Medicine layer reproduces only the *numeric facts* (drug
  doses, intervals, energy levels, weight ranges) from AHA ACLS/PALS/BLS
  guidelines, with attribution to the AHA guideline edition. AHA
  algorithm flowcharts are *not* reproduced. The Broselow-Luten
  color-band system is *not* bundled (licensed by Vital Signs); the
  pediatric dose calculator works in straight kilograms instead. See
  [docs/field-medicine-citations.md](docs/field-medicine-citations.md).
- Static code indexes (ICD-10-CM, HCPCS, CPT, NDC, POS, modifier,
  revenue, CARC / RARC, NUBC, DRG, APC, ICD-10-PCS, RxNorm,
  NDC↔RxNorm) and reference tables (adult / pediatric lab ranges,
  TDM, tox levels, ISMP high-alert wallet, AHA CPR wallet card,
  NIOSH Pocket Guide, DOT ERG, AGS Beers Criteria, ASA Physical
  Status, Mallampati, Modified Rankin) were retired in spec-v29
  wave 29-2 — Sophie's edge is computation, not indexing. Use your
  EHR, the upstream source, or your institutional protocol.
- The Appointment Prep Question Generator uses deterministic keyword
  matching against a hand-curated bank, not language understanding.
- The site is not medical, legal, or financial advice. It does not
  replace clinician judgment, institutional protocols, professional
  billing review, or legal counsel.
- Clinical calculators are math aids only. Institutional protocols
  govern any clinical decision. Field-medicine utilities additionally
  defer to local protocols and online medical direction.
## Security

Vulnerability reports: see [SECURITY.md](SECURITY.md) for the private
disclosure channel and the threat model summary. The CSP, security
headers, and supply-chain posture (pinned dev deps, SBOM on every
build, integrity-verified data shards) are documented in
[docs/threat-model.md](docs/threat-model.md).

## Documentation

- [docs/spec-v10.md](docs/spec-v10.md) — current positioning spec:
  clinical-first audience, runtime-dependency budget, permanent
  out-of-scope list
- [docs/spec-v11.md](docs/spec-v11.md) — correctness-floor spec:
  per-tile audit protocol, specialty-named groups, optional
  source-quoted `interpretation` field
- [docs/scope-mdcalc-parity.md](docs/scope-mdcalc-parity.md) —
  long-horizon scope: every actionable clinical calculator a
  healthcare worker would otherwise reach for MDCalc to find,
  shipped slowly at the v11 quality bar
- [docs/spec-v52.md](docs/spec-v52.md) — the `pa-lint` prior-auth packet
  linter: pipeline, the 855-rule ruleset, payer overlays (Aetna +
  UnitedHealthcare + Anthem + Cigna + Humana + HCSC + Highmark + Florida Blue +
  BCBSM + Blue Shield of California + Independence Blue Cross + CareFirst +
  Blue Cross NC + Horizon + BCBS Tennessee + BCBS Massachusetts + BCBS Alabama +
  BCBS South Carolina + Arkansas BCBS + BCBS Kansas City + BCBS Minnesota +
  BCBS Louisiana + HMSA, plus per-state Medicaid overlays for California /
  New York / Texas / Florida / Ohio / Illinois / Washington / Georgia / North
  Carolina / Pennsylvania / Michigan / New Jersey / Arizona), the optional on-device OCR path (§4.3.1, vendored
  tesseract.js),
  and the byte-determinism / golden-fixture guarantee
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



