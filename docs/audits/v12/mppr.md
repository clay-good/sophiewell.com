# v12 audit - mppr

- Auditor: CG
- Date: 2026-06-13
- Citation re-verified against: CMS Pub. 100-04 Claims Processing Manual, Ch. 12 40.6 (multiple surgery: 100% of the highest-fee line, 50% of each subsequent line, ranked by fee) and 40.7 (endoscopy base-code rule: the endoscopic base value is subtracted from each subsequent endoscopy before payment). The MPFS MULT PROC indicator selects which policy applies.

`lib/billing-v78.js mppr()` re-ranks the lines by fee (highest first), applies the selected reduction, and returns per-line and total expected allowed plus the dollars the reduction withholds, in integer cents.

## Boundary examples added
- tile example: surgical lines $1000 + $600 -> $1000 (100%) + $300 (50%) = $1300 allowed; $300 withheld.
- four-line surgical $1000/$600/$400/$200 -> 100/50/50/50 = $1600 allowed; $600 withheld.
- endoscopy base rule, base $200, lines $500 + $400 -> $500 (full) + $200 (= $400 - $200 base) = $700.
- single line -> paid in full; zero withheld. Empty list -> TypeError (renderer prompts to add a line).

## Cross-implementation differential
- Reference: Pub. 100-04 Ch. 12 40.6 worked 100/50/50 chain computed by hand.
- Test case: $1000, $600, $400, $200 surgical.
- Sophie result: $1000 + $300 + $200 + $100 = $1600 allowed; $600 withheld.
- Reference result: identical. PASS. Ranking is by fee regardless of input order (verified with a shuffled list).

## Edge-input handling notes
- Each line fee validates as finite >= 0 (num()); the subsequent percentage and endoscopic base validate in range; one rounding per reduced line.
- Lines with a non-positive fee are dropped at the view layer before compute, so a blank row never poisons the total.

## A11y / keyboard notes
- Add/Remove line buttons; each fee input carries an aria-label naming its line; mode and percentage are labeled. Output `aria-live="polite"`. `npm run test:a11y` clean; 320px no-horizontal-scroll sweep passes.

## Defects opened
- none

## Status
- PASS
