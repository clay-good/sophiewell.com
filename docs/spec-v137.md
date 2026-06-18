# spec-v137.md — Infectious-disease scores: ISARIC 4C mortality, COVID-GRAM, Candida score, VACS index, and RegiSCAR DRESS (+5 tiles)

> Status: **PROPOSED (2026-06-17).** Feature spec of the [spec-v100](spec-v100.md)
> **MDCalc Parity Completion** program, **Wave 6 — Heme / onc / endocrine / ID** —
> the **closing spec of Wave 6.** Adds **5** deterministic infectious-disease risk
> scores that fill confirmed catalog gaps. None duplicates a live tile.
>
> Catalog effect at v137 close: **608 + 5 = 613 tiles** — the Wave 6 end state
> (583 → 613, +30). (If specs land out of order, the implementing session uses the
> then-current `UTILITIES.length` plus this spec's +5, and the catalog-truth gate
> enforces agreement.)
>
> Every prior spec (v4 through v136) remains in force. v137 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine
> (re-binding [spec-v85](spec-v85.md) §2) and the [spec-v100](spec-v100.md) §6 CI/CD
> contract, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md)
> output-safety contract.

## 1. Thesis

The catalog has the community-acquired-pneumonia severity tools (`curb-65`,
`psi`, `smart-cop`) but none of the standard COVID, invasive-candidiasis, HIV-
mortality, or drug-reaction scores. Each is a published, deterministic instrument an
infectious-disease clinician or hospitalist already uses, and the respiratory ones
sit conceptually beside `curb-65`:

- **COVID has no inpatient risk score.** The **ISARIC 4C mortality** score (0–21,
  additive) and the logistic **COVID-GRAM** critical-illness model are the two most-
  validated COVID inpatient instruments; neither is reachable.
- **ICU candidemia has no risk tool.** The **Candida score (León)** stratifies
  invasive-candidiasis risk in non-neutropenic ICU patients (0–5).
- **HIV has no mortality index.** The **VACS index** combines HIV-specific and
  general-organ markers into a 5-year all-cause mortality estimate.
- **Severe drug reactions have no scoring tile.** The **RegiSCAR** score grades DRESS
  diagnostic certainty (7 weighted items).

v137 brings the ID-score cluster onto the page beside `curb-65` and closes Wave 6.

## 2. What v137 adds (5 tiles)

### 2.1 `isaric-4c-mortality` — ISARIC 4C Mortality Score

- **Citation:** Knight SR, Ho A, Pius R, et al. Risk stratification of patients
  admitted to hospital with covid-19 using the ISARIC WHO Clinical Characterisation
  Protocol: development and validation of the 4C Mortality Score. *BMJ.*
  2020;370:m3339.
- **citationUrl:** https://doi.org/10.1136/bmj.m3339
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `infectious-disease`, `internal-medicine`, `critical-care`,
  `nursing-icu`.
- **Inputs:** age band, sex, number of comorbidities, respiratory rate band,
  peripheral oxygen saturation band, Glasgow Coma Scale, urea band, and C-reactive
  protein band — each contributing the published additive points.
- **Output:** the **total (0–21)** mapped to the published mortality-risk groups —
  **low (0–3), intermediate (4–8), high (9–14), very high (≥ 15)** — naming the
  banded contributions. Class A (fixed additive points). Cross-links `curb-65`.

### 2.2 `covid-gram` — COVID-GRAM Critical Illness Risk Score

- **Citation:** Liang W, Liang H, Ou L, et al. Development and validation of a
  clinical risk score to predict the occurrence of critical illness in hospitalized
  patients with COVID-19. *JAMA Intern Med.* 2020;180(8):1081-1089.
- **citationUrl:** https://doi.org/10.1001/jamainternmed.2020.2033
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `infectious-disease`, `internal-medicine`, `critical-care`.
- **Inputs:** chest-imaging abnormality, age, hemoptysis, dyspnea, unconsciousness,
  number of comorbidities, cancer history, neutrophil-to-lymphocyte ratio, lactate
  dehydrogenase, and direct bilirubin.
- **Output:** the **predicted probability of critical illness (%)** via the published
  logistic model (`1/(1+e^-x)` with the fixed coefficient block), mapped to the
  low/medium/high risk tiers. Class A (fixed 2020 coefficients). Cross-links
  `isaric-4c-mortality`.

### 2.3 `candida-score` — Candida Score (León)

