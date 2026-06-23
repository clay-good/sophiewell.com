# v12 audit - p-possum

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Prytherch DR, Whiteley MS, Higgins B, et al. POSSUM and Portsmouth POSSUM for predicting mortality. Br J Surg. 1998;85(9):1217-1220. The recalibrated mortality constants (-9.065 / 0.1692 / 0.1550) were re-fetched and cross-verified across 3 independent sources; a 2024 secondary reprint's rounded -9.37/0.19/0.15 variant was rejected as a typo.

`lib/surg-v142.js pPossum()` uses the identical 18 POSSUM variables but the
Portsmouth-recalibrated mortality equation ln[R/(1-R)] = -9.065 + 0.1692*phys +
0.1550*op. It reports the P-POSSUM mortality beside the original POSSUM mortality
for the same scores so the low-risk over-prediction is visible. Class A.

## Source-governance notes
- There is NO separate P-POSSUM morbidity equation -- the unchanged POSSUM
  morbidity equation stays in the possum tile.
- Same overflow-safe odds-space logistic and complete-the-fields fallback as possum.

## Boundary worked examples added
- minimum 12/6 scores: P-POSSUM 0.2% vs original POSSUM 1.1% (the documented
  low-risk divergence -- POSSUM over-predicts ~5x at the floor).
- phys 32 / op 18: P-POSSUM 29.7% vs POSSUM 50% (the two converge as risk rises).
- a blank variable -> valid:false.

## Edge-input handling notes
- Identical 18-select validation to possum.

## A11y / keyboard notes
- 18 labeled selects; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
