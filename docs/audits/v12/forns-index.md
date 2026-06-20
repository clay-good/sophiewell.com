# v12 audit - forns-index

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Forns X, Ampurdanes S, Llovet JM, et al. Identification of chronic hepatitis C patients without hepatic fibrosis by a simple predictive model. Hepatology. 2002;36(4 Pt 1):986-992 (re-fetched; coefficients and the critical cholesterol unit cross-read across PMC8120009 -- which prints "cholesterol (mg/dL)" verbatim -- PMC2936897, and the original PubMed 12297848).

`lib/hep-v124.js fornsIndex()` computes 7.811 - 3.131 x ln(platelets in 10^9/L) +
0.781 x ln(GGT) + 3.467 x ln(age) - 0.014 x cholesterol in mg/dL. Below 4.2 rules out
significant fibrosis (NPV ~96%); above 6.9 rules it in; between is indeterminate.
Class A (fixed 2002 coefficients; journal+author citation, no ISSUER_PATTERN trip --
no docs/citation-staleness.md row).

## Boundary worked examples added
- age 30, GGT 20, platelets 280, cholesterol 220 -> 1.22, ruled out.
- a high-fibrosis profile -> > 6.9, flagged.
- mg/dL vs a mmol/L-magnitude cholesterol value diverge by > 2.5 score points (guards
  the unit correction).
- non-positive / missing -> valid:false (no ln(0)).

## Cross-implementation differential
- Reference: SPEC CORRECTION captured (v97 re-fetch) -- the cholesterol term is
  **mg/dL, NOT the mmol/L the spec-v124 draft input label said**; the -0.014
  coefficient is calibrated to mg/dL magnitudes (feeding mmol/L makes the term ~38x
  too small and grossly inflates the score). Confirmed verbatim "cholesterol (mg/dL)"
  in PMC8120009. Thresholds 4.2 / 6.9 confirmed. Match. PASS.

## Edge-input handling notes
- Four number inputs; age, GGT, platelets must be strictly positive (ln guards), and a
  blank/non-positive value surfaces a complete-the-fields fallback.

## A11y / keyboard notes
- Four labeled number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
