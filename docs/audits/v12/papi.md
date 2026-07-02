# v12 audit - papi

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Korabathina R, et al. Catheter Cardiovasc Interv. 2012;80(4):593-600; Lim/Gustafsson EJHF 2020.

`lib/hemo-v194.js papi()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- PASP 40, PADP 20, RAP 18 -> PAPi 1.11 (advanced-HF RV-dysfunction range).
- >= 3 worked examples in test/unit/papi.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- PAPi = (PASP-PADP)/RAP verified against the primary and the EJHF review; the context-specific 1.0 and 1.85 thresholds named in-tile. RAP>0 guarded. PASS.

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
