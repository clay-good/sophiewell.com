# v11 audit - Pediatric ETT Size Calculator (`peds-ett`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Cole formula (uncuffed: age/4 + 4 mm) and modified Cole formula (cuffed: age/4 + 3.5 mm); depth at the lip = 3 x tube size in cm. Standard pediatric airway formulas per PALS 2020 and the Harriet Lane Handbook (current edition). Verified against Khine HH, Corddry DH, Kettrick RG, et al. Comparison of cuffed and uncuffed endotracheal tubes in young children during general anesthesia. Anesthesiology. 1997;86(3):627-631.

## Boundary examples added
`pediatricEtt({ageYears, cuffed})` in [lib/field.js:232](../../../lib/field.js#L232).
- low (0 yr uncuffed): 0/4 + 4 = 4.0 mm; depth 12.0 cm. PASS.
- META example (4 yr uncuffed): 4/4 + 4 = 5.0 mm; depth 15.0 cm. PASS (matches META expected).
- mid (4 yr cuffed): 4/4 + 3.5 = 4.5 mm; depth 13.5 cm. PASS.
- mid (8 yr uncuffed): 8/4 + 4 = 6.0 mm; depth 18.0 cm. PASS.
- high (16 yr uncuffed): 16/4 + 4 = 8.0 mm; depth 24.0 cm (approaches adult range; bedside verification noted in the muted footer). PASS.
- high boundary (18 yr cuffed): 18/4 + 3.5 = 8.0 mm; depth 24.0 cm. PASS.

## Cross-implementation differential
- Reference implementation: Cole / modified Cole formulas per PALS 2020 and Harriet Lane.
- Test case: META example (4 yr uncuffed).
- Sophie result: 5.0 mm uncuffed, 15.0 cm depth.
- Reference result: 4/4 + 4 = 5.0 mm; 3 x 5 = 15 cm.
- Delta: 0%. PASS.

## Edge-input handling notes
- `num('ageYears', ...)` rejects age outside [0, 18] years.
- Tube-type select forces an explicit choice between cuffed/uncuffed; the renderer's muted footer reminds the operator to verify against bedside assessment.
- Output region carries the tube ID, the cuffed/uncuffed label, and the depth at the lip, so a user cannot confuse the two formulas.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- One labelled number input, one labelled select; output is an `<ul>` inside `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
