# v12 audit - renal-nephrometry

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Kutikov A, Uzzo RG. J Urol. 2009;182(3):844-853. Cross-read against >= 3 secondary reproductions of the original table (radiology references and review articles); the J Urol PDF is paywalled, so the L=3 "entirely between the polar lines" placement rests on multiple corroborating secondary sources.

`lib/uro-v131.js renalNephrometry()` sums Radius + Exophytic + Nearness + Location (each 1-3) to a 4-12 score with a non-scoring a/p/x suffix and an optional h (hilar) suffix. Class A (journal+author citation - no docs/citation-staleness.md row).

## Source-governance / scoring note
- R: <=4 cm = 1, >4-<7 = 2, >=7 = 3 (7 cm exactly = 3). E: >=50% exophytic = 1, <50% = 2, entirely endophytic = 3. N: >=7 mm = 1, >4-<7 = 2, <=4 = 3 (4 mm exactly = 3). L: above/below polar line = 1, crosses a polar line = 2, >50% across / entirely between lines / crosses axial midline = 3.
- A is a NON-scoring suffix (a anterior / p posterior / x indeterminate); h is appended for a hilar tumour. Tiers 4-6 low / 7-9 moderate / 10-12 high.

## Boundary worked examples added
- 6 -> 7 low/moderate flip with the suffix carried ("7p").
- h appends after the a/p/x letter ("ah"); minimum 4; maximum 12 ("12x", high).
- blank component, missing a/p/x descriptor, or out-of-range level (4) -> valid:false; scalar -> valid:false.

## Edge-input handling notes
- Each scored component validated as an integer in [1,3]; the a/p/x descriptor required. abnormal = total >= 7.

## A11y / keyboard notes
- Six labeled selects (a blank leading option forces entry); output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
