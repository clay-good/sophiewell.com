# spec-v91.md — Pulmonary function & chronic respiratory disease: GOLD staging, BODE, GAP, predicted spirometry, and mMRC dyspnea (+5 tiles)

> Status: **SHIPPED (2026-06-16).** Wave 2 of the
> [spec-v85](spec-v85.md) Advanced Clinical Calculators program. Adds **5**
> deterministic pulmonary tiles that fill a confirmed gap: the catalog ships the
> *acute* respiratory surface — [`aa-pf-suite`](../app.js) (E),
> [`rox`](../app.js) (E), [`curb-65`](../app.js) (G),
> [`smart-cop`](../app.js) (G) — but **nothing for chronic respiratory staging or
> prognosis**. These five are the PFT-lab and the COPD/ILD clinic standards: the
> GOLD spirometric grade, the BODE multidimensional COPD prognosis, the GAP index
> for IPF, the GLI-2012 predicted-spirometry reference, and the mMRC dyspnea scale
> that feeds the other two. None duplicates an existing tile.
>
> Catalog effect at v91 close: **385 + 5 = 390 tiles.**
>
> Every prior spec (v4 through v90) remains in force. v91 adds no runtime network
> call and no AI; each tile obeys the [spec-v85](spec-v85.md) §2 doctrine, passes
> the [spec-v29](spec-v29.md) §3 one-line test, ships its primary citation inline
> ([spec-v54](spec-v54.md)), and inherits the [spec-v59](spec-v59.md) output-safety
> contract. v91 obeys the [spec-v85](spec-v85.md) §6 CI/CD contract; the cadence CI
> job [`scripts/check-citation-cadence.mjs`](../scripts/check-citation-cadence.mjs)
> is authored by [spec-v90](spec-v90.md) — v91 just uses it.

## 1. Thesis

The catalog's respiratory surface is **acute** — the A-a/P/F oxygenation suite, the
ROX index for HFNC failure, CURB-65 and SMART-COP for pneumonia severity. Every one
of those answers a question on the day of admission. **None of them stages a chronic
respiratory disease or prognosticates it**, and that is the question the pulmonology
clinic and the PFT lab live in.

- **COPD has a grade and a multidimensional prognosis, and both are deterministic.**
  The GOLD spirometric grade is a fixed branch on the post-bronchodilator
  FEV1/FVC ratio and FEV1 %predicted; the BODE index is a four-variable point sum
  with a published 4-year survival quartile. A clinician should run them, not recall
  the cut-points.

- **IPF has its own staging instrument.** The GAP index (sex, age, FVC%, DLCO%) maps
  to a stage with cited 1/2/3-year mortality — the textbook bedside prognosticator
  for idiopathic pulmonary fibrosis, and entirely absent from the catalog.

- **The PFT lab needs predicted values and a lower limit of normal.** Every
  spirometry report is read against the GLI-2012 reference equations. A
  predicted-FEV1/FVC + LLN tile is the conversion every report depends on, and it is
  exactly the [spec-v85](spec-v85.md) §5 compiled-constant case (the GLI coefficient
  sets are constants in the module, not a dataset).

- **The dyspnea scale is the connective tissue.** The mMRC grade is an input to BODE
  and to the GOLD ABE assessment; shipping it as its own tile makes those two
  auditable and gives the clinic the standalone scale it already uses.

Each is a published, deterministic instrument a clinician already uses; v91 brings
the chronic-respiratory layer onto the page beside the acute one.

## 2. What v91 adds (5 tiles)

### 2.1 `gold-spirometry` — GOLD spirometric classification of COPD

- **Citation:** Global Initiative for Chronic Obstructive Lung Disease (GOLD). Global
  Strategy for the Diagnosis, Management, and Prevention of COPD: 2024 Report.
- **citationUrl:** https://goldcopd.org
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `internal-medicine`, `family-medicine`,
  `nursing-floor`.
