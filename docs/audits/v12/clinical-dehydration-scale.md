# v12 audit - clinical-dehydration-scale

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: Goldman RD, Friedman JN, Parkin PC. Validation of the clinical dehydration scale for children with acute gastroenteritis. Pediatrics. 2008;122(3):545-549. Items, level descriptors, and bands cross-verified across two independent reproductions.

`lib/peds-v140.js clinicalDehydrationScale()` sums four items -- general
appearance, eyes, mucous membranes, and tears -- each scored 0-2, to 0-8: 0 = no
dehydration, 1-4 = some dehydration, 5-8 = moderate to severe dehydration.
Class A.

## Source-governance notes
- Validated in children roughly 1 to 36 months with acute gastroenteritis; the
  posture note states this population.
- The tool reports the total and band; the rehydration route and rate decision
  stays with the clinician.

## Boundary worked examples added
- appearance 1, eyes 1, mucous 2, tears 1 -> 5 (the some -> moderate-severe flip).
- all 0 -> 0 (no dehydration).
- score 4 -> the upper edge of the some band.
- all 2 -> 8 (moderate to severe).
- out-of-range items clamp to 0-2.

## Edge-input handling notes
- Each item clamps to [0, 2]; a blank scores 0; the tool is always valid and
  bounded; scalar-path fuzz returns finite, leak-free strings.

## A11y / keyboard notes
- Four labeled selects each with a "not assessed" first option; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
