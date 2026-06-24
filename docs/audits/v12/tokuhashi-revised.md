# v12 audit - tokuhashi-revised

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Tokuhashi Y, Matsuzaki H, Oda H, Oshima M, Ryu J. A revised scoring system for preoperative evaluation of metastatic spine tumor prognosis. Spine. 2005;30(19):2186-2191 (cross-verified against PMC3578515, which reproduces the original Table 1, and mdapp.co).

`lib/spine-v146.js tokuhashiRevised()` consumes the six prognostic parameters
(general condition, extraspinal bone metastases, vertebral-body metastases,
major-organ metastases, primary site, palsy) and computes the total 0-15 with
the published expected-survival band. A lower total is the worse prognosis.
Class A.

## Source-governance notes
- Six parameters: general condition (KPS poor 0 / moderate 1 / good 2),
  extraspinal bone foci (>=3 = 0 / 1-2 = 1 / 0 = 2), vertebral-body metastases
  (>=3 = 0 / 2 = 1 / 1 = 2), major-organ metastases (unremovable 0 / removable 1
  / none 2), primary site (0-5; lung/stomach lowest, thyroid/breast/prostate
  highest), palsy (Frankel A,B = 0 / C,D = 1 / E = 2).
- Bands: 0-8 expected survival < 6 months, 9-11 >= 6 months, 12-15 >= 1 year.
- A blank parameter renders the complete-the-fields fallback.

## Boundary worked examples added
- total 8 -> < 6 months; 9 -> >= 6 months (8->9 survival-band change).
- total 11 -> >= 6 months; 12 -> >= 1 year (11->12 flip).
- floor 0, ceiling 15.

## Edge-input handling notes
- Six required selects; unrecognized keys ignored. Total is a bounded integer
  0-15 -- no non-finite path. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- Six labeled selects (leading blank placeholder); output aria-live="polite".
  320px sweep, no hscroll.

## Defects opened
- none
