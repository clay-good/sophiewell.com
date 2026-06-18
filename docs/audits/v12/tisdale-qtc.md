# v12 audit - tisdale-qtc

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Tisdale JE, Jaynes HA, Kingery JR, et al. Circ Cardiovasc Qual Outcomes. 2013;6(4):479-487.

`lib/cardio-v101.js tisdaleQtc()` sums age >= 68 (1), female (1), loop diuretic (1), K <= 3.5 (2), admission QTc >= 450 (2), acute MI (2), sepsis (3), heart failure (3), and QT-prolonging drugs (one 3, two or more 6). Total 0-21: low <= 6, moderate 7-10, high >= 11. The cumulative drug item (one 3 + one more 3 for >= two) is what yields the published maximum of 21. Class A.

## Boundary worked examples added
- sepsis + heart failure -> 6, still low (upper edge).
- + age >= 68 -> 7, moderate (band flip).
- a 11-point combination -> high.
- one drug -> 3; two-or-more drugs -> 6.
- all factors with >= 2 drugs -> 21 maximum.
- fuzz: bounded integer sum.

## Cross-implementation differential
- Reference: the Tisdale 2013 risk-factor weights; the >= 2-drug cumulative model that produces the MDCalc-published maximum of 21. Match. PASS.

## Edge-input handling notes
- Boolean flags plus a drug-count select mapped through a fixed table (unknown value -> 0); bounded integer sum, no non-finite leak. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
