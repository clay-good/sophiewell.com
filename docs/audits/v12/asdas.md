# v12 audit - asdas

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Lukas C, Landewé R, Sieper J, et al. Development of an ASAS-endorsed disease activity score (ASDAS) in patients with ankylosing spondylitis. Ann Rheum Dis. 2009;68(1):18-24 (cross-verified against the official ASAS calculator and the CamCOPS ASDAS task documentation; CRP-floor and cutoffs cross-verified against the Machado validation, PMC8972926).

`lib/rheum-v148.js asdas()` consumes the four 0-10 NRS items (back pain, morning
stiffness, patient global, peripheral pain) plus CRP (mg/L, preferred) or ESR
(mm/h) and computes the weighted ASDAS value with the published activity band.
Class A.

## Source-governance notes
- ASDAS-CRP = 0.12*back pain + 0.06*morning stiffness + 0.11*patient global +
  0.07*peripheral pain + 0.58*ln(CRP+1). ASDAS-ESR uses DIFFERENT item weights
  (0.08/0.07/0.11/0.09) + 0.29*sqrt(ESR) -- the two variants do NOT share the
  back-pain/morning-stiffness/peripheral coefficients (a common transcription
  trap; cross-verified against ASAS + CamCOPS).
- CRP < 2 mg/L is floored to 2 before the log term (Machado operational rule).
- Cutoffs: inactive < 1.3, low 1.3-<2.1, high 2.1-3.5, very high > 3.5. CRP is
  preferred; both variants are computed and reported when both inputs are present.

## Boundary worked examples added
- bp4 ms3 pg5 pp2 CRP10 -> 2.74 (high); inactive/low 1.3 boundary; high->very-high
  3.5 boundary; CRP-floor equivalence at 0 vs 2 mg/L; ESR-variant path.

## Edge-input handling notes
- Five required values via reqNum()/num() bounds; a blank NRS item or a missing
  acute-phase reactant surfaces a complete-the-fields fallback rather than scoring
  a partial value. Covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Six labeled number inputs (inputmode numeric/decimal); output aria-live. 320px
  sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
