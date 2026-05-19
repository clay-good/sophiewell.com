# v11 audit - icdsc

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Bergeron N, Dubois MJ, Dumont M, Dial S, Skrobik Y. *Intensive Care Delirium Screening Checklist: evaluation of a new screening tool.* Intensive Care Med. 2001;27(5):859-864. Eight binary items each scored 0/1; cutoff >=4 of 8 for delirium.

`lib/scoring-v4.js icdsc()` sums the eight Bergeron 2001 items and returns the count plus a delirium-band interpretation per spec-v11 §5.

## Boundary examples added
- low (tile example): 0 of 8 -> below the Bergeron 2001 cutoff (>=4).
- mid (sub-threshold): 3 of 8 -> still below cutoff.
- threshold: exactly 4 of 8 -> delirium per Bergeron 2001.
- high: 8 of 8 -> delirium (Bergeron 2001 maximum).

## Cross-implementation differential
- Reference implementation: Bergeron N, et al. Intensive Care Med. 2001;27(5):859-864 §Results (8-item binary sum).
- Test case: items A, B, C, D checked (4 of 8).
- Sophie result: score 4, delirium = true.
- Reference result: 4 of 8 meets the >=4 cutoff. PASS within one ordinal category.

## Edge-input handling notes
- Eight boolean inputs only.

## A11y / keyboard notes
- Eight labeled checkboxes; Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
