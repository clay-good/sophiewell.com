# spec-v180.md — Older-adult mortality & long-term-care prognosis: Lee, Schonberg, Walter, Suemoto, Mitchell MRI, ADEPT, and the CHESS scale (+7 tiles)

> Status: **SHIPPED 2 of 7 (2026-07-01, +2 → 816).** Feature spec of the
> [spec-v172](spec-v172.md) **Long-Term Care & Geriatric Assessment (LTC-GA)**
> program (umbrella §3.8), implementing the **older-adult mortality & LTC
> prognosis** cluster. Proposes **7** deterministic prognostic instruments that
> fill confirmed gaps in the elder-care / hospice-eligibility surface; none
> duplicates a live tile. **Live at this implementation:** `lee-mortality-index`
> (the Lee 4-year mortality point-table, all weights and validation-cohort bands
> cross-verified across the JAMA tables, the abstract/MDCalc, and the SoFOG PDF)
> and `chess-scale` (the interRAI CHESS 0–5 health-instability score, item set /
> cap / combination cross-verified across the interRAI official PDF, the CIHI
> LTCF guide, and the CIHI Contact Assessment job aid). **Deferred on the
> [spec-v97](spec-v97.md) ≥ 2-source verbatim bar:** `schonberg-index` (5-year
> weights are double-sourced, but the point→mortality-band percentages are
> single-sourced and the 9-year weights are image-locked), `walter-index`,
> `suemoto-index`, `mitchell-mri`, and `adept` (not re-verified against ≥ 2
> independent sources at this implementation; the MRI/ADEPT logistic forms would
> additionally need the spec-v140 odds-space guard). Each deferred tile re-opens
> when it clears the bar.
>
> Catalog effect: **live `UTILITIES.length` + 7** — the catalog-truth gate
> ([spec-v46](spec-v46.md)) enforces the live count + delta at build time; no
> number is copied from the umbrella (the running counts carry a known
> off-by-one).
>
> Every prior spec (v4 through v179) remains in force. v180 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine (re-binding [spec-v85](spec-v85.md) §2) — including the §2
> classification-tile clarification — and the [spec-v100](spec-v100.md) §6 CI/CD
> contract. Each passes the [spec-v29](spec-v29.md) §3 one-line test, ships its
> primary citation inline ([spec-v54](spec-v54.md)), inherits the
> [spec-v59](spec-v59.md) output-safety contract, renders the
> [spec-v50](spec-v50.md) §3 clinical-posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (no end-of-life / dosing order in Sophie's voice).
> **Every weight, coefficient, band, and lookup row is re-fetched and
> cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); nothing here is implemented from recall. Any
> uncertain point weight or mortality % carries an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag.

## 1. Thesis

The catalog already prognosticates around comorbidity (`charlson`), performance
status (`ecog-karnofsky`), and terminal-cancer survival (the
`palliative-prognostic-index` / `palliative-prognostic-score` pair). It does not
yet carry the **validated all-cause life-expectancy indices for the older adult**
— the ePrognosis set (Lee, Schonberg, Walter, Suemoto) — nor the
**advanced-dementia prognosis tools** (Mitchell MRI, ADEPT) and the **MDS/interRAI
health-instability scale** (CHESS) that the nursing home, the geriatric clinic,
and the hospice team reach for when deciding whether to screen, to refer, or to
shift the goals of care. v180 ships those seven. Each is a deterministic weighted
point sum mapped to a published mortality band; each is a **prognostic estimate
framed as decision support, never a prediction of an individual's death**.

- **Lee 4-year mortality index** — the community-dwelling older-adult life-table
  index (age, sex, comorbidity, function).
- **Schonberg index** — the 5-year and 9-year all-cause mortality index for
  older adults (age, sex, comorbidity, function, behaviors).
- **Walter index** — 1-year mortality after hospital discharge in the older adult.
- **Suemoto index** — the international 10-year mortality index.
- **Mitchell MRI** — the Mortality Risk Index for 6-month mortality in advanced
  dementia (MDS-based, nursing home).
- **ADEPT** — the Advanced Dementia Prognostic Tool for 6-month mortality.
- **CHESS scale** — the interRAI/MDS Changes in Health, End-stage disease, Signs
  and Symptoms scale (0–5), a marker of health instability and mortality risk.

