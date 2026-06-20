# v12 audit - egris

- Auditor: CG
- Date: 2026-06-19
- Citation re-verified against: Walgaard C, Lingsma HF, Ruts L, et al. Prediction of respiratory insufficiency in Guillain-Barre syndrome. Ann Neurol. 2010;67(6):781-787 (re-fetched; the original is paywalled, so the scoring box reproduced verbatim and attributed to Walgaard 2010 in the open-access PMC "Ten Steps" GBS review Box 3, plus the Evidencio and Neuroassistant reproductions, were cross-read).

`lib/neuro-v121.js egris()` sums three items: days from onset of weakness to
admission (more than 7 d 0, 4-7 d 1, 3 d or fewer 2), facial and/or bulbar
weakness (+1), and the MRC sum-score band at admission (60-51 0, 50-41 1, 40-31 2,
30-21 3, 20 or below 4), for a total of 0-7. The published mechanical-ventilation
risk is reported only as category rates -- low (0-2) ~4%, intermediate (3-4) ~24%,
high (>= 5) ~65% -- with a continuous logistic curve and no per-score table.
Class A (fixed point weights; journal+author citation, no ISSUER_PATTERN trip --
no docs/citation-staleness.md row).

## Boundary worked examples added
- all 0-point inputs -> 0/7, low band ~4%.
- onset <= 3 d + facial/bulbar -> 3/7, crosses into the intermediate band ~24%.
- onset <= 3 d + facial/bulbar + MRC 30-21 -> 6/7, the high band ~65%.
- every item at maximum -> 7/7, clamped.
- scalar fuzz arg -> valid 0/7, never NaN.

## Cross-implementation differential
- Reference: the point weights are unanimous across the derivation-box reproduction
  and the calculator reproductions. The paper publishes NO discrete per-integer
  ventilation-risk table -- only the three category rates (4% / 24% / 65%) over the
  continuous curve -- so the tile quotes the category rates and invents no per-score
  percentage. A separate "modified EGRIS / mEGRIS" (Luijten 2022, range 0-32) is a
  different instrument and is NOT conflated. Match. PASS.

## Edge-input handling notes
- Two selects (days 0-2, MRC band 0-4) and one boolean; total clamped 0-7. A scalar
  fuzz arg yields a valid 0/7, never NaN.

## A11y / keyboard notes
- Two labeled selects, one labeled checkbox; output aria-live="polite". 320px
  sweep, no hscroll.

## Defects opened
- none
