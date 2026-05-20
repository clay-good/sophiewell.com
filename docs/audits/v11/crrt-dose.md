# v11 audit - crrt-dose

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Kidney Disease: Improving Global Outcomes (KDIGO) AKI Work Group. *KDIGO Clinical Practice Guideline for Acute Kidney Injury.* Kidney Int Suppl. 2012;2(1):1-138 (sec 5.8 effluent target 20-25 mL/kg/h delivered). Davenport A, Tolwani A. *Citrate anticoagulation for continuous renal replacement therapy (CRRT) in patients with acute kidney injury admitted to the intensive care unit.* NDT Plus. 2009;2(6):439-447 (post-filter ionised Ca target 0.25-0.35 mmol/L; systemic ionised Ca 1.1-1.2 mmol/L; total/ionised Ca ratio >= 2.5 suggests citrate accumulation).

`lib/scoring-v4.js crrtDose()` accepts `{weightKg, effluentRateMlPerHr, modality, ultrafiltrationMlPerHr, systemicIonisedCa, postFilterIonisedCa, totalCa}` and returns `{effluentDoseMlPerKgPerHr, modality, ultrafiltrationMlPerHr, totalIonisedRatio, banners, text}`.

## Boundary examples added
- Weight 80 kg, effluent 1800 mL/h -> 22.5 mL/kg/h (within KDIGO).
- Weight 80 kg, effluent 1200 mL/h -> 15 mL/kg/h (below KDIGO).
- Weight 80 kg, effluent 2400 mL/h -> 30 mL/kg/h (above KDIGO).
- Post-filter iCa 0.5 mmol/L -> outside Davenport 2009 0.25-0.35 target.
- Systemic iCa 1.0 mmol/L -> outside Davenport 2009 1.1-1.2 target.
- Total/iCa ratio 2.6 -> citrate accumulation banner per Davenport 2009.

## Cross-implementation differential
- Reference: KDIGO 2012 sec 5.8 effluent target; Davenport 2009 citrate monitoring targets.
- Sophie result: matches each band. PASS.

## Edge-input handling notes
- Missing weight or effluent rate throws.
- Optional iCa / totalCa fields omitted -> no false banners.

## A11y / keyboard notes
- Seven labeled inputs + one modality select; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
