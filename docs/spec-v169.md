# spec-v169.md — Pediatric percentile completion: pediatric BP percentile, CDC stature-for-age, and CDC weight-for-age (+3 tiles)

> Status: **SHIPPED 2 of 3 (2026-06-29).** `cdc-stature-for-age` and
> `cdc-weight-for-age` shipped (Group E, beside their growth-percentile
> siblings); `pediatric-bp-percentile` is **deferred** — the AAP 2017 / NHLBI
> Fourth Report BP regression coefficients are published only in PDF appendices
> that could not be fetched verbatim and cross-verified in the build environment,
> and a wrong BP percentile mis-stages hypertension (spec-v97 sourcing gate, the
> `crib-ii` precedent). It re-opens the moment a verbatim coefficient source is
> reachable. Original status below.
>
> Status: **PROPOSED (2026-06-23).** Feature spec of the
> [spec-v168](spec-v168.md) **Data-Sourced Reference-Table** program. Adds **3**
> deterministic pediatric percentile instruments built on **verbatim-fetched
> reference tables** ([spec-v141](spec-v141.md) pattern). Fills confirmed gaps —
> the catalog has `peds-bmi-percentile` (CDC BMI-for-age) and `who-growth-zscore`
> (WHO 0–2 yr) but **no pediatric blood-pressure percentile and no CDC 2–20 yr
> stature/weight-for-age percentile.** None duplicates a live tile.
>
> Catalog effect at v169 close: **live count + 3** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v168) remains in force. v169 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract. **Every table value is
> verbatim-fetched and programmatically parsed — none hand-transcribed**
> ([spec-v168](spec-v168.md) §3, [spec-v97](spec-v97.md)).

## 1. Thesis

Pediatric blood pressure cannot be interpreted as a single number — it is a
percentile against age, sex, and height, and elevated/stage-1/stage-2 hypertension
is defined by those percentiles. The catalog cannot compute it. Likewise the CDC
2–20 yr stature-for-age and weight-for-age percentiles (the companions to the
already-shipped BMI-for-age) are absent. All three are LMS/regression lookups over
published reference tables, fetched verbatim and parsed with the existing
`lib/growth-lms-data.js` infrastructure.

## 2. What v169 adds (3 tiles)

### 2.1 `pediatric-bp-percentile` — Pediatric Blood Pressure Percentile & HTN Stage

- **Citation:** Flynn JT, Kaelber DC, Baker-Smith CM, et al. Clinical practice
  guideline for screening and management of high blood pressure in children and
  adolescents. *Pediatrics.* 2017;140(3):e20171904 (AAP; normative tables from the
  NHLBI Fourth Report regression method).
- **citationUrl:** https://doi.org/10.1542/peds.2017-1904 (verify at implementation)
- **Group:** Pediatrics & Neonatal (`N`).
- **Specialties:** `pediatrics`, `pediatric-cardiology`, `pediatric-nephrology`.
- **Inputs:** age (1–17 yr), sex, measured height (to derive the height percentile),
  and systolic + diastolic BP (mmHg).
- **Output:** the **SBP and DBP percentiles** (computed from the verbatim NHLBI/AAP
  regression coefficients by sex, age, and height-Z) and the **AAP 2017 category** —
  normal (<90th), elevated (≥90th to <95th or ≥120/80), stage 1 (≥95th to <95th+12,
  or ≥130/80), stage 2 (≥95th+12 or ≥140/90) — with the ≥13 yr fixed-threshold
  branch. Class B (agency table). Guards every input; the height-percentile step
  reuses the CDC stature LMS (2.3).

### 2.2 `cdc-stature-for-age` — CDC Stature-for-Age Percentile (2–20 yr)

- **Citation:** Kuczmarski RJ, Ogden CL, Guo SS, et al. 2000 CDC growth charts for
  the United States: methods and development. *Vital Health Stat 11.* 2002;(246).
- **citationUrl:** https://www.cdc.gov/growthcharts/ (statage.csv — fetch verbatim)
- **Group:** Pediatrics & Neonatal (`N`).
- **Specialties:** `pediatrics`, `family-medicine`.
- **Inputs:** age (2–20 yr), sex, stature (cm).
- **Output:** the **stature-for-age z-score and percentile** via the LMS transform
  `z = ((X/M)^L − 1)/(L·S)` (L→0 limit `ln(X/M)/S`), percentile via the A&S erf
  `normalCdf`, clamped [0.1, 99.9]. Class A (fixed CDC 2000 standard →
  documentation-only staleness row). Reuses `interpLMS`/`normalCdf` from
  `lib/growth-lms-data.js`.

### 2.3 `cdc-weight-for-age` — CDC Weight-for-Age Percentile (2–20 yr)

- **Citation:** Kuczmarski RJ, Ogden CL, Guo SS, et al. 2000 CDC growth charts for
  the United States. *Vital Health Stat 11.* 2002;(246).
- **citationUrl:** https://www.cdc.gov/growthcharts/ (wtage.csv — fetch verbatim)
- **Group:** Pediatrics & Neonatal (`N`).
- **Specialties:** `pediatrics`, `family-medicine`.
- **Inputs:** age (2–20 yr), sex, weight (kg).
- **Output:** the **weight-for-age z-score and percentile** via the same LMS
  transform. Class A (CDC 2000 → documentation-only staleness row). Cross-linked to
  `peds-bmi-percentile`, `who-growth-zscore`, `cdc-stature-for-age`.