- **Citation:** León C, Ruiz-Santana S, Saavedra P, et al. A bedside scoring system
  ("Candida score") for early antifungal treatment in nonneutropenic critically ill
  patients with Candida colonization. *Crit Care Med.* 2006;34(3):730-737.
- **citationUrl:** https://doi.org/10.1097/01.CCM.0000202208.37364.7D
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `infectious-disease`, `critical-care`, `nursing-icu`, `pharmacy`.
- **Inputs:** total parenteral nutrition (1); surgery on ICU admission (1);
  multifocal *Candida* colonization (1); severe sepsis (2).
- **Output:** the **total (0–5)** with the published threshold (a score **≥ 3**
  identifies patients in whom invasive candidiasis is likely and empiric antifungal
  therapy should be considered), naming the items counted. Class A. Cross-links the
  sepsis cluster.

### 2.4 `vacs-index` — Veterans Aging Cohort Study (VACS) Index

- **Citation:** Tate JP, Justice AC, Hughes MD, et al. An internationally
  generalizable risk index for mortality after one year of antiretroviral therapy.
  *AIDS.* 2013;27(4):563-572.
- **citationUrl:** https://doi.org/10.1097/QAD.0b013e32835b8c7f
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `infectious-disease`, `internal-medicine`, `primary-care`.
- **Inputs:** age, CD4 count, HIV-1 RNA (viral load), hemoglobin, FIB-4 (AST/ALT/
  platelets), eGFR, and hepatitis-C co-infection — each contributing the published
  component points.
- **Output:** the **VACS index total** with the published 5-year all-cause mortality
  framing, naming the component contributions. Class A (fixed component points).
  Cross-links `fib4` (whose value feeds a VACS component).

### 2.5 `regiscar-dress` — RegiSCAR Score for DRESS

- **Citation:** Kardaun SH, Sekula P, Valeyrie-Allanore L, et al. Drug reaction with
  eosinophilia and systemic symptoms (DRESS): an original multisystem adverse drug
  reaction. Results from the prospective RegiSCAR study. *Br J Dermatol.*
  2013;169(5):1071-1080.
- **citationUrl:** https://doi.org/10.1111/bjd.12501
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `dermatology`, `infectious-disease`, `internal-medicine`,
  `pharmacy`.
- **Inputs:** fever ≥ 38.5 °C; enlarged lymph nodes (≥ 2 sites); eosinophilia (count/
  percentage bands); atypical lymphocytes; skin involvement (extent, suggestive
  morphology, biopsy); organ involvement (count); resolution > 15 days; and exclusion
  of alternative causes — each scoring the published −1/0/+1/+2 weights.
- **Output:** the **total** mapped to the RegiSCAR certainty bands — **< 2 no case,
  2–3 possible, 4–5 probable, > 5 definite** DRESS — naming the weighted
  contributions. Class A. Cross-links the drug-reaction cluster.

## 3. Per-tile robustness

- **`isaric-4c-mortality`, `candida-score`, and `regiscar-dress` are banded/weighted
  additive logic** with bounded totals; each flows through the [spec-v59](spec-v59.md)
  fuzz harness and names which bands/items were counted, returning a surfaced
  complete-the-fields fallback rather than a partial total when a required input is
  blank. RegiSCAR's negative weights mean the total can go below zero; the band
  selection handles the full signed range.
- **`covid-gram` is a logistic model — guard the exponential.** It computes
  `x = β₀ + Σβᵢxᵢ` from the compiled coefficient block (re-fetched verbatim per the
  v97 lesson), **clamps `x` to a finite range** (e.g. [−40, 40]) before
  `1/(1+e^-x)`, and returns a surfaced `valid:false` fallback rather than a
  probability from `NaN`/`Infinity` when a required input is blank. The exponential is
  explicitly fuzzed for overflow.
- **`vacs-index` is component-point logic over banded labs** (some feeding FIB-4); each
  component clamps to its published band with a blank guard, and the FIB-4 sub-
  computation reuses the live `fib4` math (guarding the platelet denominator).
