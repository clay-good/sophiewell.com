# v12 audit - gold-spirometry

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Global Initiative for Chronic Obstructive Lung Disease (GOLD). Global Strategy for the Diagnosis, Management, and Prevention of COPD: 2024 Report (goldcopd.org).

`lib/pulm-v91.js goldSpirometry()` reports obstruction when the post-bronchodilator FEV1/FVC ratio is < 0.70, then assigns the GOLD spirometric grade off FEV1 %predicted: 1 (>= 80%), 2 (50-79%), 3 (30-49%), 4 (< 30%). The ratio may be entered directly (range-checked to (0, 1]) or computed from FEV1(L)/FVC(L) with an FVC > 0 guard. Without obstruction (ratio >= 0.70) no spirometric grade is assigned (the source's own rule).

## Boundary worked examples added
- ratio 0.69 -> obstruction; ratio 0.70 -> no obstruction, no grade.
- FEV1 %predicted edges: 80 -> grade 1; 79/50 -> grade 2; 49/30 -> grade 3; 29 -> grade 4.
- FEV1 45% + ratio 0.6 -> obstruction, GOLD 3 severe.
- FEV1 1.8 L / FVC 3.0 L -> ratio 0.6 computed, grade 2.

## Cross-implementation differential
- Reference: GOLD 2024 spirometric grade table. The < 0.70 fixed-ratio criterion and the 80/50/30 %predicted grade cut-points match. PASS.

## Edge-input handling notes
- A zero/blank FVC yields a surfaced "(complete all fields)" fallback, never a divide that reaches the DOM as Infinity/NaN. Obstruction present with FEV1 %predicted missing surfaces "enter FEV1 %predicted" rather than guessing a grade. The spec-v59 fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Four labeled numeric inputs (FEV1 %predicted, FEV1/FVC ratio, FEV1 L, FVC L); output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
