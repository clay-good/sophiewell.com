# v12 audit - hepatic-steatosis-index

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Lee JH, Kim D, Kim HJ, et al. Dig Liver Dis. 2010;42(7):503-508 (re-fetched; formula and thresholds confirmed verbatim from the Lee 2010 abstract PubMed 19766548 and the MDApp calculator).

`lib/hep-v125.js hepaticSteatosisIndex()` computes HSI = 8 x (ALT/AST) + BMI + 2 (if
female) + 2 (if diabetes). Below 30 rules NAFLD out (sensitivity ~93%); above 36 rules
it in (specificity ~92%); 30-36 indeterminate. Class A (fixed 2010 coefficients;
journal+author citation, no ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- ALT 60, AST 30, BMI 30, female, diabetes -> HSI 50, ruled in.
- a lean profile -> HSI < 30, ruled out.
- female and diabetes each add 2 (base 36 -> 38 with female).
- non-positive / missing (incl. AST 0) -> valid:false (no divide-by-zero).

## Cross-implementation differential
- Reference: coefficient 8 on the ALT/AST ratio, BMI added directly, +2 female, +2
  diabetes, thresholds 30/36 confirmed. Match. PASS.

## Edge-input handling notes
- Three number inputs (ALT/AST/BMI) + two checkboxes; AST must be positive (ratio
  denominator) and ALT/BMI positive or the tile surfaces a complete-the-fields
  fallback. A scalar fuzz arg -> valid:false.

## A11y / keyboard notes
- Three labeled number inputs + two labeled checkboxes; output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none
