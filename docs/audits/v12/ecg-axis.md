# v12 audit - ecg-axis

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Surawicz B, Knilans T. Chou's Electrocardiography in Clinical Practice. 6th ed. Saunders/Elsevier; 2008 (standard hexaxial frontal-plane axis reference).

`lib/cardio-v90.js ecgAxis()` computes the mean frontal-plane QRS axis from the net QRS deflection in lead I and lead aVF via atan2 on the hexaxial reference (lead I = 0 deg, aVF = +90 deg, an orthogonal pair). It returns the axis in degrees and the quadrant: normal (-30 to +90), left-axis deviation (-30 to -90), right-axis deviation (+90 to +180), extreme/northwest (-90 to -180). Lead II is accepted but does not change the result. The all-isoelectric (0,0) input returns "indeterminate axis", never 0 deg or a NaN.

## Boundary worked examples added
- Lead I 8, aVF 6 -> +36.9 deg, normal.
- atan2 boundaries: -30 deg -> normal; +90 deg -> normal; +180 deg -> right-axis deviation; -90 deg -> extreme/northwest.
- Lead I 1, aVF -1 -> -45 deg, left-axis deviation.
- (0,0) -> indeterminate axis (guarded).

## Cross-implementation differential
- Reference: hand computation. atan2(6, 8) = 36.8699 deg -> 36.9. Sophie matches. PASS.

## Edge-input handling notes
- Classification is on the rounded degree so the shown axis and named quadrant always agree (a raw -30.0000001 displays "-30 deg" and reads normal). A blank limb lead renders the complete-the-fields fallback. The spec-v59 fuzz harness covers the module, zero non-finite leaks; the atan2 (0,0) domain is guarded.

## A11y / keyboard notes
- Three labeled numeric inputs (lead I, aVF, optional lead II); output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
