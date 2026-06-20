# v12 audit - meld-xi

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Heuman DM, Mihas AA, Habib A, et al. MELD-XI: a rational approach to patients with end-stage liver disease requiring anticoagulation. Liver Transpl. 2007;13(1):30-37 (re-fetched; the three coefficients confirmed verbatim from the abstract via PubMed 17154400).

`lib/hep-v124.js meldXi()` computes 5.11 x ln(bilirubin) + 11.76 x ln(creatinine) +
9.44, both labs in mg/dL, each floored at 1.0 before the log, rounded to an integer.
Class A (fixed 2007 coefficients; journal+author citation, no ISSUER_PATTERN trip --
no docs/citation-staleness.md row).

## Boundary worked examples added
- bilirubin 2.0, creatinine 1.5 -> 18.
- both labs <= 1.0 floor to the intercept -> round(9.44) = 9.
- missing labs -> valid:false.
- never negative (floor guarantees score >= 9).

## Cross-implementation differential
- Reference: coefficients 5.11 / 11.76 / 9.44 confirmed. GOVERNANCE: the 1.0 mg/dL
  floor is the standard-MELD convention (so the score cannot go negative), NOT an
  explicit clause in the bare Heuman 2007 equation; documented as such. No rescaling
  and no creatinine cap are applied (source-faithful to the published equation).
  Match. PASS.

## Edge-input handling notes
- Two number inputs floored at 1.0; ln guarded. A scalar fuzz arg -> valid:false.

## A11y / keyboard notes
- Two labeled number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
