# v12 audit - nitrogen-balance

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: ASPEN nutrition-support core curriculum (cross-verified against the Practical Gastroenterology nitrogen-balance review and the Harvard MEEI nitrogen-balance reference; >= 2 sources, spec-v97).

`lib/endo-metab-v161.js nitrogenBalance()` computes nitrogen balance. Group F,
Class A.

## Source-governance notes
- N balance (g/day) = (protein g / 6.25) - (24h UUN g + insensible losses). The
  6.25 g protein per g nitrogen factor reflects protein being ~16% nitrogen. The
  insensible-loss constant defaults to 4 g/day and is an optional input.
- Positive = anabolic, negative = catabolic. Requires a complete 24h urine
  collection and is unreliable in significant renal impairment.

## Boundary worked examples added
- the tile example (protein 100, UUN 8 -> +4, anabolic); a catabolic -8; the 6.25
  factor (6.25 g protein = 1 g N) and the adjustable insensible loss; blanks ->
  valid:false.

## Edge-input handling notes
- Inputs are finite and non-negative; a blank surfaces a complete-the-fields
  fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Two labelled number inputs + an optional insensible-loss input; output
  aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
