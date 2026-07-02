# spec-v210.md — Ischemic-stroke & intracerebral-hemorrhage prognosis: the iScore, the ASTRAL score, the SPAN-100 index, the FUNC score, and the PLAN score (+5 tiles)

> Status: **PROPOSED (2026-07-02).** Second feature spec of the **Advanced Prognostic &
> Risk-Equation Instruments** program ([spec-v209](spec-v209.md) §1.1). Adds **5**
> deterministic ischemic-stroke and intracerebral-hemorrhage prognostic instruments.
> **Each tile was verified absent by a direct scan of `app.js`** (zero id / name / keyword
> hits at draft): the catalog carries the stroke tools `nihss`, `mnihss`, `mrs`, `abcd2`,
> `thrive-stroke`, `dragon-stroke`, `atria-stroke`, and the hemorrhage tools `ich-score`,
> `ich-volume-abc2`, `hunt-hess-wfns`, and `modified-fisher`, but **not** the iScore, the
> ASTRAL score, the SPAN-100 index, the FUNC score, or the PLAN score.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v210 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine and the §6 CI/CD contract, passes
> the [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no thrombolysis order, thrombectomy referral,
> withdrawal-of-care recommendation, or disposition in Sophie's voice** — these prognosticate;
> the decision stays with the stroke neurologist, the neurointensivist, and the patient or
> surrogate). **Every point weight and outcome band is re-fetched and cross-verified against
> ≥2 independent open sources at implementation** ([spec-v97](spec-v97.md)); uncertain values
> carry an explicit *(verify at implementation, [spec-v97](spec-v97.md))* tag. The
> implementing session **re-runs the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 2. What v210 adds (5 tiles)

### 2.1 `iscore` — iScore (mortality after acute ischemic stroke)

- **Citation:** Saposnik G, Kapral MK, Liu Y, et al. IScore: a risk score to predict death
  early after hospitalization for an acute ischemic stroke. *Circulation.*
  2011;123(7):739-749.
- **citationUrl:** https://doi.org/10.1161/CIRCULATIONAHA.110.983353
- **Group:** G (clinical scoring & risk). **Specialties:** `neurology`,
  `emergency-medicine`, `internal-medicine`.
