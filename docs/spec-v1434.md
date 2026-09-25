# spec-v1434 — C2HEST score for incident atrial fibrillation

Found by running the single-token gap finder over well-known named scores: `c2hest` matched nothing.
The catalog predicts new atrial fibrillation with `charge-af` (a US/European cohort model) and had
nothing from the Asian derivation that C2HEST comes from.

## Source, read 2026-09-24

Li YG et al, *Chest* 2019;155:510-518 (open access, PMC6437029): derived in 471,446 Chinese adults,
applied to 451,199 Korean adults.

| item | points |
|---|---|
| coronary artery disease | 1 |
| COPD | 1 |
| hypertension | 1 |
| age 75 or older | 2 |
| systolic heart failure | 2 |
| hyperthyroidism | 1 |

Groups: low 0-1 (0.34% per year), medium 2-3 (2.60%), high more than 3 (15.98%), in the derivation
cohort.

## Behavior

- **Structural heart disease is asked first** and, when present, the score is not computed: the
  derivation excluded these patients and said they "should be independently considered as high
  risk for AF".
- Every item must be answered; a blank is asked for, never read as "no".
- The answer quotes the per-year rate with its population, and notes that discrimination fell from
  AUC 0.75 to 0.65 in the Korean cohort, and that this is not a stroke-risk or anticoagulation score.

## Tests

`test/unit/c2hest.test.js`: each item's points, the three group edges, the structural-heart-disease
exclusion, and blank items.
