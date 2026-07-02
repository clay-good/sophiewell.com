# v12 audit - shunt-fraction

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Berggren SM. Acta Physiol Scand. 1942; restated in Nunn Applied Respiratory Physiology.

`lib/hemo-v194.js shuntFraction()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- Hb 15, PAO2 110, SaO2 99, PaO2 95, SvO2 75, PvO2 40 -> Qs/Qt 4.7% (normal).
- >= 3 worked examples in test/unit/shunt-fraction.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- CxO2 = 1.34*Hb*SxO2 + 0.0031*PxO2 (end-capillary Sc=100%) and Qs/Qt = (CcO2-CaO2)/(CcO2-CvO2) verified against Nunn; content-difference denominator guarded > 0. PASS.

## Edge-input handling notes
- Missing / non-positive / out-of-range inputs return a surfaced complete-the-fields
  fallback (valid:false); zero-denominator and log-domain edges are guarded.

## A11y / keyboard notes
- Every input carries a real <label for>; output aria-live="polite". The 320px sweep
  passes with no horizontal scroll. Risk/prognosis stratification, not an order.

## Defects opened
- none

## Status
- PASS
