# v12 audit - fagan-post-test

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Fagan TJ. Nomogram for Bayes theorem. N Engl J Med. 1975;293(5):257 (cross-verified against standard EBM texts and the odds-form derivation; ≥ 2 sources, spec-v97).

`lib/ebm-v163.js faganPostTest()` computes the Fagan Post-Test Probability. Group E, Class A.

## Source-governance notes
- Pre-test odds = p/(1−p); post-test odds = pre-test odds × LR; post-test p = odds/(1+odds).
- Computed in ODDS space (not sigmoid-then-subtract) so p→0/1 with a large LR cannot leak a non-finite value (the spec-v140 lesson).
- sens/spec mode derives LR+ = sens/(1−spec) and LR− = (1−sens)/spec and reports both post-test probabilities.

## Boundary worked examples added
- pre-test 20% × LR+ 10 → 71.4%; LR<1 lowers the probability; p→1 with LR 1e6 clamps to 100 (no NaN); pre-test 0/100% and blank LR → valid:false.

## Edge-input handling notes
- pre-test guarded to (0,100) exclusive (odds need p in (0,1)); spec=100 excluded (LR+ infinite). Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- A mode select + four labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
