# v12 audit - tash-score

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Yucel N, Lefering R, Maegele M, et al. J Trauma. 2006;60(6):1228-1236.

`lib/trauma-v108.js tashScore()` sums the weighted variables (Hb, base excess, SBP
bands; HR > 120; positive FAST; unstable pelvis; open/dislocated femur; male) to a
total clamped 0-31, then maps it to the logistic probability of mass transfusion
P = 1/(1 + e^-x), x = -4.9 + 0.3*TASH, with the exponent clamped finite. Class A.

## Boundary worked examples added
- no inputs -> score 0, low probability (~0.7 percent), valid.
- tile example: Hb 9.5 + BE -7 + SBP 95 + HR 130 + FAST = 16, ~47.5 percent.
- band flip: probability crossing 50 percent (high flag) at higher totals.
- hemoglobin bands: < 7 = 8 points; >= 12 = 0.
- all variables clamp to the published 0-31 maximum.
- overflow-safe: extreme inputs stay finite.

## Cross-implementation differential
- Reference: every point value (Hb 8/6/4/3/2; BE 4/3/1; SBP 4/1; HR 2; FAST 3;
  pelvis 6; femur 3; male 1) and the logistic constants (-4.9 intercept, +0.3 slope)
  re-fetched and cross-verified against MDCalc and the J Trauma full text. The
  additive max is 31 (MDCalc), not the abstract's 28 (which treats the fracture
  component as a single AIS item). The sign arrangement reproduces the published
  anchors (~50 percent near 16). Match. PASS.

## Edge-input handling notes
- numeric bands count only when the value is entered; binary items use the shared
  onFlag helper. A risk estimate, not an MTP order -- the note says so.

## A11y / keyboard notes
- Labeled number inputs/checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
