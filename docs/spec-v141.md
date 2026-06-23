# spec-v141.md — Pediatric growth & dosing: CDC BMI-for-age percentile, WHO growth z-score, mid-parental height, corrected age, APLS weight estimation, and the Gail/BCRAT model (+6 tiles)

> Status: **SHIPPED (2026-06-23) — 4 of the 6 proposed tiles.** Fourth and final
> feature spec of **Wave 7** of the [spec-v100](spec-v100.md) MDCalc Parity
> Completion program.
>
> **What shipped (+4, catalog 631 → 635):** `peds-bmi-percentile`,
> `who-growth-zscore`, `mid-parental-height`, `corrected-age` — all Group E, all
> Class A, via `lib/peds-growth-v141.js` + `views/group-v141.js` (`RV141`) reading
> the verbatim CDC 2000 / WHO 2006 LMS tables compiled into
> `lib/growth-lms-data.js`.
>
> **What did NOT ship.** §2.5 **`peds-weight-est` is SKIPPED** — the
> spec-v85 §6.2 collision check at implementation found it **already live** from
> spec-v149 (Group I, the APLS age-based weight estimate). Re-adding it would
> duplicate a live tile, which the spec-v100 "none duplicates a live tile"
> doctrine forbids. §2.6 **`gail-bcrat` is DEFERRED** on source-governance +
> safety grounds: the NCI Gail/BCRAT model's race-specific composite-incidence
> (λ1) and competing-mortality (λ2) tables ship only as binary `.rda` objects in
> the public-domain NCI BCRA package — not verbatim-fetchable to cross-verify per
> the spec-v97 ≥2-source rule — and its recode / relative-risk / attributable-risk
> pipeline is intricate enough that a subtly-wrong cancer-risk percentage is a real
> harm. Parked alongside `crib-ii` / `gwtg-hf` / ROKS until the coefficient block
> can be sourced and cross-verified verbatim.
>
> Catalog effect at v141 close: **631 + 4 = 635 tiles** — the Wave 7 end state.
> (The original projection of 637 assumed all six; the two unshipped tiles above
> account for the difference.)
>
> Every prior spec (v4 through v140) remains in force. v141 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md)
> §3 one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)),
> and inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog has the pediatric dosing-math helpers (`peds-weight-conv` and the
weight-based drip tiles) but the six standard pediatric growth, dosing, and risk
instruments a clinician reaches for in the well-child visit, the resuscitation
bay, and the breast-cancer-risk clinic are absent:

- **There is no growth-percentile calculator** — `peds-weight-conv` converts
  units, but the CDC 2000 LMS transform that turns a measured BMI into a BMI-for-
  age z-score and percentile (the number that defines pediatric overweight and
  obesity) is reachable nowhere; it sits beside `peds-weight-conv`.
- **There is no WHO infant z-score** — the WHO 2006 LMS transform for weight/
  length-for-age (0–2 yr) is absent.
- **There is no target-height predictor** — the mid-parental height formula is
  absent.
- **There is no corrected-age tool** — the preterm corrected-gestational-age
  calculation that governs developmental milestones is reachable nowhere.
- **Pediatric resuscitation has no free weight estimator** — the APLS age-based
  weight formulas (the free substitute for the excluded Broselow tape) are absent.
- **Primary care has no breast-cancer risk model** — the public-domain NCI
  Gail/BCRAT model is absent.

Each is a published, deterministic instrument a clinician already uses; v141
closes Wave 7.

## 2. What v141 adds (6 tiles)

### 2.1 `peds-bmi-percentile` — Pediatric BMI-for-age Percentile & z-score (CDC 2000)

- **Citation:** Kuczmarski RJ, Ogden CL, Guo SS, et al. 2000 CDC growth charts for
  the United States: methods and development. *Vital Health Stat 11.*
  2002;(246):1-190.
