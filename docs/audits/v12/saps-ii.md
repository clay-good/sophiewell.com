# v12 audit - saps-ii

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: Le Gall JR, Lemeshow S, Saulnier F. A new Simplified Acute Physiology Score (SAPS II) based on a European/North American multicenter study. JAMA. 1993;270(24):2957-2963.

`lib/idcrit-v99.js sapsII()` bands each of the 17 SAPS II variables to fixed points (BUN in mg/dL, bilirubin in mg/dL) and converts the total to predicted hospital mortality via logit = -7.7631 + 0.0737*SAPS + 0.9971*ln(SAPS+1). Point bands cross-verified against MDCalc and ClinCalc; the urine 0.500-0.999 L/day band is +4 (a corrupted +1 reproduction was rejected). Class A.

## Boundary worked examples added
- the worked ICU case scores 64 points -> 75.3% mortality (matches the ClinCalc 64-point calibration).
- a young, normal scheduled-surgical admission -> 0 points -> < 1%.
- 1e9 inputs -> finite mortality in [0,100].

## Cross-implementation differential
- Reference: the SAPS II band table and the published logistic constants. Match. PASS.

## Edge-input handling notes
- Each variable clamped to its band domain; the logistic uses an overflow-safe form; ln(SAPS+1) is finite since SAPS >= 0; a blank required variable surfaces valid:false. Fuzz harness covers the module with the logistic explicitly fuzzed.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
