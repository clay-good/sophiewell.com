# v12 audit - jostel-tsh-index

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Jostel A, et al. Clin Endocrinol. 2009;71(4):529-534.

`lib/endo-quant-v197.js jostelTshIndex()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- TSH 1.5, FT4 15 -> TSHI 2.42, sTSHI -0.41 (in-band).
- >= 3 worked examples in test/unit/jostel-tsh-index.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- TSHI = ln(TSH)+0.1345*FT4 and sTSHI = (TSHI-2.7)/0.676 verified against the primary and a second reproduction; TSH>0 guarded before the log. PASS.

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
