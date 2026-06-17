# v12 audit - el-ganzouri

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: el-Ganzouri AR, McCarthy RJ, Tuman KJ, et al. Preoperative airway assessment: predictive value of a multivariate risk index. Anesth Analg. 1996;82(6):1197-1204.

`lib/periop-v97.js elGanzouri()` sums the seven-factor weighted airway index (each factor 0/1/2; mouth opening and prognathism cap at 1) and flags the commonly cited >= 4 difficult-laryngoscopy threshold.

## Boundary worked examples added
- all-low -> total 0, below threshold.
- threshold edge: thyromental < 6 (2) + Mallampati III (1) = 3 -> below; add mouth < 4 cm (1) -> 4 -> at/above the >= 4 threshold.
- maximum -> total 12 (every factor at its cap).

## Cross-implementation differential
- Reference: the el-Ganzouri / Simplified Airway Risk Index point table and the >= 4 operating point. Match. PASS.

## Edge-input handling notes
- All seven selects required; an unselected factor withholds the score. Mallampati I and II both score 0 per the source. Total is a bounded finite integer 0-12. Fuzz harness covers the module; zero non-finite leaks.

## A11y / keyboard notes
- Seven labeled selects; output aria-live="polite". 320px sweep passes with no horizontal scroll. Quantifies a bedside airway exam; it does not replace the airway plan.

## Defects opened
- none

## Status
- PASS
