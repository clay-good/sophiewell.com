# v12 audit - carg-toxicity

- Auditor: CG
- Date: 2026-06-23
- Citation re-verified against: Hurria A, Togawa K, Mohile SG, et al. Predicting chemotherapy toxicity in older adults with cancer: a prospective multicenter study. J Clin Oncol. 2011;29(25):3457-3465 (Table 4). The eleven point weights, the band cutoffs, and the per-band toxicity rates were cross-verified across 4+ sources (SOFOG Table 4 reproduction, MDCalc, cancercalc.com, mdapp.co; PMC6067916 for cutoffs).

`lib/frailty-v143.js cargToxicity()` sums eleven weighted predictors and bands the
total low (0-5) / intermediate (6-9) / high (>= 10). Class A (fixed 2011 weights).

## Source-governance notes
- The per-factor weights were re-fetched, never recalled (the thing people get
  wrong). Hemoglobin, creatinine clearance, and falls are each weighted 3 (the
  highest); age, GI/GU cancer, standard-dose chemo, polychemotherapy, hearing, and
  walking limitation are each 2; medication help and decreased social activity are
  each 1. Hemoglobin is a SINGLE factor (male OR female cutoff, never both).
- Band cutoffs (low 0-5, intermediate 6-9, high >= 10) and the collapsed per-band
  grade 3-5 toxicity rates (~30% / ~52% / ~83%) are unanimous across sources.
- TOTAL RANGE -- sources disagree: the paper reports the observed range as 0-19,
  but the arithmetic maximum summing all weights is 23. The tile allows the score
  to compute to 23 and bands everything >= 10 as high; the high band is identical
  either way. No CrCl is recomputed -- the input is a banded yes/no (< 34 mL/min)
  so the tile stays deterministic and does not shadow cockcroft-gault, which is
  cross-linked for computing the value.
- No dose-reduction or proceed/defer order is authored (spec-v143 §7) -- the tile
  reports the score, band, and the source's toxicity rate only.

## Boundary worked examples added
- no risk factors -> 0, low risk.
- the low -> intermediate band change at the 5/6 cutoff (three 2-point factors =
  6 -> intermediate; drop one -> 4 -> low).
- weighted predictors: hemoglobin, CrCl, and falls each 3 points; med help and
  social activity each 1.
- high-risk band at >= 10; arithmetic maximum is 23.

## Edge-input handling notes
- Each predictor is a checkbox coerced through onFlag(). A bounded weighted sum --
  no non-finite path. Covered by the spec-v59 fuzz harness.

## A11y / keyboard notes
- Eleven labeled checkboxes; output aria-live="polite". 320px sweep, no hscroll.

## Defects opened
- none
