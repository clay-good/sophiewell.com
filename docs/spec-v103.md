# spec-v103.md — CV risk & prevention engines: SCORE2, SCORE2-OP, MESA-CHD, Framingham CVD, Reynolds, and non-HDL/remnant cholesterol (+6 tiles)

> Status: **SHIPPED (2026-06-18).** Feature spec of the [spec-v100](spec-v100.md)
> MDCalc Parity Completion program, **Wave 1** (Cardiology / EP / vascular / lipids).
> Adds **6** deterministic 10-year cardiovascular-risk engines and atherogenic-lipid
> fractions that fill confirmed gaps. None duplicates a live tile.
>
> Catalog effect: **441 + 6 = 447 tiles.** (The roster pre-assumed a 442 start;
> spec-v102 shipped +4 not +5 because `gwtg-hf` was deferred, so the actual base was
> 441. Shipped via `lib/cvrisk-v103.js` + `views/group-v28.js` (`RV28`); coefficients
> re-fetched verbatim from the published supplements/papers and cross-verified against
> the ESC worked examples and the CVrisk / RiskScorescvd open-source implementations.)
>
> Every prior spec (v4 through v100) remains in force. v103 adds no runtime network
> call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2 doctrine (which
> re-binds the [spec-v85](spec-v85.md) §2 suite doctrine) and the
> [spec-v100](spec-v100.md) §6 CI/CD contract, passes the [spec-v29](spec-v29.md) §3
> one-line test, ships its primary citation inline ([spec-v54](spec-v54.md)), and
> inherits the [spec-v59](spec-v59.md) output-safety contract.

## 1. Thesis

The catalog ships the US primary-prevention engines (`ascvd` Pooled Cohort, `prevent`)
but is missing the European SCORE2 family, the two well-known alternative US/global
risk engines, and the atherogenic-lipid fractions a lipidologist computes by hand:

- **No SCORE2.** The 2021 ESC engine (age 40–69, region-calibrated) is the European
  primary-prevention standard and is reachable nowhere.
- **No SCORE2-OP.** The older-persons companion (age ≥ 70) extends SCORE2 and is
  absent.
- **No MESA CHD risk with CAC.** The MESA engine is the standard tool for refining
  10-year CHD risk with an Agatston coronary-artery-calcium score; nothing ships.
- **No Framingham general CVD.** The 2008 D'Agostino general-CVD engine is a widely
  taught alternative and is missing.
- **No Reynolds Risk Score.** The engine that adds hsCRP and family history is absent.
- **No non-HDL / remnant cholesterol tile.** `ldl-calc` computes LDL but not the
  atherogenic non-HDL and remnant fractions the lipid guidelines emphasize.

Each is a published, deterministic instrument a clinician already uses; v103 brings
them onto the page. The CV-risk engines **complement, never replace**, the existing
`ascvd`/`prevent`.

## 2. What v103 adds (6 tiles)

### 2.1 `score2` — SCORE2 (ESC 2021, age 40–69)

- **Citation:** SCORE2 working group and ESC Cardiovascular Risk Collaboration. SCORE2
  risk prediction algorithms: new models to estimate 10-year risk of cardiovascular
  disease in Europe. *Eur Heart J.* 2021;42(25):2439-2454.
- **citationUrl:** https://doi.org/10.1093/eurheartj/ehab309
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `primary-care`,
  `family-medicine`.
- **Inputs:** age, sex, smoking, systolic BP, total cholesterol, HDL cholesterol, and
  **risk region** (low / moderate / high / very-high), which selects the calibration
  coefficient set.
- **Output:** the **10-year fatal + non-fatal CVD risk (%)** via the published
  region-calibrated transformation, with the age-banded ESC risk category (low-to-
  moderate / high / very-high). **Class B** (the ESC SCORE2 region coefficients are
  recalibrated on a calendar → `docs/citation-staleness.md` row, on-publication
  cadence). The region coefficient table is a **compiled constant** per
  [spec-v100](spec-v100.md) §5, not a dataset.

### 2.2 `score2-op` — SCORE2-OP (ESC 2021, age ≥ 70)

- **Citation:** SCORE2-OP working group and ESC Cardiovascular Risk Collaboration.
  SCORE2-OP risk prediction algorithms: estimating incident cardiovascular event risk
  in older persons. *Eur Heart J.* 2021;42(25):2455-2467.
- **citationUrl:** https://doi.org/10.1093/eurheartj/ehab312
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `geriatrics`,
  `primary-care`.
- **Inputs:** age (≥ 70), sex, smoking, systolic BP, total cholesterol, HDL, diabetes,
  and risk region.
- **Output:** the **10-year CVD risk (%)** via the older-persons recalibration, with
  the ESC category. **Class B** (region coefficients recalibrated on a calendar →
  `docs/citation-staleness.md` row, on-publication cadence). Cross-links `score2`.

### 2.3 `mesa-chd` — MESA 10-Year CHD Risk (with coronary calcium)

