# spec-v163.md — EBM bedside math: Fagan post-test probability, diagnostic 2×2, and NNT/ARR (+3 tiles)

> Status: **PROPOSED (2026-06-23).** Feature spec of the
> [spec-v162](spec-v162.md) **Cross-Discipline Completion** program. Adds **3**
> deterministic evidence-based-medicine computes that fill a confirmed gap — the
> catalog cites sensitivity/likelihood-ratios in tile notes but has **no tool to
> compute post-test probability, predictive values, or numbers-needed-to-treat**.
> None duplicates a live tile.
>
> Catalog effect at v163 close: **live count + 3** (catalog-truth gate enforces).
>
> Every prior spec (v4 through v162) remains in force. v163 adds no runtime
> network call and no AI; each tile obeys the [spec-v100](spec-v100.md) §2
> doctrine, passes the [spec-v29](spec-v29.md) §3 one-line test, ships its primary
> citation inline ([spec-v54](spec-v54.md)), and inherits the
> [spec-v59](spec-v59.md) output-safety contract. Formulas are textbook-standard
> and cross-verified to ≥2 sources at implementation ([spec-v97](spec-v97.md)).

## 1. Thesis

Every diagnostic and therapeutic decision the rest of the catalog supports rests on
three pieces of bedside arithmetic the catalog itself does not provide: turning a
pre-test probability and a likelihood ratio into a **post-test probability**
(Fagan), turning a 2×2 table into **sensitivity/specificity/predictive
values/likelihood ratios**, and turning event rates into **absolute risk reduction
and number-needed-to-treat**. These are the EBM literacy tools that make every other
score interpretable.

## 2. What v163 adds (3 tiles)

### 2.1 `fagan-post-test` — Fagan Post-Test Probability (likelihood ratio)

- **Citation:** Fagan TJ. Nomogram for Bayes's theorem. *N Engl J Med.*
  1975;293(5):257.
- **citationUrl:** https://doi.org/10.1056/NEJM197507312930513 (verify at
  implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `clinical-epidemiology`, `internal-medicine`, `emergency-medicine`.
- **Inputs:** pre-test probability (%) and a likelihood ratio (LR+ or LR−), **or** a
  pre-test probability with sensitivity + specificity (LR derived).
- **Output:** **post-test probability** via odds form — pre-test odds = p/(1−p),
  post-test odds = pre-test odds × LR, post-test p = odds/(1+odds) — reported as a
  percent for both LR+ and LR− when sens/spec are given. Class A. Computed in **odds
  space** to avoid the float clamp ([spec-v140](spec-v140.md) lesson); guards p∈(0,1).

### 2.2 `diagnostic-2x2` — Diagnostic Test 2×2 (sens/spec/PV/LR)

- **Citation:** Altman DG, Bland JM. Diagnostic tests 1: sensitivity and
  specificity; 2: predictive values. *BMJ.* 1994;308(6943):1552; 309(6947):102.
- **citationUrl:** https://doi.org/10.1136/bmj.308.6943.1552 (verify at
  implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `clinical-epidemiology`, `internal-medicine`.
- **Inputs:** the four 2×2 cells — true positive, false positive, false negative,
  true negative.
- **Output:** **sensitivity, specificity, PPV, NPV, accuracy, LR+ (= sens/(1−spec)),
  LR− (= (1−sens)/spec)**, and prevalence; PPV/NPV optionally recomputed for a
  user-supplied prevalence (Bayes) so they are not read from the sample prevalence
  alone. Class A. Every denominator (row/column totals) guarded.

### 2.3 `nnt-arr` — Number Needed to Treat / Absolute Risk Reduction

- **Citation:** Laupacis A, Sackett DL, Roberts RS. An assessment of clinically
  useful measures of the consequences of treatment. *N Engl J Med.*
  1988;318(26):1728-1733.
- **citationUrl:** https://doi.org/10.1056/NEJM198806303182605 (verify at
  implementation)
- **Group:** Clinical Math & Conversions (`E`).
- **Specialties:** `clinical-epidemiology`, `internal-medicine`.
- **Inputs:** control event rate (CER) and experimental event rate (EER), as
  proportions or percents.
- **Output:** **ARR = CER − EER**, **RRR = ARR/CER**, **relative risk = EER/CER**,
  **NNT = 1/ARR** (and **NNH = 1/|ARR|** when EER > CER, with the harm framing).
  Class A. Guards the ARR = 0 case (NNT → ∞, surfaced as "no difference" rather than
  a divide-by-zero).

## 3. Per-tile robustness

- All three are **closed-form arithmetic** over finite-checked inputs using
  `lib/num.js`; every probability is range-checked to (0,1)/[0,100] and every
  denominator (Fagan p, 2×2 totals, ARR) is guarded — a blank/non-finite/zero input
  renders a surfaced `valid:false` complete-the-fields fallback rather than
  `NaN`/`Infinity`.
