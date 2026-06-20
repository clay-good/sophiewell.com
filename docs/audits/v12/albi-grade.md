# v12 audit - albi-grade

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Johnson PJ, Berhane S, Kagebayashi C, et al. Assessment of liver function in patients with hepatocellular carcinoma: a new evidence-based approach -- the ALBI grade. J Clin Oncol. 2015;33(6):550-558 (re-fetched; coefficients and grade cutoffs cross-read across PMC5645222 and PMC7683769).

`lib/hep-v124.js albiGrade()` computes ALBI = log10(bilirubin in umol/L) x 0.66 +
albumin in g/L x -0.085, taking albumin in g/dL and bilirubin in mg/dL and converting
internally (g/dL x 10; mg/dL x 17.1). Grade 1 <= -2.60, grade 2 (-2.60, -1.39], grade
3 > -1.39. Class A (fixed 2015 coefficients; journal+author citation, no
ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- albumin 3.5 g/dL, bilirubin 1.0 mg/dL -> score -2.16, grade 2.
- preserved function (4.5 / 0.6) -> grade 1, not flagged.
- poor function (2.0 / 5.0) -> grade 3, flagged.
- non-positive / missing inputs -> valid:false (no log10(0)).

## Cross-implementation differential
- Reference: the albumin coefficient is the primary-paper -0.085 (NOT the -0.0852
  some implementations carry); units bilirubin umol/L, albumin g/L confirmed; grade
  cutoffs -2.60 / -1.39 confirmed across two PMC sources. Match. PASS.

## Edge-input handling notes
- Two number inputs; both must be strictly positive or the tile surfaces a
  complete-the-fields fallback (never log10(0) or log10(-x)).

## A11y / keyboard notes
- Two labeled number inputs; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
