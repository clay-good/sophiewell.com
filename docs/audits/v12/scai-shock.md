# v12 audit - scai-shock

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: Naidu SS, et al. JSCAI. 2022;1(1):100008; Kadosh/Kapur, JACC 2022;80(3):185-198.

`lib/acs-v193.js scaiShock()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- SBP 80, lactate 3, one intervention -> stage C (classic), ~12.4% Mayo CICU mortality.
- >= 3 worked examples in test/unit/scai-shock.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- The Kadosh/Kapur CSWG operationalized thresholds and the Jentzer 2019 Mayo A-E mortality gradient (3.0/7.1/12.4/40.4/67.0%) cross-verified across the JACC full text, the ACC journal scan, and the JSCAI consensus. PASS.

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
