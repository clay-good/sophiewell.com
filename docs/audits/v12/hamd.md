# v12 audit - hamd

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Hamilton M. A rating scale for depression. J Neurol Neurosurg Psychiatry. 1960;23(1):56-62.

`lib/psych-v96.js hamd()` sums the 17 clinician-rated items under Hamilton's mixed anchors (items 1-3, 7-11, 15: 0-4; items 4-6, 12-14, 16-17: 0-2), bands the total 0-52, and refuses a band from a partially-completed instrument.

## Boundary worked examples added
- band edges: total 7 -> no/none, 8 -> mild, 16 -> mild, 17 -> moderate, 23 -> moderate, 24 -> severe.
- every item rated 1 -> total 17 -> moderate; band string startsWith "HAM-D 17: moderate depression".
- a blank item -> "(complete all 17 items)", no band; an out-of-range item (item 4 = 4 against its 0-2 anchor) is rejected, not clamped into the total.

## Cross-implementation differential
- Reference: Hamilton 1960 17-item HDRS item weighting and severity bands. Match. PASS.

## Edge-input handling notes
- Each item is clamped to its own anchor; a non-array / wrong-length / blank input withholds the band; an out-of-range value yields valid:false rather than a silently-wrong sum. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- Seventeen labeled numeric item inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Reports the score and band only; no diagnosis.

## Defects opened
- none

## Status
- PASS
