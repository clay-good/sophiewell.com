# v12 audit - frail-scale

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Morley JE, Malmstrom TK, Miller DK. A simple frailty questionnaire (FRAIL) predicts outcomes in middle aged African Americans. J Nutr Health Aging. 2012;16(7):601-608. The five items and the 0/1-2/>=3 bands were cross-verified across 2+ sources.

`lib/frailty-v143.js frailScale()` sums five bedside items (Fatigue, Resistance,
Ambulation, Illnesses >= 5 of 11, Loss of weight > 5%), one point each, for a 0-5
total mapped to 0 robust / 1-2 pre-frail / >= 3 frail. Class A.

## Source-governance notes
- FRAIL is the acronym for the five domains; "Resistance" is difficulty climbing
  one flight of stairs and "Ambulation" is difficulty walking one block.
  "Illnesses" counts five or more of eleven listed chronic conditions.
- Bands are the source's: 0 robust, 1-2 pre-frail, >= 3 frail (`abnormal` flips at
  the pre-frail -> frail boundary, score 3).

## Boundary worked examples added
- zero items -> robust.
- one to two items -> pre-frail.
- the pre-frail -> frail boundary flips at 3 (2 -> 3).
- all five -> 5, frail.

## Edge-input handling notes
- Each item is a checkbox coerced through onFlag(). A bounded sum -- no non-finite
  path. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- Five labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
