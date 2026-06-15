# v12 audit - therapy-units

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: CMS Pub. 100-04 Ch. 5 20.2 and 42 CFR 410 (the Medicare 8-minute rule for time-based therapy CPT codes: 8-22 = 1 unit, 23-37 = 2, 38-52 = 3, 53-67 = 4, each +15 minutes adds a unit, counted on cumulative total minutes); the AMA "Rule of Eights" applies the 8-minute threshold to each service individually.

`lib/billing-v80.js therapyUnits()` computes Medicare units = floor((total + 7)/15) (0 below 8) on the cumulative total, and Rule-of-Eights units = the sum of each service's own 8-minute-rule count, surfacing the divergence between the two on the same minutes.

## Boundary examples added
- 8-minute bands: 7 -> 0, 8 -> 1, 22 -> 1, 23 -> 2, 50 -> 3, 52 -> 3, 53 -> 4.
- Rule of Eights vs cumulative: [8,8] -> 2 (RoE) vs 1 (Medicare); [7,7] -> 0 vs 1; [15,15] -> agree.

## Cross-implementation differential
- Reference: the CMS 8-minute band table, computed by hand at each boundary.
- Test case: 50 cumulative minutes -> 3 units. Sophie: 3. Reference: identical. PASS. The [8,8] divergence (RoE 2 vs Medicare 1) reproduces the textbook PT/OT/SLP boundary case.

## Edge-input handling notes
- Medicare mode requires totalMinutes in [0,100000]; Rule-of-Eights mode requires a non-empty perServiceMinutes array (TypeError otherwise); each per-service value validates with num(). An unknown rule throws TypeError.

## A11y / keyboard notes
- Rule select, a numeric total input and a comma-separated per-service field; output aria-live="polite". 320px sweep passes.

## Defects opened
- none

## Status
- PASS
