# v12 audit - cpsss

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Katz BS, McMullan JT, Sucharew H, Adeoye O, Broderick JP. Design and validation of a prehospital scale to predict stroke severity: Cincinnati Prehospital Stroke Severity Scale. Stroke. 2015;46(6):1508-1512 (re-fetched; the AHA derivation, an external-validation cohort, and the MDCalc reproduction cross-read).

`lib/neuro-v119.js cpsss()` sums three NIHSS-derived field items: conjugate gaze
deviation (+2), level-of-consciousness questions/commands answered incorrectly
(+1), and severe arm weakness -- the arm cannot be held against gravity (+1), for
a total of 0-4. The validated dichotomy is >= 2 predicts a large-vessel occlusion.
Class A (fixed point weights; journal+author citation, no ISSUER_PATTERN trip --
no docs/citation-staleness.md row).

## Boundary worked examples added
- no items -> 0/4, below threshold.
- LOC alone -> 1/4, below the >= 2 band-flip.
- gaze alone -> 2/4, crosses the LVO-prediction threshold.
- LOC + arm -> 2/4, the same band-flip from two 1-point items.
- all three -> 4/4 (max).
- scalar fuzz arg -> valid 0/4, never NaN.

## Cross-implementation differential
- Reference: the 2/1/1 weighting and the >= 2 cutoff are unanimous across the
  derivation, the external validation cohort, and MDCalc. Operating
  characteristics are cohort-dependent (Katz derivation ~89%/73% for severe
  stroke [NIHSS >= 15]; external validation ~70%/87% for LVO), so the tile frames
  the >= 2 LVO prediction and names the cohort rather than fixing a single
  sens/spec pair -- it invents no number. Match. PASS.

## Edge-input handling notes
- All three inputs are booleans; the total is clamped 0-4. A scalar / non-object
  fuzz arg yields a valid 0/4, never a NaN.

## A11y / keyboard notes
- Three labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
