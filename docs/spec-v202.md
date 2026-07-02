# spec-v202.md — Cardiovascular & heart-failure risk engines: QRISK3, the Seattle Heart Failure Model, the MECKI score, the ADVANCE CVD-risk model, and the UKPDS Risk Engine (+5 tiles)

> Status: **PROPOSED (2026-07-02).** Fourth feature spec of the **Deep Subspecialty
> Quantitation** program ([spec-v199](spec-v199.md) §1.1). Adds **5** deterministic
> multivariable cardiovascular / heart-failure survival and risk engines. **Each tile
> was verified absent by a direct scan of `app.js`** (zero id / name / keyword hits at
> draft): the catalog carries `ascvd`, `prevent`, `framingham`, `mesa-chd`, `reynolds`,
> `score2`, `maggic`, `h2fpef`, and `dapt-score`, but **not** QRISK3, the Seattle Heart
> Failure Model, the MECKI score, the ADVANCE cardiovascular-risk model, or the UKPDS
> Risk Engine.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v202 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no statin, anticoagulant, device, or treatment order
> in Sophie's voice** — these estimate risk; the decision stays with the clinician and
> the patient). **Every coefficient, baseline-survival term, and band threshold is
> re-fetched and cross-verified against ≥2 independent open sources at implementation**
> ([spec-v97](spec-v97.md)); these are the most coefficient-heavy tiles in the program,
> so every fractional-polynomial term, interaction, and baseline-survival constant
> carries an explicit *(verify at implementation, [spec-v97](spec-v97.md))* tag until
> reproduced against the published equations. The implementing session **re-runs the
> [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

The pooled-cohort and SCORE2 primary-prevention calculators are carried; this slice
adds the multivariable engines a cardiologist and diabetologist reach for when the
simple charts do not fit: the UK flagship 10-year CVD engine with the widest risk-
factor set (QRISK3), the reference heart-failure survival model with medication and
device modifiers (Seattle HF), the cardiopulmonary-exercise-anchored HF prognostic
score (MECKI), and two diabetes-specific engines that outperform generic charts in
type-2 diabetes (ADVANCE, UKPDS). Each is a published, openly reproducible equation,
and each is decision support — **never a prescription or device order**.

## 2. What v202 adds (5 tiles)

### 2.1 `qrisk3` — QRISK3 10-year cardiovascular risk

- **Citation:** Hippisley-Cox J, Coupland C, Brindle P. Development and validation of
  QRISK3 risk prediction algorithms to estimate future risk of cardiovascular disease:
  prospective cohort study. *BMJ.* 2017;357:j2099.
- **citationUrl:** https://doi.org/10.1136/bmj.j2099
- **Group:** G (clinical scoring & risk). **Specialties:** `cardiology`,
  `primary-care`, `internal-medicine`.
- **Inputs:** age, sex, ethnicity, smoking status, diabetes (type 1 / type 2), the
  clinical risk factors (treated hypertension, rheumatoid arthritis, atrial
  fibrillation, chronic kidney disease, migraine, SLE, severe mental illness, atypical
  antipsychotic use, corticosteroid use, erectile dysfunction), family history of
  premature CHD, cholesterol/HDL ratio, systolic BP and its standard deviation, and
  BMI. Townsend deprivation defaults to 0 (population average) with a note that it is a
  UK-specific term.
- **Output:** the **10-year CVD risk (%)** from the published Cox model with
  fractional-polynomial age/BMI terms and the full interaction set *(every coefficient,
  the ethnicity/smoking centering, and the baseline-survival term are transcribed
  verbatim from the open-source QRISK3 algorithm at implementation,
  [spec-v97](spec-v97.md))*, naming the largest contributors. Framed as the UK NICE-
  endorsed engine, noting its derivation population. Class A. Cross-links `ascvd`,
  `score2`, `prevent`.

### 2.2 `seattle-hf` — Seattle Heart Failure Model

- **Citation:** Levy WC, Mozaffarian D, Linker DT, et al. The Seattle Heart Failure
  Model: prediction of survival in heart failure. *Circulation.*
  2006;113(11):1424-1433.
- **citationUrl:** https://doi.org/10.1161/CIRCULATIONAHA.105.584102
- **Group:** G. **Specialties:** `cardiology`, `critical-care`.
- **Inputs:** age, sex, NYHA class, weight, ejection fraction, systolic BP, ischemic
  etiology, the labs (sodium, hemoglobin, lymphocyte %, uric acid, cholesterol), the
  medications (ACE-I/ARB, beta-blocker, aldosterone antagonist, statin, allopurinol,
  loop-diuretic dose), and the devices (ICD, CRT, CRT-D) — the published predictors.
- **Output:** the **estimated 1-, 2-, and 5-year survival (%)** and **mean life
  expectancy (years)** from the published proportional-hazards model with its
  medication and device hazard modifiers *(the full coefficient set, baseline survival,
  and device/medication modifiers are transcribed verbatim at implementation,
  [spec-v97](spec-v97.md))*, naming the largest survival modifiers. Framed as the
  reference ambulatory-HF survival model. Class A. Cross-links `maggic`, `h2fpef`.

### 2.3 `mecki` — MECKI score (HF, CPET-anchored)

- **Citation:** Agostoni P, Corrà U, Cattadori G, et al. Metabolic exercise test data
  combined with cardiac and kidney indexes, the MECKI score: a multiparametric approach
  to heart failure prognosis. *Int J Cardiol.* 2013;167(6):2710-2718.
- **citationUrl:** https://doi.org/10.1016/j.ijcard.2012.06.113
- **Group:** G. **Specialties:** `cardiology`.
- **Inputs:** the six variables — hemoglobin (g/dL), sodium (mEq/L), LVEF (%),
  peak VO₂ (% predicted), VE/VCO₂ slope, and the MDRD-estimated GFR (mL/min/1.73 m²).
- **Output:** the **MECKI score (%)** — the model's 2-year risk of cardiovascular
  death / urgent transplant / LVAD *(the logistic coefficients and intercept are
  transcribed verbatim at implementation, [spec-v97](spec-v97.md))* — naming the
  contributors; framed as a cardiopulmonary-exercise-anchored HF prognostic score.
  Class A. Cross-links `seattle-hf`, `maggic`.

### 2.4 `advance-cvd` — ADVANCE cardiovascular-risk model (type 2 diabetes)

- **Citation:** Kengne AP, Patel A, Marre M, et al. Contemporary model for
  cardiovascular risk prediction in people with type 2 diabetes. *Eur J Cardiovasc Prev
  Rehabil.* 2011;18(3):393-398.
- **citationUrl:** https://doi.org/10.1177/1741826710394270
- **Group:** G. **Specialties:** `cardiology`, `endocrinology`, `primary-care`.
- **Inputs:** age at diagnosis, known diabetes duration, sex, pulse pressure, treated
  hypertension, atrial fibrillation, retinopathy, HbA1c, urine albumin/creatinine
  ratio, and non-HDL cholesterol — the published predictors.
- **Output:** the **4-year CVD risk (%)** from the published model *(the coefficients
  and baseline survival are transcribed verbatim at implementation,
  [spec-v97](spec-v97.md))*, naming the largest contributors; framed as a
  diabetes-specific engine that outperforms generic charts in type-2 diabetes. Class A.
  Cross-links `ukpds-risk`, `ascvd`.

### 2.5 `ukpds-risk` — UKPDS Risk Engine (CHD in type 2 diabetes)

- **Citation:** Stevens RJ, Kothari V, Adler AI, Stratton IM; UKPDS Group. The UKPDS
  risk engine: a model for the risk of coronary heart disease in Type II diabetes
  (UKPDS 56). *Clin Sci (Lond).* 2001;101(6):671-679.
- **citationUrl:** https://doi.org/10.1042/cs1010671
- **Group:** G. **Specialties:** `endocrinology`, `cardiology`, `primary-care`.
- **Inputs:** age, sex, ethnicity (Afro-Caribbean flag), smoking status, HbA1c,
  systolic BP, total-to-HDL cholesterol ratio, atrial fibrillation, and diabetes
  duration — the published predictors.
- **Output:** the **estimated 10-year (and configurable-horizon) risk of fatal and
  non-fatal CHD (%)** from the published risk-engine equations *(the risk-factor
  exponents, the Weibull/exponential survival form, and the constants are transcribed
  verbatim at implementation, [spec-v97](spec-v97.md))*, naming the contributors;
  framed as a diabetes-specific CHD engine. Class A. Cross-links `advance-cvd`,
  `framingham`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** These carry
  fractional-polynomial, logarithmic, and exponential/Weibull terms; each clamps its
  inputs to the published physiologic domains and renders a complete-the-fields
  fallback for a blank or out-of-domain input rather than a `NaN`/`Infinity`. Risk is
  clamped to [0, 100] %.
- **Each tile reports its result with the largest contributing factors named**
  ([spec-v59](spec-v59.md)), and QRISK3 surfaces the Townsend-default note so the
  UK-specific assumption is explicit.
- **All five render risk estimates, not orders** — none authors a statin,
  anticoagulant, device, or treatment order in Sophie's voice ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note and states its
  derivation population so a US clinician reads the UK/diabetes-cohort provenance.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, fuzzed across the input domains and at the risk-clamp
  boundaries.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed published
  equations. Because these are the program's most coefficient-dense tiles, the
  implementing session cross-verifies each equation against the primary paper **and** a
  second independent open reproduction (the open-source QRISK3 code, the Seattle HF /
  UKPDS published supplements, and MDCalc / independent re-implementations) before
  removing any *(verify)* tag. The session confirms whether any citation trips
  `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/cvrisk-engines-v202.js` module, added to `test/unit/fuzz-tools.test.js`
  `MODULES`. Renderers live in a new `views/group-v202.js`; its `RV202` export is
  spread into the `app.js` `RENDERERS` map. Every input carries a real `<label for>`.
  The catalog count moves on all **13 catalog-truth surfaces** using the **live
  `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the
  chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `cardiology`, `primary-care`,
  `internal-medicine`, `endocrinology`, `critical-care` — all already in the
  vocabulary.

## 5. Files touched

```
docs/spec-v202.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v202 RV202 into RENDERERS)
lib/cvrisk-engines-v202.js               (new: qrisk3, seattleHf, mecki, advanceCvd, ukpdsRisk)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to ascvd, score2, maggic, framingham)
views/group-v202.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/qrisk3.test.js, seattle-hf.test.js, mecki.test.js, advance-cvd.test.js, ukpds-risk.test.js  (>=3 worked examples each, each cross-checked against a published reference case)
test/unit/fuzz-tools.test.js             (add lib/cvrisk-engines-v202.js to MODULES)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v202 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v202 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — **each including at least
  one example whose expected output is reproduced from a published reference case or an
  independent open re-implementation** (not self-derived), so the coefficient
  transcription is externally anchored.
- Every compute is finite-guarded, routes through `lib/num.js`, clamps risk to
  [0, 100] %, and is covered by the [spec-v59](spec-v59.md) fuzz harness with **zero
  non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v202 with the +5 delta.

## 7. Out of scope for v202

- **No prescription / device / treatment order** — the tiles estimate risk; the statin,
  anticoagulant, device, and therapy decisions stay with the clinician and the patient
  ([spec-v11](spec-v11.md) §5.3).
- **No non-reproducible engine** — any model whose coefficients cannot be reproduced
  from ≥ 2 open sources is deferred under [spec-v97](spec-v97.md). If, at
  implementation, the full QRISK3 or Seattle-HF coefficient set cannot be transcribed
  and externally verified, that tile is dropped from the slice rather than shipped with
  unverified constants — the +5 delta is reduced accordingly.
