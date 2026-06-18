# v12 audit - score2

- Auditor: CG
- Date: 2026-06-18
- Citation re-verified against: SCORE2 working group and ESC Cardiovascular Risk Collaboration. Eur Heart J. 2021;42(25):2439-2454.

`lib/cvrisk-v103.js score2()` is the 2021 ESC SCORE2 region-calibrated 10-year fatal + non-fatal CVD risk model for ages 40-69. The sex-specific linear predictor runs on centered age, systolic BP, total and HDL cholesterol (mmol/L), and smoking, with the published age interactions; uncalibrated risk = 1 - S0^exp(LP); then the published per-region cloglog recalibration selects the low / moderate / high / very-high European-region scale1/scale2 pair. Coefficients re-fetched + cross-verified (the EHJ supplementary material, cross-checked against the CRAN RiskScorescvd source via two fetch routes). Class B (ESC region recalibration).

## Boundary worked examples added
- the ESC published worked example reproduces exactly: a 50yo male smoker, SBP 140, TC 5.5, HDL 1.3 mmol/L scores 5.9% in a low-risk region and 14.0% in a very-high-risk region; the matching woman scores 4.2% and 13.7%.
- region drives the ESC age-banded category flip at a fixed profile.
- an unrecognized region returns a surfaced fallback rather than reading undefined coefficients.
- fuzz: extreme inputs clamp to a probability in [0,100], never Infinity.

## Cross-implementation differential
- Reference: the EHJ 2021 SCORE2 supplementary betas / baseline survivals / region scales (RiskScorescvd transcription). The two ESC worked examples match byte-for-byte. PASS.

## Edge-input handling notes
- Continuous inputs clamped to their published domain; the linear-predictor exponent is clamped to an overflow-safe range; the recalibration double-log clamps the uncalibrated risk away from {0,1}; an unknown region or a blank required input surfaces valid:false. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs and selects; output aria-live="polite". 320px sweep passes with no horizontal scroll. European-region calibrated; complements, does not replace, ascvd / prevent.

## Defects opened
- none

## Status
- PASS
