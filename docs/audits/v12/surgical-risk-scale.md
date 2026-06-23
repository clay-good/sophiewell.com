# v12 audit - surgical-risk-scale

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Sutton R, Bann S, Brooks M, Sarin S. The Surgical Risk Scale as an improved tool for risk-adjusted analysis in comparative surgical audit. Br J Surg. 2002;89(6):763-768. The three components and the 3-14 total range were cross-verified across 5+ sources.

`lib/surg-v142.js surgicalRiskScale()` sums CEPOD urgency (elective 1 to emergency
4) + ASA-PS grade (1-5) + BUPA operative-magnitude grade (minor 1 to complex-major
5) to 3-14. Class A.

## Source-governance notes
- The spec draft's "3-17" total range was CORRECTED to the source value 3-14
  (CEPOD 1-4 + ASA 1-5 + BUPA 1-5).
- Higher scores carry a higher in-hospital mortality (Sutton's univariate
  beta 0.84, P < 0.001); >= 8 is the common high-risk threshold. NO mortality
  probability is shipped -- the only published full equation carries a single-
  source intercept (-9.81, Harare validation), which the spec-v97 cross-
  verification discipline declines to embed.

## Boundary worked examples added
- minimum 1+1+1 = 3, below the high-risk threshold.
- emergency / ASA IV / complex-major = 13, high risk.
- the >= 8 threshold flips at 8 (CEPOD 3 + ASA 3 + BUPA 2).
- maximum 4+5+5 = 14; an out-of-range CEPOD (5) or blank -> valid:false.

## Edge-input handling notes
- Each component validates against its allowed integer set; any blank/out-of-range
  -> valid:false (complete-the-fields). A bounded sum -- no non-finite path.

## A11y / keyboard notes
- Three labeled selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
