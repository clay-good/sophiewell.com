# v12 audit - ivc-fluid-responsiveness

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Barbier C, Loubieres Y, Schmit C, Hayon J, Ricome
  JL, Jardin F, Vieillard-Baron A. Intensive Care Med. 2004;30(9):1740-1746.

`lib/fluidresp-v113.js ivcFluidResponsiveness()` computes, per ventilation mode,
the distensibility index (Dmax - Dmin) / Dmin x 100 (mechanical, ~18% cutoff) or
the collapsibility (caval) index (Dmax - Dmin) / Dmax x 100 (spontaneous). Class A.

## Boundary worked examples added
- mechanical 2.0 / 1.6 cm is 25% distensibility, above the ~18% cutoff.
- a distensibility just under 18% (2.0 / 1.75) is below the fluid-response threshold.
- spontaneous mode uses the collapsibility index over Dmax (2.0 / 1.0 -> 50%).
- denominator guarded per mode: Dmin 0 mechanical / Dmax 0 spontaneous return a
  fallback, never NaN or Infinity.
- partial input -> complete-the-fields fallback.

## Cross-implementation differential
- Reference: the distensibility-index arithmetic and the ~18% fluid-response
  cutoff are the Barbier 2004 definition. Match. PASS. The spontaneous
  collapsibility index and its widely-taught ~40-50% suggestive range are framed
  as the caval-index reading, not asserted as a Barbier cutoff.

## Edge-input handling notes
- the denominator is selected by mode and guarded strictly positive before
  dividing; a Dmin above Dmax yields a correctly-signed negative index in words.

## A11y / keyboard notes
- One labeled mode select plus two labeled number inputs; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
