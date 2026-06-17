# v12 audit - pcl5

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Blevins CA, Weathers FW, Davis MT, et al. The PTSD Checklist for DSM-5 (PCL-5): development and initial psychometric evaluation. J Trauma Stress. 2015;28(6):489-498.

`lib/psych-v96.js pcl5()` sums the 20 items (each 0-4), reports the provisional-PTSD screen framed as the source's cutoff RANGE (>= 31-33, not a single hard number), tallies the DSM-5 B/C/D/E clusters (item endorsed at a rating >= 2), and refuses a result from a partially-completed instrument.

## Boundary worked examples added
- cutoff range flip: total 30 -> below; 31 -> at or above; 33 -> at or above.
- cluster tallies: every item rated 2 -> total 40, clusters B 5/5, C 2/2, D 7/7, E 6/6, at or above the cutoff.
- a rating of 1 does not count toward a cluster tally (clusters all 0); total 20, below cutoff.
- a blank item -> "(complete all 20 items)"; an out-of-range item (5) is rejected.

## Cross-implementation differential
- Reference: Blevins 2015 PCL-5 total, the DSM-5 cluster item maps, and the published provisional cutoff range. Match. PASS.

## Edge-input handling notes
- Items clamped to 0-4; non-array / blank withholds the result; out-of-range yields valid:false. The cutoff is quoted as the source's range, not asserted as a single threshold. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- Twenty labeled numeric item inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Screen, not a diagnosis.

## Defects opened
- none

## Status
- PASS
