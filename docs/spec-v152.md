# spec-v152.md — Nutrition & energy expenditure: Mifflin-St Jeor, Harris-Benedict, Katch-McArdle, Penn State, and Ireton-Jones (+5 tiles)

> Status: **PROPOSED (2026-06-23).** Feature spec of the
> [spec-v150](spec-v150.md) **Post-Parity Coverage** program. Adds **5**
> deterministic predictive energy-expenditure equations that fill a confirmed
> gap — the catalog has nutrition *screening* (`must-nutrition`, `nrs2002`,
> `nutric`, `mnutric`, `refeeding-risk`) and an `icu-nutrition-target` but **no
> predictive resting/total energy-expenditure equation**, which is the number
> every dietitian and nutrition-support service starts from. None duplicates a
> live tile.
>
> Catalog effect at v152 close: **live count + 5** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v151) remains in force. v152 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract. Every coefficient is re-fetched
> and cross-verified to ≥2 sources at implementation ([spec-v97](spec-v97.md)) —
> in particular the Harris-Benedict **revised (Roza 1984)** vs **original (1919)**
> constants and the Penn State **2003b vs modified-2010** form.

## 1. Thesis

`icu-nutrition-target` gives a weight-based kcal/protein goal; this spec ships the
**predictive regression equations** that estimate resting/total energy expenditure
directly — the ambulatory standard (Mifflin-St Jeor), the classic comparator
(Harris-Benedict), the lean-mass equation for body-composition contexts
(Katch-McArdle), and the two ventilated-patient equations that approximate indirect
calorimetry when a metabolic cart is unavailable (Penn State, Ireton-Jones). Each is
a closed-form arithmetic compute with named, published coefficients.

## 2. What v152 adds (5 tiles)

### 2.1 `mifflin-st-jeor` — Mifflin-St Jeor Resting Energy Expenditure

- **Citation:** Mifflin MD, St Jeor ST, Hill LA, et al. A new predictive equation
  for resting energy expenditure in healthy individuals. *Am J Clin Nutr.*
  1990;51(2):241-247.
- **citationUrl:** https://doi.org/10.1093/ajcn/51.2.241 (verify at implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nutrition`, `internal-medicine`, `primary-care`.
- **Inputs:** weight (kg), height (cm), age (yr), sex, and an optional activity
  factor (sedentary 1.2 → very active 1.9).
- **Output:** **REE (kcal/day) = 10·wt + 6.25·ht − 5·age + s** where **s = +5
  (male) / −161 (female)**; reports REE and, if an activity factor is supplied,
  **TDEE = REE × factor**. Class A.

### 2.2 `harris-benedict` — Harris-Benedict Basal Energy Expenditure

- **Citation:** Harris JA, Benedict FG. A biometric study of basal metabolism in
  man. *Proc Natl Acad Sci USA.* 1918;4(12):370-373. Revised constants: Roza AM,
  Shizgal HM. *Am J Clin Nutr.* 1984;40(1):168-182.
- **citationUrl:** https://doi.org/10.1073/pnas.4.12.370 (verify at implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nutrition`, `internal-medicine`, `primary-care`.
- **Inputs:** weight (kg), height (cm), age (yr), sex; optional activity factor.
- **Output:** **BEE (kcal/day)** by the **revised (Roza 1984)** equation — male
  **88.362 + 13.397·wt + 4.799·ht − 5.677·age**, female **447.593 + 9.247·wt +
  3.098·ht − 4.330·age** — with TDEE = BEE × activity factor. Class A.
  Cross-linked to `mifflin-st-jeor` (Mifflin is the preferred contemporary
  equation; Harris-Benedict tends to overestimate ~5%).

### 2.3 `katch-mcardle` — Katch-McArdle Basal Metabolic Rate (lean-mass based)

- **Citation:** Katch FI, McArdle WD. *Nutrition, Weight Control, and Exercise.*
  (Lean-body-mass BMR equation.)
- **citationUrl:** (textbook — verify edition/page at implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `nutrition`, `sports-medicine`, `physical-medicine-rehabilitation`.
- **Inputs:** lean body mass (kg) directly, **or** total weight (kg) + body-fat %
  (LBM derived).
- **Output:** **BMR (kcal/day) = 370 + 21.6·LBM(kg)**; reports BMR and TDEE ×
  activity factor. Class A. Guards the body-fat→LBM derivation against non-finite /
  out-of-range (>100%) input.

### 2.4 `penn-state-ree` — Penn State Equation (ventilated REE)

- **Citation:** Frankenfield D, Smith JS, Cooney RN. Validation of 2 approaches to
  predicting resting metabolic rate in critically ill patients. *JPEN J Parenter
  Enteral Nutr.* 2004;28(4):259-264; modified equation: Frankenfield DC, et al. *J
  Am Diet Assoc.* 2009;109(9):1564-1569.
- **citationUrl:** https://doi.org/10.1177/0148607104028004259 (verify at
  implementation)
- **Group:** Medication & Infusion (`F`) — ICU nutrition-support context.
- **Specialties:** `nutrition`, `critical-care`, `pulmonology`.
- **Inputs:** the Mifflin-St Jeor REE (computed from wt/ht/age/sex), maximum
  temperature in the prior 24 h (Tmax, °C), and minute ventilation (Ve, L/min);
  the **modified (2010)** form applies to BMI ≥30 and age ≥60.
