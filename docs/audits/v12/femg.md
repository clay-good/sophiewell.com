# v12 audit - femg

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Elisaf M, et al. Miner Electrolyte Metab. 1998;24(2-3):315-318 (PMID 9513927; the 0.7 free-fraction correction and the hypomagnesemia >4% cutoff cross-read against the Elisaf abstract, Medscape hypomagnesemia workup, and MedCentral; the 4% renal-wasting threshold is Elisaf's hypomagnesemia-specific value).

`lib/renal-v128.js femg()` computes FEMg (%) = (urine Mg x plasma Cr) / (0.7 x plasma
Mg x urine Cr) x 100. The 0.7 multiplier corrects for the ~30% protein-bound,
non-filterable plasma magnesium. Class A (journal+author citation, no ISSUER_PATTERN
trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- urine Mg 2.0, plasma Mg 1.2, matched creatinines -> 4.8% (renal wasting).
- the 0.7 multiplier raises FE vs the uncorrected form (4.76 vs 3.33).
- low FE (urine Mg 1.0, plasma Mg 2.0) -> 0.7% (extra-renal loss).
- zero/missing denominator term -> valid:false; scalar -> valid:false.

## Source-governance / threshold note
- The band flips at >2% (a commonly cited sensitive screen) and the band text names
  Elisaf's hypomagnesemia-specific ~4% cutoff. A 2024 pediatric study reports a 2%
  cutoff in hypomagnesemic vs 4% in normomagnesemic patients; both are within the
  band's stated range. The 0.7 is applied to the denominator so it never zeroes it
  (a minority calculator variant omits it and inflates FE by ~1/0.7 -- not used here).

## Edge-input handling notes
- pos() guards each of the four inputs; denominator (0.7 x plasma Mg x urine Cr)
  positive before the division. Rounded to one decimal; band classified on the
  rounded value.

## A11y / keyboard notes
- Four number inputs each labeled; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
