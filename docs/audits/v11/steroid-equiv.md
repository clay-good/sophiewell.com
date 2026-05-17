# v11 audit - Steroid Equivalence Converter (`steroid-equiv`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Goodman & Gilman's *The Pharmacological Basis of Therapeutics* (Brunton, Hilal-Dandan, Knollmann eds., 13e), glucocorticoid equipotent-dose table. Cross-checked against the UpToDate "Major side effects of systemic glucocorticoids" topic, which carries the same canonical ratios.

## Boundary examples added
Pivot is 20 mg hydrocortisone equivalent. `steroidEquivalent` = doseMg × (toRow.equivDoseMg / fromRow.equivDoseMg).
- low: 5 mg prednisone -> methylprednisolone = 5 × (4 / 5) = 4.00 mg (META example)
- mid: 40 mg prednisone -> dexamethasone = 40 × (0.75 / 5) = 6.00 mg
- high: 10 mg dexamethasone -> prednisone = 10 × (5 / 0.75) = 66.67 mg

Mineralocorticoid activity column reproduced verbatim from Goodman & Gilman:
- hydrocortisone Yes, cortisone Yes, prednisone Slight, prednisolone Slight, methylprednisolone No, dexamethasone No, betamethasone No, fludrocortisone Strong (mineralocorticoid; excluded from the equivalence calculation by guard `typeof equivDoseMg !== 'number'`).

## Cross-implementation differential
- Reference implementation: hand calculation against the canonical Goodman & Gilman ratio table.
- Test case: 60 mg hydrocortisone -> prednisone.
- Sophie result: 60 × (5 / 20) = 15.00 mg.
- Reference result: 15 mg (Goodman & Gilman 13e ratio table).
- Delta: 0%. PASS.

## Edge-input handling notes
- Fludrocortisone is excluded from the selector populator (`if (typeof r.equivDoseMg !== 'number') continue`), so it cannot be picked as `from` or `to`, preventing a NaN result. PASS.
- The mineralocorticoid-activity hint renders below the equivalence line so the user is reminded that the conversion captures glucocorticoid potency only. PASS.
- Dose validation: renderer requires `dose > 0` before invoking `steroidEquivalent`. PASS.

## A11y / keyboard notes
- Dose number input + two selects, all label-bound. Output region `aria-live="polite"`. `npm run test:a11y` clean.
- Renderer uses the en-dash character `≈` (U+2248) which is a math glyph, not a dash, so `grep-check.mjs` is unaffected.

## Defects opened
- none

## Status
- PASS
