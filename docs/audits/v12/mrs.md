# v12 audit - mrs

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: van Swieten JC, Koudstaal PJ, Visser MC, et al. Interobserver agreement for the assessment of handicap in stroke patients. Stroke. 1988;19(5):604-607.

`lib/neuro-v95.js mrs()` maps a single 7-point ordinal grade (0-6) to the source's verbatim descriptor and surfaces the good-outcome (0-2) / poor-outcome (3-6) dichotomy.

## Boundary worked examples added
- grade 2 -> good outcome (0-2); grade 3 -> poor outcome (3-6) (the dichotomy flip).
- grade 0 (no symptoms) and grade 6 (dead) endpoints.

## Cross-implementation differential
- Reference: van Swieten 1988 mRS descriptors and the standard 0-2 trial dichotomy. Match. PASS.

## Edge-input handling notes
- A non-integer (2.5), out-of-range (7, -1), or blank grade returns a surfaced valid:false guard rather than a wrong band. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- One labeled <select>; output aria-live="polite". 320px sweep passes with no horizontal scroll. Reports the grade and dichotomy only, not a disposition.

## Defects opened
- none

## Status
- PASS
