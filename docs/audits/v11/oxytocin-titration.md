# v11 audit - Oxytocin mU/min <-> mL/hr (`oxytocin-titration`)

- Auditor: CG
- Date: 2026-06-09
- Citation re-verified against: ACOG Induction of Labor (Practice Bulletin); standard low-dose and high-dose oxytocin titration. Conversion: rate (mL/hr) = dose (mU/min) x 60 / concentration (mU/mL). spec-v62 §3.3.

## Boundary examples added
- 60 mU/mL (30 units/500 mL): 6 mU/min -> 6 mL/hr; 12 mL/hr -> 12 mU/min.
- 20 mU/mL (20 units/1000 mL): 2 mU/min -> 6 mL/hr.
- impossible: concentration 0 mU/mL -> RangeError.

## Cross-implementation differential
- Reference: hand calculation. 6 mU/min x 60 / 60 mU/mL = 6 mL/hr; 12 mL/hr x 60 mU/mL / 60 = 12 mU/min. Sophie matches exactly. PASS.

## Edge-input handling notes
- `milliunitsPerMl` bounded `min: 0.001`, so a zero concentration throws RangeError (no divide-by-zero); NaN/'' throw TypeError (caught by `safe()`). The bag concentration is selected from banded presets. Renders the "follow your unit's oxytocin protocol and uterine-activity monitoring" note. PASS.

## A11y / keyboard notes
- One labeled concentration `<select>` plus two labeled numeric inputs, Tab order = source order; `aria-live="polite"` output. `npm run test:a11y` clean. PASS.

## Defects opened
- none

## Status
- PASS
