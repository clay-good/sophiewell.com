# v12 audit - hscore-hlh

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Fardet L, Galicier L, Lambotte O, et al. Development and validation of the HScore, a score for the diagnosis of reactive hemophagocytic syndrome. Arthritis Rheumatol. 2014;66(9):2613-2620.

`lib/hemonc-v94.js hscoreHlh()` sums nine weighted items (max 337) and reads the probability of reactive HLH from the published curve; an HScore >= 169 best discriminates HLH (sensitivity 93%, specificity 86%).

## Boundary worked examples added
- temp 40, both organs, 2 cytopenias, ferritin 4000, TG 3, fibrinogen 2, AST 100, hemophagocytosis -> 274, probability > 99%.
- all-low inputs -> 0, probability < 1%.
- cutoff edge: 169 -> high discrimination.
- temperature/ferritin band weights verified.

## Cross-implementation differential
- Reference: Fardet 2014 HScore weights and probability curve. Match. PASS.

## Edge-input handling notes
- Out-of-set selectors fall through to 0 (no undefined sum). Blank numeric items contribute 0. Fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Two yes/no <select>s, two band <select>s, five labeled numeric inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
