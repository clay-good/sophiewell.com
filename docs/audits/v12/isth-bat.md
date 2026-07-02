# v12 audit - isth-bat

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Rodeghiero F, et al. J Thromb Haemost. 2010; Elbatarny, Haemophilia 2014.

`lib/subspecialty-v198.js isthBat()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- male, epistaxis 2 + surgery 3 -> ISTH-BAT 5, abnormal (>=4 male).
- >= 3 worked examples in test/unit/isth-bat.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- 14 domains scored 0 to +4 (no negatives) and the >=4/>=6/>=3 male/female/child thresholds cross-verified across Elbatarny 2014, practical-haemostasis, and FPNotebook. PASS.

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
