# spec-v133.md — Warfarin dosing & pharmacogenomics: IWPC, Gage, and the 10 mg / 5 mg initiation nomograms (+4 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> **MDCalc Parity Completion** program, **Wave 6 — Heme / onc / endocrine / ID.**
> Adds **4** deterministic warfarin-dosing instruments — two pharmacogenetic dose
> models and two initiation nomograms — that fill confirmed catalog gaps. None
> duplicates a live tile.
>
> Catalog effect at v133 close: **588 + 4 = 592 tiles.** (If specs land out of
> order, the implementing session uses the then-current `UTILITIES.length` plus
> this spec's +4, and the catalog-truth gate enforces agreement.)
>
> Every prior spec (v4 through v132) remains in force. v133 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding [spec-v85](spec-v85.md) §2) and the [spec-v100](spec-v100.md) §6 CI/CD
> contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract.

## 1. Thesis

The catalog has the IV-heparin weight-based titration nomogram (`heparin-nomogram`)
but no oral-anticoagulant initiation support at all. Four standard warfarin-dosing
instruments — the pharmacogenetic dose models clinicians use when CYP2C9/VKORC1
genotype is known, and the fixed-dose initiation nomograms used when it is not —
are absent, leaving warfarin start-up reachable nowhere. Each sits conceptually
beside `heparin-nomogram` (the other "compute the next dose from inputs" tool):

- **There is no pharmacogenetic warfarin dose estimator.** The **IWPC** algorithm
  (Klein 2009) and the **Gage** algorithm (Gage 2008) are the two most-cited models
  that take age, body size, target/clinical factors, and the entered CYP2C9 and
  VKORC1 (Gage adds CYP4F2) genotype and return a predicted maintenance dose. Both
  are linear regressions on the **square root of the weekly dose** — a fixed,
  published coefficient block.
- **There is no warfarin initiation nomogram.** The **10 mg** (Kovacs 2003) and
  **5 mg** (Crowther 1999) protocols give the early-day dose from the daily INR.
  These are the genotype-unknown counterpart to the PGx models and the warfarin
  analogue of the `heparin-nomogram` already shipped.

v133 brings warfarin start-up onto the page beside `heparin-nomogram`, with the
high-stakes second-check note every dosing tile in this program carries.

## 2. What v133 adds (4 tiles)

### 2.1 `warfarin-iwpc` — IWPC Pharmacogenetic Warfarin Dose

- **Citation:** International Warfarin Pharmacogenetics Consortium; Klein TE,
  Altman RB, Eriksson N, et al. Estimation of the warfarin dose with clinical and
  pharmacogenetic data. *N Engl J Med.* 2009;360(8):753-764.
- **citationUrl:** https://doi.org/10.1056/NEJMoa0809329
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `pharmacy`, `hematology`, `internal-medicine`, `family-medicine`.
- **Inputs:** age (decade band), height, weight, race (per the published terms),
  enzyme-inducer use (carbamazepine/phenytoin/rifampin), amiodarone use, and the
  entered **VKORC1 (-1639 G>A)** and **CYP2C9 (\*1/\*2/\*3)** genotypes.
- **Output:** the **predicted stable weekly maintenance dose (mg/week)** and the
  derived **daily dose**, via the published IWPC pharmacogenetic equation (which
  predicts √dose; the tile squares the result). Class A (fixed 2009 coefficients).
  Carries the high-stakes second-check note ([spec-v11](spec-v11.md) §5.3).
  Cross-links `warfarin-gage`.

### 2.2 `warfarin-gage` — Gage Pharmacogenomic Warfarin Dose

- **Citation:** Gage BF, Eby C, Johnson JA, et al. Use of pharmacogenetic and
  clinical factors to predict the therapeutic dose of warfarin. *Clin Pharmacol
  Ther.* 2008;84(3):326-331.
