# v12 audit - spina-gd

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Dietrich JW, et al. Front Endocrinol. 2016;7:57.

`lib/endo-quant-v197.js spinaGd()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- FT4 16.5, FT3 4.5 -> GD 25.22 nmol/s (in-band).
- >= 3 worked examples in test/unit/spina-gd.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- GD = beta31*(KM1+FT4)*601*FT3/(alpha31*FT4); the T3-binding factor 601 = 1+K30*[TBG] was the key correction (a simplified form omitting it is ~601x low). Three SPINA-package worked examples (25.22/336.23/63.70) reproduce to the decimal. PASS.

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
