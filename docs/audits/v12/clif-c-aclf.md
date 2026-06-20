# v12 audit - clif-c-aclf

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Jalan R, Saliba F, Pavesi M, et al. J Hepatol. 2014;61(5):1038-1047 (re-fetched; the formula confirmed verbatim from the EF-CLIF official calculator and the CLIF-OF organ table cross-read across the LWW/Medicine 2017 validation and EF-CLIF-derived sources).

`lib/hep-v125.js clifCAclf()` sums the six CLIF-OF organ sub-scores (each 1-3, total
6-18), then computes 10 x [0.33 x CLIF-OF + 0.04 x age + 0.63 x ln(WBC in 10^9/L) - 2],
rounded to an integer (0-100). Class A (fixed 2014 coefficients; journal+author
citation, no ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- liver 2, kidney 3, brain 2, coag 1, circ 2, resp 1, age 55, WBC 12 -> CLIF-OF 11,
  score 54.
- all organs at minimum -> CLIF-OF 6.
- organ sub-scores clamp to 1-3 -> CLIF-OF max 18.
- missing age/WBC -> valid:false (no ln(0)).

## Cross-implementation differential
- Reference: coefficients 0.33/0.04/0.63/-2 and the x10 multiplier confirmed verbatim
  (EF-CLIF). SOURCE-GOVERNANCE: the circulation organ scores 3 for VASOPRESSOR USE
  (canonical CLIF-OF) -- NOT the MAP < 65 of CLIF-SOFA that crept into one secondary
  table; the renderer's circulation options are MAP >= 70 (1) / MAP < 70 (2) /
  vasopressors (3). Match. PASS.

## Edge-input handling notes
- Six organ selects (clamped 1-3) + age + WBC number inputs; WBC ln guarded; a scalar
  fuzz arg -> valid:false.

## A11y / keyboard notes
- Six labeled selects + two labeled number inputs; output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none