- **Citation:** McClelland RL, Jorgensen NW, Budoff M, et al. 10-year coronary heart
  disease risk prediction using coronary artery calcium and traditional risk factors:
  derivation in the Multi-Ethnic Study of Atherosclerosis. *J Am Coll Cardiol.*
  2015;66(15):1643-1653.
- **citationUrl:** https://doi.org/10.1016/j.jacc.2015.08.035
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `primary-care`,
  `family-medicine`.
- **Inputs:** age, sex, race/ethnicity, diabetes, current smoking, total and HDL
  cholesterol, lipid-lowering therapy, systolic BP, antihypertensive therapy, family
  history of MI, and **Agatston CAC score** (with and without CAC).
- **Output:** the **10-year CHD risk (%)** via the published logistic/Cox transform,
  reported with and without the CAC term. Class A (fixed 2015 coefficients).
  Robustness: the logistic exponent is clamped to an overflow-safe range and `ln(1 +
  CAC)` is domain-guarded (CAC ≥ 0).

### 2.4 `framingham-cvd` — Framingham General CVD Risk (2008)

- **Citation:** D'Agostino RB Sr, Vasan RS, Pencina MJ, et al. General cardiovascular
  risk profile for use in primary care: the Framingham Heart Study. *Circulation.*
  2008;117(6):743-753.
- **citationUrl:** https://doi.org/10.1161/CIRCULATIONAHA.107.699579
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `primary-care`,
  `family-medicine`.
- **Inputs:** age, sex, total and HDL cholesterol, systolic BP, BP-treatment status,
  smoking, diabetes.
- **Output:** the **10-year general-CVD risk (%)** via the sex-specific Cox model, with
  the "vascular age" companion the paper publishes. Class A (fixed 2008 coefficients).
  The `ln()` transforms of the continuous predictors are domain-guarded (positive
  inputs).

### 2.5 `reynolds-risk` — Reynolds Risk Score

- **Citation:** Ridker PM, Buring JE, Rifai N, Cook NR. Development and validation of
  improved algorithms for assessment of global cardiovascular risk in women: the
  Reynolds Risk Score. *JAMA.* 2007;297(6):611-619; and Ridker PM, Paynter NP, Rifai N,
  et al. *Circulation.* 2008;118(22):2243-2251 (men).
- **citationUrl:** https://doi.org/10.1001/jama.297.6.611
- **Group:** Clinical Scoring & Risk (`G`).
- **Specialties:** `cardiology`, `internal-medicine`, `primary-care`,
  `family-medicine`.
- **Inputs:** age, sex, systolic BP, smoking, total and HDL cholesterol, hsCRP, HbA1c
  (if diabetic), and parental history of MI before age 60.
- **Output:** the **10-year CVD risk (%)** via the sex-specific published model. Class A
  (fixed 2007/2008 coefficients). The `ln(hsCRP)` term is domain-guarded (hsCRP > 0).

### 2.6 `non-hdl-remnant` — Non-HDL & Remnant Cholesterol

- **Citation:** Varbo A, Benn M, Tybjærg-Hansen A, et al. Remnant cholesterol as a
  causal risk factor for ischemic heart disease. *J Am Coll Cardiol.*
  2013;61(4):427-436.
- **citationUrl:** https://doi.org/10.1016/j.jacc.2012.08.1026
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `cardiology`, `internal-medicine`, `primary-care`,
  `pharmacy`.
- **Inputs:** total cholesterol, HDL cholesterol, LDL cholesterol (measured or
  calculated), in mg/dL or mmol/L.
- **Output:** **non-HDL = TC − HDL** and **remnant = TC − HDL − LDL**, with the unit
  preserved and the guideline non-HDL target context (e.g. non-HDL < 130 mg/dL).
  Class A (arithmetic identity, no coefficients).

## 3. Per-tile robustness

- **`mesa-chd`, `framingham-cvd`, and `reynolds-risk` are logistic/Cox engines.**
  Each computes risk as `1 − S₀^exp(Σβx − mean)` (or the equivalent logistic), with the
  exponent **clamped to an overflow-safe range** so an extreme fuzzed predictor returns
  a probability in [0, 1] rather than `Infinity`; every `ln()` of a continuous
  predictor guards a positive domain and returns a surfaced `valid:false` on a
  non-positive or blank input.
- **`score2` / `score2-op` guard their region lookup.** The risk-region selector keys
  the compiled coefficient block; an unrecognized region returns a surfaced fallback
  rather than reading `undefined` coefficients, and the published transform is
  clamped to [0, 1].
- **`non-hdl-remnant` is an arithmetic identity** with no overflow surface; it flags an
  implausible negative remnant (LDL + HDL > TC, a data-entry error) rather than
  printing a negative concentration, and preserves the input unit.
- All six run the [spec-v59](spec-v59.md) fuzz harness, render the
  [spec-v50](spec-v50.md) §3 clinical posture note, and quote the source's
  interpretation; none authors a statin-start or lipid-target prescription in Sophie's
  voice ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract (re-binding [spec-v85](spec-v85.md) §6):