## 2. What v180 adds (7 tiles)

### 2.1 `lee-mortality-index` — Lee 4-Year Mortality Index for Older Adults

- **Citation:** Lee SJ, Lindquist K, Segal MR, Covinsky KE. Development and
  validation of a prognostic index for 4-year mortality in older adults. *JAMA.*
  2006;295(7):801-808.
- **citationUrl:** https://doi.org/10.1001/jama.295.7.801
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `primary-care`, `internal-medicine`.
- **Inputs:** age band (e.g., 60–64 / 65–69 / 70–74 / 75–79 / 80–84 / ≥85, each
  with its published points *(verify at implementation, [spec-v97](spec-v97.md))*),
  male sex (+2), comorbid conditions (diabetes, cancer, chronic lung disease,
  heart failure, current smoker, each weighted), BMI < 25, and the functional
  items (difficulty bathing, difficulty walking several blocks, difficulty
  managing money, difficulty pushing/pulling heavy objects).
- **Output:** the **point total (~0–26)** mapped to the published **4-year
  mortality risk bands** (e.g., ≤5 ≈ 4%, 6–9 ≈ 15%, 10–13 ≈ 42%, ≥14 ≈ 64%
  *(verify at implementation, [spec-v97](spec-v97.md))*), naming the contributing
  factors. Class A. Part of the **ePrognosis** collection. Cross-links `charlson`
  and `ecog-karnofsky`.

### 2.2 `schonberg-index` — Schonberg Mortality Index

- **Citation:** Schonberg MA, Davis RB, McCarthy EP, Marcantonio ER. Index to
  predict 5-year mortality of community-dwelling adults aged 65 and older using
  data from the National Health Interview Survey. *J Gen Intern Med.*
  2009;24(10):1115-1122. Revalidation/9-year extension: Schonberg MA et al,
  *J Gerontol A Biol Sci Med Sci.* 2011.
