# v12 audit - harris-benedict

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Harris JA, Benedict FG. Proc Natl Acad Sci USA. 1918;4(12):370-373; revised constants Roza AM, Shizgal HM. Am J Clin Nutr. 1984;40(1):168-182 (the revised Roza-Shizgal constants cross-verified against the Roza 1984 paper and a second independent reproduction; ≥ 2 sources, spec-v97).

`lib/nutrition-energy-v152.js harrisBenedict()` consumes weight (kg), height (cm),
age (yr), sex, and an optional activity factor, and computes the sex-specific
revised BEE with TDEE = BEE × factor. Class A.

## Source-governance notes
- The REVISED (Roza 1984) constants are shipped, not the original 1919 form: male
  BEE = 88.362 + 13.397·wt + 4.799·ht − 5.677·age; female = 447.593 + 9.247·wt +
  3.098·ht − 4.330·age. Each constant verified to 3 decimals and signs (age term
  negative in both).
- Cross-linked to mifflin-st-jeor: Harris-Benedict overestimates resting
  expenditure ~5% vs Mifflin, the preferred contemporary equation.

## Boundary worked examples added
- male 70/175/40 → BEE 1639; female identical anthropometrics → 1464; activity
  factor → TDEE; blank input → valid:false.

## Edge-input handling notes
- A blank/non-finite weight, height, or age surfaces a complete-the-fields
  fallback rather than NaN; covered by the spec-v59 fuzz harness, zero leaks.

## A11y / keyboard notes
- Four labeled inputs + sex and activity select; output aria-live. 320px sweep,
  no hscroll.

## Defects opened
- none

## Status
- PASS
