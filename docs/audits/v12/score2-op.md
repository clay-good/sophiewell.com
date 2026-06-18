# v12 audit - score2-op

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: SCORE2-OP working group and ESC Cardiovascular Risk Collaboration. Eur Heart J. 2021;42(25):2455-2467.

`lib/cvrisk-v103.js score2Op()` is the 2021 ESC SCORE2-OP older-persons (age >= 70) companion to SCORE2. It adds diabetes as a predictor, centers at age 73 / SBP 150 / TC 6 / HDL 1.4 mmol/L, computes uncalibrated risk = 1 - S0^exp(LP - mean) with sex-specific baseline survival/mean, then applies the per-region cloglog recalibration. Coefficients re-fetched + cross-verified (EHJ Table 2 betas confirmed against the CRAN RiskScorescvd transcription of the supplement). Class B (ESC region recalibration).

## Boundary worked examples added
- a 75yo woman in a high-risk region, non-smoker, SBP 150, TC 5.5, HDL 1.4 mmol/L scores 21.6%.
- region calibration changes the risk (low < high) at a fixed profile.
- diabetes raises the estimate.
- fuzz: extreme inputs clamp to [0,100].

## Cross-implementation differential
- Reference: the EHJ 2021 SCORE2-OP betas / baseline survivals+means / region scales. Betas match Table 2 to published precision. PASS.

## Edge-input handling notes
- Continuous inputs clamped; the exponent clamps for overflow; the recalibration guards its double-log; an unknown region or blank required input surfaces valid:false. The OP region scale2 values are published to two decimals (documented in docs/citation-staleness.md). Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs and selects; output aria-live="polite". 320px sweep passes with no horizontal scroll. Cross-links score2.

## Defects opened
- none

## Status
- PASS
