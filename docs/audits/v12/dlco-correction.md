# v12 audit - dlco-correction

- Auditor: CG
- Date: 2026-06-30
- Citation re-verified against: Macintyre N, et al (ATS/ERS). Eur Respir J 2005;26(4):720-735 (Cotes hemoglobin correction cross-verified against the ATS/ERS DLCO standard and the 2017 update; >= 2 sources, spec-v97). ATS matches the issuer-acronym set -- a documentation-only docs/citation-staleness.md row records the formula is unchanged.

`lib/specialtymath-v186.js dlcoCorrection()` is a deterministic, finite-guarded compute per the spec-v100 §2
doctrine; the renderer states it is decision support and defers the decision to
the clinician (spec-v11 §5.3).

## Source-governance notes
- Hb-adjusted DLCO = observed*(10.22+Hb)/(1.7*Hb) men, *(9.38+Hb)/(1.7*Hb) women; KCO = DLCO/VA.

## Boundary worked examples added
- anemia raises corrected (23.8, KCO 4); female constant differs; polycythemia lowers; Hb/VA 0 -> valid:false; sex required.

## Edge-input handling notes
- Hb and VA are guarded > 0 before the divisions; sex required; blank/non-finite surface a fallback. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Labelled inputs (`<label for>`), output aria-live. 320px sweep, no horizontal
  scroll; touch targets meet the minimum.

## Defects opened
- none

## Status
- PASS
