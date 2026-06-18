# v12 audit - egsys

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Del Rosso A, Ungar A, Maggi R, et al. Heart. 2008;94(12):1620-1626.

`lib/cardio-v104.js egsys()` sums the signed EGSYS weights and bounds the total to [-2, +12]; a score >= 3 suggests cardiac syncope. Class A.

## Source correction (spec-v97 lesson: source governs over spec wording)
- spec-v104 prose combined "effort or supine" into one +3 item and phrased the -1 terms as "absence of"; the primary paper and MDCalc (calc/3948) both define effort (+3) and supine (+2) as SEPARATE items and score the two -1 terms (precipitating factors, autonomic prodromes) when PRESENT. The true range is -2 to +12 (positive weights sum to the universally-cited maximum of 12), not -2 to +10. Implemented the source/MDCalc-parity version.

## Boundary worked examples added
- no factors -> 0, below threshold.
- both -1 items present -> -2 (minimum).
- 2 -> 3 flip with a negative term: palpitations (+4) + autonomic prodrome (-1) = 3 -> cardiac.
- palpitations (+4) + both -1 items = 2 -> not cardiac.
- effort (+3) + supine (+2) = 5 (separate items).
- all positives -> 12.
- fuzz: signed-weight sum (negative terms exercised), bounded, no non-finite leak.

## Cross-implementation differential
- Reference: Del Rosso 2008 derived weights, cross-checked against MDCalc and the Frontiers Cardiovasc Med 2023 reproduction. Match. PASS.

## Edge-input handling notes
- Boolean flags only; the total is clamped to [-2, +12] so an out-of-range sum is impossible.

## A11y / keyboard notes
- Labeled checkboxes; output aria-live="polite". 320px sweep passes with no horizontal scroll. Probability estimate, not an admission order.

## Defects opened
- none

## Status
- PASS