- **citationUrl:** https://www.cdc.gov/nchs/data/series/sr_11/sr11_246.pdf
  (verify at implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `pediatrics`, `family-medicine`, `nutrition`, `nursing-peds`.
- **Inputs:** age (2–20 yr), sex, and BMI (or weight + height to compute BMI).
- **Output:** the **BMI-for-age z-score and percentile** via the CDC 2000 LMS
  transform, with the **underweight / healthy / overweight / obese** bands per the
  CDC cutoffs. Class A (fixed published LMS coefficients). **Near-neighbor:**
  `peds-weight-conv` — cross-linked.

### 2.2 `who-growth-zscore` — WHO Growth z-score (0–2 yr)

- **Citation:** WHO Multicentre Growth Reference Study Group. WHO Child Growth
  Standards based on length/height, weight and age. *Acta Paediatr Suppl.*
  2006;450:76-85.
- **citationUrl:** https://doi.org/10.1111/j.1651-2227.2006.tb02378.x
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `pediatrics`, `neonatology`, `nutrition`, `nursing-peds`.
- **Inputs:** age (months, 0–24), sex, and the measured weight or length.
- **Output:** the **weight/length-for-age z-score and percentile** via the WHO 2006
  LMS transform. Class A (fixed published LMS coefficients).

### 2.3 `mid-parental-height` — Mid-Parental Target Height

- **Citation:** Tanner JM, Goldstein H, Whitehouse RH. Standards for children's
  height at ages 2-9 years allowing for height of parents. *Arch Dis Child.*
  1970;45(244):755-762.
- **citationUrl:** https://doi.org/10.1136/adc.45.244.755
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `pediatrics`, `family-medicine`, `primary-care`.
- **Inputs:** the child's sex, the mother's height, and the father's height.
- **Output:** the **predicted adult target height** ((mother + father ± 13 cm) / 2,
  sex-adjusted) with the **± 6.5 cm (≈ 8.5 cm)** target range per the source. Class
  A.

### 2.4 `corrected-age` — Corrected Gestational Age

- **Citation:** Engle WA; American Academy of Pediatrics Committee on Fetus and
  Newborn. Age terminology during the perinatal period. *Pediatrics.*
  2004;114(5):1362-1364.
- **citationUrl:** https://doi.org/10.1542/peds.2004-1915
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `neonatology`, `pediatrics`, `nursing-nicu`, `nursing-peds`.
- **Inputs:** the chronological age and the gestational age at birth (weeks).
- **Output:** the **corrected age = chronological age − (40 − GA) weeks** per the
  AAP standard, with the note that correction is conventionally applied through
  ~24 months. Class A. Robustness: guards a gestational age outside the plausible
  range.

### 2.5 `peds-weight-est` — Age-Based Weight Estimation (APLS)

- **Citation:** Luscombe M, Owens B. Weight estimation in resuscitation: is the
  current formula still valid? *Arch Dis Child.* 2007;92(5):412-415 (the updated
  APLS age-band formulas).
- **citationUrl:** https://doi.org/10.1136/adc.2006.107284
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `pediatrics`, `pediatric-emergency`, `emergency-medicine`,
  `nursing-peds`.
- **Inputs:** the child's age (the formula band is selected by age range).
- **Output:** the **estimated weight (kg)** via the APLS age-band formulas. Class
  A. **Substitute note:** the free APLS formula replaces the excluded Broselow tape
  ([spec-v100](spec-v100.md) §8). These are the **APLS age formulas, not the
  copyrighted Broselow tape.**

### 2.6 `gail-bcrat` — Gail Model (BCRAT)

- **Citation:** Gail MH, Brinton LA, Byar DP, et al. Projecting individualized
  probabilities of developing breast cancer for white females who are being
  examined annually. *J Natl Cancer Inst.* 1989;81(24):1879-1886; updated in the
  NCI BCRAT (CARE model, 2007).
- **citationUrl:** https://doi.org/10.1093/jnci/81.24.1879
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `oncology`, `primary-care`, `family-medicine`,
  `obstetrics-gynecology`.
- **Inputs:** age, age at menarche, age at first live birth, number of first-degree
  relatives with breast cancer, number of prior breast biopsies, atypical
  hyperplasia, and race/ethnicity (for the CARE relative-risk set).
- **Output:** the **5-year and lifetime invasive breast-cancer risk (%)** via the
  public-domain NCI BCRAT model. Class A (public-domain NCI model, fixed
  coefficients).

## 3. Per-tile robustness

- **`peds-bmi-percentile` and `who-growth-zscore` use the LMS z-score transform**
  `z = ((X/M)^L − 1) / (L·S)` with the **L → 0 special case** `z = ln(X/M) / S`.
  The compute guards `L = 0` (uses the log form), guards `M > 0` and `S > 0`, and
  guards `X > 0` before the power/log; the percentile is the standard-normal CDF of
  the bounded z. These tiles need a **new compiled-constants module
  `lib/growth-lms-data.js`** (analogous to [`lib/gli-2012-data.js`](../lib/gli-2012-data.js)),
  sourced **verbatim from the CDC 2000 and WHO 2006 published LMS tables — NOT
  fabricated** ([spec-v100](spec-v100.md) §5; re-fetch per the v91/v97 lesson). The
  module exports the L/M/S arrays by age/sex; the compute interpolates between
  tabulated ages.
- **`gail-bcrat` re-fetches its published relative-risk and baseline-hazard
  coefficients verbatim**; the attributable-risk product and the
  `1 − exp(−cumulative-hazard)` conversion are overflow-guarded — never a
  probability from `NaN`.
- **`mid-parental-height`, `corrected-age`, and `peds-weight-est`** are bounded
  arithmetic with domain guards (non-negative heights, plausible GA, age-band
  selection); each returns the complete-the-fields fallback on a missing or
  out-of-domain input.
- All six render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treatment recommendation in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all six are **Class A** (fixed LMS tables /
  formulas / coefficients) — no `docs/citation-staleness.md` row. The CDC/WHO LMS
  citations name the *Vital Health Stat* / *Acta Paediatr* series and the MGRS
  group; phrase them to name the publication and authors, not "CDC"/"WHO" as an
  issuing society in a threshold sense, to avoid the `ISSUER_PATTERN` trip
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson) — the LMS coefficients
  are fixed, so no staleness row is warranted.
