# v11 audit - Norepinephrine-Equivalent Vasopressor Dose (`norepi-equiv`)

- Auditor: CG
- Date: 2026-06-10
- Citation re-verified against: Kotani Y, et al. An updated "norepinephrine equivalent" score in intensive care as a marker of shock severity. Crit Care. 2023;27:29 (proposed standard); Goradia S, et al. J Crit Care. 2021;61:233-240. spec-v62 §3.1.

## Source-constant pinning (the wave-1 deferral reason)
- The wave-1 note deferred this tile because NE-equivalent vasopressin/angiotensin factors vary across scoping reviews. Pinned to the Kotani 2023 proposed-standard formula, confirmed against the published article (doi:10.1186/s13054-023-04322-y):
  - norepinephrine x1, epinephrine x1 (mcg/kg/min)
  - dopamine /100 (mcg/kg/min)
  - phenylephrine x0.06 (mcg/kg/min)
  - vasopressin x2.5 (units/min — not weight-keyed)
  - angiotensin II x0.0025 (ng/kg/min)
- Weight is deliberately NOT an input: the catecholamine doses are already weight-indexed (mcg/kg/min) and vasopressin is units/min, so the published formula is weight-normalized. A weight field would be dead UI; the tile says so.

## Boundary examples added
- example: NE 0.1 + epi 0.05 + vasopressin 0.04 U/min -> 0.25 mcg/kg/min (vasopressin contributes 0.04 x 2.5 = 0.1).
- each-factor: dopamine 10 -> 0.1; phenylephrine 1 -> 0.06; angiotensin II 20 ng/kg/min -> 0.05.
- all-zero: empty form -> total 0 (not an error); "enter at least one agent dose" rendered.

## Cross-implementation differential
- Reference: hand calculation against the Kotani 2023 formula. 0.1 + 0.05 + 2.5x0.04 = 0.25. Sophie matches exactly. PASS.

## Edge-input handling notes
- Each agent bounded (catecholamines [0,100] mcg/kg/min; vasopressin [0,10] U/min; angiotensin II [0,1000] ng/kg/min). NaN/negative throw TypeError/RangeError, caught by `safe()`; empty fields coerce to 0 (`nv() || 0`). No NaN/Infinity leak. PASS.

## A11y / keyboard notes
- Six labeled numeric inputs, Tab order = source order; `aria-live="polite"` output. `npm run test:a11y` clean. PASS.

## Defects opened
- none

## Status
- PASS
