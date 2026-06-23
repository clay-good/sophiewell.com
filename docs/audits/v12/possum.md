# v12 audit - possum

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Copeland GP, Jones D, Walters M. POSSUM: a scoring system for surgical audit. Br J Surg. 1991;78(3):355-360. The 18 variable point-bands and the two logistic equations were re-fetched and cross-verified across >= 2 independent sources (MDCalc, StatPearls, primary-paper reproductions).

`lib/surg-v142.js possum()` grades the 12 physiological + 6 operative variables
(each 1/2/4/8, with the published gaps: WCC and operative-severity have no
8-point band; age/procedures/urgency/ECG skip a level) to a physiological score
(12-88) and operative score (6-48), then drives the two logistic equations:
morbidity ln[R/(1-R)] = -5.91 + 0.16*phys + 0.19*op and mortality
ln[R/(1-R)] = -7.04 + 0.13*phys + 0.16*op. Class A (Clinical Scoring & Risk,
Group G).

## Source-governance notes
- The reference UK surgical-audit / benchmarking model. POSSUM is known to
  over-predict mortality at the low-risk end, which P-POSSUM corrects -- the two
  tiles are cross-linked and both kept.
- Each probability is computed in odds space from a logit clamped to [-40, 40] so
  exp() never overflows; a blank required variable surfaces a complete-the-fields
  fallback rather than a probability from NaN.

## Boundary worked examples added
- physiological score 32 / operative score 18 (mortality logit exactly 0) ->
  morbidity 93.3%, mortality 50.0%.
- minimum scores 12 / 6 -> mortality ~1.08% (the low end where P-POSSUM diverges).
- a blank variable -> valid:false; an out-of-band grade (e.g. age = 8) -> valid:false.

## Edge-input handling notes
- The 18 selects each carry a leading blank placeholder; any unfilled variable
  returns valid:false. The point-grade is validated against the variable's allowed
  set, so a stray value cannot inflate the score.

## A11y / keyboard notes
- 18 labeled selects, each with <label for>; output aria-live="polite". 320px
  sweep, vertical scroll only, no hscroll.

## Defects opened
- none
