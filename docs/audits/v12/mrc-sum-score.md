# v12 audit - mrc-sum-score

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: De Jonghe B, Sharshar T, Lefaucheur JP, et al. JAMA. 2002;288(22):2859-2867 (re-fetched; cross-read with the Springer Critical Care MRC-sumscore review s13054-020-03282-x and review PMC5103015).

`lib/critcare-v112.js mrcSumScore()` sums six movements graded bilaterally
(shoulder abduction, elbow flexion, wrist extension, hip flexion, knee extension,
ankle dorsiflexion -- 12 muscle groups), each 0-5 on the MRC scale, to a sum of
0-60. A sum below 48 defines ICU-acquired weakness; below 36 is severe. Class A.

## Boundary worked examples added
- all groups graded 4 -> sum 48, at or above the threshold (not weakness).
- the threshold is strictly < 48: 47 is weakness, 48 is not.
- a sum below 36 is severe weakness.
- the maximum sum is 60 (all groups 5).
- a missing muscle group -> complete-the-fields fallback.

## Cross-implementation differential
- Reference: the six movements, the bilateral 12-group structure, the 0-60 range,
  and the strictly-less-than-48 threshold matched the sources. SOURCE NOTE: the
  upper-limb movement is elbow FLEXION (two secondary sources transcribe "elbow
  extension" in error); the tile uses flexion. The < 36 severe band is a widely
  cited secondary threshold. Match. PASS.

## Edge-input handling notes
- requires all 12 groups graded; otherwise a fallback. Each grade is clamped to
  0-5 before summing.

## A11y / keyboard notes
- Twelve labeled 0-5 selects (six movements x left/right); output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
