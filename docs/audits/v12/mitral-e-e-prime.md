# v12 audit - mitral-e-e-prime

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Nagueh SF, Smiseth OA, Appleton CP, et al. Recommendations for the evaluation of left ventricular diastolic function by echocardiography. J Am Soc Echocardiogr. 2016;29(4):277-314 (cross-verified against the ASE 2016 diastolic-function summary and the JAHA validation study PMC8649534; ≥ 2 sources, spec-v97).

`lib/echo-v158.js mitralEePrime()` computes the E/e′ LV filling-pressure estimate
with the average-vs-single-site cutoffs. Group E, Class A.

## Source-governance notes
- E/e′ = mitral E (cm/s) ÷ e′ (cm/s). The e′ division is guarded (e′ > 0).
- Average E/e′: < 9 normal, 9–14 indeterminate, > 14 elevated LV filling pressure
  (the published normal boundary is < 9, not < 8 — corrected at implementation).
- Single-site cutoffs for elevated filling pressure: septal > 15, lateral > 13.

## Boundary worked examples added
- the tile example (average 15 → elevated); the 14/15 average elevated boundary;
  average < 9 normal; the septal > 15 and lateral > 13 single-site flips; e′ = 0
  or missing site → valid:false.

## Edge-input handling notes
- A blank/non-finite/zero e′ surfaces a complete-the-fields fallback rather than
  NaN/Infinity; covered by the spec-v59 fuzz harness, zero non-finite leaks.

## A11y / keyboard notes
- Two labelled number inputs + an e′-site select; output aria-live. 320px sweep,
  no horizontal scroll.

## Defects opened
- none

## Status
- PASS
