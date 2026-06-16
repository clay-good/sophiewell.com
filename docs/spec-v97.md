# spec-v97.md — Perioperative risk prediction: Gupta MICA, Gupta respiratory failure, Arozullah pneumonia, El-Ganzouri airway, and POSPOM (+5 tiles)

> Status: **PROPOSED (2026-06-16).** Wave 2 of the
> [spec-v85](spec-v85.md) Advanced Clinical Calculators program
> ([§4](spec-v85.md) roster). Adds **5** deterministic perioperative risk
> instruments that fill confirmed gaps in the catalog's surgical-risk surface: two
> regression-based **probability** calculators (Gupta perioperative MICA and Gupta
> postoperative respiratory failure), two validated **weighted indices** (Arozullah
> postoperative pneumonia and the El-Ganzouri difficult-intubation index), and a
> preoperative **point-score mortality** model (POSPOM). The catalog already ships
> `rcri`, `ariscat`, `lemon`, `apfel`, and the [spec-v89](spec-v89.md) `asa-ps` and
> `surgical-apgar`, but it carries **no regression-based probability calculator**
> (Gupta MICA/respiratory, POSPOM) and **none** of the validated airway/pneumonia
> indices (El-Ganzouri/Arozullah). None duplicates an existing tile.
>
> Catalog effect at v97 close: **418 + 5 = 423 tiles.**
>
> Every prior spec (v4 through v96) remains in force. v97 adds no runtime network
> call and no AI; each tile obeys the [spec-v85](spec-v85.md) §2 doctrine and the
> [spec-v85](spec-v85.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog's perioperative surface is strong on the **screening indices** a
clinician runs in pre-op clinic — `rcri` (cardiac risk class), `ariscat`
(pulmonary-complication risk), `lemon` (difficult-airway screen), `apfel` (PONV
risk), and the [spec-v89](spec-v89.md) `asa-ps` and `surgical-apgar`. What it lacks
is the layer one rung up: the **published regression equations** that return an
actual *predicted probability* rather than a risk class, and the **validated
weighted indices** that the anesthesiologist and surgeon reach for when the case is
high-stakes.

- **A risk class is not a probability.** `rcri` returns a Lee class; the
  anesthesiologist and the consenting surgeon increasingly want the *number* —
  "what is this patient's predicted probability of perioperative MI or cardiac
  arrest?" The **Gupta MICA** model (Circulation 2011) answers exactly that with a
  fixed logistic equation over five inputs, and it is the model the ACS-NSQIP
  derivation popularized. There is no probability calculator of this shape in the
  catalog.

- **Respiratory failure is its own prediction.** `ariscat` scores *pulmonary
  complications* broadly; the **Gupta respiratory-failure** model (Chest 2011)
  predicts the specific, high-cost endpoint of mechanical ventilation > 48 h or
  unplanned reintubation, again as a published logistic probability. It is the
  respiratory companion to Gupta MICA and is absent.

- **Pneumonia has a validated weighted index.** The **Arozullah** postoperative
  pneumonia risk index (Ann Intern Med 2001) is the classic multifactorial,
  point-weighted instrument that maps a weighted total to one of five risk classes
  with a cited pneumonia probability. It is the pneumonia-specific companion to
  `ariscat` and is not in the catalog.

- **Difficult intubation has a multivariate score.** `lemon` is a bedside screen;
  the **El-Ganzouri Risk Index** (Anesth Analg 1996) is the weighted seven-factor
  multivariate index validated against difficult laryngoscopy, with the commonly
  cited threshold of ≥ 4. It is the quantitative airway companion to `lemon`.

- **Preoperative mortality has a point score.** **POSPOM** (Anesthesiology 2016) is
  the large-cohort-derived preoperative point score that maps age band, nine
  comorbidity categories, and a procedure-category weight to a predicted in-hospital
  mortality. No preoperative all-cause mortality calculator exists in the catalog.

Each is a published, deterministic instrument a physician already uses; v97 brings
them onto the page.

## 2. What v97 adds (5 tiles)

### 2.1 `gupta-mica` — Gupta perioperative cardiac risk (MI or cardiac arrest)

- **Citation:** Gupta PK, Gupta H, Sundaram A, et al. Development and validation of
  a risk calculator for prediction of cardiac risk after surgery. *Circulation.*
  2011;124(4):381-387.
- **citationUrl:** https://doi.org/10.1161/CIRCULATIONAHA.110.015701
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `surgery`, `cardiology`,
  `internal-medicine`.
- **Inputs:** age (years); ASA class (I–V); functional status (independent /
  partially dependent / totally dependent); abnormal creatinine (> 1.5 mg/dL,
  yes/no); surgery type (procedure category).
- **Output:** the **predicted probability (%) of perioperative MI or cardiac
  arrest** computed from the published logistic regression
  (probability = 1 / (1 + e^−x), x the linear predictor over the fixed coefficients),
  with the linear-predictor terms shown as a [spec-v48](spec-v48.md) derivation and
  the source's interpretation quoted. **Class A** — fixed regression coefficients;
  no staleness row. Cross-links `rcri` (the risk-class companion) and `asa-ps` (the
  ASA input).

### 2.2 `gupta-respiratory-failure` — Gupta postoperative respiratory failure risk

- **Citation:** Gupta H, Gupta PK, Fang X, et al. Development and validation of a
  risk calculator predicting postoperative respiratory failure. *Chest.*
  2011;140(5):1207-1215.
- **citationUrl:** https://doi.org/10.1378/chest.11-0466
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `surgery`, `pulmonology`.
- **Inputs:** ASA class; preoperative sepsis status; functional status; surgery
  type (procedure category); emergency case (yes/no).
- **Output:** the **predicted probability (%) of postoperative respiratory failure**
  (mechanical ventilation > 48 h or unplanned reintubation) from the published
  logistic model, with the linear-predictor derivation and the source's
  interpretation. **Class A.** Cross-links `ariscat` (the pulmonary-complication
  companion).

### 2.3 `arozullah-pneumonia` — Arozullah postoperative pneumonia risk index

- **Citation:** Arozullah AM, Khuri SF, Henderson WG, Daley J. Development and
  validation of a multifactorial risk index for predicting postoperative pneumonia
  after major noncardiac surgery. *Ann Intern Med.* 2001;135(10):847-857.
- **citationUrl:** https://doi.org/10.7326/0003-4819-135-10-200111200-00005
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `surgery`, `pulmonology`,
  `internal-medicine`.
- **Inputs:** the weighted index items — type of surgery; age band; functional
  status; preoperative weight loss > 10%; COPD; general anesthesia; impaired
  sensorium; history of CVA; BUN level bands; transfusion > 4 units; emergency
  surgery; chronic steroid use; current smoking; alcohol use; preoperative
  bilirubin.
- **Output:** the **weighted total** mapped to the cited **risk class (0–5)** with
  the source's pneumonia probability for that class, the contributing items shown as
  a derivation, and the source's interpretation. **Class A** — fixed point weights.
  Cross-links `ariscat`.

### 2.4 `el-ganzouri` — El-Ganzouri Risk Index for difficult intubation

- **Citation:** el-Ganzouri AR, McCarthy RJ, Tuman KJ, et al. Preoperative airway
  assessment: predictive value of a multivariate risk index. *Anesth Analg.*
  1996;82(6):1197-1204.
- **citationUrl:** https://doi.org/10.1097/00000539-199606000-00017
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `emergency-medicine`, `critical-care`.
- **Inputs:** mouth opening (< 4 cm, banded); thyromental distance (bands);
  Mallampati class (I–IV); neck movement (bands); inability to prognath (yes/no);
  weight (bands); history of difficult intubation.
- **Output:** the **weighted total** with the **difficult-laryngoscopy risk
  threshold** (commonly **≥ 4**) flagged, the contributing items shown as a
  derivation, and the source's interpretation. **Class A** — fixed point weights.
  Cross-links `lemon`.

### 2.5 `pospom` — Preoperative Score to Predict Postoperative Mortality

- **Citation:** Le Manach Y, Collins G, Rodseth R, et al. Preoperative Score to
  Predict Postoperative Mortality (POSPOM): derivation and validation.
  *Anesthesiology.* 2016;124(3):570-579.
- **citationUrl:** https://doi.org/10.1097/ALN.0000000000000972
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `anesthesiology`, `surgery`.
- **Inputs:** age band; nine comorbidity categories (each weighted); procedure-
  category weight.
- **Output:** the **total point score** with the corresponding **predicted
  in-hospital mortality (%)** from the published mapping, the contributing weights
  shown as a derivation, and the source's interpretation. **Class A** — fixed point
  table. Near-neighbors `rcri`/`asa-ps`/`surgical-apgar`, all kept.

## 3. Per-tile robustness

- **The Gupta logistic models guard `1 / (1 + e^−x)`.** The linear predictor `x` is
  clamped to a sane range before exponentiation so a large-magnitude `x` cannot
  produce `Infinity`/`0` overflow or a non-finite probability; the result is always
  a finite percentage in `[0, 100]`. Every categorical input (ASA class, functional
  status, surgery type, sepsis status, emergency) is validated against its fixed
  enum and maps to a known coefficient — an out-of-enum value returns a surfaced
  `valid:false` fallback, never a silent `NaN`. Age is range-clamped.
- **The weighted indices bound their sums.** `arozullah-pneumonia`, `el-ganzouri`,
  and `pospom` sum fixed integer point weights over validated categorical inputs;
  the total is bounded by the sum of the maximum weights and is always a finite
  integer. Each maps its total to a published class/probability band and names the
  band that fired so the determination is auditable; an unselected required input
  surfaces a prompt rather than scoring a partial total as final.
- **All five join the [spec-v59](spec-v59.md) fuzz harness** on import via
  `test/unit/fuzz-tools.test.js` MODULES; zero non-finite leaks across fuzzed
  inputs is a merge gate ([spec-v85](spec-v85.md) §6.2). Every compute uses
  `lib/num.js` for arithmetic and formatting.
- **Posture note ([spec-v50](spec-v50.md) §3 / [spec-v11](spec-v11.md) §5.3).** Each
  tile renders the clinical posture note and frames its output as a *probability
  estimate per the published model*, attributed to the cited source and the user's
  inputs — **not** a guarantee, not a clearance, and not a treatment recommendation
  in Sophie's voice. It surfaces the computation and the source's per-band
  interpretation; the decision to proceed, optimize, or cancel stays with the
  clinician and local protocol.

## 4. CI/CD & maintenance

All five tiles are **Class A** under the [spec-v85](spec-v85.md) §6.3 maintenance
taxonomy: each uses a **fixed regression equation or published point table** (Gupta
2011 coefficients, the Arozullah/El-Ganzouri point weights, the POSPOM 2016 score
table) that does not change on a calendar. Therefore:

- **No `docs/citation-staleness.md` rows** and **no `pa-staleness-ledger.json`
  entries** — Class A constants carry no staleness obligation
  ([spec-v85](spec-v85.md) §6.3). They can only change if the source paper is
  retracted or superseded, which the routine README-stats / citation re-verification
  pass catches ([spec-v85](spec-v85.md) §6.4). v97 introduces **no** Class B
  threshold, so it does not author `scripts/check-citation-cadence.mjs`.
- **The [spec-v85](spec-v85.md) §6.2 merge gates** apply unchanged: `eslint`;
  `grep-check.mjs` and `check-catalog-truth.mjs` (the 13 enforced catalog-count
  surfaces all equal `UTILITIES.length` = 423); `check-output-safety.mjs` (no raw
  `.toFixed()`/interpolation that can surface `NaN`); `check-citations.mjs` (the
  `ISSUER_PATTERN` acronym rule — these are journal citations, so no row is
  required); `a11y-check.mjs` (heading order, labels, contrast for `group-v23.js`);
  the Playwright `all-tools`/`smoke` route-boot, `mobile-no-hscroll`, and
  `mobile-touch-targets` suites.
- **Fuzz MODULES add.** `lib/periop-v97.js` is added to the
  `test/unit/fuzz-tools.test.js` `MODULES` list so all five computes are auto-fuzzed
  for non-finite leaks ([spec-v85](spec-v85.md) §6.2).
- **Example-correctness pin.** Each tile's `META` worked example renders **verbatim**
  on the page and is pinned by the chromium-only `example-correctness` sweep
  (flake-prone under CPU load; CI `retries:2`; rerun isolated to confirm)
  ([spec-v85](spec-v85.md) §6.2).
- **Build pipeline.** No build-script change beyond the five `UTILITIES` rows the
  builder already parses ([spec-v85](spec-v85.md) §6.1): `npm run build` emits
  `dist/` with `BUILD_HASH`, pre-renders `/tools/<id>/index.html` for each id,
  regenerates `sitemap.xml`/topic-hub pages/SW shell precache, and rebuilds
  `sbom.json`/`sbom.md` (the changed source legitimately changes the SBOM
  serialNumber — commit it).

## 5. Files touched

```
docs/spec-v97.md                          (this file)
app.js                                    (+5 UTILITIES rows, group G; import group-v23 renderers into RENDERERS)
lib/periop-v97.js                         (new module: guptaMica, guptaRespiratoryFailure, arozullahPneumonia, elGanzouri, pospom)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to rcri, ariscat, lemon, asa-ps)
views/group-v23.js                       (new renderer module: 5 renderers — Gupta logistic derivations, the weighted-index checklists, the POSPOM point table)
docs/clinical-citations.md               (+5 rows for the five perioperative sources)
test/unit/gupta-mica.test.js             (new; ≥3 boundary worked examples incl. a worked logistic probability)
test/unit/gupta-respiratory-failure.test.js  (new; ≥3 incl. emergency/sepsis band cases)
test/unit/arozullah-pneumonia.test.js    (new; ≥3 incl. risk-class edges 0–5)
test/unit/el-ganzouri.test.js            (new; ≥3 incl. the ≥4 difficult-laryngoscopy threshold)
test/unit/pospom.test.js                 (new; ≥3 incl. a point-total → mortality mapping)
test/unit/fuzz-tools.test.js             (add lib/periop-v97.js to MODULES)
docs/audits/v12/gupta-mica.md, gupta-respiratory-failure.md, arozullah-pneumonia.md, el-ganzouri.md, pospom.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 418 -> 423; append to the running ledger)
CHANGELOG.md                             (Unreleased: v97 entry, +5)
README.md, package.json                  (catalog count 418 -> 423; spec-progression line -> v97)
```

## 6. Acceptance criteria

v97 is fully shipped when:

- All 5 tiles in §2 are live in group `G` with a `META[id]` entry, an inline primary
  citation + `citationUrl` + `accessed`, ≥3 boundary worked examples in the unit test
  (including the band-flip cases), a [spec-v11](spec-v11.md) audit log, and a passing
  [spec-v29](spec-v29.md) §3 scope check.
- `gupta-mica` returns a worked logistic probability: for a stated set of inputs the
  test asserts `1 / (1 + e^−x)` to the published value, and the linear-predictor
  terms render in the derivation.
- `gupta-respiratory-failure` returns the published probability across at least the
  elective and the emergency/sepsis cases.
- `arozullah-pneumonia` maps its weighted total to the correct risk class across at
  least two **class edges** (a total at the boundary lands in the expected 0–5 class
  with its cited pneumonia probability).
- `el-ganzouri` flags difficult laryngoscopy at the **≥ 4 threshold** — a total of 3
  is below, a total of 4 is at/above — naming the threshold.
- `pospom` returns a worked **point-total → predicted in-hospital mortality (%)**
  mapping for at least one stated patient.
- The Gupta logistic `1 / (1 + e^−x)` is **guarded against overflow**: fuzzed
  large-magnitude linear predictors yield a finite probability in `[0, 100]`, never
  `NaN`/`Infinity`.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**
  (`lib/periop-v97.js` in `MODULES`).
- `UTILITIES.length` is **423** and all catalog-truth surfaces
  ([spec-v46](spec-v46.md)) — the 13 enforced count surfaces — agree.
- `npm run lint`, `npm run test`, `npm run test:e2e`, `npm run sbom`, and
  `npm run build` all pass.
- The CHANGELOG records v97 with the **+5** catalog delta (418 → 423).

## 7. Out of scope for v97

- **No ACS-NSQIP universal Surgical Risk Calculator.** It is a proprietary online
  model requiring a large input set and is **not a fixed published equation** the
  way Gupta MICA is — it fails the [spec-v85](spec-v85.md) §2 clause 1 / clause 2
  bar (input-driven deterministic equation, not a hosted model) and the
  [scope-mdcalc-parity §4](scope-mdcalc-parity.md) non-proprietary rule. Excluded.
- **No Mallampati auto-assessment.** The Mallampati class (an `el-ganzouri` input)
  is an examination finding entered by the clinician; the tile does not infer it from
  an image or other inputs.
- **No auto-clearance, cancellation, or disposition.** Each tile reports the model's
  predicted probability / score and the source's stated interpretation; the decision
  to proceed, optimize the patient, or cancel the case stays with the clinician and
  local protocol ([spec-v11](spec-v11.md) §5.3).
