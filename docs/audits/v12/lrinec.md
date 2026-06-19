# v12 audit - lrinec

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Wong CH, Khin LW, Heng KS, Tan KC, Low CO. Crit Care Med. 2004;32(7):1535-1541.

`lib/traumaclass-v109.js lrinec()` bands six routine labs to the published point
values (total 0-13) and maps the total to low (<= 5) / intermediate (6-7) /
high (>= 8) suspicion. Class A.

## Boundary worked examples added
- all-normal labs score 0 (low risk).
- each lab bands to its published point value (max 13).
- intermediate band 6-7.
- band flip: a sixth-lab point crosses 7 into the high band.
- hemoglobin boundary: 13.5 scores 1, just above scores 0.

## Cross-implementation differential
- Reference: CRP >= 150 mg/L = 4, WBC 15-25/>25 = 1/2, Hb 11-13.5/<11 = 1/2,
  Na < 135 = 2, creatinine > 1.6 mg/dL = 2, glucose > 180 mg/dL = 1, cross-verified
  against MDCalc, WikEM, and the Wong 2004 paper. The CRP 150 mg/L = 15 mg/dL
  unit equivalence is the most common transcription error and was confirmed; the
  probability bands (<= 5 / 6-7 / >= 8) are kept distinct from the >= 6 suspicion
  cutoff. Match. PASS.

## Edge-input handling notes
- a low score does not rule out necrotizing fasciitis; the note states it.
  Partial labs score only what was entered.

## A11y / keyboard notes
- Labeled numeric inputs with units; output aria-live="polite". 320px sweep, no
  hscroll.

## Defects opened
- none

## Status
- PASS
