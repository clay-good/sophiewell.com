# spec-v192.md — Screening & bedside risk: FINDRISC, the Grobman (race-free) VBAC calculator, the Marburg Heart Score, and the GWTG-HF and ADHERE in-hospital heart-failure mortality models (+5 tiles)

> Status: **PROPOSED (2026-07-01).** Advances the
> [scope-mdcalc-parity.md](scope-mdcalc-parity.md) commitment across primary-care
> screening, obstetrics, and cardiology. Adds **5** deterministic instruments,
> **each verified absent by a direct scan of `app.js`** (zero hits): the catalog
> carries `framingham-cvd`, `prevent`, `score2`, the VTE and chest-pain rules, and
> the `flamm-vbac` score, but not the type-2-diabetes risk score, the race-free
> Grobman VBAC calculator, the primary-care chest-pain rule, or the two in-hospital
> heart-failure mortality models.
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v192 adds no runtime network call and no AI;
> each tile obeys the [spec-v100](spec-v100.md) §2 doctrine, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no screening, delivery-mode, or disposition order
> in Sophie's voice**). **Every point weight, logistic coefficient, and risk band is
> re-fetched and cross-verified against ≥2 independent sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs
> the [spec-v85 §6.2](spec-v85.md) collision check** first.

## 1. Thesis

Five deterministic risk instruments span the day and are missing from the catalog:
the **FINDRISC** type-2-diabetes screening score, the **Grobman** race-free VBAC
success calculator (the modern successor to the live Flamm score), the **Marburg
Heart Score** for ruling out CAD in primary-care chest pain, and the **GWTG-HF** and
**ADHERE** in-hospital heart-failure mortality models. Each is a transparent point
score, logistic model, or decision tree — auditable, unit-tested at every band — and
each is decision support, **never a screening, delivery-mode, or disposition order**.

## 2. What v192 adds (5 tiles)

### 2.1 `findrisc` — Finnish Diabetes Risk Score

- **Citation:** Lindström J, Tuomilehto J. The diabetes risk score: a practical tool
  to predict type 2 diabetes risk. *Diabetes Care.* 2003;26(3):725-731.
- **citationUrl:** https://doi.org/10.2337/diacare.26.3.725
- **Group:** G (clinical scoring & risk). **Specialties:** `endocrinology`,
  `primary-care`, `family-medicine`.
- **Inputs:** age band, BMI band, waist circumference band (sex-specific), daily
  physical activity, daily fruit/vegetable intake, history of antihypertensive
  medication, history of high blood glucose, and family history of diabetes, each
  with its published points.
- **Output:** the **FINDRISC total (0–26)** mapped to the 10-year type-2-diabetes
  risk band (low / slightly elevated / moderate / high / very high *(verify the band
  percentages at implementation, [spec-v97](spec-v97.md))*), naming the contributors.
  Class A. Cross-links the metabolic tiles.

### 2.2 `grobman-vbac` — VBAC Success Calculator (Grobman, race-free 2021)

- **Citation:** Grobman WA, Sandoval G, Rice MM, et al. Prediction of vaginal birth
  after cesarean delivery in term gestations: a calculator without race and
  ethnicity. *Am J Obstet Gynecol.* 2021;225(6):664.e1-664.e7.
- **citationUrl:** https://doi.org/10.1016/j.ajog.2021.05.021
- **Group:** G. **Specialties:** `obstetrics`, `maternal-fetal-medicine`.
- **Inputs:** maternal age, BMI, prior vaginal delivery, prior VBAC, and a
  treated-chronic-hypertension flag, entered per the 2021 model (which **removed the
  race / ethnicity terms** of the 2007 version). Computes the **predicted probability
  of a successful trial of labor after cesarean** via the published logistic
  equation, evaluated in odds space per [spec-v140](spec-v140.md).
- **Output:** the **VBAC success probability (%)**, naming the inputs; the tile notes
  it is the race-free successor to the live `flamm-vbac` and is a counseling aid, not
  a delivery-mode order. Class A. Cross-links `flamm-vbac`.

### 2.3 `marburg-heart-score` — Marburg Heart Score (CAD in primary-care chest pain)

- **Citation:** Bösner S, Haasenritter J, Becker A, et al. Ruling out coronary
  artery disease in primary care: development and validation of a simple prediction
  rule. *CMAJ.* 2010;182(12):1295-1300.
- **citationUrl:** https://doi.org/10.1503/cmaj.100212
- **Group:** G. **Specialties:** `primary-care`, `family-medicine`, `cardiology`.
- **Inputs:** the five criteria, each 1 point — age/sex (female ≥ 65 or male ≥ 55),
  known vascular disease, pain worse with exercise, pain **not** reproducible by
  palpation, and the patient assumes the pain is cardiac.
- **Output:** the **score (0–5)** banded (0–2 low / CAD unlikely; ≥ 3 higher, warrants
  further evaluation *(verify at implementation, [spec-v97](spec-v97.md))*), naming
  the criteria; framed as a primary-care rule-out aid. Class A. Cross-links `heart`
  and `edacs`.

### 2.4 `gwtg-hf` — GWTG-HF In-Hospital Mortality Risk

- **Citation:** Peterson PN, Rumsfeld JS, Liang L, et al. A validated risk score for
  in-hospital mortality in patients with heart failure from the American Heart
  Association Get With The Guidelines program. *Circ Cardiovasc Qual Outcomes.*
  2010;3(1):25-32.
