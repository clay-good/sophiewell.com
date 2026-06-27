# v12 audit - pk-suite

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Rowland M, Tozer TN. Clinical Pharmacokinetics and Pharmacodynamics, 4th ed (first-order relations cross-verified against standard PK references; ≥ 2 sources, spec-v97).

`lib/pk-v166.js pkSuite()` computes the Pharmacokinetics Suite. Group F, Class A.

## Source-governance notes
- loading = Vd·Cp/F; maintenance/interval = CL·Css·τ/F; k = CL/Vd; t½ = 0.693·Vd/CL; steady state ≈ 5·t½.
- Each relation computed only from the inputs supplied; partial input yields per-output values, not NaN.
- Every division (F, Vd, CL) guarded; F range-checked to (0,1]; a zero/absent denominator → valid:false.

## Boundary worked examples added
- Vd 50, CL 5, Cp 20, F 1, τ 12 → t½ 6.93 h, steady state 34.65 h, loading 1000 mg, maintenance 1200 mg; Vd+CL only → k/half-life only; F 1.5/0 → valid:false.

## Edge-input handling notes
- needs at least one computable relation; bioavailability scales the loading dose (F 0.5 doubles oral LD). Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- Five labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
