# v12 audit - uacr-upcr

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Spot urine albumin/protein-to-creatinine ratio; albuminuria categories per the KDIGO 2024 CKD guideline. Kidney Int. 2024;105(4S):S117-S314.

`lib/nephro-v92.js uacrUpcr()` computes the spot ratio (mg/g) = analyte (mg/dL) / urine creatinine (mg/dL) x 1000, estimates the 24-hour excretion (mg, since ~1 g creatinine is excreted daily), and maps the UACR to the KDIGO A-stage (A1 < 30, A2 30-300, A3 > 300 mg/g). The albumin unit toggle (mg/dL <-> mg/L) converts before the ratio.

## Boundary worked examples added
- albumin 30 mg/dL, urine Cr 100 mg/dL -> UACR 300 mg/g (A2), ~300 mg/day.
- urine creatinine 0 or blank -> surfaced valid:false (no NaN/Infinity).
- mg/L unit toggle: 300 mg/L = 30 mg/dL -> UACR 300 (matches mg/dL).
- A-stage edge: 29.9 mg/g -> A1, 30.01 mg/g -> A2 (agrees with ckd-staging).

## Cross-implementation differential
- Reference: NKF/KDIGO spot-ratio guidance + albuminuria categories. The x1000 unit conversion and the A-cutoffs match; A-stage agrees with the ckd-staging tile. PASS.

## Edge-input handling notes
- Division by urine creatinine is guarded (must be > 0); a protein-only input yields the UPCR independently of the albumin/UACR. The spec-v59 fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Three labeled numeric inputs + one labeled unit <select>; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
