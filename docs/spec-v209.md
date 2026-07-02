# spec-v209.md — Advanced cardiology risk & prognosis: HCM Risk-SCD, the 2019 ARVC arrhythmia model, the Seattle Heart Failure Model, CHARGE-AF, and the MECKI score (+5 tiles)

> Status: **PROPOSED (2026-07-02).** First feature spec of the **Advanced Prognostic &
> Risk-Equation Instruments** program (umbrella below, §1.1), advancing the long-horizon
> [scope-mdcalc-parity.md](scope-mdcalc-parity.md) commitment to carry every clinically
> actionable calculator. Adds **5** deterministic cardiology risk-equation and prognosis
> instruments. **Each tile was verified absent by a direct scan of `app.js`** (zero id /
> name / keyword hits at draft): the catalog carries the heart-failure and cardiac-risk
> tools `maggic`, `adhere-hf`, `hfa-peff`, `ascvd`, `score2`, `score2-op`, `prevent`,
> `mesa-chd`, `dapt-score`, `grace`, `euroscore2`, and `cha2ds2-va`, but **not** the HCM
> Risk-SCD model, the 2019 ARVC ventricular-arrhythmia model, the Seattle Heart Failure
> Model, CHARGE-AF, or the MECKI score.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v209 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine (re-binding
> [spec-v85](spec-v85.md) §2) and the §6 CI/CD contract, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no ICD referral, device order, transplant listing,
> anticoagulation order, or disposition in Sophie's voice** — these estimate risk and
> prognosis; the decision stays with the cardiologist, the electrophysiologist, the
> heart-failure team, and the patient). **Every coefficient, baseline-survival term, and
> interpretation band is re-fetched and cross-verified against ≥2 independent open sources
> at implementation** ([spec-v97](spec-v97.md)); uncertain values carry an explicit
> *(verify at implementation, [spec-v97](spec-v97.md))* tag. The implementing session
> **re-runs the [spec-v85 §6.2](spec-v85.md) collision check** first.

### 1.1 Program umbrella — Advanced Prognostic & Risk-Equation Instruments (v209–v212)

The [scope-mdcalc-parity.md](scope-mdcalc-parity.md) stratum that remains after the
**Advanced Specialist Quantitation** ([spec-v193](spec-v193.md)–[spec-v198](spec-v198.md)),
**Deep Subspecialty Quantitation** ([spec-v199](spec-v199.md)–[spec-v203](spec-v203.md)),
and **Frontline & Bedside Decision Instruments** ([spec-v204](spec-v204.md)–[spec-v208](spec-v208.md))
programs is the **published multivariable risk-equation** stratum: the peer-reviewed
prognostic models a subspecialist reaches for to put a number on a hard question — what is
this hypertrophic-cardiomyopathy patient's 5-year sudden-death risk, will this stroke
patient survive and walk, which CML or transplant candidate is high-risk, can this
cirrhotic skip screening endoscopy. Each is a **fully published, deterministic** model
(integer point-table, logistic equation, or Cox survival term) that is reproducible from
≥2 open sources and confirmed absent from the catalog. Each slice is a set of five such
instruments:

- **[spec-v209](spec-v209.md)** — advanced cardiology risk & prognosis (this spec).
- **[spec-v210](spec-v210.md)** — ischemic-stroke & intracerebral-hemorrhage prognosis.
- **[spec-v211](spec-v211.md)** — hematology-oncology risk stratification.
- **[spec-v212](spec-v212.md)** — hepatology, fibrosis & portal-hypertension prognosis.

Each slice follows the same contract; further slices may follow. **Proprietary or
non-reproducible models are deferred under [spec-v97](spec-v97.md)** — any equation whose
coefficients cannot be recovered from ≥2 open sources (e.g. the KCCQ health-status scoring
algorithm, whose weights are owned and not openly published) does not enter the catalog.

## 2. What v209 adds (5 tiles)

### 2.1 `hcm-risk-scd` — HCM Risk-SCD (5-year sudden-cardiac-death risk in hypertrophic cardiomyopathy)

- **Citation:** O'Mahony C, Jichi F, Pavlou M, et al. A novel clinical risk prediction
  model for sudden cardiac death in hypertrophic cardiomyopathy (HCM Risk-SCD). *Eur Heart
  J.* 2014;35(30):2010-2020.
- **citationUrl:** https://doi.org/10.1093/eurheartj/eht439
- **Group:** G (clinical scoring & risk). **Specialties:** `cardiology`,
  `electrophysiology`, `internal-medicine`.
- **Inputs:** age (years), maximal LV wall thickness (mm), left-atrial diameter (mm),
  maximal (rest/Valsalva) LV outflow-tract gradient (mmHg), family history of sudden
  cardiac death (yes/no), non-sustained ventricular tachycardia on Holter (yes/no), and
  unexplained syncope (yes/no).
