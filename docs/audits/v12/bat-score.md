# v12 audit - bat-score

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Morotti A, Dowlatshahi D, Boulouis G, et al. Predicting intracerebral hemorrhage expansion with noncontrast computed tomography: the BAT score. Stroke. 2018;49(5):1163-1169 (re-fetched; PubMed PMID 29669875 and the AHA abstract content cross-read with the Frontiers 2023 review and a clinical reproduction).

`lib/neuro-v118.js batScore()` sums three non-contrast CT markers: the Blend
sign (+1), Any intrahematoma hypodensity (+2), and Timing onset-to-NCCT < 2.5 h
(+2), for a total of 0-5. The validated dichotomy is >= 3 predicts hematoma
expansion (sensitivity ~0.50, specificity ~0.89 in the derivation cohort).
Class A (fixed point weights; journal+author citation, no ISSUER_PATTERN trip --
no docs/citation-staleness.md row).

## Boundary worked examples added
- no markers -> 0/5, below threshold.
- blend sign alone -> 1/5 (below threshold).
- hypodensity alone -> 2/5 (below the >= 3 band-flip).
- blend + hypodensity -> 3/5, crosses the expansion-prediction threshold.
- timing + hypodensity -> 4/5 high band.
- all three -> 5/5.

## Cross-implementation differential
- Reference: the 1/2/2 weights (max 5) and the >= 3 dichotomy are unanimous
  across all four sources. The paper publishes NO per-score expansion-probability
  table, so the tile frames risk via the >= 3 threshold and the cited operating
  characteristics (sens ~0.50, spec ~0.89) only -- it invents no continuous
  probability. A secondary validation cohort reports 0.41/0.93 at the same
  threshold; the tile quotes the primary 0.50/0.89 pairing. Match. PASS.

## Edge-input handling notes
- All three inputs are booleans; the total is clamped 0-5. A scalar / non-object
  fuzz arg yields a valid 0/5, never a NaN.

## A11y / keyboard notes
- Three labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none

## Status
- PASS