## 3. Per-tile robustness

- **Verbatim sourcing:** the CDC `statage.csv`/`wtage.csv` and the NHLBI/AAP BP
  regression coefficients are fetched to disk and parsed by the generator
  (`scratchpad/gen-*.js`, uncommitted) into committed data modules; the audit log
  records source URL + fetch date + the ≥2-source cross-verification
  ([spec-v97](spec-v97.md)). **No value is hand-typed.**
- **LMS guards** ([spec-v141](spec-v141.md) lesson): `interpLMS` guards a non-array
  stratum; the L→0 limit branch is exercised; the percentile is clamped [0.1, 99.9];
  the ordinal-suffix helper avoids the `/tiles?/` drift-scan collision (keep version
  numbers away from the word "percentile" in docs).
- **`pediatric-bp-percentile`** chains the height-percentile step into the BP
  regression; both the <13 yr percentile path and the ≥13 yr fixed-threshold path are
  unit-tested, including the **elevated→stage 1→stage 2 boundary flips** and the
  "lower of percentile-vs-absolute" rule. A blank/out-of-range age renders a surfaced
  `valid:false` complete-the-fields fallback.
- All three flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks; all render the [spec-v50](spec-v50.md) §3 posture note (a single
  reading is not a diagnosis; confirm over visits) and author no order
  ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** `pediatric-bp-percentile` is **Class B** (AAP/NHLBI
  agency tables) → real `docs/citation-staleness.md` row; `cdc-stature-for-age` and
  `cdc-weight-for-age` are fixed CDC 2000 standards → **documentation-only**
  staleness rows (CDC trips `ISSUER_PATTERN`; the standard does not drift).
- **Specialty vocabulary:** no new tags (`pediatrics`, `pediatric-cardiology`,
  `pediatric-nephrology`, `family-medicine` all exist).
- **Build & gates (§6.1/§6.2):** the three computes live in the new
  `lib/peds-percentile-v169.js` module (`pediatricBpPercentile`,
  `cdcStatureForAge`, `cdcWeightForAge`) plus new data in `lib/growth-lms-data.js`
  (CDC stature/weight LMS) and a new `lib/bp-norms-data.js` (BP regression
  coefficients), added to `fuzz-tools.test.js` `MODULES`. Renderers live in the new
  `views/group-v169.js`; its `RV169` export is spread into `app.js` `RENDERERS`.
  The catalog count moves on all **13 catalog-truth surfaces**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass. **Housekeeping:** `git checkout -- data/` after
  any baseline `build-data` to avoid the manifest-restamp diff.

## 5. Files touched

```
docs/spec-v169.md                        (this file)
app.js                                   (+3 UTILITIES rows, group N; import group-v169 RV169 into RENDERERS)
lib/peds-percentile-v169.js              (new module: pediatricBpPercentile, cdcStatureForAge, cdcWeightForAge)
lib/growth-lms-data.js                   (+ CDC stature-for-age & weight-for-age LMS strata, fetched verbatim)
lib/bp-norms-data.js                     (new data module: NHLBI/AAP BP regression coefficients, fetched verbatim)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed; cross-links to peds-bmi-percentile, who-growth-zscore)
views/group-v169.js                      (new renderer module: 3 renderers)
docs/clinical-citations.md               (+ rows for the sources)
docs/citation-staleness.md               (+ Class B row for pediatric-bp-percentile; documentation-only rows for the CDC tiles)
test/unit/pediatric-bp-percentile.test.js, cdc-stature-for-age.test.js, cdc-weight-for-age.test.js   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/peds-percentile-v169.js to MODULES)
docs/audits/v12/pediatric-bp-percentile.md, cdc-stature-for-age.md, cdc-weight-for-age.md   (spec-v11 audit logs; record source URL + fetch date + cross-verify source)
docs/scope-data-sourced.md               (catalog ledger; advance the v168 running count)
CHANGELOG.md                             (Unreleased: v169 entry, +3)
README.md, package.json                  (catalog count + spec-progression line -> v169)
```

## 6. Acceptance criteria

v169 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all three ids are absent.
- All 3 tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a
  **pediatric BP elevated→stage 1 boundary for a given age/sex/height**, a **CDC
  stature 50th-percentile check**, and a **CDC weight z-score at a known reference
  value**), a [spec-v11](spec-v11.md) audit log recording the **verbatim source URL +
  fetch date + cross-verification source**, and a passing [spec-v29](spec-v29.md) §3
  check.
- Every table value is verbatim-fetched and programmatically parsed — **no
  hand-transcription**; `interpLMS` guards the non-array stratum; percentiles clamp
  [0.1, 99.9]; blank inputs render a complete-the-fields fallback.
- Every compute uses `lib/num.js`/the LMS helpers and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- `pediatric-bp-percentile` carries its Class B staleness row; the CDC tiles carry
  documentation-only rows.
- `UTILITIES.length` is live count + 3, all catalog-truth surfaces agree, and the
  `data/` diff is surgical (manifest not restamped).
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v169 with the +3 delta.

## 7. Out of scope for v169

- **No <1 yr BP** — the AAP percentile method applies to ages 1–17; neonatal/infant
  BP norms are a separate reference.
- **No overweight-inclusive BP tables** — the AAP 2017 normative set excludes
  overweight/obese children by design; the tile reflects that source.
- **No diagnosis** — a single elevated reading is reported with the AAP requirement
  to confirm across visits; the diagnosis stays with the clinician.
