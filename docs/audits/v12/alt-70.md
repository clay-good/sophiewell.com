# v12 audit - alt-70

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: Raff AB, Weng QY, Cohen JM, et al. J Am Acad Dermatol. 2017;76(4):618-625.

`lib/traumaclass-v109.js alt70()` scores Asymmetry (3), Leukocytosis (WBC >= 10, 1),
Tachycardia (HR >= 90, 1), and age >= 70 (2), total 0-7, mapped to <= 2 unlikely /
3-4 indeterminate / >= 5 likely. Class A.

## Boundary worked examples added
- no positive features -> cellulitis unlikely.
- asymmetry alone scores 3 (indeterminate).
- band flip: total crosses 5 into cellulitis-likely.
- age >= 70 adds 2, full house scores 7.
- thresholds are inclusive at the boundary.

## Cross-implementation differential
- Reference: the four point values and the three interpretation bands cross-
  verified against MDCalc and the Raff 2017 paper (no source disagreement). The
  <= 2 band carries the >= 83% pseudocellulitis likelihood, the >= 5 band the
  >= 82% cellulitis likelihood. Match. PASS.

## Edge-input handling notes
- a diagnostic aid, not an antibiotic order; total clamped to 0-7.

## A11y / keyboard notes
- Labeled asymmetry checkbox + numeric WBC/HR/age inputs; output
  aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
