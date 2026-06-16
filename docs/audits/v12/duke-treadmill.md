# v12 audit - duke-treadmill

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Mark DB, Hlatky MA, Harrell FE Jr, et al. Exercise treadmill score for predicting prognosis in coronary artery disease. Ann Intern Med. 1987;106(6):793-800.

`lib/cardio-v90.js dukeTreadmill()` computes DTS = exercise time(min) - (5 x ST deviation mm) - (4 x angina index), with the risk band (low >= +5, moderate -10 to +4, high <= -11) and the cited 5-year survival (low 99%, moderate 95%, high 79%).

## Boundary worked examples added
- Time 7, ST 1, angina 0 -> DTS 2, moderate, 95%.
- Low-risk flip at +5: time 10, ST 1 -> 5 (low, 99%); time 9, ST 1 -> 4 (moderate).
- High-risk flip at -11: time 4, ST 3 -> -11 (high, 79%); time 5, ST 3 -> -10 (moderate).

## Cross-implementation differential
- Reference: hand computation. 7 - (5 x 1) - (4 x 0) = 2 -> moderate. Sophie matches. PASS.

## Edge-input handling notes
- Exercise time and ST deviation clamp non-negative; the angina index clamps to its 0/1/2 domain (a 9 reads as 2). A blank input renders the complete-the-fields fallback. The spec-v59 fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Two labeled numeric inputs, one labeled select (angina index); output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