- **`fagan-post-test` computes in odds space** (not sigmoid-then-subtract) to avoid
  the float64 clamp at extreme probabilities that produced a `NaN` leak in
  [spec-v140](spec-v140.md); the [spec-v59](spec-v59.md) fuzz harness exercises
  p→0 and p→1 with large LRs.
- **`nnt-arr` ARR = 0** is surfaced as "no measurable difference (NNT undefined)";
  the NNH/NNT sign flip when EER > CER is unit-tested so harm is never reported as
  benefit.
- **`diagnostic-2x2`** distinguishes sample-prevalence PPV/NPV from the
  Bayes-recomputed values at a user prevalence, so the renderer never implies the
  study PPV transfers to a different population.
- All three render the [spec-v50](spec-v50.md) §3 posture note (these are
  interpretive aids; the inputs and their applicability are the clinician's) and
  author no recommendation ([spec-v11](spec-v11.md) §5.3).

## 4. CI/CD & maintenance

Per the [spec-v100](spec-v100.md) §6 contract:

- **Maintenance class (§6.3):** all three are **Class A** — fixed textbook formulas
  cited by journal/authors; none trips `ISSUER_PATTERN`; **no
  `citation-staleness.md` row.**
- **Specialty vocabulary:** adds **`clinical-epidemiology`** to
  `ALLOWED_SPECIALTIES` (see [spec-v162](spec-v162.md) §4).
- **Build & gates (§6.1/§6.2):** the three computes live in the new `lib/ebm-v163.js`
  module (`faganPostTest`, `diagnostic2x2`, `nntArr`), added to
  `fuzz-tools.test.js` `MODULES` (the odds-space and divide-by-zero paths explicitly
  fuzzed). Renderers live in the new `views/group-v163.js`; its `RV163` export is
  spread into `app.js` `RENDERERS`. The catalog count moves on all **13
  catalog-truth surfaces**; a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and
  the chromium `example-correctness` sweep pass.

## 5. Files touched

```
docs/spec-v163.md                        (this file)
app.js                                   (+3 UTILITIES rows, group E; import group-v163 RV163 into RENDERERS)
lib/ebm-v163.js                          (new module: faganPostTest, diagnostic2x2, nntArr)
lib/meta.js                              (+3 META entries: inline citation + citationUrl + accessed)
views/group-v163.js                      (new renderer module: 3 renderers)
test/unit/specialty-coverage.test.js     (add 'clinical-epidemiology' to ALLOWED_SPECIALTIES)
docs/clinical-citations.md               (+ rows for the three sources)
test/unit/fagan-post-test.test.js, diagnostic-2x2.test.js, nnt-arr.test.js   (≥3 boundary worked examples each)
test/unit/fuzz-tools.test.js             (add lib/ebm-v163.js to MODULES)
docs/audits/v12/fagan-post-test.md, diagnostic-2x2.md, nnt-arr.md            (spec-v11 audit logs)
docs/scope-cross-discipline.md           (catalog ledger; advance the v162 running count)
CHANGELOG.md                             (Unreleased: v163 entry, +3)
README.md, package.json                  (catalog count + spec-progression line -> v163)
```

## 6. Acceptance criteria

v163 is fully shipped when:

- The implementing session has re-run the [spec-v85 §6.2](spec-v85.md) collision
  check and confirmed all three ids are absent.
- All 3 tiles are live with a `META[id]` entry, inline primary citation +
  `citationUrl` + `accessed`, ≥3 boundary worked examples each (including a **Fagan
  pre-test 20% × LR+ 10 → post-test ~71%**, a **2×2 with LR+ and a Bayes-recomputed
  PPV at a different prevalence**, and an **NNT from ARR with a CER=EER undefined
  case**), a [spec-v11](spec-v11.md) audit log, and a passing [spec-v29](spec-v29.md)
  §3 check.
- `fagan-post-test` computes in odds space with no `NaN` leak at p→0/1; all
  denominators guarded; blank inputs render a complete-the-fields fallback.
- `clinical-epidemiology` is in `ALLOWED_SPECIALTIES` and `specialty-coverage.test.js`
  passes.
- Every compute uses `lib/num.js` and is covered by the [spec-v59](spec-v59.md)
  fuzz harness with zero non-finite leaks.
- `UTILITIES.length` is live count + 3 and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v163 with the +3 delta.

## 7. Out of scope for v163

- **No confidence intervals / hypothesis tests** — these tiles report point
  estimates; CI computation (Wilson/exact) is a possible future extension, not v163.
- **No study-design grading** — GRADE/risk-of-bias assessment is qualitative and out
  of scope.
- **No meta-analysis math** — single-study/single-test arithmetic only.
