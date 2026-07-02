# spec-v204.md — Nephrology, fluids & renal-tubular quantitation: the calcium/creatinine clearance ratio, urinary-calcium (hypercalciuria) assessment, maximum allowable blood loss, electrolyte-free water clearance, and the renal phosphate threshold TmP/GFR (+5 tiles)

> Status: **PROPOSED (2026-07-02).** First feature spec of the **Frontline & Bedside
> Decision Instruments** program (umbrella below, §1.1), advancing the long-horizon
> [scope-mdcalc-parity.md](scope-mdcalc-parity.md) commitment to carry every clinically
> actionable calculator. Adds **5** deterministic nephrology, fluid-balance, and
> renal-tubular instruments. **Each tile was verified absent by a direct scan of
> `app.js`** (zero id / name / keyword hits at draft): the catalog carries
> `fena-feurea`, `urine-anion-gap`, `urine-osmolal-gap`, `osmolal-gap`,
> `free-water-deficit`, `ttkg`, `corrected-sodium`, `sodium-correction`, `fepo4`,
> `ktv-urr`, `uacr-upcr`, `rifle-aki`, and `akin-aki`, but **not** the
> calcium/creatinine clearance ratio, a urinary-calcium (hypercalciuria) assessment,
> the maximum-allowable-blood-loss estimate, electrolyte-free water clearance, or the
> renal phosphate threshold (TmP/GFR).
>
> Catalog effect: **live `UTILITIES.length` + 5** — enforced by the catalog-truth
> gate ([spec-v46](spec-v46.md)) at build time; no number is copied here.
>
> Every prior spec remains in force. v204 adds no runtime network call and no AI; each
> tile obeys the [spec-v100](spec-v100.md) §2 doctrine (re-binding
> [spec-v85](spec-v85.md) §2) and the §6 CI/CD contract, passes the
> [spec-v29](spec-v29.md) §3 one-line test, ships its citation inline
> ([spec-v54](spec-v54.md)), inherits the [spec-v59](spec-v59.md) output-safety
> contract, renders the [spec-v50](spec-v50.md) §3 posture note, and honors
> [spec-v11](spec-v11.md) §5.3 (**no fluid order, transfusion order, dialysis
> prescription, parathyroid-surgery referral, or disposition in Sophie's voice** — these
> quantify and stratify; the decision stays with the treating clinician and the
> patient). **Every constant, coefficient, and interpretation band is re-fetched and
> cross-verified against ≥2 independent open sources at implementation**
> ([spec-v97](spec-v97.md)); uncertain values carry an explicit *(verify at
> implementation, [spec-v97](spec-v97.md))* tag. The implementing session **re-runs the
> [spec-v85 §6.2](spec-v85.md) collision check** first.

### 1.1 Program umbrella — Frontline & Bedside Decision Instruments (v204–v208)

The [scope-mdcalc-parity.md](scope-mdcalc-parity.md) tail that remains after the
**Advanced Specialist Quantitation** ([spec-v193](spec-v193.md)–[spec-v198](spec-v198.md))
and **Deep Subspecialty Quantitation** ([spec-v199](spec-v199.md)–[spec-v203](spec-v203.md))
programs is the frontline stratum: the instruments a nephrologist, intensivist,
pulmonologist, resuscitationist, dietitian, obstetrician, or neonatologist reaches for
at the bedside to answer a concrete question — is this hypercalcemia benign (FHH) or
surgical (PHPT), how much blood can this patient lose before transfusion, which COPD or
malignant-effusion patient is high-risk, which head-CT carries a poor prognosis, when may
field resuscitation be stopped, and is this patient malnourished. Each slice is a set of
five deterministic, cited, actionable instruments confirmed absent from the catalog:

- **[spec-v204](spec-v204.md)** — nephrology, fluids & renal-tubular quantitation (this spec).
- **[spec-v205](spec-v205.md)** — pulmonology, COPD & sleep severity.
- **[spec-v206](spec-v206.md)** — traumatic brain injury & stroke prognosis.
- **[spec-v207](spec-v207.md)** — resuscitation, cardiac arrest & trauma-death prognosis.
- **[spec-v208](spec-v208.md)** — nutrition-status assessment & maternal-neonatal risk.

Each slice follows the same contract; further slices may follow.

## 2. What v204 adds (5 tiles)

