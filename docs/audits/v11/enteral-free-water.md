# v11 audit - Enteral Free-Water & Flush Target (`enteral-free-water`)

- Auditor: CG
- Date: 2026-06-09
- Citation re-verified against: Boullata JI, et al. ASPEN Safe Practices for Enteral Nutrition Therapy. JPEN J Parenter Enteral Nutr. 2017;41(1):15-103. Free water in formula = daily volume x free-water fraction; flush = goal - delivered. spec-v62 §3.2.

## Boundary examples added
- mid: 1200 mL/day at 84% free water, goal 1500 -> 1008 mL/day from formula; 492 mL/day flush; 123 mL q6h.
- clamp: 2000 mL/day at 80%, goal 1000 -> formula delivers 1600 > goal, flush clamps to 0 (never negative).
- impossible: free-water fraction 150% -> RangeError.

## Cross-implementation differential
- Reference: hand calculation. 1200 x 0.84 = 1008; 1500 - 1008 = 492; 492 / 4 = 123. Sophie matches exactly. PASS.

## Edge-input handling notes
- `freeWaterPct` bounded `[0,100]`; out-of-range throws RangeError; NaN/'' throw TypeError (caught by `safe()`). Flush uses `Math.max(0, ...)` so an over-delivering formula yields a 0 flush, never a negative number. PASS.

## A11y / keyboard notes
- Three labeled numeric inputs, Tab order = source order; `aria-live="polite"` output. `npm run test:a11y` clean. PASS.

## Defects opened
- none

## Status
- PASS
