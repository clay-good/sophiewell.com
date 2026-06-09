# v11 audit - Infusion Time Remaining & Rate-to-Last (`infusion-time-remaining`)

- Auditor: CG
- Date: 2026-06-09
- Citation re-verified against: utility-class infusion arithmetic (time = volume / rate; rate = volume / hours), with ISMP Guidelines for Optimizing Safe Use of Smart Infusion Pumps cited for safe-practice framing only (no derived constant). spec-v62 §3.1.

## Boundary examples added
- low: 250 mL at 100 mL/hr -> 2.5 h (150 min).
- mid: 1000 mL at 125 mL/hr -> 8 h.
- inverse: 500 mL to last 8 h -> 62.5 mL/hr.

## Cross-implementation differential
- Reference: hand calculation against `t = V/R` and `R = V/t`. 250/100 = 2.5 h; 500/8 = 62.5 mL/hr. Sophie matches exactly. PASS.

## Edge-input handling notes
- `rateMlHr` and `hours` carry `min: 0.001`, so a zero rate/duration throws RangeError (no divide-by-zero); NaN/'' throw TypeError. Both are caught by the renderer `safe()` wrapper. The renderer only computes a branch when its inputs are > 0, otherwise prints a guidance note. PASS.

## A11y / keyboard notes
- All three numeric inputs have `<label for>` bindings, reachable in source order via Tab; output region is `aria-live="polite"`. `npm run test:a11y` clean. PASS.

## Defects opened
- none

## Status
- PASS
