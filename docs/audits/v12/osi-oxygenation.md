# v12 audit - osi-oxygenation

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: PALICC. Pediatr Crit Care Med. 2015;16(5):428-439.

`lib/vent-v195.js osi()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- FiO2 0.6, MAP 15, SpO2 92 -> OSI 9.78 (moderate PARDS).
- >= 3 worked examples in test/unit/osi-oxygenation.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- OSI = (FiO2*MAP*100)/SpO2 and the PARDS bands (5/7.5/12.3) verified against the PALICC consensus and a second reproduction. SpO2>0 guarded. PASS.

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
