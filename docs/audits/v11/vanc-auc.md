# v11 audit - vanc-auc

- Auditor: CG
- Date: 2026-06-06 (spec-v56). Guideline-derived (IDSA): carries citationAccessed + a docs/citation-staleness.md row.
- Citation re-verified against: Rybak MJ, et al. ASHP/IDSA/PIDS/SIDP consensus. Am J Health-Syst Pharm 2020;77(11):835-864.

lib/medication-v5.js vancAuc() implements the first-order two-level (Sawchuk-Zaske) method: k from peak/trough, extrapolated Cmax/Cmin, AUC over tau (infusion trapezoid + elimination phase), AUC24 = AUC_tau x 24/tau, compared to the 400-600 target. NOT Bayesian.

## Boundary examples added
- peak 30 / trough 10, tau 12, MIC 1: AUC24 ~453, within target.
- low levels / MIC 2: AUC24/MIC <400, sub-therapeutic.
- peak 45 / trough 22: AUC24/MIC >600, supratherapeutic.

## Cross-implementation differential
- k = ln(30/10)/9 = 0.122 /h matches Sophie 0.122. PASS.

## Edge-input handling notes
- Guards: peak>trough, trough draw after peak, trough within interval; all throw RangeError. mic min 0.1 prevents divide-by-zero.

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