- **Output:** the **5-year SCD probability** = `1 − 0.998^exp(PI)`, where the prognostic
  index `PI` is the published linear predictor `0.15939858 × wall-thickness −
  0.00294271 × wall-thickness² + 0.0259082 × LA-diameter + 0.00446131 × LVOT-gradient +
  0.4583082 × FHx-SCD + 0.82639195 × NSVT + 0.71650361 × syncope − 0.01799934 × age`
  *(all coefficients and the 0.998 baseline-survival term are transcribed verbatim and
  cross-verified at implementation, [spec-v97](spec-v97.md))* — reported with the ESC
  guidance bands **< 4% low / 4–6% intermediate / ≥ 6% high 5-year risk** that inform the
  ICD discussion — naming the value and stating the model's validated domain (age ≥ 16,
  no prior cardiac arrest/sustained VT, no maximal wall thickness ≥ 35 mm, no prior ICD).
  Framed as the ESC-endorsed SCD-risk estimator that replaces the older major-risk-factor
  count; **not** an ICD order. Class A. Cross-links `maggic`, `mesa-chd`.

### 2.2 `arvc-risk` — 2019 ARVC risk calculator (5-year ventricular-arrhythmia risk)

- **Citation:** Cadrin-Tourigny J, Bosman LP, Nozza A, et al. A new prediction model for
  ventricular arrhythmias in arrhythmogenic right ventricular cardiomyopathy. *Eur Heart
  J.* 2019;40(23):1850-1858. **Validation:** Cadrin-Tourigny J, et al. Sudden cardiac
  death prediction in arrhythmogenic right ventricular cardiomyopathy: a multinational
  collaboration. *Circ Arrhythm Electrophysiol.* 2021;14(1):e008509.
- **citationUrl:** https://doi.org/10.1093/eurheartj/ehz103
- **Group:** G. **Specialties:** `cardiology`, `electrophysiology`.
- **Inputs:** age (years), sex, recent cardiac syncope (yes/no), number of premature
  ventricular complexes per 24 hours (Holter), number of leads with T-wave inversion
  (anterior + inferior), right-ventricular ejection fraction (%), and prior sustained
  VT/VF or NSVT status per the model's definition *(the exact predictor set and Cox
  coefficients are transcribed verbatim at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **predicted risk of a first sustained ventricular arrhythmia at 1, 2,
  and 5 years** from the published Cox model, named with the value and the model's
  validated domain (definite ARVC by 2010 Task Force Criteria, no prior sustained VA).
  Framed as the arrhythmic-risk estimator that supports — but does not make — the primary-
  prevention ICD decision in ARVC. Class A. Cross-links `hcm-risk-scd`, `hunt-hess-wfns`.

### 2.3 `seattle-hf` — Seattle Heart Failure Model (survival in heart failure)

- **Citation:** Levy WC, Mozaffarian D, Linker DT, et al. The Seattle Heart Failure Model:
  prediction of survival in heart failure. *Circulation.* 2006;113(11):1424-1433.
- **citationUrl:** https://doi.org/10.1161/CIRCULATIONAHA.105.584102
- **Group:** G. **Specialties:** `cardiology`, `heart-failure`, `internal-medicine`.
- **Inputs:** age, sex, NYHA class, ischemic etiology, LV ejection fraction, systolic
  blood pressure, diuretic dose (mg furosemide-equivalent per kg), the current medication
  set (ACE-inhibitor/ARB, beta-blocker, statin, aldosterone antagonist, allopurinol) and
  device set (ICD, biventricular pacer), and the laboratory panel (hemoglobin, %
  lymphocytes, uric acid, total cholesterol, sodium) *(the full covariate list, baseline
  hazard, and per-covariate hazard ratios are transcribed verbatim from the Levy 2006
  appendix at implementation, [spec-v97](spec-v97.md))*.
- **Output:** the **estimated mean life expectancy** and **1-, 2-, and 3-year survival**
  from the published multivariable model, naming the strongest contributors and the model's
  domain (chronic HF; derived largely in HFrEF cohorts). Framed as the reference outpatient
  HF survival estimator used to frame transplant/LVAD and goals-of-care conversations;
  **not** a transplant-listing or device order. Class A. Cross-links `maggic`, `adhere-hf`.

### 2.4 `charge-af` — CHARGE-AF (5-year incident atrial-fibrillation risk)

- **Citation:** Alonso A, Krijthe BP, Aspelund T, et al. Simple risk model predicts
  incidence of atrial fibrillation in a racially and geographically diverse population: the
  CHARGE-AF consortium. *J Am Heart Assoc.* 2013;2(2):e000102.
- **citationUrl:** https://doi.org/10.1161/JAHA.112.000102
- **Group:** G. **Specialties:** `cardiology`, `electrophysiology`, `internal-medicine`.
- **Inputs:** age, race (white/other), height, weight, systolic and diastolic blood
  pressure, current smoking, antihypertensive-medication use, diabetes, and history of
  heart failure and of myocardial infarction.
- **Output:** the **5-year predicted risk of incident atrial fibrillation** =
  `1 − 0.9718412736^exp(Σ βᵢxᵢ − 12.5815600)`, using the published simple-model beta
  coefficients *(all β terms, the units — height in cm, weight in kg, blood pressure in
  mmHg — the 5-year baseline-survival term, and the mean-centering constant are transcribed
  verbatim at implementation, [spec-v97](spec-v97.md))* — naming the value; framed as a
  population AF-incidence estimator used to select patients for screening or monitoring, not
  an anticoagulation or monitoring order. Class A. Cross-links `cha2ds2-va`, `mesa-chd`.