- All five render the [spec-v50](spec-v50.md) §3 clinical posture note and quote the
  source's interpretation; none authors a treat/admit/start-antifungal recommendation
  in Sophie's voice ([spec-v11](spec-v11.md) §5.3) — each reports the score/probability
  and the source's stated guidance.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all five are **Class A** (fixed additive points /
  logistic coefficients / component weights) — **no** `docs/citation-staleness.md`
  row. Each citation names the **journal and authors** (BMJ, JAMA Intern Med, Crit
  Care Med, AIDS, Br J Dermatol), not an issuing-society acronym, so
  `check-citations.mjs` `ISSUER_PATTERN` does not fire ([spec-v92](spec-v92.md)/
  [spec-v94](spec-v94.md) lesson — note the ISARIC-4C citation names ISARIC/WHO in the
  *protocol* title; verify the rendered string carries no bare acronym that trips the
  pattern, or fold the protocol reference into prose).
- **Build (§6.1):** `lib/id-v137.js` is the new compute module (`isaric4cMortality`,
  `covidGram`, `candidaScore`, `vacsIndex`, `regiscarDress`), with the COVID-GRAM
  coefficient block as compiled constants ([spec-v100](spec-v100.md) §5);
  `views/group-v137.js` is the new renderer module, exporting `RV137` into the
  `app.js` `RENDERERS` spread.
- **Gates (§6.2):** `lib/id-v137.js` is added to `test/unit/fuzz-tools.test.js`
  `MODULES` (zero non-finite leaks, with the COVID-GRAM logistic explicitly fuzzed for
  overflow); each `META` example is pinned by the chromium `example-correctness`
  sweep; the catalog count moves on all **13 catalog-truth surfaces**; a11y,
  `mobile-no-hscroll`, and 44px touch-target checks pass for `views/group-v137.js`.
- **Wave-close note:** with v137 Wave 6 of the [spec-v100](spec-v100.md) program is
  complete at **613** tiles (583 → 613, +30). `scope-mdcalc-parity.md` records the
  wave delta in the running ledger.

## 5. Files touched

```
docs/spec-v137.md                        (this file)
app.js                                   (+5 UTILITIES rows, group G; import group-v137 RV137 into RENDERERS)
lib/id-v137.js                           (new module: isaric4cMortality, covidGram, candidaScore, vacsIndex, regiscarDress; COVID-GRAM coefficient constants)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to curb-65, psi, fib4)
views/group-v137.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/isaric-4c-mortality.test.js, covid-gram.test.js, candida-score.test.js, vacs-index.test.js, regiscar-dress.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/id-v137.js to MODULES)
docs/audits/v12/isaric-4c-mortality.md, covid-gram.md, candida-score.md, vacs-index.md, regiscar-dress.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 608 -> 613; Wave 6 close: 583 -> 613, +30)
CHANGELOG.md                             (Unreleased: v137 entry, +5; Wave 6 complete note)
README.md, package.json                  (catalog count 608 -> 613; spec-progression line -> v137)
```

## 6. Acceptance criteria

v137 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  five ids are absent.
- All 5 tiles in §2 are live in Group G with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples each (including
  an **ISARIC-4C risk-group boundary** at a band edge, a worked **COVID-GRAM
  probability**, a **Candida score crossing the ≥ 3 threshold**, a worked **VACS
  total**, and a **RegiSCAR probable-vs-definite boundary**), a [spec-v11](spec-v11.md)
  audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- `covid-gram` clamps its logistic exponent and surfaces a `valid:false` fallback for
  missing inputs; `vacs-index`'s FIB-4 sub-computation guards the platelet
  denominator; all computes are covered by the [spec-v59](spec-v59.md) fuzz harness
  with zero non-finite leaks.
- `UTILITIES.length` is **613** (or live count + 5 if specs land out of order) and
  all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md`
  records Wave 6 complete (583 → 613, +30).
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v137 with the +5 catalog delta and the Wave 6 complete note.

## 7. Out of scope for v137

- **No microbiology, imaging, or lab-feed parsing** — each tile consumes the
  clinician-entered values and findings, not a culture, chest-imaging read, or lab
  feed.
- **No auto-antifungal / auto-antiviral / auto-admit order** — `candida-score` reports
  the threshold verdict, `covid-gram`/`isaric-4c-mortality` report the risk, and
  `regiscar-dress` reports the certainty band; the management decision stays with the
  clinician and local protocol.
- **No HIV-staging or ART-selection re-implementation** — `vacs-index` reports the
  mortality index only; it does not stage HIV or recommend a regimen.
- **No SCORTEN / SJS-TEN tile** — v137 covers DRESS certainty (RegiSCAR) only; the
  SJS/TEN severity score is not added here.