- **citationUrl:** https://doi.org/10.1161/CIRCOUTCOMES.109.854877
- **Group:** G. **Specialties:** `cardiology`, `internal-medicine`,
  `emergency-medicine`.
- **Inputs:** age, systolic blood pressure, BUN, heart rate, sodium, the presence of
  COPD, and race, each mapped to its published points *(verify the point table at
  implementation, [spec-v97](spec-v97.md); this was parked in the earlier deferral
  ledger pending a second verbatim source — the implementing session sources the
  point table from ≥2 independent references before shipping)*.
- **Output:** the **GWTG-HF total** mapped to the in-hospital mortality band, naming
  the contributors. Class A. Cross-links `adhere-hf` and `maggic`.

### 2.5 `adhere-hf` — ADHERE In-Hospital Mortality (CART)

- **Citation:** Fonarow GC, Adams KF Jr, Abraham WT, Yancy CW, Boscardin WJ; ADHERE
  Scientific Advisory Committee. Risk stratification for in-hospital mortality in
  acutely decompensated heart failure: classification and regression tree analysis.
  *JAMA.* 2005;293(5):572-580.
- **citationUrl:** https://doi.org/10.1001/jama.293.5.572
- **Group:** G. **Specialties:** `cardiology`, `internal-medicine`,
  `emergency-medicine`.
- **Inputs:** admission **BUN** (≥ 43 mg/dL split), **systolic blood pressure**
  (< 115 mmHg split), and **serum creatinine** (≥ 2.75 mg/dL split), applied as the
  published three-node classification-and-regression tree.
- **Output:** the **risk group** (low / intermediate / high) with the associated
  in-hospital mortality, naming which tree branch was taken; the tile notes it is a
  fast bedside triage complement to the point-based `gwtg-hf`. Class A. Cross-links
  `gwtg-hf`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** The point
  sums clamp inputs to the published bands; `grobman-vbac` evaluates its logistic
  model in **odds space** and clamps the reported probability to [0, 1] per
  [spec-v140](spec-v140.md) (no `1 − sigmoid` complement leak); `adhere-hf` applies
  its threshold splits exactly; outside the valid domain each tile renders a
  complete-the-fields fallback, never a `NaN`/`Infinity`.
- **`gwtg-hf` and `adhere-hf` render the "mortality estimate for the team, not a
  disposition order" framing** ([spec-v59](spec-v59.md); [spec-v11](spec-v11.md)
  §5.3).
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero
  non-finite leaks**, and `grobman-vbac` is fuzzed explicitly in odds space at the
  saturation edge per [spec-v140](spec-v140.md).
- **These score and stratify; they are not orders.** Every tile renders the
  [spec-v50](spec-v50.md) §3 posture note; none authors a screening, delivery-mode,
  or disposition order in Sophie's voice.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed point / logistic /
  tree models, each cited by journal + authors. The **GWTG-HF** names the AHA
  program; the implementing session confirms whether that trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) at build time and adds a
  `docs/citation-staleness.md` row only if the live pattern matches — and sources the
  GWTG-HF point table from ≥2 independent references (it was previously parked for a
  second verbatim source).
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/risk-v192.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES` (the
  `grobman-vbac` logistic model fuzzed in odds space per [spec-v140](spec-v140.md)).
  Renderers live in a new `views/group-v192.js`; its `RV192` export is spread into
  the `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog
  count moves on all **13 catalog-truth surfaces** using the **live
  `UTILITIES.length` + 5**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and
  the chromium `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `endocrinology`,
  `primary-care`, `family-medicine`, `obstetrics`, `maternal-fetal-medicine`,
  `cardiology`, `internal-medicine`, `emergency-medicine` — all already in the
  vocabulary.

## 5. Files touched

```
docs/spec-v192.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v192 RV192 into RENDERERS)
lib/risk-v192.js                         (new: findrisc, grobmanVbac, marburgHeartScore, gwtgHf, adhereHf)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to flamm-vbac, heart, maggic)
views/group-v192.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/findrisc.test.js, grobman-vbac.test.js, marburg-heart-score.test.js, gwtg-hf.test.js, adhere-hf.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/risk-v192.js to MODULES; grobman-vbac fuzzed in odds space)
docs/audits/v12/*.md                     (5 spec-v11 audit logs)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v192 delta)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v192 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **FINDRISC
  band crossing**, a **Grobman VBAC probability with a prior-vaginal-delivery
  contrast**, a **Marburg score crossing the ≥ 3 threshold**, a **GWTG-HF mortality
  band**, and an **ADHERE tree reaching the high-risk node**.
- Every compute is finite-guarded, `grobman-vbac` computes in odds space with the
  [0, 1] clamp, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass;
  the CHANGELOG records v192 with the +5 delta.

## 7. Out of scope for v192

- **No screening / delivery-mode / disposition order** — the tiles stratify risk;
  the screening referral, the trial-of-labor decision, and the admission decision
  stay with the clinician and the patient ([spec-v11](spec-v11.md) §5.3).
- **No proprietary heart-failure models** — the Seattle Heart Failure Model and
  similar closed / many-coefficient tools are separate sourcing questions and are not
  bundled here.
