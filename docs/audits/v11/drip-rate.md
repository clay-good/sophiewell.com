# v11 audit - Drip Rate Calculator (`drip-rate`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Standard nursing infusion formulas as taught in Lehne's Pharmacology (11e) and Potter & Perry Fundamentals of Nursing (10e); identical to the public IV drop-rate formula `gtt/min = (volume_mL × drop_factor) / time_min`.

## Boundary examples added
- low: V=50 mL, t=30 min, df=10 -> 100 mL/hr; 50*10/30 = 16.667 gtts/min -> rounds to 17
- mid: V=1000 mL, t=480 min (8 h), df=15 -> 125 mL/hr; 1000*15/480 = 31.25 gtts/min -> rounds to 31
- high: V=1000 mL, t=60 min, df=60 (macrodrip primary set) -> 1000 mL/hr; 1000*60/60 = 1000 gtts/min

## Cross-implementation differential
- Reference implementation: hand calculation against the canonical formula `mL/hr = (V/t)*60` and `gtt/min = (V*df)/t`. Identical results to Potter & Perry (10e), ch. 31, worked examples.
- Test case: 1000 mL over 8 hours with a 15 gtt/mL IV set.
- Sophie result: 125 mL/hr, 31 gtts/min.
- Reference result: 125 mL/hr, 31.25 gtts/min (Sophie rounds to nearest integer for gtts).
- Delta: 0% (mL/hr exact); rounding only on gtts/min, well within the ±0.5% / ±1 unit tolerance for ordinal rate selection. PASS.

## Edge-input handling notes
- `lib/clinical.js dripRate` rejects `durationMin < 0.001` and negative `volumeMl` / `dropFactor` via the shared `num` validator; renderer surfaces the thrown message in the muted output paragraph rather than a silent NaN. PASS.
- All inputs are unit-labeled in the visible `<label>` (mL, minutes, gtts/mL). PASS.
- No optional inputs; nothing to default. The "Reset to example" link prefills V=1000, t=60, df=15 -> 1000 mL/hr / 250 gtts/min, an in-range clinical case. PASS.

## A11y / keyboard notes
- All three numeric inputs are reachable in source order via Tab; each has a label-for/for binding. Output region is `aria-live="polite"`. Reset link reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
