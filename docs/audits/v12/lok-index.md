# v12 audit - lok-index

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Lok AS, Ghany MG, Goodman ZD, et al. Predicting cirrhosis in patients with hepatitis C based on standard laboratory tests: results of the HALT-C cohort. Hepatology. 2005;42(2):282-292 (re-fetched; the four coefficients confirmed verbatim from EBMcalc and PMC10699156).

`lib/hep-v124.js lokIndex()` computes x = -5.56 - 0.0089 x platelets (10^9/L) + 1.26 x
(AST/ALT) + 5.27 x INR, then probability = 1 / (1 + e^-x) via an overflow-safe
sigmoid. Below 0.2 rules cirrhosis out; above 0.5 rules it in. Class A (fixed 2005
coefficients; journal+author citation, no ISSUER_PATTERN trip -- no
docs/citation-staleness.md row).

## Boundary worked examples added
- platelets 120, AST 60, ALT 50, INR 1.2 -> probability 0.77, likely cirrhosis.
- a low-risk profile -> probability < 0.2, ruled out.
- extreme inputs stay in [0,1] (overflow-safe), never Infinity.
- non-positive / missing (incl. ALT 0) -> valid:false (no divide-by-zero).

## Cross-implementation differential
- Reference: coefficients -5.56 / -0.0089 / 1.26 / 5.27 confirmed; AST/ALT is the
  ratio (not individual values); platelets in 10^9/L (~150, matching the -0.0089
  coefficient); thresholds 0.2 / 0.5 confirmed. Match. PASS.

## Edge-input handling notes
- Four number inputs; ALT must be positive (ratio guard) and all four required; the
  logistic uses an overflow-safe 1/(1+e^-x). A scalar fuzz arg -> valid:false.

## A11y / keyboard notes
- Four labeled number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
