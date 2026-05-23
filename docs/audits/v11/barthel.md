# v11 audit - barthel

- Auditor: CG
- Date: 2026-05-22
- Citation re-verified against: Mahoney FI, Barthel DW. *Functional evaluation: the Barthel Index.* Md State Med J. 1965;14:61-65. Ten ADL items with weighted 0/5/10/15-point increments per the published form (feeding 0/5/10, bathing 0/5, grooming 0/5, dressing 0/5/10, bowel 0/5/10, bladder 0/5/10, toilet 0/5/10, transfers 0/5/10/15, mobility 0/5/10/15, stairs 0/5/10). Total 0-100 in 5-point increments. Severity banding per Shah S, Vanclay F, Cooper B. *Improving the sensitivity of the Barthel Index for stroke rehabilitation.* J Clin Epidemiol. 1989;42(8):703-709 — five bands: 100 independent, 91-99 slight, 61-90 moderate, 21-60 severe, 0-20 total dependency.

`lib/scoring-v4.js barthel()` enforces the published per-item allowed-value sets (off-grid values reject), sums to a 0-100 total, and bands per Shah 1989.

## Boundary examples added

- Score 100 (tile example, all maximal) -> independent.
- Score 95 (feeding 5 instead of 10) -> slight dependency (lower-typical edge above the moderate boundary).
- Score 90 (feeding 5 + bathing 0) -> moderate dependency (upper edge).
- Score 65 (no transfers, dressing, stairs) -> moderate dependency (lower-region typical edge).
- Score 60 (no transfers, mobility, stairs) -> severe dependency (upper edge).
- Score 25 (just feeding + bowel + bathing) -> severe dependency (lower-region typical edge).
- Score 20 (just feeding + bowel) -> total dependency (upper edge).
- Score 0 (all zero) -> total dependency.

## Cross-implementation differential

- Reference: Mahoney 1965 publishes the per-item weights; Shah 1989 publishes the five-band severity scheme that has become the modern reference. The score is always a multiple of 5 because all per-item allowed values are multiples of 5.
- Sophie result: every band-boundary worked example above matches the Shah 1989 cutoffs. PASS.

## Edge-input handling notes

- Off-grid item values (feeding=7, transfers=20, mobility=-5) reject with a typed Error per spec-v11 §3.1.
- Non-integer (NaN, 5.5), missing items, and out-of-range values reject.
- The 5-point grid is enforced per-item rather than as a post-hoc divisibility check on the total, so the error message names the offending item directly.

## A11y / keyboard notes

- Ten labeled selects, each option explicitly naming the score (e.g., "10 independent"); all Tab-reachable; aria-live result region wraps the tile output, including the per-item breakdown muted line for the bedside hand-off. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
