# v12 audit - ventilatory-ratio

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Sinha P, et al. Br J Anaesth. 2009;102(5):692-697.

`lib/vent-v195.js ventilatoryRatio()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- VE 9000, PaCO2 50, height 175, male -> VR 1.7 (elevated).
- >= 3 worked examples in test/unit/ventilatory-ratio.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- VR = (VE*PaCO2)/(PBW*100*37.5) with ARDSNet PBW verified against the primary; PBW denominator guarded > 0. PASS.

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
