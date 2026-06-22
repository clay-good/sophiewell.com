# v12 audit - koff-bladder-capacity

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Koff SA. Estimating bladder capacity in children. Urology. 1983;21(3):248. Formula cross-verified across two independent reproductions.

`lib/peds-v140.js koffBladderCapacity()` computes the expected bladder capacity
in millilitres = (age in years + 2) x 30. Class A (Clinical Math & Conversions,
Group E).

## Source-governance notes
- The standard reference estimate for children roughly 1 to 12 years; under about
  1 year other weight-based formulas apply and in older children the estimate
  plateaus near the adult capacity. The band notes the applicable range when the
  entered age falls outside 1-12 years.
- It reports an expected capacity for reference; the clinical interpretation stays
  with the clinician.

## Boundary worked examples added
- age 4 -> (4 + 2) x 30 = 180 mL.
- age 2 -> 120 mL; age 8 -> 300 mL.
- age 15 -> 510 mL with the validated-range note.
- a negative age -> valid:false; a missing age -> valid:false.

## Edge-input handling notes
- A negative or blank age surfaces a complete-the-fields fallback; otherwise the
  single linear formula is finite for any finite age.

## A11y / keyboard notes
- One labeled number input; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