- **Output:** **RMR = Mifflin·0.96 + Tmax·167 + Ve·31 − 6212** (standard 2003b),
  with the modified-equation constants surfaced for the obese-elderly branch.
  Class A. Cross-linked to `icu-nutrition-target` and `mifflin-st-jeor`.

### 2.5 `ireton-jones` — Ireton-Jones Energy Equation

- **Citation:** Ireton-Jones C, Jones JD. Improved equations for predicting energy
  expenditure in patients: the Ireton-Jones equations. *Nutr Clin Pract.*
  2002;17(1):29-31 (revised from the 1992 equations).
- **citationUrl:** https://doi.org/10.1177/011542650201700129 (verify at
  implementation)
- **Group:** Medication & Infusion (`F`) — nutrition-support context.
- **Specialties:** `nutrition`, `critical-care`, `surgery`.
- **Inputs:** ventilated vs spontaneously-breathing, age (yr), weight (kg), sex,
  and the trauma / burn diagnosis flags; the spec ships the **ventilator-dependent
  (1997 revised)** form and the spontaneous form.
- **Output:** ventilated **EEE = 1784 − 11·age + 5·wt + 244·(male) + 239·(trauma) +
  804·(burn)** kcal/day (and the spontaneous-breathing form), with the diagnosis
  modifiers named. Class A. Coefficients **re-verified to ≥2 sources** at
  implementation (1992 vs 1997-revised constants differ).

## 3. Per-tile robustness

- All five are **closed-form arithmetic** over finite-checked numeric inputs using
  `lib/num.js`; a blank/non-finite weight, height, or age renders a surfaced
  `valid:false` complete-the-fields fallback rather than `NaN`.
- **Sex/branch handling is explicit:** Mifflin's ±constant, Harris-Benedict's
  sex-specific equation, Ireton-Jones's male indicator, and Penn State's
  obese-elderly branch are each unit-tested on both branches so a default does not
  silently apply the wrong constant.
- **Katch-McArdle's body-fat→LBM path** is range-guarded (0 < BF% < 100) and the
  direct-LBM path is offered to avoid the derivation entirely.
- **Activity-factor multiplication** is optional and clearly separated from the
  REE/BEE/BMR base so the renderer never presents a TDEE as if it were the resting
  value.
- All five render the [spec-v50](spec-v50.md) §3 posture note (a *prediction*, not
  a measured calorimetry value) and defer the prescription to the clinician
  ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** all five are **Class A** — fixed published
  equations cited by journal/authors; none trips `ISSUER_PATTERN`; **no
  `citation-staleness.md` row.**
- **Build & gates (§6.1/§6.2):** the five computes live in the new
  `lib/nutrition-energy-v152.js` module (`mifflinStJeor`, `harrisBenedict`,
  `katchMcArdle`, `pennStateRee`, `iretonJones`), added to `fuzz-tools.test.js`
  `MODULES`. Renderers live in the new `views/group-v152.js`; its `RV152` export is
  spread into `app.js` `RENDERERS`. The catalog count moves on all **13
  catalog-truth surfaces** in the same change; a11y, `mobile-no-hscroll`,
  `mobile-touch-targets`, and the chromium `example-correctness` sweep pass.

## 5. Files touched

```
docs/spec-v152.md                        (this file)
app.js                                   (+5 UTILITIES rows, groups E/F; import group-v152 RV152 into RENDERERS)
lib/nutrition-energy-v152.js             (new module: mifflinStJeor, harrisBenedict, katchMcArdle, pennStateRee, iretonJones)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to icu-nutrition-target, bw-bsa-suite)
views/group-v152.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+ rows for the five sources)
test/unit/mifflin-st-jeor.test.js, harris-benedict.test.js, katch-mcardle.test.js, penn-state-ree.test.js, ireton-jones.test.js   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/nutrition-energy-v152.js to MODULES)
docs/audits/v12/mifflin-st-jeor.md, harris-benedict.md, katch-mcardle.md, penn-state-ree.md, ireton-jones.md   (spec-v11 audit logs)
docs/scope-post-parity.md                (catalog ledger; advance the v150 running count)
CHANGELOG.md                             (Unreleased: v152 entry, +5)
README.md, package.json                  (catalog count + spec-progression line -> v152)
```

## 6. Acceptance criteria

v152 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all five ids are absent.
- All 5 tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a
  **Mifflin male vs female ±constant pair on identical anthropometrics**, a
  **Harris-Benedict revised-equation worked total**, a **Katch-McArdle from
  body-fat %**, and a **Penn State 2003b vs modified branch**), a
  [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md) §3 check.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks; sex/diagnosis branches exercised on both
  sides.
- `UTILITIES.length` is live count + 5 and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v152 with the +5 delta.

## 7. Out of scope for v152

- **No indirect-calorimetry replacement claim** — these are *predictive* equations
  with known error vs the metabolic cart; the renderer states that explicitly.
- **No protein/fluid prescription** — `icu-nutrition-target` already owns the
  protein goal; v152 stays on energy and cross-links rather than re-implements.
- **No pediatric equations** — Schofield/WHO pediatric REE equations are deferred to
  a future spec (the live `peds-*` cluster owns pediatric dosing/fluids today).
