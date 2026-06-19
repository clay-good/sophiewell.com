# v12 audit - rabt-score

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Joseph B, Khan M, Truitt M, et al. World J Surg. 2018;42(11):3702-3708.

`lib/trauma-v108.js rabtScore()` adds 1 point each for shock index (HR/SBP) > 1,
pelvic fracture, penetrating mechanism, and positive FAST, clamping the total to
0-4; a total >= 2 predicts massive transfusion. Class A.

## Boundary worked examples added
- no inputs -> 0, below threshold.
- shock index > 1 scores a point; <= 1 does not.
- band flip: total crossing 2 into the activation band.
- all four items present clamp to 4.
- shock index reported when HR and SBP present, null otherwise.

## Cross-implementation differential
- Reference: the four items, the 0-4 range, and the >= 2 cutoff (sensitivity 84
  percent, specificity 77 percent, AUROC 0.83) cross-verified against the World J
  Surg paper and the Canadian validation. Match. PASS.

## Edge-input handling notes
- the shock index point counts only when both HR and SBP are entered (and positive);
  a missing pair contributes 0. A trigger-threshold aid, not an MTP order.

## A11y / keyboard notes
- Labeled number inputs/checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