### 2.1 `cccr` — Calcium/Creatinine Clearance Ratio (FHH vs primary hyperparathyroidism)

- **Citation:** Christensen SE, Nissen PH, Vestergaard P, Heickendorff L, Brixen K,
  Mosekilde L. Discriminative power of three indices of renal calcium excretion for the
  distinction between familial hypocalciuric hypercalcaemia and primary
  hyperparathyroidism: a follow-up study on methods. *Clin Endocrinol (Oxf).*
  2008;69(5):713-720.
- **citationUrl:** https://doi.org/10.1111/j.1365-2265.2008.03259.x
- **Group:** G (clinical scoring & risk). **Specialties:** `endocrinology`,
  `nephrology`, `internal-medicine`.
- **Inputs:** 24-hour (or spot) urine calcium, serum creatinine, serum calcium, and
  urine creatinine — calcium terms entered in one shared unit and creatinine terms in one
  shared unit (the ratio is dimensionless and the collection volume cancels).
- **Output:** the **CCCR** = `(urine Ca × serum Cr) / (serum Ca × urine Cr)` with the
  interpretation bands — **< 0.01 suggests familial hypocalciuric hypercalcemia (FHH);
  > 0.02 suggests primary hyperparathyroidism (PHPT); 0.01–0.02 is an indeterminate gray
  zone** — naming the value and stating that vitamin-D deficiency, low calcium intake,
  renal impairment, thiazides, and lithium can lower the ratio and mislabel PHPT as FHH.
  Framed as a screen to separate a benign, autosomal-dominant *CASR* condition (that must
  **not** go to parathyroidectomy) from surgical hyperparathyroidism — interpreted
  alongside PTH, vitamin-D status, and family history, never alone. Class A. Cross-links
  `corrected-calcium`, `calcium-correction`.

### 2.2 `urine-calcium-cr` — Urinary-calcium assessment (spot Ca/Cr ratio + 24-hour excretion)

- **Citation:** Pearle MS, Goldfarb DS, Assimos DG, et al. Medical management of kidney
  stones: AUA guideline. *J Urol.* 2014;192(2):316-324. **Pediatric age bands:** Sargent
  JD, Stukel TA, Kresel J, Klein RZ. Normal values for random urinary calcium to
  creatinine ratios in infancy. *J Pediatr.* 1993;123(3):393-397.
- **citationUrl:** https://doi.org/10.1016/j.juro.2014.05.006
- **Group:** G. **Specialties:** `nephrology`, `urology`, `endocrinology`,
  `pediatrics`.
- **Inputs:** spot urine calcium and urine creatinine (same mass units → mg/mg ratio),
  **or** 24-hour urine calcium (mg/day) with body weight (kg) for the weight-indexed
  form; a patient-age band selects the pediatric vs adult cut-point.
