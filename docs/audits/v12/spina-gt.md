# v12 audit - spina-gt

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Dietrich JW, et al. Front Endocrinol. 2016;7:57.

`lib/endo-quant-v197.js spinaGt()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- TSH 1, FT4 16.5 -> GT 4.70 pmol/s (in-band).
- >= 3 worked examples in test/unit/spina-gt.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- GT = betaT*(DT+TSH)*6901*FT4/(alphaT*TSH); the protein-binding factor 6901 = 1+K41*[TBG]+K42*[TBPA] and constants cross-verified against the primary Table 1 and the SPINA R package; worked example reproduces to 4.70. PASS.

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
