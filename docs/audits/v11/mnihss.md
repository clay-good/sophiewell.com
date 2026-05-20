# v11 audit - mnihss

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Meyer BC, Hemmen TM, Jackson CM, Lyden PD. *Modified National Institutes of Health Stroke Scale for use in stroke clinical trials: prospective reliability and validity.* Stroke. 2002;33(5):1261-1266. Eleven items: LOC questions (0-2), LOC commands (0-2), best gaze (0-2), visual fields (0-3), motor arm L (0-4), motor arm R (0-4), motor leg L (0-4), motor leg R (0-4), sensory dichotomized (0-1), best language (0-3), extinction / inattention (0-2). Total 0-31. Severity bands per NIHSS convention (mNIHSS validates against the same bands per Meyer 2002 Results).

`lib/scoring-v4.js mnihss()` returns `{total, severity, band}`.

## Boundary examples added
- 0 (tile example) -> no stroke symptoms.
- 1 -> minor.
- 4 (upper edge of minor) -> minor.
- 5 (lower edge of moderate) -> moderate.
- 15 (upper edge of moderate) -> moderate.
- 20 (upper edge of moderate-severe) -> moderate-severe.
- 21 (lower edge of severe) -> severe.
- 31 (all maxima) -> severe.

## Cross-implementation differential
- Reference: Meyer 2002 derivation cohort severity bands (NIHSS-convention bands).
- Sophie result: matches across all eight boundary cases above. PASS.

## Edge-input handling notes
- Any item out of its per-item 0-max range throws with a clear message.

## A11y / keyboard notes
- Eleven labeled range inputs with linked output spans; Tab-reachable; aria-live result region.

## Defects opened
- none

## Status
- PASS