- **citationUrl:** https://doi.org/10.1038/clpt.2008.10
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `pharmacy`, `hematology`, `internal-medicine`, `family-medicine`.
- **Inputs:** age, body-surface area (height + weight), target INR, smoking status,
  amiodarone use, race, deep-vein-thrombosis/PE indication, and the entered
  **CYP2C9**, **VKORC1**, and **CYP4F2** genotypes.
- **Output:** the **predicted therapeutic weekly dose (mg/week)** and the derived
  daily dose, via the published Gage equation (also a √dose regression; the tile
  squares the exponentiated result). Class A (fixed 2008 coefficients). Carries the
  high-stakes second-check note. Cross-links `warfarin-iwpc`.

### 2.3 `warfarin-init-10mg` — Warfarin 10 mg Initiation Nomogram

- **Citation:** Kovacs MJ, Rodger M, Anderson DR, et al. Comparison of 10-mg and
  5-mg warfarin initiation nomograms together with low-molecular-weight heparin for
  outpatient treatment of acute venous thromboembolism. *Ann Intern Med.*
  2003;138(9):714-719.
- **citationUrl:** https://doi.org/10.7326/0003-4819-138-9-200305060-00007
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `pharmacy`, `internal-medicine`, `hematology`, `primary-care`.
- **Inputs:** the treatment day (1, 2, 3, 4, 5+) and the morning INR for the
  INR-driven days.
- **Output:** the **recommended warfarin dose (mg) for that day** per the Kovacs
  10 mg nomogram (10 mg days 1–2, then INR-banded). Class A (fixed nomogram table).
  Carries the high-stakes second-check note. Cross-links `warfarin-init-5mg`.

### 2.4 `warfarin-init-5mg` — Warfarin 5 mg Initiation Nomogram

- **Citation:** Crowther MA, Ginsberg JB, Kearon C, et al. A randomized trial
  comparing 5-mg and 10-mg warfarin loading doses. *Arch Intern Med.*
  1999;159(1):46-48.
- **citationUrl:** https://doi.org/10.1001/archinte.159.1.46
- **Group:** Medication & Infusion (`F`).
- **Specialties:** `pharmacy`, `internal-medicine`, `geriatrics`, `primary-care`.
- **Inputs:** the treatment day and the morning INR for the INR-driven days.
- **Output:** the **recommended warfarin dose (mg) for that day** per the Crowther
  5 mg nomogram (5 mg day 1, then INR-banded). Class A (fixed nomogram table).
  Carries the high-stakes second-check note. Cross-links `warfarin-init-10mg`.

## 3. Per-tile robustness

