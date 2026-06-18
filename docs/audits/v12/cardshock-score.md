# v12 audit - cardshock-score

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Harjola VP, Lassus J, Sionis A, et al. Eur J Heart Fail. 2015;17(5):501-509.

`lib/cardio-v102.js cardShock()` sums age > 75 (1), confusion (1), prior MI/CABG (1), ACS etiology (1), EF < 40% (1), banded lactate (2-4 = 1, > 4 = 2), and banded eGFR (30-60 = 1, < 30 = 2) to a 0-9 total, mapped to low (0-3, ~8.7%) / intermediate (4-5, ~36%) / high (6-9, ~77%) in-hospital mortality. The named deterministic substitute for the excluded gestalt SCAI staging. Class A. Item points + bands cross-verified (Frontiers review transcription, cardshock.org).

## Boundary worked examples added
- low-risk case -> 2, low (~8.7%).
- 3 -> 4 flips low to intermediate.
- lactate/eGFR graded bands verified (1.9/61 -> 0; 3/45 -> 2; 5/20 -> 4).
- all factors with lactate > 4 and eGFR < 30 -> 9, high (~77%).

## Cross-implementation differential
- Reference: the Harjola 2015 nine-point model (five binaries + lactate and eGFR bands) and the three-band mortality rates. Match. PASS.

## Edge-input handling notes
- Lactate and eGFR clamped to plausible domains before banding; binaries default false; a blank lactate or eGFR surfaces valid:false. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
