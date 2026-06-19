# v12 audit - lake-louise-ams

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Roach RC, Hackett PH, Oelz O, et al; Lake Louise AMS Score Consensus Committee. High Alt Med Biol. 2018;19(1):4-6 (re-fetched, cross-read with StatPearls NBK557466).

`lib/enviro-v111.js lakeLouiseAms()` sums four 0-3 symptom items (headache, GI,
fatigue/weakness, dizziness) to a total of 0-12 and applies the diagnostic gate:
AMS is present only when the total is >= 3 AND a headache is present (>= 1), after
a recent altitude gain. Severity once diagnosed: mild 3-5, moderate 6-9, severe
10-12. Class A.

## Boundary worked examples added
- total 3 with a headache -> AMS, mild.
- band flip: total 3 WITHOUT a headache fails the headache-required gate (AMS not
  diagnosed); moving one point into headache flips AMS present.
- severity bands: total 6 -> moderate, total 10 -> severe.
- total < 3 is below the diagnostic threshold.
- symptoms clamp to 0-3; the max total is 12.

## Cross-implementation differential
- Reference: the four 0-3 items, the 0-12 range, the headache-required >= 3 gate,
  and the 3-5 / 6-9 / 10-12 bands cross-verified against the 2018 consensus paper
  and StatPearls. The 2018 revision dropped the sleep item (score is 0-12, not the
  legacy 0-15). Match. PASS.

## Edge-input handling notes
- a field severity score carrying the spec-v50 §3 posture note; a partial input
  (fewer than four items rated) returns a complete-the-fields fallback, never a
  partial score.

## A11y / keyboard notes
- Four labeled 0-3 selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