- **Inputs:** age, sex, stroke severity (NIHSS), stroke subtype (non-lacunar / lacunar /
  undetermined), the vascular-risk and comorbid set (atrial fibrillation, congestive heart
  failure, prior myocardial infarction, current smoking, cancer, dependency before the
  stroke), admission glucose, and dialysis status *(the full points table is transcribed
  verbatim at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **iScore total** with the model's predicted **30-day and 1-year
  mortality** risk from the published risk mapping, naming the total and the heaviest
  contributors (age, NIHSS, and pre-stroke dependency). Framed as a validated early-mortality
  estimator that helps calibrate prognosis conversations and case-mix — **not** a
  thrombolysis-eligibility or care-limitation rule. Class A. Cross-links `nihss`,
  `thrive-stroke`.

### 2.2 `astral` — ASTRAL score (3-month functional outcome after ischemic stroke)

- **Citation:** Ntaios G, Faouzi M, Ferrari J, Lang W, Vemmos K, Michel P. An integer-based
  score to predict functional outcome in acute ischemic stroke: the ASTRAL score.
  *Neurology.* 2012;78(24):1916-1922.
- **citationUrl:** https://doi.org/10.1212/WNL.0b013e318259e221
- **Group:** G. **Specialties:** `neurology`, `emergency-medicine`.
- **Inputs:** age, NIHSS at admission, time from onset to admission (> 3 h vs ≤ 3 h),
  admission visual-field defect, admission glucose (abnormal high or low range), and level
  of consciousness (impaired vs normal) *(the six-item integer weights — A-cute stroke,
  S-everity, T-ime, R-ange of visual fields, A-ge, L-oss of consciousness — are transcribed
  verbatim at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **ASTRAL total** with the model's predicted probability of **unfavorable
  3-month outcome (modified Rankin Scale 3–6)** from the published logistic mapping, naming
  the total and the driving items. Framed as a bedside, integer, 90-day-outcome estimator
  computable at admission from routinely available data. Class A. Cross-links `mrs`,
  `nihss`.

### 2.3 `span-100` — SPAN-100 index (age + NIHSS stroke prognostication)

- **Citation:** Saposnik G, Guzik AK, Reeves M, Ovbiagele B, Johnston SC. Stroke
  Prognostication using Age and NIH Stroke Scale: SPAN-100. *Neurology.* 2013;80(1):21-28.
- **citationUrl:** https://doi.org/10.1212/WNL.0b013e31827b1ace
- **Group:** G. **Specialties:** `neurology`, `emergency-medicine`.
- **Inputs:** age (years) and NIHSS.
- **Output:** the **SPAN-100 index** = `age + NIHSS`, dichotomized at **100 (SPAN-100
  positive when ≥ 100)**, with the observation that SPAN-100-positive patients have
  substantially higher mortality and disability and lower rates of favorable outcome — and,
  in the derivation, a differential response pattern to thrombolysis *(the outcome rates by
  SPAN status are quoted from the source at implementation, [spec-v97](spec-v97.md))* —
  naming the index and its positive/negative status. Framed as the simplest validated
  age-plus-severity prognostic index; **not** a treatment-eligibility rule. Class A.
  Cross-links `nihss`, `astral`.

### 2.4 `func-score` — FUNC score (functional independence after intracerebral hemorrhage)

- **Citation:** Rost NS, Smith EE, Chang Y, et al. Prediction of functional outcome in
  patients with primary intracerebral hemorrhage: the FUNC score. *Stroke.*
  2008;39(8):2304-2309.
- **citationUrl:** https://doi.org/10.1161/STROKEAHA.107.512202
- **Group:** G. **Specialties:** `neurology`, `neurosurgery`, `critical-care`.
- **Inputs:** intracerebral-hemorrhage volume (mL, e.g. by ABC/2), age band, hemorrhage
  location (lobar / deep / infratentorial), Glasgow Coma Scale band, and pre-ICH cognitive
  impairment (yes/no) *(the 0–11 point weights are transcribed verbatim at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **FUNC total (0–11)** with the probability of **functional independence
  (Glasgow Outcome ≥ independent) at 90 days** rising stepwise across the published bands
  (a total of 0–4 confers a very low chance; 11 the highest), naming the total and the
  contributing items. Framed as an ICH functional-recovery estimator intended to counter
  early nihilism and inform — never dictate — goals-of-care discussions. Class A.
  Cross-links `ich-score`, `ich-volume-abc2`.

### 2.5 `plan-score` — PLAN score (death and severe disability after ischemic stroke)

- **Citation:** O'Donnell MJ, Fang J, D'Uva C, et al. The PLAN score: a bedside prediction
  rule for death and severe disability following acute ischemic stroke. *Arch Intern Med.*
  2012;172(20):1548-1556.
- **citationUrl:** https://doi.org/10.1001/2013.jamainternmed.30
- **Group:** G. **Specialties:** `neurology`, `emergency-medicine`, `internal-medicine`.
- **Inputs:** the **P**readmission comorbidities (cancer, congestive heart failure,
  atrial fibrillation, pre-stroke dependence), the **L**evel of consciousness (reduced),
  **A**ge, and the **N**eurologic deficit set (weakness of leg/arm, aphasia, neglect)
  *(the component point weights are transcribed verbatim at implementation,
  [spec-v97](spec-v97.md))*.
- **Output:** the **PLAN total** with the model's predicted **30-day mortality**, **1-year
  mortality**, and **death-or-severe-dependence (mRS 5–6) at discharge** across the
  published risk bands, naming the total and the contributing components. Framed as a
  bedside outcome-prediction rule from data available on admission. Class A. Cross-links
  `iscore`, `mrs`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** All five are
  bounded integer/point instruments (`span-100` a simple sum, `func-score` bounded 0–11,
  and `iscore`/`astral`/`plan-score` summed point tables with logistic outcome mappings);
  each clamps its inputs to the published domains and renders a complete-the-fields fallback
  for a missing item rather than a partial result.
- **Each tile reports which band applies and names its inputs** ([spec-v59](spec-v59.md)) —
  the iScore mortality band, the ASTRAL unfavorable-outcome probability, the SPAN-100
  positive/negative status, the FUNC independence band, the PLAN outcome band — so a result
  is never read without its basis.
- **All five render prognostication, not orders** — none authors a thrombolysis,
  thrombectomy, or withdrawal-of-care recommendation in Sophie's voice
  ([spec-v11](spec-v11.md) §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note,
  with an explicit note that these scores must not be used to justify early care limitation.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks**, fuzzed at the band boundaries and at NIHSS / age / volume extremes.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed published point tables,
  each cited by journal + authors. The implementing session confirms whether any citation
  trips `ISSUER_PATTERN` ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/stroke-prognosis-v210.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v210.js`; its `RV210` export is spread into the
  `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog count
  moves on all **13 catalog-truth surfaces** using the **live `UTILITIES.length` + 5**;
  a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium `example-correctness`
  sweep pass.
- **Specialties** are drawn from the closed vocabulary: `neurology`, `neurosurgery`,
  `emergency-medicine`, `critical-care`, `internal-medicine`; the implementing session adds
  any tag missing from `ALLOWED_SPECIALTIES`.

## 5. Files touched

```
docs/spec-v210.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v210 RV210 into RENDERERS)
lib/stroke-prognosis-v210.js             (new: iScore, astral, span100, funcScore, planScore)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to nihss, mrs, ich-score, thrive-stroke)
views/group-v210.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/iscore.test.js, astral.test.js, span-100.test.js, func-score.test.js, plan-score.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/stroke-prognosis-v210.js to MODULES)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v210 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v210 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including an **iScore across
  its mortality bands**, an **ASTRAL crossing the unfavorable-outcome threshold**, a
  **SPAN-100 positive and negative pair**, a **FUNC across the 0–4 vs 8–11 bands**, and a
  **PLAN across its outcome bands**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v210 with the +5 delta.

## 7. Out of scope for v210

- **No thrombolysis / thrombectomy / care-limitation recommendation** — the tiles
  prognosticate; the treat and goals-of-care decisions stay with the clinician and the
  patient or surrogate ([spec-v11](spec-v11.md) §5.3). Each tile carries an explicit
  anti-nihilism note.
- **No proprietary or non-reproducible model** — any score whose weights are not
  reproducible from ≥ 2 open sources is deferred under [spec-v97](spec-v97.md).

<!-- Program note: v210 is the ischemic-stroke & ICH prognosis slice of the Advanced
Prognostic & Risk-Equation Instruments program (v209–v212). Five fully published,
deterministic, order-free prognostic models. Each tile was verified absent at draft. -->
