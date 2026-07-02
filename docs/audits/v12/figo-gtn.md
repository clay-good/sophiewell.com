# v12 audit - figo-gtn

- Auditor: CG
- Date: 2026-07-02
- Citation re-verified against: FIGO Oncology Committee. Int J Gynaecol Obstet. 2002;77(3):285-287.

`lib/subspecialty-v198.js figoGtn()` implements the spec-v193/198 Advanced Specialist Quantitation
instrument. Every point weight, coefficient, and band threshold was re-fetched and
cross-verified against >= 2 independent open sources at implementation (spec-v97);
the compute routes through lib/num.js and is finite-guarded. Decision support only,
never an order (spec-v11 sec 5.3).

## Boundary worked examples added
- age 45, term, interval 14mo, hCG 2e5, size 6, liver/brain, 10 mets, single-drug -> WHO/FIGO 23, high (multi-agent).
- >= 3 worked examples in test/unit/figo-gtn.test.js exercise the band crossings and guards.
- fuzz: covered by test/unit/fuzz-tools.test.js MODULES; no non-finite leak.

## Cross-implementation differential
- The 8-factor 0/1/2/4 table cross-verified across NCI PDQ, PMC11582452, and MDCalc-aligned sources; the coding gotchas (prior chemo 0/2/4 with no 1; age/antecedent/size cap at 2) preserved. Names WHO -> citation-staleness row. PASS.

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