- **citationUrl:** https://doi.org/10.1007/s11606-009-1073-y
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `primary-care`, `internal-medicine`.
- **Inputs:** age band, sex, comorbidity (diabetes, cancer, chronic lung disease,
  smoking), and function/health items (self-rated health, BMI, difficulty with
  ADLs/IADLs, hospitalization), each weighted *(verify at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **point total** mapped to the published **5-year and 9-year
  all-cause mortality risk bands**, naming the contributors. Class A. ePrognosis
  collection. Cross-links `lee-mortality-index` and `charlson`.

### 2.3 `walter-index` — Walter 1-Year Post-Discharge Mortality Index

- **Citation:** Walter LC, Brand RJ, Counsell SR, et al. Development and
  validation of a prognostic index for 1-year mortality in older adults after
  hospitalization. *JAMA.* 2001;285(23):2987-2994.
- **citationUrl:** https://doi.org/10.1001/jama.285.23.2987
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `internal-medicine`, `primary-care`.
- **Inputs:** male sex, dependence in ADLs at discharge (graded), congestive
  heart failure, cancer (solid +, metastatic ++), serum creatinine > 3.0 mg/dL,
  and low serum albumin (3.0–3.4 / < 3.0 g/dL), each weighted *(verify at
  implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **point total (0–~10)** mapped to the published **1-year
  mortality risk groups** (e.g., low ≈ 4% / intermediate / high / very high
  ≈ 64% *(verify at implementation, [spec-v97](spec-v97.md))*), naming the
  factors. Class A. ePrognosis collection. Cross-links `charlson`.

### 2.4 `suemoto-index` — Suemoto 10-Year Mortality Index

- **Citation:** Suemoto CK, Ueda P, Beltrán-Sánchez H, et al. Development and
  validation of a 10-year mortality prediction model: meta-analysis of individual
  participant data from five cohorts of older adults. *J Gerontol A Biol Sci Med
  Sci.* 2017;72(3):410-416.
- **citationUrl:** https://doi.org/10.1093/gerona/glw166
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `primary-care`, `internal-medicine`.
- **Inputs:** age, sex, comorbidities (diabetes, cancer, chronic lung disease,
  heart disease, stroke), function (ADL/IADL difficulty, mobility), and behaviors
  (current smoking, physical activity), each weighted *(verify at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **point total** mapped to the published **10-year mortality
  risk band**, naming the contributors. Class A. ePrognosis collection.
  Cross-links `lee-mortality-index` and `charlson`.

### 2.5 `mitchell-mri` — Mortality Risk Index for Advanced Dementia

- **Citation:** Mitchell SL, Kiely DK, Hamel MB, et al. Estimating prognosis for
  nursing home residents with advanced dementia. *JAMA.*
  2004;291(22):2734-2740.
- **citationUrl:** https://doi.org/10.1001/jama.291.22.2734
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `palliative-care`, `nursing-general`.
- **Inputs:** the 12 MDS-based risk factors, each weighted — complete ADL
  dependence, male sex, cancer, congestive heart failure, O₂ therapy within
  14 days, shortness of breath, < 25% of food eaten at most meals, unstable
  medical condition, bowel incontinence, bedfast, age > 83, not awake most of the
  day *(verify the per-factor weights at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **score** mapped to the published **6-month mortality
  probability bands** (graded from the lowest score band ≈ 8.9% up to the highest
  ≈ 70% *(verify at implementation, [spec-v97](spec-v97.md))*), naming the
  factors. Class A. Cross-links `fast-dementia` ([spec-v173](spec-v173.md)) and
  `adept`.

### 2.6 `adept` — Advanced Dementia Prognostic Tool

- **Citation:** Mitchell SL, Miller SC, Teno JM, et al. Prediction of 6-month
  survival of nursing home residents with advanced dementia using ADEPT vs
  hospice eligibility guidelines. *JAMA.* 2010;304(17):1929-1935.
- **citationUrl:** https://doi.org/10.1001/jama.2010.1572
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `palliative-care`, `nursing-general`.
- **Inputs:** the weighted MDS variables — age, sex, dyspnea, pressure ulcers
  (stage ≥ 2), total functional dependence, bedfast, insufficient intake,
  bowel incontinence, BMI, weight loss, congestive heart failure, each with its
  published weight *(verify at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **risk score** predicting **6-month mortality**, mapped to the
  published probability bands, naming the contributors. Class A. The validation
  found ADEPT **modestly outperformed the FAST stage-7 hospice-eligibility
  guidelines** (slightly higher area under the ROC curve) — the renderer notes
  this without asserting hospice eligibility. Cross-links `mitchell-mri` and
  `fast-dementia` ([spec-v173](spec-v173.md)).

### 2.7 `chess-scale` — CHESS Scale (Changes in Health, End-stage disease, Signs and Symptoms)

- **Citation:** Hirdes JP, Frijters DH, Teare GF. The MDS-CHESS scale: a new
  measure to predict mortality in institutionalized older people. *J Am Geriatr
  Soc.* 2003;51(1):96-100.
- **citationUrl:** https://doi.org/10.1034/j.1601-5215.2002.51017.x
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `geriatrics`, `nursing-rehab`, `palliative-care`.
- **Inputs:** the MDS/interRAI-derived items — decline in cognition, decline in
  ADL, end-stage disease (≤ 6 months to live), and the health-instability
  symptoms (dyspnea, edema, dehydration, vomiting, weight loss, insufficient
  fluid/food intake), combined by the published algorithm *(verify the item
  combination and capping at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **CHESS score (0–5)**; higher = greater health instability and
  mortality risk, naming the items. Class A. The interRAI/MDS scoring method is
  **public** (the *derived* scale is published and shippable per
  [spec-v172](spec-v172.md) §4); **no `docs/citation-staleness.md` row** is
  required (it is a journal-published, public-method instrument, not a
  society-issued criteria set). Cross-links `mitchell-mri`.

## 3. Per-tile robustness

- **Every tile is a bounded weighted point sum mapped to published mortality
  bands.** Each names which factors were counted; band boundaries are unit-tested
  at each transition.
- **The six point-to-probability models — `lee-mortality-index`,
  `schonberg-index`, `walter-index`, `suemoto-index`, `mitchell-mri`, `adept` —
  compute in odds/log space and never sigmoid-then-`1−p`.** When a logistic risk
  model is evaluated by the naive `1 − sigmoid(−bx)` route at a large positive
  `bx`, `sigmoid` saturates to a float64 `1.0` (`e^{−bx} < machine-ε`), so
  `1 − p = 0` → a downstream `Infinity`/`NaN` leak — exactly the
  [spec-v140](spec-v140.md) EOS-calculator hazard. These tiles therefore work in
  **odds space** (`odds = e^{bx}`, `prob = odds / (1 + odds)`) and clamp the
  reported probability to the published band rather than recomputing a complement.
  Where these indices are published as a **point total → observed mortality
  band** (Lee/Schonberg/Walter as life-table point models) the mapping is a
  table lookup with no exponentiation at all; where a tile carries a true
  logistic equation (`mitchell-mri`/`adept` coefficient forms) the odds-space
  guard applies. The implementing session confirms which form each index uses
  *(verify at implementation, [spec-v97](spec-v97.md))*.
- **`chess-scale` is a capped 0–5 combination** of the cognition/ADL-decline and
  symptom items; the cap at 5 is enforced after the algorithmic combination so a
  high symptom load cannot overflow the published range.
- **Blank or non-finite inputs render a complete-the-fields fallback**, never a
  value derived from `NaN`; every division (any `odds/(1+odds)` or BMI-band
  derivation) is finite- and positive-checked, and every compute routes through
  `lib/num.js`.
- All seven flow through the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks** — the logistic mortality models are fuzzed explicitly in
  **odds space** for the saturation/overflow path.
- **These are PROGNOSTIC ESTIMATES.** Every tile renders the [spec-v50](spec-v50.md)
  §3 clinical-posture note and quotes the source's interpretation, explicitly
  framed as **decision support for life-expectancy-informed care planning, not a
  prediction of an individual resident's death**. None authors an end-of-life,
  hospice-enrollment, or goals-of-care order in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3); the decision stays with the clinician, the
  resident/family, and local protocol.

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding
[spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** all seven tiles are **Class A** — fixed
  formulas / point tables / a public interRAI-MDS method, each cited by journal +
  authors. **No tile names a society/consensus issuer that trips
  `ISSUER_PATTERN`** ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md) lesson):
  Lee/Schonberg/Walter/Suemoto/Mitchell/ADEPT are JAMA / J Gen Intern Med /
  J Gerontol journal formulas, and CHESS is a J Am Geriatr Soc public-method
  scale — so **no `docs/citation-staleness.md` row is required**. The
  implementing session confirms the pattern result at build time rather than from
  this document.
- **Build & gates (§6.1/§6.2):** the seven computes live in the new
  `lib/ltcga-v180.js` module (`leeMortalityIndex`, `schonbergIndex`,
  `walterIndex`, `suemotoIndex`, `mitchellMri`, `adept`, `chessScale`), added to
  the `test/unit/fuzz-tools.test.js` `MODULES` list — **the logistic mortality
  models are fuzzed in odds space** for the [spec-v140](spec-v140.md)
  saturation/overflow path (zero non-finite leaks). Renderers live in the new
  `views/group-v180.js` module; its `RV180` export is spread into the `app.js`
  `RENDERERS` map. Every input carries a real `<label for>`. The catalog count
  moves on all **13 catalog-truth surfaces** ([spec-v46](spec-v46.md)) in the
  same change, using the **live `UTILITIES.length` + 7**; a11y,
  `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass for `views/group-v180.js`.
- **Specialties** are drawn from the closed vocabulary
  (`test/unit/specialty-coverage.test.js`): `geriatrics`, `palliative-care`,
  `primary-care`, `internal-medicine`, `nursing-general`, `nursing-rehab` — all
  already in the vocabulary (no edit required).
- **Program note:** v180 is the §3.8 cluster of the [spec-v172](spec-v172.md)
  LTC-GA program. `scope-mdcalc-parity.md` records the v180 delta against the
  live count and the running LTC-GA program total.

## 5. Files touched

```
docs/spec-v180.md                        (this file)
app.js                                   (+7 UTILITIES rows, all Group G; import group-v180 RV180 into RENDERERS)
lib/ltcga-v180.js                        (new module: leeMortalityIndex, schonbergIndex, walterIndex, suemotoIndex, mitchellMri, adept, chessScale)
lib/meta.js                              (+7 META entries: inline citation + citationUrl + accessed; cross-links to charlson, ecog-karnofsky, palliative-prognostic-index, palliative-prognostic-score, fast-dementia)
views/group-v180.js                      (new renderer module: 7 renderers)
docs/clinical-citations.md               (+7 rows for the seven sources)
test/unit/lee-mortality-index.test.js, schonberg-index.test.js, walter-index.test.js, suemoto-index.test.js, mitchell-mri.test.js, adept.test.js, chess-scale.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ltcga-v180.js to MODULES — NOTE: the logistic mortality models lee/schonberg/walter/suemoto/mitchell/adept are fuzzed in ODDS SPACE per spec-v140, asserting zero non-finite leaks at large bx)
docs/audits/v12/lee-mortality-index.md, schonberg-index.md, walter-index.md, suemoto-index.md, mitchell-mri.md, adept.md, chess-scale.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+7; record the v180 LTC-GA §3.8 cluster delta)
CHANGELOG.md                             (Unreleased: v180 entry, +7)
README.md, package.json                  (catalog count live -> live+7; spec-progression line -> v180)
```

## 6. Acceptance criteria

v180 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all seven ids are absent.
- All 7 tiles in §2 are live (Group G, Class A) with a `META[id]` entry, an
  inline primary citation + `citationUrl` + `accessed`, ≥3 boundary worked
  examples each — **each example crossing a published mortality-band boundary**,
  including:
  - a **Lee points → 4-year-band transition** (e.g., a 5→6 point move that flips
    the lowest band to the next);
  - a **Schonberg 5-year and 9-year band crossing** at a published cut-point;
  - a **Walter 1-year risk-group flip** (e.g., low → intermediate);
  - a **Suemoto 10-year band crossing**;
  - a **Mitchell MRI 6-month-mortality band flip** (a point move that crosses a
    published probability band);
  - an **ADEPT risk-score band crossing**; and
  - a **CHESS 2 → 3** transition.
- Each tile has a [spec-v11](spec-v11.md) audit log and a passing
  [spec-v29](spec-v29.md) §3 check; each renders the [spec-v50](spec-v50.md) §3
  posture note and the decision-support (not death-prediction) framing, with **no
  end-of-life order in Sophie's voice** ([spec-v11](spec-v11.md) §5.3).
- The six point-to-probability models **compute in odds/log space** and are
  fuzzed for the [spec-v140](spec-v140.md) saturation path; `chess-scale` caps at
  0–5; blank inputs render a complete-the-fields fallback.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live count + 7** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) agree; `scope-mdcalc-parity.md` records the v180
  LTC-GA §3.8 cluster delta.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v180 with the +7 catalog delta.

## 7. Out of scope for v180

- **No FRAX** — the WHO fracture-risk algorithm uses **closed, non-public
  coefficients** and fails the [spec-v97](spec-v97.md) free-reproducibility bar;
  excluded per [spec-v172](spec-v172.md) §4.
- **No hospice Local Coverage Determinations** — these are **reference policy
  documents, not a calculator** (fail [spec-v29](spec-v29.md) §3 /
  [spec-v100](spec-v100.md) §2); excluded per [spec-v172](spec-v172.md) §4.
- **No duplication of the live comorbidity / terminal-cancer tiles** — `charlson`
  (comorbidity) and the `palliative-prognostic-index` / `palliative-prognostic-score`
  pair (terminal-cancer survival) are **complementary** to the all-cause
  life-expectancy indices v180 ships and are cross-linked, not re-shipped.
- **No PPS (Palliative Performance Scale)** — reserved in the
  [spec-v150](spec-v150.md)–[spec-v171](spec-v171.md) drafts and excluded from the
  [spec-v172](spec-v172.md) LTC-GA program; not re-shipped here.
- **No automatic prognosis-driven order** — each tile reports the score and the
  source's interpretation as decision support; the goals-of-care / hospice
  decision stays with the clinician, the resident and family, and local protocol
  ([spec-v11](spec-v11.md) §5.3).
```
