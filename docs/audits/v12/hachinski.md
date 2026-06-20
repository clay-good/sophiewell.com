# v12 audit - hachinski

- Auditor: CG
- Date: 2026-06-20
- Citation re-verified against: Hachinski VC, Iliff LD, Zilhka E, et al. Cerebral blood flow in dementia. Arch Neurol. 1975;32(9):632-637 (re-fetched; the original is paywalled, so the per-item weights were cross-read across the official ARIC/NIH study form, medicalcriteria.com, GPnotebook, FPNotebook, and radiopaedia, all internally consistent and summing to the published max of 18).

`lib/neuro-v122.js hachinski()` sums thirteen weighted features. Five score 2
points each -- abrupt onset, fluctuating course, history of strokes, focal
neurological symptoms, and focal neurological signs -- and eight score 1 point
each -- stepwise deterioration, nocturnal confusion, relative preservation of
personality, depression, somatic complaints, emotional incontinence, hypertension,
and associated atherosclerosis -- for a maximum of 18. Bands: <= 4 favors a primary
degenerative (Alzheimer-type) dementia, 5-6 indeterminate/mixed, >= 7 favors a
vascular (multi-infarct) cause. Class A (fixed point weights; journal+author
citation, no ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Boundary worked examples added
- no features -> 0/18, degenerative band.
- stepwise deterioration alone -> 1/18 (the source correction: it is 1 point, not 2).
- a single 2-point item -> 2/18.
- four 1-point items -> 4/18 (degenerative) vs four 2-point items -> 8/18 (vascular): the band-flip.
- abrupt + fluctuating + depression -> 5/18, the indeterminate band.
- all 13 items -> 18/18, the published maximum.
- scalar fuzz arg -> valid 0/18, never NaN.

## Cross-implementation differential
- Reference: every reachable source agrees on the per-item weights. SOURCE
  CORRECTION captured: stepwise deterioration is **1 point, NOT 2** -- a common
  mis-recall that the official ARIC/NIH form and all reproductions contradict; this
  is exactly why the weights are re-fetched and not recalled (spec-v97). The five
  2-point items sum (5x2) + (8x1) = 18, matching every source that states a max.
  Match. PASS.

## Edge-input handling notes
- Thirteen booleans summed with their published weights; total clamped 0-18. A
  scalar fuzz arg yields a valid 0/18, never NaN.

## A11y / keyboard notes
- Thirteen labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