- **Build (§6.1):** `lib/peds-growth-v141.js` is the compute module
  (`pedsBmiPercentile`, `whoGrowthZscore`, `midParentalHeight`, `correctedAge`,
  `pedsWeightEst`, `gailBcrat`), reading the new `lib/growth-lms-data.js`
  compiled-constants module; the renderer module is `views/group-v141.js` (six
  renderers, `RV141` added to the `app.js` `RENDERERS` spread).
- **Gates (§6.2):** **both** `lib/peds-growth-v141.js` **and** `lib/growth-lms-data.js`
  are added to `test/unit/fuzz-tools.test.js` `MODULES` where they export functions
  (the LMS data module exports constants and any interpolation helper; the fuzz
  harness skips non-functions) — zero non-finite leaks, with the LMS z-transform
  and the Gail hazard explicitly fuzzed for overflow and the `L = 0` branch; each
  `META` example is pinned by the chromium `example-correctness` sweep; the catalog
  count moves on all **13 catalog-truth surfaces**; a11y, mobile-no-hscroll, and
  44px touch-target checks pass for `views/group-v141.js`.
- **Data strategy (§5):** the CDC 2000 / WHO 2006 LMS tables and the Gail/BCRAT
  coefficient block are **compiled constants the compute reads**, not a `data/`
  directory ([spec-v100](spec-v100.md) §5) — `lib/growth-lms-data.js` is the single
  new compiled-constants module this wave authors.

