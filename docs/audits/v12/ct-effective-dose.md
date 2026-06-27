# v12 audit - ct-effective-dose

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: AAPM Report 96 / EUR 16262 conversion coefficients (adult region k-factors cross-verified across two independent CT-dose references citing AAPM Report 96; ≥ 2 sources, spec-v97).

`lib/radiology-v165.js ctEffectiveDose()` computes the CT Effective Dose. Group E, Class A.

## Source-governance notes
- Effective dose (mSv) = DLP (mGy·cm) × region k. Adult k: head 0.0021, head-neck 0.0031, neck 0.0059, chest 0.014, abdomen 0.015, pelvis 0.015, abdomen-pelvis 0.015.
- A population estimate (ICRP-60 weighting), not patient-specific organ dosimetry; pediatric factors differ and are not used.
- DLP guarded > 0; region select required; multiplication range-checked.

## Boundary worked examples added
- chest DLP 400 → 5.6 mSv (k 0.014); head/neck/abdomen k-factors verified; blank DLP / missing region → valid:false.

## Edge-input handling notes
- each k-factor is the correctness-critical content and re-fetched; abdomen and pelvis share 0.015. Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- One number input + a region select, each labelled; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
