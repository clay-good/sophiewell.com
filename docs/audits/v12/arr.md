# v12 audit - arr

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Funder JW, Carey RM, Mantero F, et al. The management of primary aldosteronism: an Endocrine Society clinical practice guideline. J Clin Endocrinol Metab. 2016;101(5):1889-1916 (cross-verified against the aldosterone-to-renin meta-analysis PMC9279773 and ARUP Consult; >= 2 sources, spec-v97).

`lib/endo-metab-v161.js arr()` computes the Aldosterone-Renin Ratio. Group E,
Class A (Endocrine Society is not in the issuer-acronym set, so no staleness row).

## Source-governance notes
- ARR = plasma aldosterone (ng/dL) / renin. Renin is PRA (ng/mL/h) or DRC
  (mIU/L). Unit discipline is the dominant concern: the cutoff differs by renin
  unit and is never compared across unit systems.
- PRA cutoff ~20-40 (representative 30) with aldosterone >= 15 ng/dL as a
  positive screen; DRC cutoff ~3.7 (range 2.4-4.9). A positive screen warrants
  confirmatory testing, not a diagnosis. Renin guarded > 0.

## Boundary worked examples added
- the tile example (PRA, ratio 44, positive); a high ratio with low aldosterone
  that is NOT positive; the DRC cutoff vs PRA cutoff for the same ratio; renin = 0
  or missing unit -> valid:false.

## Edge-input handling notes
- The renin division is guarded (renin > 0); a blank surfaces a complete-the-
  fields fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Two labelled number inputs + a renin-unit select; output aria-live. 320px
  sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
