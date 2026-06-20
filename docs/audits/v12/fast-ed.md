# v12 audit - fast-ed

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Lima FO, Silva GS, Furie KL, et al. Field Assessment Stroke Triage for Emergency Destination: a simple and accurate prehospital scale to detect large vessel occlusion strokes. Stroke. 2016;47(8):1997-2002 (re-fetched; the PMC full text and the MDCalc reproduction are byte-identical on the item->point table).

`lib/neuro-v119.js fastEd()` sums five NIHSS-derived field items: Facial palsy
(0-1), Arm weakness (0-2), Speech changes (0-2), Eye deviation (0-2), and Denial/
Neglect (0-2), for a total of 0-9. The validated dichotomy is >= 4 predicts a
large-vessel occlusion and supports comprehensive-center triage (sensitivity
~0.60, specificity ~0.89, PPV ~0.72 in the derivation cohort). Class A (fixed
point weights; journal+author citation, no ISSUER_PATTERN trip -- no docs/
citation-staleness.md row).

## Boundary worked examples added
- no deficits -> 0/9, below threshold.
- facial + arm-drift + mild speech -> 3/9, just below the >= 4 band-flip.
- facial + severe arm + severe speech -> 5/9, crosses the LVO threshold.
- forced eye deviation + neglect alone -> 4/9, the threshold itself.
- all items at maximum -> 9/9.
- out-of-range item levels clamp to the published maxima.

## Cross-implementation differential
- Reference: the point bands are verbatim from Lima Table 1, confirmed identical
  between the PMC full text and MDCalc. NOTE: the item maxima sum to 9 (facial
  palsy caps at 1, not 2); MDCalc's UI labels the range "0-10," a sum-of-fives
  artifact. The tile uses the arithmetic-correct 0-9. Match. PASS.

## Edge-input handling notes
- Each item is a 0-N select; lib rounds and clamps each to its published maximum,
  so an out-of-range or non-finite level never overflows the 0-9 total.

## A11y / keyboard notes
- Five labeled selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
