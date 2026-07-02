# v12 audit - virsta

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Tubiana S, et al. J Infect. 2016;72(5):544-553.

`lib/subspecialty-v198.js virsta()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- emboli + native valve disease -> VIRSTA 8, higher risk (echo recommended).
- >= 3 worked examples in test/unit/virsta.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- The 10 weighted items (5/5/4/4/3/3/2/2/1/1) and the <=2 low (IE ~1%, NPV ~99%) vs >=3 higher (~17%) bands cross-verified against the primary abstract, a validation cohort, and medcalcu.com; CRP>190 mg/L = >19 mg/dL. PASS.

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