- **`warfarin-iwpc` and `warfarin-gage` are regression models with published
  coefficients.** Both must be **re-fetched verbatim** at implementation (the v97
  "re-fetch, never recall coefficients" lesson), and both predict the **square root
  of the weekly dose** — the compute computes √dose, then **squares it** to return
  mg/week, guarding the domain (the squared result is finite and non-negative; a
  blank required input returns a surfaced `valid:false` fallback, never a dose from
  `NaN`). Genotype is an enumerated input (the dropdown's allowed alleles only); an
  unrecognized/blank genotype surfaces the fallback rather than silently dropping a
  coefficient. Both join the [spec-v59](spec-v59.md) fuzz harness with the squaring
  step explicitly fuzzed for overflow.
- **`warfarin-init-10mg` and `warfarin-init-5mg` are fixed nomogram lookups.** The
  day index and INR band are clamped to the published table; an out-of-range INR
  surfaces the fallback. No interpolation between bands.
- **High-stakes second-check (mandatory, all four).** Per
  [spec-v11](spec-v11.md) §5.3 and the [spec-v100](spec-v100.md) §2 clause 5 dosing
  rule, every warfarin tile renders the note: **a model/nomogram estimate is a
  starting point — confirm against your institutional protocol, the indication's
  target INR, and a second independent check before prescribing.** None authors a
  prescribe-this-dose recommendation in Sophie's voice.
- All four render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; every compute uses `lib/num.js`.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all four are **Class A** (fixed 2008/2009
  regression coefficients and fixed 1999/2003 nomogram tables) — **no**
  `docs/citation-staleness.md` row. Each citation names the **journal and authors**
  (NEJM, Clin Pharmacol Ther, Ann Intern Med, Arch Intern Med), not an issuing-society
  acronym, so `check-citations.mjs` `ISSUER_PATTERN` does not fire.
- **Build (§6.1):** `lib/warfarin-v133.js` is the new compute module
  (`warfarinIwpc`, `warfarinGage`, `warfarinInit10mg`, `warfarinInit5mg`), with the
  IWPC/Gage coefficient blocks as compiled constants ([spec-v100](spec-v100.md) §5);
  `views/group-v133.js` is the new renderer module, exporting `RV133` into the
  `app.js` `RENDERERS` spread.
- **Gates (§6.2):** `lib/warfarin-v133.js` is added to `test/unit/fuzz-tools.test.js`
  `MODULES` (zero non-finite leaks, with the √dose → square step explicitly fuzzed);
  each `META` example is pinned by the chromium `example-correctness` sweep (the
  rendered worked dose must appear verbatim); the catalog count moves on all **13
  catalog-truth surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks
  pass for `views/group-v133.js`.

## 5. Files touched

```
docs/spec-v133.md                        (this file)
app.js                                   (+4 UTILITIES rows, group F; import group-v133 RV133 into RENDERERS)
lib/warfarin-v133.js                     (new module: warfarinIwpc, warfarinGage, warfarinInit10mg, warfarinInit5mg; IWPC/Gage coefficient constants)
lib/meta.js                              (+4 META entries: inline citation + citationUrl + accessed; cross-links to heparin-nomogram)
views/group-v133.js                      (new renderer module: 4 renderers; second-check note on each)
docs/clinical-citations.md               (+ rows for the four sources)
test/unit/warfarin-iwpc.test.js, warfarin-gage.test.js, warfarin-init-10mg.test.js, warfarin-init-5mg.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/warfarin-v133.js to MODULES)
docs/audits/v12/warfarin-iwpc.md, warfarin-gage.md, warfarin-init-10mg.md, warfarin-init-5mg.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 588 -> 592; running ledger)
CHANGELOG.md                             (Unreleased: v133 entry, +4)
README.md, package.json                  (catalog count 588 -> 592; spec-progression line -> v133)
```

## 6. Acceptance criteria

v133 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  four ids are absent.
- All 4 tiles in §2 are live in Group F with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each, a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- **Each warfarin dosing tile shows a worked dose** (a worked IWPC mg/week for a
  genotype set, a worked Gage mg/week, and the 10 mg / 5 mg nomogram dose for at
  least one INR-driven day each) **and carries the second-check caveat** in the
  rendered output.
- `warfarin-iwpc` and `warfarin-gage` compute √dose and **square it**, guard the
  domain, and surface a `valid:false` fallback for blank/unrecognized genotype or
  missing inputs; both are covered by the [spec-v59](spec-v59.md) fuzz harness with
  zero non-finite leaks.
- `UTILITIES.length` is **592** (or live count + 4 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v133 with the +4 catalog delta.

## 7. Out of scope for v133

- **No genomic interpretation beyond the entered genotype** — the PGx tiles consume
  the clinician-entered CYP2C9 / VKORC1 (Gage: CYP4F2) genotype; they do **not**
  call variants, parse a genotyping report, or infer a genotype from phenotype.
- **No auto-anticoagulation order** — every tile reports a model/nomogram estimate
  with the second-check note; the prescribe decision stays with the clinician and
  local protocol.
- **No INR-management beyond the cited initiation window** — the nomograms cover the
  published early-day protocol only, not chronic maintenance adjustment or
  supratherapeutic-INR reversal (see `anticoag-reversal`, cross-linked).
- **No DOAC dose modeling** — v133 is warfarin-specific.
