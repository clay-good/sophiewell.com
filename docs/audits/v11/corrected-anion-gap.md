# v11 audit - Albumin-Corrected Anion Gap (Figge) (`corrected-anion-gap`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Figge J, Jabor A, Kazda A, Fencl V. *Anion gap and hypoalbuminemia.* Crit Care Med. 1998;26(11):1807-1810.

Figge correction: AG_corr = AG_measured + 2.5 × (4.0 − albumin g/dL). The implementation also supports the optional K+-inclusive AG variant (AG = (Na + K) − (Cl + HCO3)) when `includePotassium: true`. `lib/clinical-v5.js correctedAnionGap()` enforces both forms.

## Boundary examples added
- low: Na 140, Cl 104, HCO3 24, alb 4.0 -> measured AG 12, correction term 0, corrected AG 12 (normal at normal albumin).
- mid (META example, K-excluded): Na 140, Cl 106, HCO3 24, alb 2.0 -> measured AG 10 (looks normal), corrected AG = 10 + 2.5 × (4-2) = 15 (elevated; HAGMA workup warranted despite "normal-looking" measured value).
- high: Na 140, Cl 100, HCO3 10, alb 1.5 -> measured AG 30, corrected AG = 30 + 2.5 × (4-1.5) = 36.25.

K+-inclusive variant: Na 140, K 4.0, Cl 106, HCO3 24, alb 2.0 -> measured AG = 144 − 130 = 14; corrected AG = 14 + 2.5 × 2 = 19. Documented as the contemporary critical-care preferred form per Figge 1998.

## Cross-implementation differential
- Reference implementation: Figge 1998 Crit Care Med formula (+2.5 mEq/L per 1 g/dL albumin drop).
- Test case: META example.
- Sophie result: measured AG 10, corrected AG 15.
- Reference result: 10 + 2.5 × (4-2) = 15 (Figge 1998).
- Delta: 0%. PASS.

## Edge-input handling notes
- The `includePotassium` flag is a single boolean; when true, K must be supplied (validated via the shared `num` helper); when false, K is ignored.
- Albumin is validated to be > 0; entering albumin 0 would inflate the correction unbounded, so the field carries a minimum-value validator.
- The interpretation surfacing emphasizes that a "normal" measured AG in a hypoalbuminemic patient masks underlying HAGMA — the principal misuse that Figge 1998 was written to correct.

## A11y / keyboard notes
- Four-to-five labeled number inputs (K conditional on the checkbox) + one checkbox, Tab-reachable in source order. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
