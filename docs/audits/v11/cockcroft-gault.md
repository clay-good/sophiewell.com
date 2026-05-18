# v11 audit - Cockcroft-Gault Creatinine Clearance (`cockcroft-gault`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Cockcroft DW, Gault MH. *Prediction of creatinine clearance from serum creatinine.* Nephron. 1976;16(1):31-41. Original CrCl equation: `CrCl = ((140 - age) * weight_kg) / (72 * SCr_mg/dL)`, multiplied by 0.85 for female sex.

`lib/clinical.js cockcroftGault()` implements verbatim. Returns mL/min rounded to two decimals.

## Boundary examples added
- low (CKD, elderly): age 80, weight 60 kg, SCr 2.0 mg/dL, F -> ((140-80)*60)/(72*2.0)*0.85 = 3600/144*0.85 = 25 * 0.85 = 21.25 mL/min.
- mid (META example): age 60, weight 80 kg, SCr 1.0 mg/dL, M -> ((140-60)*80)/(72*1.0) = 6400/72 = 88.89 mL/min. PASS.
- high (young, normal): age 30, weight 80 kg, SCr 0.8 mg/dL, M -> ((140-30)*80)/(72*0.8) = 8800/57.6 = 152.78 mL/min.
- sex correction: same numerators as mid example with F -> 88.89 * 0.85 = 75.56 mL/min.

## Cross-implementation differential
- Reference: Cockcroft 1976 hand-computation; cross-checked against the MDCalc Cockcroft-Gault calculator.
- Test case: META example. Sophie 88.89 / reference 88.89. Delta 0%. PASS.

## Edge-input handling notes
- The equation is in non-SI units (mg/dL, kg, years) per the original 1976 paper; lab units in mg/dL are standard in US workflows. International users with umol/L creatinine must convert (Sophie's unit-converter tile supports this).
- Cockcroft-Gault is famously over-estimating in obese, edematous, or amputee patients (use actual body weight per Cockcroft, but lean / adjusted BW in obesity is common per pharmacology practice). Sophie's tile uses whatever weight the user enters; the citation copy notes "verify weight-basis assumption against your institutional protocol".
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Four labelled inputs (age, weight, SCr, sex select). `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