- **Inputs:** post-bronchodilator FEV1 (entered in L **or** %predicted, unit toggle),
  FVC, and the FEV1/FVC ratio (entered directly or computed from FEV1/FVC when both
  volumes are given).
- **Output:** **obstruction present** when post-bronchodilator FEV1/FVC < 0.70; then
  the **GOLD grade** off FEV1 %predicted — grade **1** (FEV1 ≥ 80% predicted), **2**
  (50–79%), **3** (30–49%), **4** (< 30%). The output names the grade and the
  ratio-vs-0.70 determination, and states that without obstruction (ratio ≥ 0.70) a
  GOLD spirometric grade is not assigned. **Class B** — GOLD revises annually, so a
  [`docs/citation-staleness.md`](citation-staleness.md) row with an **annual** cadence
  (§4). Cross-links [`bode-index`](#22-bode-index--multidimensional-copd-prognosis)
  and [`mmrc-dyspnea`](#25-mmrc-dyspnea--modified-mrc-dyspnea-scale).

### 2.2 `bode-index` — multidimensional COPD prognosis

- **Citation:** Celli BR, Cote CG, Marin JM, et al. The body-mass index, airflow
  obstruction, dyspnea, and exercise capacity index in chronic obstructive pulmonary
  disease. *N Engl J Med.* 2004;350(10):1005-1012.
- **citationUrl:** https://doi.org/10.1056/NEJMoa021322
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `internal-medicine`, `palliative-care`.
- **Inputs:** BMI, FEV1 %predicted, mMRC dyspnea grade (0–4), and 6-minute walk
  distance (m).
- **Output:** the **BODE total (0–10)** as the sum of four point variables —
  **B**ody-mass index (BMI ≤ 21 = 1 point, > 21 = 0); airflow **O**bstruction
  (FEV1% ≥ 65 = 0, 50–64 = 1, 36–49 = 2, ≤ 35 = 3); **D**yspnea
  (mMRC 0–1 = 0, 2 = 1, 3 = 2, 4 = 3); and **E**xercise capacity
  (6MWD ≥ 350 m = 0, 250–349 = 1, 150–249 = 2, ≤ 149 = 3) — shown as a per-variable
  derivation, with the cited **approximate 4-year survival quartile** for the score's
  band (0–2, 3–4, 5–6, 7–10). Cross-links
  [`mmrc-dyspnea`](#25-mmrc-dyspnea--modified-mrc-dyspnea-scale) and
  [`gold-spirometry`](#21-gold-spirometry--gold-spirometric-classification-of-copd).
  **Class A.**

### 2.3 `gap-ipf` — GAP index for idiopathic pulmonary fibrosis

- **Citation:** Ley B, Ryerson CJ, Vittinghoff E, et al. A multidimensional index and
  staging system for idiopathic pulmonary fibrosis. *Ann Intern Med.*
  2012;156(10):684-691.
- **citationUrl:** https://doi.org/10.7326/0003-4819-156-10-201205150-00004
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `critical-care`.
- **Inputs:** sex; age; FVC %predicted; DLCO %predicted (or "cannot perform").
- **Output:** the **GAP points** — **G**ender (male = 1, female = 0); **A**ge
  (> 60 = 1, > 65 = 2, ≤ 60 = 0); **P**hysiology FVC% (> 75% = 0, 50–75 = 1, < 50 = 2)
  and DLCO% (> 55% = 0, 36–55 = 1, ≤ 35 = 2, **cannot perform = 3**) — summing to a
  **GAP stage**: **I** (0–3 points), **II** (4–5), **III** (6–8), each shown with the
  cited 1-, 2-, and 3-year mortality estimate. The "cannot perform" DLCO option is the
  source's explicit highest-risk physiology limb and is surfaced as a selectable
  state, not a blank. **Class A.**

### 2.4 `predicted-spirometry` — GLI-2012 predicted FEV1/FVC + lower limit of normal

- **Citation:** Quanjer PH, Stanojevic S, Cole TJ, et al (Global Lung Function
  Initiative). Multi-ethnic reference values for spirometry for the 3–95-yr age range:
  the global lung function 2012 equations. *Eur Respir J.* 2012;40(6):1324-1343.
- **citationUrl:** https://doi.org/10.1183/09031936.00080312
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `pulmonology`, `respiratory-therapy`.
- **Inputs:** age, height (cm), sex, ethnicity group; optionally a measured FEV1 / FVC
  to compute % predicted.
- **Output:** the **predicted FEV1, FVC, and FEV1/FVC ratio** and the
  **lower limit of normal** (5th percentile, LLN) computed from the GLI-2012 reference
  equations for the selected ethnicity group; when a measured value is entered, the
  **% predicted** and the **above/below-LLN** flag are shown as a derivation.
  **Class B** — GLI is the standard but updates are possible, so a
  [`docs/citation-staleness.md`](citation-staleness.md) row with an
  **on-publication** cadence (§4). **Note:** the GLI-2012 coefficient sets (the
  ethnicity-group lookup-and-spline coefficients) are compiled **constants** in the
  module per [spec-v85](spec-v85.md) §5 — **not** a `data/` dataset and not a
  browsable index. Cross-links
  [`aa-pf-suite`](../app.js) and
  [`gold-spirometry`](#21-gold-spirometry--gold-spirometric-classification-of-copd)
  (which consumes FEV1 %predicted).

### 2.5 `mmrc-dyspnea` — modified MRC dyspnea scale

- **Citation:** Bestall JC, Paul EA, Garrod R, Newcombe RG, Jones PW, Wedzicha JA.
  Usefulness of the Medical Research Council (MRC) dyspnoea scale as a measure of
  disability in patients with chronic obstructive pulmonary disease. *Thorax.*
  1999;54(7):581-586.
- **citationUrl:** https://doi.org/10.1136/thx.54.7.581
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `pulmonology`, `internal-medicine`, `palliative-care`,
  `nursing-floor`.
- **Inputs:** a single 5-point grade selection (**0** breathless only with strenuous
  exercise; **1** short of breath hurrying on the level or up a slight hill;
  **2** walks slower than peers on the level, or stops for breath at own pace;
  **3** stops for breath after ~100 m or a few minutes on the level; **4** too
  breathless to leave the house, or breathless when dressing).
- **Output:** the **mMRC grade 0–4** with its descriptor; the result text notes the
  grade **feeds BODE and the GOLD ABE assessment** and cross-links
  [`bode-index`](#22-bode-index--multidimensional-copd-prognosis) and
  [`gold-spirometry`](#21-gold-spirometry--gold-spirometric-classification-of-copd).
  **Class A.**

## 3. Per-tile robustness

- **Grade inputs are clamped to their published range.** `mmrc-dyspnea` accepts only
  0–4 and refuses an out-of-range grade with a surfaced fallback; `bode-index` clamps
  the mMRC grade it consumes the same way, so a stray value can never index an
  undefined point. `gap-ipf` treats "cannot perform" DLCO as a first-class selectable
  state (3 points), never as a missing value.
- **`gold-spirometry` and `predicted-spirometry` guard the FEV1/FVC division.** A zero
  or blank FVC yields a surfaced "(complete all fields)" fallback, never a divide
  result that reaches the DOM as `Infinity`/`NaN`. The ratio is computed only when both
  volumes are finite and FVC > 0; when the ratio is entered directly it is range-checked
  to (0, 1].
- **`predicted-spirometry` reads compiled constants only.** The GLI-2012 coefficient
  sets are fixed module constants ([spec-v85](spec-v85.md) §5); the spline/LMS
  arithmetic guards its domains (no `ln` of a non-positive argument, no division by a
  zero coefficient) and returns a surfaced `valid:false` fallback rather than a `NaN`.
  An ethnicity group outside the GLI sets falls back to the "other/mixed" coefficient
  set the source defines, surfaced in the derivation.
- **Partial input yields a clear "(complete all fields)" message,** not a half-computed
  score. `bode-index` and `gap-ipf` require all of their variables before reporting a
  total/stage; each variable's per-point contribution is shown only once all are
  present.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness** on import
  (`lib/pulm-v91.js` added to `MODULES` in
  [`test/unit/fuzz-tools.test.js`](../test/unit/fuzz-tools.test.js)); zero non-finite
  leaks across fuzzed inputs is a merge gate.
- **All five render the [spec-v50](spec-v50.md) §3 clinical posture note** and quote
  the source's own per-band interpretation (GOLD grade, BODE survival quartile, GAP
  mortality); none authors a treatment recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3). They are mobile-first, single-thumb
  ([spec-v72](spec-v72.md)): numeric keypad inputs, 44px targets, and a top-to-bottom
  `<dl>` derivation with no horizontal scroll at 320px.

## 4. CI/CD & maintenance

v91 instantiates the [spec-v85](spec-v85.md) §6 contract; the §6.2 merge gates and the
§6.3 maintenance classes apply unchanged.

- **Class A — fixed coefficient / point table (no staleness row):**
  - `bode-index` — the Celli 2004 point cut-points and the 4-year survival quartiles
    are a published, fixed table; they change only if the source is superseded, which
    the routine citation pass catches.
  - `gap-ipf` — the Ley 2012 point weights and stage mortality estimates are likewise
    a fixed published table.
  - `mmrc-dyspnea` — the Bestall 1999 five-grade scale is a fixed instrument.
- **Class B — revisable guideline threshold (each gets a
  [`docs/citation-staleness.md`](citation-staleness.md) row naming the edition in
  force, the `accessed` date, and a review cadence):**
  - `gold-spirometry` — GOLD republishes the report **annually**; row cites the
    **2024 Report**, cadence **annual**.
  - `predicted-spirometry` — GLI is the reference standard but a new edition is
    possible; row cites **GLI-2012**, cadence **on-publication**.
- The §6.3 cadence CI job
  [`scripts/check-citation-cadence.mjs`](../scripts/check-citation-cadence.mjs)
  (authored by [spec-v90](spec-v90.md)) reads the two new rows and **warns** (never
  blocks, never auto-edits) when an `accessed` date ages past its cadence — converting
  "remember to check GOLD every year" into a calendar-driven prompt. `check-citations.mjs`
  already fails the build if the GOLD/GLI Class-B acronyms lack a row.
- The §6.4 update workflow governs any future GOLD/GLI revision: edit the single
  threshold/coefficient set in `lib/pulm-v91.js`, bump the `META` `accessed` and the
  staleness row, re-run the [spec-v11](spec-v11.md) audit (the worked example may move
  a band edge), and run the full gate set so `example-correctness` re-pins the example.
  The Class A tiles never enter this workflow.

## 5. Files touched

```
docs/spec-v91.md                         (this file)
app.js                                   (+5 UTILITIES rows — predicted-spirometry in group E, the other four in group G; import group-v17 renderers into RENDERERS)
lib/pulm-v91.js                          (new module: goldSpirometry, bodeIndex, gapIpf, predictedSpirometry, mmrcDyspnea; GLI-2012 coefficient sets as compiled constants per spec-v85 §5)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links per §2)
views/group-v17.js                       (new renderer module: 5 renderers — GOLD ratio/grade, BODE per-variable derivation, GAP stage, predicted-spirometry LLN derivation, mMRC grade selector)
docs/citation-staleness.md               (+ rows: gold-spirometry (GOLD 2024, annual), predicted-spirometry (GLI-2012, on-publication))
docs/clinical-citations.md               (+5 rows for the five pulmonary sources)
test/unit/gold-spirometry.test.js        (new; ≥3 boundary worked examples incl. the FEV1/FVC 0.70 cutoff + GOLD grade edges)
test/unit/bode-index.test.js             (new; ≥3 incl. a band edge and the BMI/6MWD point cut-points)
test/unit/gap-ipf.test.js                (new; ≥3 incl. the stage I/II/III edges and the "cannot perform" DLCO limb)
test/unit/predicted-spirometry.test.js   (new; ≥3 incl. a GLI predicted value, the LLN 5th-percentile, and a % predicted)
test/unit/mmrc-dyspnea.test.js           (new; ≥3 incl. each grade descriptor + the out-of-range clamp)
test/unit/fuzz-tools.test.js             (add lib/pulm-v91.js to MODULES)
docs/audits/v12/gold-spirometry.md, bode-index.md, gap-ipf.md, predicted-spirometry.md, mmrc-dyspnea.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 385 -> 390; append to the running ledger)
CHANGELOG.md                             (Unreleased: v91 entry, +5)
README.md, package.json                  (catalog count 385 -> 390; spec-progression line -> v91)
```

## 6. Acceptance criteria

v91 is fully shipped when:

- All 5 tiles in §2 are live in their stated group (`predicted-spirometry` in `E`, the
  other four in `G`) with a `META[id]` entry, an inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples in the unit test, a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 scope
  check.
- The ≥3 boundary examples per tile include: the **FEV1/FVC 0.70 cutoff** (obstruction
  present vs. not) and the **GOLD grade edges** (80% / 50% / 30%) for `gold-spirometry`;
  a **BODE band** edge (e.g. 2→3, the survival-quartile flip) for `bode-index`; the
  **GAP stage edges** (3→4, 5→6) and the cannot-perform-DLCO limb for `gap-ipf`; a
  **GLI predicted value and its LLN** (5th percentile) plus a % predicted for
  `predicted-spirometry`; and each grade descriptor plus the out-of-range clamp for
  `mmrc-dyspnea`.
- `gold-spirometry` reports obstruction at ratio 0.69 and none at 0.70, and assigns
  grades 1/2/3/4 at the 80/50/30 %predicted edges, naming the grade.
- `bode-index` and `gap-ipf` show a per-variable derivation, report a total/stage only
  with all fields present, and surface the cited survival/mortality band.
- `predicted-spirometry` computes the GLI-2012 predicted values and the LLN from
  compiled constants (no `data/` touched), and the % predicted + above/below-LLN flag
  when a measured value is entered.
- `mmrc-dyspnea` returns each grade with its descriptor and refuses an out-of-range
  grade with a surfaced fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with zero non-finite leaks.
- The revisable thresholds carry `accessed` + a `docs/citation-staleness.md` row:
  `gold-spirometry` (GOLD 2024, annual cadence), `predicted-spirometry` (GLI-2012,
  on-publication cadence); both are read by `check-citation-cadence.mjs`.
- `UTILITIES.length` is **390** and all 13 enforced catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run test:e2e`, `npm run sbom`, and
  `npm run build` all pass (the §6.2 gates).
- The CHANGELOG records v91 with the **+5** catalog delta.

## 7. Out of scope for v91

- **No spirometry-tracing import.** `predicted-spirometry` and `gold-spirometry`
  take entered FEV1/FVC values; importing or parsing a spirometer's flow-volume
  tracing is an ETL/file-ingestion path the [spec-v5](spec-v5.md) §2 and
  [spec-v29](spec-v29.md) §3 rules exclude.
- **No CAT (COPD Assessment Test) score.** The CAT is a copyrighted/registered
  instrument; per [spec-v85](spec-v85.md) §9 and
  [scope-mdcalc-parity §4](scope-mdcalc-parity.md) it is **excluded for licensing**.
  `mmrc-dyspnea` ships the public-domain dyspnea grade that the GOLD ABE assessment
  also accepts.
- **No auto-treatment-tier.** `gold-spirometry` reports the spirometric grade; the
  GOLD **ABE** group assignment that drives pharmacotherapy (and the inhaler-class
  selection) is a clinician decision left out of this spec
  ([spec-v11](spec-v11.md) §5.3) — the tiles report the grade/score and the source's
  stated interpretation, not the treatment.
