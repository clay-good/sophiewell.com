# v12 audit - pps

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Anderson F, Downing GM, Hill J, et al. Palliative Performance Scale (PPS): a new tool. J Palliat Care. 1996;12(1):5-11; PPSv2 (c) Victoria Hospice Society, 2001 (cross-verified against the Victoria Hospice PPSv2 sample and the HIGN "Try This" reproduction — cell-for-cell identical, zero discrepancies; ≥ 2 sources, spec-v97).

`lib/function-v154.js pps()` resolves the five PPSv2 columns to a level 0%–100%
in 10% decrements using the documented read-leftward rule. Group G, Class A.

## Source-governance notes
- Five columns (ambulation; activity & evidence of disease; self-care; intake;
  conscious level), levels 100% down to 0% in 10% steps (0% = death).
- The scoring rule is "best horizontal fit; begin at the leftmost column and work
  across; leftward columns take precedence." Each column descriptor is consistent
  with a SET of levels (ambulation "Full" spans 100/90/80), so the implementation
  intersects the running candidate set column-by-column from the left; a rightward
  column that conflicts with the leftward-established set is overridden (and flagged)
  rather than emptying the set. The level is the highest (least-impaired) value still
  consistent (read-down convention). Ambulation = Death short-circuits to 0%.
- PPSv2 is © Victoria Hospice Society with a no-alteration clause; the column
  descriptors are reproduced as factual functional states with attribution and the
  tile alters nothing.

## Boundary worked examples added
- reduced ambulation converges to 70%; full ambulation disambiguated rightward to a
  single level; read-leftward conflict overridden and flagged (mainly-in-bed +
  unable-most vs full self-care → 40%); bottom rows disambiguated by intake/conscious
  to 20%; death dominates to 0%; blank column → valid:false.

## Edge-input handling notes
- Each column requires a selection; a blank column surfaces a complete-the-fields
  fallback. The candidate-set intersection never yields an empty result (leftward
  precedence preserves the prior set); covered by the spec-v59 fuzz harness, zero
  non-finite leaks.

## A11y / keyboard notes
- Five labelled selects; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