- **Output:** the **spot Ca/Cr ratio** (with an optional molar mmol/mmol form, ≈ mg/mg ×
  2.82) and/or **24-hour calcium (mg/day and mg/kg/day)** against the hypercalciuria
  thresholds — **adult spot > 0.20 mg/mg; 24-h > 250 mg/day (women), > 300 mg/day (men)
  *(the men's cut-point varies 275–300; verify at implementation, [spec-v97](spec-v97.md))*,
  or > 4 mg/kg/day; pediatric age-stratified Sargent bands (< 7 mo 0.86, 7–18 mo 0.60,
  19 mo–6 y 0.42 mg/mg)** — naming which threshold applies. Framed as the calciuria step
  in the nephrolithiasis and idiopathic-hypercalciuria workup. Class A. Cross-links
  `cccr`, `uacr-upcr`.

### 2.3 `max-allowable-blood-loss` — Maximum Allowable Blood Loss (ABL)

- **Citation:** Gross JB. Estimating allowable blood loss: corrected for dilution.
  *Anesthesiology.* 1983;58(3):277-280.
- **citationUrl:** https://doi.org/10.1097/00000542-198303000-00016
- **Group:** F (bedside physiology / dosing). **Specialties:** `anesthesia`, `surgery`,
  `critical-care`, `emergency-medicine`.
- **Inputs:** weight (kg), patient category (average blood-volume factor: neonate /
  infant / child / adult male / adult female), starting hematocrit (or hemoglobin), and
  the lowest acceptable (target) hematocrit.
- **Output:** the **estimated blood volume** (weight × factor) and the **maximum allowable
  blood loss** = `EBV × (Hct_initial − Hct_target) / Hct_initial` *(the average-form and
  the Gross dilution-corrected logarithmic form are both transcribed at implementation,
  [spec-v97](spec-v97.md))*, naming the blood-volume factor used and framing it as an
  intraoperative transfusion-planning estimate, **not** a transfusion order. Class A.
  Cross-links `estimated-blood-volume`, `transfusion-volume`.

### 2.4 `efw-clearance` — Electrolyte-Free Water Clearance

- **Citation:** Rose BD. New approach to disturbances in the plasma sodium
  concentration. *Am J Med.* 1986;81(6):1033-1040.
- **citationUrl:** https://doi.org/10.1016/0002-9343(86)90401-8
- **Group:** F. **Specialties:** `nephrology`, `critical-care`, `internal-medicine`.
- **Inputs:** urine sodium, urine potassium, plasma sodium (shared units), and urine
  volume over the collection interval.
- **Output:** the **electrolyte-free water clearance** = `V × [1 − (U_Na + U_K) / P_Na]`,
  reported per interval, with the interpretation that a **positive** value means the
  kidney is excreting free water (aggravating hypernatremia / correcting hyponatremia) and
  a **negative** value means net free-water retention (aggravating hyponatremia) — naming
  the sign and framing it as the physiologic quantity that explains why urine output alone
  can mislead in dysnatremia management. Class A. Cross-links `free-water-deficit`,
  `sodium-correction`.

### 2.5 `tmp-gfr` — Renal Tubular Maximum Phosphate Reabsorption per GFR (TmP/GFR)

- **Citation:** Payne RB. Renal tubular reabsorption of phosphate (TmP/GFR): indications,
  interpretation and clinical usefulness. *Ann Clin Biochem.* 1998;35(Pt 2):201-206.
  **Nomogram:** Walton RJ, Bijvoet OLM. Nomogram for derivation of renal threshold
  phosphate concentration. *Lancet.* 1975;2(7929):309-310.
- **citationUrl:** https://doi.org/10.1177/000456329803500203
- **Group:** F. **Specialties:** `nephrology`, `endocrinology`, `internal-medicine`.
- **Inputs:** serum phosphate, urine phosphate, serum creatinine, and urine creatinine
  (phosphate terms in one shared unit, creatinine terms in one shared unit).
- **Output:** the **fractional tubular reabsorption of phosphate** TRP =
  `1 − (U_P × S_Cr)/(S_P × U_Cr)` and the derived **TmP/GFR** — the Payne linear
  approximation when TRP ≤ 0.86 (`TmP/GFR = TRP × S_P`) and the hyperbolic form above 0.86
  *(both branches and the constants are transcribed verbatim at implementation,
  [spec-v97](spec-v97.md))* — against the age-adjusted reference range, naming whether the
  result indicates renal phosphate wasting (low TmP/GFR, e.g. hyperparathyroidism, FGF23
  excess) or retention. Framed as the definitive renal-phosphate-handling index that
  fractional excretion alone cannot give. Class A. Cross-links `fepo4`, `cccr`.

## 3. Per-tile robustness

- **Every compute routes through `lib/num.js` and is finite-guarded.** `cccr`,
  `tmp-gfr`, and `efw-clearance` carry ratios with clinician-entered denominators; each
  clamps to the published domains and renders a complete-the-fields fallback for a blank,
  zero, or out-of-domain denominator rather than a `NaN`/`Infinity`. `max-allowable-blood-loss`
  clamps the target hematocrit below the starting hematocrit and floors ABL at 0.
- **Each tile reports which band / sign / threshold applies and names its inputs**
  ([spec-v59](spec-v59.md)) — the CCCR band, the calciuria threshold used, the ABL
  blood-volume factor, the EFWC sign, the TmP/GFR reference — so a result is never read
  without its basis.
- **All five render quantitation, not orders** — none authors a fluid, transfusion,
  dialysis, or surgical-referral order in Sophie's voice ([spec-v11](spec-v11.md) §5.3);
  each renders the [spec-v50](spec-v50.md) §3 posture note.
- **All five flow through the [spec-v59](spec-v59.md) fuzz harness with zero non-finite
  leaks**, fuzzed at the band boundaries and at denominator extremes.

## 4. CI/CD & maintenance

- **Maintenance classes (§6.3):** all five are **Class A** — fixed formulas / point
  thresholds, each cited by journal + authors. The implementing session confirms whether
  any citation (e.g. the AUA guideline) trips `ISSUER_PATTERN`
  ([spec-v92](spec-v92.md)/[spec-v94](spec-v94.md)) and adds a
  `docs/citation-staleness.md` row only if the live pattern matches.
- **Build & gates (§6.1/§6.2):** the five computes live in a new
  `lib/nephro-fluids-v204.js` module, added to `test/unit/fuzz-tools.test.js` `MODULES`.
  Renderers live in a new `views/group-v204.js`; its `RV204` export is spread into the
  `app.js` `RENDERERS` map. Every input carries a real `<label for>`. The catalog count
  moves on all **13 catalog-truth surfaces** using the **live `UTILITIES.length` + 5**;
  a11y, `mobile-no-hscroll`, `mobile-touch-targets`, and the chromium
  `example-correctness` sweep pass.
- **Specialties** are drawn from the closed vocabulary: `endocrinology`, `nephrology`,
  `internal-medicine`, `urology`, `pediatrics`, `anesthesia`, `surgery`,
  `critical-care`, `emergency-medicine`; the implementing session adds any tag missing
  from `ALLOWED_SPECIALTIES`.

## 5. Files touched

```
docs/spec-v204.md                        (this file)
app.js                                   (+5 UTILITIES rows; import group-v204 RV204 into RENDERERS)
lib/nephro-fluids-v204.js                (new: cccr, urineCalcium, maxAllowableBloodLoss, efwClearance, tmpGfr)
lib/meta.js                              (+5 META entries: inline citation + citationUrl + accessed; cross-links to corrected-calcium, uacr-upcr, free-water-deficit, fepo4)
views/group-v204.js                      (new renderer module: 5 renderers)
docs/clinical-citations.md               (+5 rows)
test/unit/cccr.test.js, urine-calcium-cr.test.js, max-allowable-blood-loss.test.js, efw-clearance.test.js, tmp-gfr.test.js  (>=3 worked examples each)
test/unit/fuzz-tools.test.js             (add lib/nephro-fluids-v204.js to MODULES)
docs/scope-mdcalc-parity.md              (catalog count live -> live+5; record the v204 delta; open the Frontline & Bedside Decision Instruments program)
CHANGELOG.md, README.md, package.json    (catalog count live -> live+5; spec-progression line)
```

## 6. Acceptance criteria

v204 is fully shipped when:

- The implementing session has **re-run the [spec-v85 §6.2](spec-v85.md) collision
  check** and confirmed all five ids are absent (as verified at draft).
- All 5 tiles in §2 are live (Class A) with a `META[id]` entry, inline citation +
  `citationUrl` + `accessed`, and ≥ 3 worked examples each — including a **CCCR spanning
  the FHH / gray-zone / PHPT bands**, a **urinary-calcium pair crossing the hypercalciuria
  threshold (adult spot and a pediatric age band)**, an **ABL with the blood-volume factor
  shown**, an **EFWC with a positive and a negative result**, and a **TmP/GFR crossing the
  0.86 TRP branch point**.
- Every compute is finite-guarded, routes through `lib/num.js`, and is covered by the
  [spec-v59](spec-v59.md) fuzz harness with **zero non-finite leaks**.
- `UTILITIES.length` is **live + 5** and all catalog-truth surfaces agree.
- `npm run lint`, `npm run test`, `npm run sbom`, and `npm run build` all pass; the
  CHANGELOG records v204 with the +5 delta and opens the Frontline & Bedside Decision
  Instruments program (v204–v208).

## 7. Out of scope for v204

- **No fluid / transfusion / dialysis / surgical-referral order** — the tiles quantify
  and stratify; the resuscitate/transfuse/dialyze/operate decisions stay with the
  clinician and the patient ([spec-v11](spec-v11.md) §5.3).
- **No proprietary or non-reproducible model** — any index whose constants are not
  reproducible from ≥ 2 open sources is deferred under [spec-v97](spec-v97.md).

<!-- Program note: v204 opens the Frontline & Bedside Decision Instruments program
(v204–v208), five slices of five deterministic, cited, order-free calculators each,
targeting the frontline bedside stratum still absent from the catalog. Each tile was
verified absent at draft. -->