### 2.5 `mecki-score` — MECKI score (metabolic-exercise / cardiac / kidney index in heart failure)

- **Citation:** Agostoni P, Corrà U, Cattadori G, et al. Metabolic exercise test data
  combined with cardiac and kidney indexes, the MECKI score: a multiparametric approach to
  heart failure prognosis. *Int J Cardiol.* 2013;167(6):2710-2718.
- **citationUrl:** https://doi.org/10.1016/j.ijcard.2012.06.113
- **Group:** G. **Specialties:** `cardiology`, `heart-failure`.
- **Inputs:** hemoglobin (g/dL), serum sodium (mmol/L), kidney function (MDRD eGFR),
  LV ejection fraction (%), peak VO₂ (% of predicted), and the VE/VCO₂ slope from
  cardiopulmonary exercise testing.
- **Output:** the **MECKI score** — the model's predicted probability of the composite of
  **cardiovascular death, urgent transplant, or LVAD implantation at 2 years** from the six
  variables *(the logistic coefficients and the 2-year risk mapping are transcribed
  verbatim at implementation, [spec-v97](spec-v97.md))* — reported with the value and the
  driving variables (a low peak-VO₂ %predicted and a high VE/VCO₂ slope weigh heaviest).
  Framed as the CPET-anchored systolic-HF prognostic score used for transplant/LVAD timing;
  **not** a listing or device order. Class A. Cross-links `seattle-hf`, `maggic`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** `hcm-risk-scd`,
  `arvc-risk`, `seattle-hf`, `charge-af`, and `mecki-score` each evaluate an exponential /
  logistic term: each clamps its linear predictor to the published input domains and floors
  and caps the resulting probability to `[0, 1]`, rendering a complete-the-fields fallback
  for a missing input rather than a partial or non-finite result.
- **Each tile reports which band applies and names its inputs** ([spec-v59](spec-v59.md)) —
  the HCM-Risk-SCD low/intermediate/high band, the ARVC 1/2/5-year risks, the Seattle mean
  life expectancy, the CHARGE-AF 5-year risk, the MECKI composite risk — so a result is
  never read without its basis, and each names the model's validated domain.
- **All five render risk estimation, not orders** — none authors an ICD referral, device,
  transplant-listing, or anticoagulation order in Sophie's voice ([spec-v11](spec-v11.md)
  §5.3); each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks**, fuzzed at the band boundaries and at coefficient-domain extremes.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed published coefficients,
  each cited by journal + authors. The implementing session confirms whether any citation
  (e.g. the ESC / AHA society wording) trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/cardio-risk-v209.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v209.js`; its `RV209` export is spread into the
  `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog count
  moves on all **13 catalog-truth surfaces** using the **live `UTILITIES.length` + 5**;
  a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium `example-correctness`
  sweep pass.
- **Specialties** are drawn from the closed vocabulary: `cardiology`, `electrophysiology`,
  `heart-failure`, `internal-medicine`; the implementing session adds any tag missing from
  `ALLOWED_SPECIALTIES`.

## 5. Files touched

```
docs/spec-v209.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v209 RV209 into RENDERERS)
lib/cardio-risk-v209.js                  (new: hcmRiskScd, arvcRisk, seattleHf, chargeAf, meckiScore)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to maggic, mesa-chd, cha2ds2-va, adhere-hf)
views/group-v209.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/hcm-risk-scd.test.js, arvc-risk.test.js, seattle-hf.test.js, charge-af.test.js, mecki-score.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/cardio-risk-v209.js to MODULES)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v209 delta; open the Advanced Prognostic & Risk-Equation Instruments program)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v209 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including an **HCM-Risk-SCD
  spanning the low / intermediate / high bands**, an **ARVC risk at 1/2/5 years**, a
  **Seattle survival across two contrasting profiles**, a **CHARGE-AF low vs high 5-year
  risk**, and a **MECKI score across its risk range**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v209 with the +5 delta and opens the Advanced Prognostic &
  Risk-Equation Instruments program (v209–v212).

## 7. Out of scope for v209

- **No ICD / device / transplant-listing / anticoagulation order** — the tiles estimate
  risk and prognosis; the device, listing, and anticoagulation decisions stay with the
  clinician and the patient ([spec-v11](spec-v11.md) §5.3).
- **No proprietary or non-reproducible model** — the KCCQ health-status score is deferred:
  its item weights are owned and not openly published, so it cannot be reproduced from ≥ 2
  open sources ([spec-v97](spec-v97.md)).

<!-- Program note: v209 opens the Advanced Prognostic & Risk-Equation Instruments program
(v209–v212), four slices of five fully published, deterministic, order-free multivariable
prognostic models each, targeting the peer-reviewed risk-equation stratum still absent from
the catalog. Each tile was verified absent at draft. -->