- **Maintenance classes (§6.3):** `mesa-chd`, `framingham-cvd`, `reynolds-risk`, and
  `non-hdl-remnant` are **Class A** (fixed derivation papers / coefficients / identity)
  — **no** staleness row; their citations name the **journal + authors**, not a
  society, to avoid the `ISSUER_PATTERN` false-positive. `score2` and `score2-op` (ESC
  region-recalibrated coefficient tables) are **Class B** — each gets a
  `docs/citation-staleness.md` row naming the 2021 ESC edition / region table in force,
  the `accessed` date, and an on-publication (region-recalibration) cadence, monitored
  by `scripts/check-citation-cadence.mjs`.
- **Gates (§6.2):** `lib/cvrisk-v103.js` joins the `test/unit/fuzz-tools.test.js`
  `MODULES` list (zero non-finite leaks; the logistic/Cox exponents and the SCORE2
  region transform **explicitly fuzzed for overflow**); each `META` example is pinned by
  the chromium `example-correctness` sweep; the catalog count moves on all **13
  catalog-truth surfaces**; a11y, `mobile-no-hscroll`, and 44px touch-target checks pass
  for the new `views/group-v28.js` renderer (`RV28` added to the `app.js` `RENDERERS`
  spread). The SCORE2 region coefficient block is authored as a **compiled constant**
  in `lib/cvrisk-v103.js`, re-fetched verbatim from the published supplement per the
  v97 "re-fetch, never recall coefficients" lesson — no `data/` directory is added.

## 5. Files touched

```
docs/spec-v103.md                        (this file)
app.js                                   (+6 UTILITIES rows, groups G & E; import group-v28 RV28 into RENDERERS)
lib/cvrisk-v103.js                       (new module: score2, score2Op, mesaChd, framinghamCvd, reynoldsRisk, nonHdlRemnant; + compiled SCORE2 region coefficients)
lib/meta.js                              (+6 META entries: inline citation + citationUrl + accessed; cross-links to ascvd, prevent, ldl-calc)
views/group-v28.js                       (new renderer module: 6 renderers; incl. SCORE2 risk-region selector + CAC input for mesa-chd)
docs/citation-staleness.md               (+ rows: score2 2021 ESC region table, score2-op 2021 ESC region table)
docs/clinical-citations.md               (+ rows for the six sources)
test/unit/score2.test.js, score2-op.test.js, mesa-chd.test.js, framingham-cvd.test.js, reynolds-risk.test.js, non-hdl-remnant.test.js  (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/cvrisk-v103.js to MODULES)
docs/audits/v12/score2.md, score2-op.md, mesa-chd.md, framingham-cvd.md, reynolds-risk.md, non-hdl-remnant.md  (spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count 441 -> 447; Wave 1 progress)
CHANGELOG.md                             (Unreleased: v103 entry, +6)
README.md, package.json                  (catalog count 441 -> 447; spec-progression line -> v103)
```

## 6. Acceptance criteria

v103 is fully shipped when:

- The implementing session has **re-run the §6.2 collision check** and confirmed all
  six ids are absent.
- All 6 tiles in §2 are live in their group (`score2`/`score2-op`/`mesa-chd`/
  `framingham-cvd`/`reynolds-risk` in G, `non-hdl-remnant` in E) with a `META[id]`
  entry, an inline primary citation + `citationUrl` + `accessed`, ≥ 3 boundary worked
  examples each — including a SCORE2 low- vs high-region risk-category flip at a fixed
  profile, a SCORE2-OP age ≥ 70 worked risk, a MESA risk with-CAC vs without-CAC
  delta, a Framingham worked 10-yr risk + vascular age, a Reynolds hsCRP-driven risk,
  and a non-HDL crossing the 130 mg/dL target — a [spec-v11](spec-v11.md) audit log, and
  a passing [spec-v29](spec-v29.md) §3 check.
- The logistic/Cox exponents and the SCORE2 region transform clamp for overflow and
  return a probability in [0, 1]; every `ln()` term guards its domain; blank/invalid
  inputs render a surfaced fallback.
- Every compute function uses `lib/num.js` and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `score2` and `score2-op` carry `accessed` + a `docs/citation-staleness.md` row; the
  Class-A four carry none.
- `UTILITIES.length` is **447** (or the then-current count + 6 if specs land out of
  order) and all catalog-truth surfaces ([spec-v46](spec-v46.md)) agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass.
- The CHANGELOG records v103 with the +6 catalog delta.

## 7. Out of scope for v103

- **No replacement of `ascvd`/`prevent`.** The new engines **complement** the existing
  US primary-prevention tools; each cross-links them and states its derivation
  population so the clinician picks the right engine for the patient.
- **SCORE2 is European-region calibrated** — the tile **cross-links, does not replace**,
  the US Pooled-Cohort/PREVENT engines, and surfaces the risk-region caveat prominently;
  it is not a US-population estimate.
- **No CAC-scan or lipid-panel feed parsing** — `mesa-chd` takes the clinician's
  Agatston number and `non-hdl-remnant` takes entered lipid values, not an imaging or
  lab feed.
- **No statin-initiation, ezetimibe, or PCSK9 order** — each tile reports the risk/
  fraction and the source's stated interpretation; the prevention-therapy decision
  stays with the clinician and guideline.
