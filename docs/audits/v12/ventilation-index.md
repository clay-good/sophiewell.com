# v12 audit - ventilation-index

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Paret G, et al. Pediatr Pulmonol. 1998;26(2):125-128.

`lib/vent-v195.js ventilationIndex()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- RR 30, PIP 30, PaCO2 50 -> VI 45 (markedly elevated).
- >= 3 worked examples in test/unit/ventilation-index.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- VI = (RR*PIP*PaCO2)/1000 verified against the primary; the PEEP-corrected variant noted in-tile. PASS.

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