## 5. Files touched

```
docs/spec-v141.md                        (this file)
app.js                                   (+6 UTILITIES rows, groups E/G; import group-v141 renderers into RENDERERS)
lib/peds-growth-v141.js                  (new module: pedsBmiPercentile, whoGrowthZscore, midParentalHeight, correctedAge, pedsWeightEst, gailBcrat)
lib/growth-lms-data.js                   (NEW compiled-constants module: CDC 2000 + WHO 2006 L/M/S arrays by age/sex, sourced verbatim — analogous to lib/gli-2012-data.js)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to peds-weight-conv)
views/group-v141.js                      (new renderer module: 6 renderers; incl. the growth age/sex/measurement inputs and the Gail risk-factor input)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/peds-bmi-percentile.test.js, who-growth-zscore.test.js, mid-parental-height.test.js, corrected-age.test.js, peds-weight-est.test.js, gail-bcrat.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/peds-growth-v141.js and lib/growth-lms-data.js to MODULES)
test/unit/specialty-coverage.test.js     (ALLOWED_SPECIALTIES: confirm pediatric-emergency/neonatology/nursing-nicu/family-medicine/primary-care present; add any missing)
docs/audits/v12/peds-bmi-percentile.md, who-growth-zscore.md, mid-parental-height.md, corrected-age.md, peds-weight-est.md, gail-bcrat.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 631 -> 637; Wave 7 closes)
CHANGELOG.md                             (Unreleased: v141 entry, +6; Wave 7 complete)
README.md, package.json                  (catalog count 631 -> 637; spec-progression line -> v141)
```

## 6. Acceptance criteria

v141 is fully shipped when:

- The implementing session has **re-run the [spec-v85](spec-v85.md) §6.2 collision
  check** and confirmed all six ids are absent.
- All 6 tiles in §2 are live in their group with a `META[id]` entry, an inline
  primary citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each
  (including a BMI-for-age crossing the **97th-percentile (obese) boundary**, a WHO
  weight-for-age z-score, a mid-parental target with its ± range, a corrected-age
  for a 28-week preemie, an APLS weight for a known age, and a Gail 5-year risk
  crossing a counseling threshold), a [spec-v11](spec-v11.md) audit log, and a
  passing [spec-v29](spec-v29.md) §3 check.
- The LMS z-transform guards the `L = 0` branch, `M > 0`, `S > 0`, and `X > 0`;
  `gail-bcrat` overflow-guards its hazard conversion; partial inputs render a
  complete-the-fields fallback.
- `lib/growth-lms-data.js` is sourced **verbatim** from the CDC 2000 / WHO 2006
  published tables (not fabricated) and is committed as compiled constants.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- Any new specialty tag is added to `test/unit/specialty-coverage.test.js`
  `ALLOWED_SPECIALTIES` (the closed vocab).
- `UTILITIES.length` is **637** (or live count + 6 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree; Wave 7 records 613 →
  637 (+24) in `scope-mdcalc-parity.md`.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v141 with the +6 catalog delta and the Wave-7-complete
  note.

## 7. Out of scope for v141

- **No CDC/WHO growth-chart image rendering** — `peds-bmi-percentile` and
  `who-growth-zscore` output the **z-score and percentile**, not a plotted chart or
  a chart image.
- **No Broselow tape** — excluded per [spec-v100](spec-v100.md) §8; `peds-weight-est`
  ships the free APLS age formulas as the substitute (the APLS formulas, not the
  copyrighted Broselow product).
- **No Tyrer-Cuzick/IBIS or FRAX** — the licensed risk models are excluded per
  [spec-v100](spec-v100.md) §8; the public-domain NCI Gail/BCRAT is the included
  free model.
- **No auto-referral, auto-dosing, or auto-feeding order** — each tile reports the
  percentile/z/weight/risk and the source's stated interpretation; the management
  decision stays with the clinician and local protocol.
