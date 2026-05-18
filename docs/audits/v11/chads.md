# v11 audit - CHA2DS2-VASc (`chads`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Lip GYH, Nieuwlaat R, Pisters R, Lane DA, Crijns HJGM. *Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation using a novel risk factor-based approach: the Euro Heart Survey on Atrial Fibrillation.* Chest. 2010;137(2):263-272.

Point assignments verified literal against Lip 2010 Table 6: CHF/LVD 1, hypertension 1, age >= 75 = 2, diabetes 1, prior stroke/TIA/TE 2, vascular disease (prior MI, PAD, aortic plaque) 1, age 65-74 = 1, female sex 1. Total range 0-9. `lib/clinical.js chadsVasc()` and `CHADS_ITEMS` implement this verbatim.

## Boundary examples added
- low: no risk factors selected -> 0 (annual stroke risk ~0% per Lip 2010 Table 7).
- mid: META example (hypertension + age 65-74 + diabetes) -> 1+1+1 = 3 (annual stroke risk ~3.2% per Lip 2010; guideline-level threshold for oral anticoagulation in most jurisdictions).
- high: CHF + hypertension + age >= 75 + diabetes + prior stroke + vascular disease + female -> 1+1+2+1+2+1+1 = 9 (maximum; annual stroke risk ~15.2% per Lip 2010 Table 7).

## Cross-implementation differential
- Reference implementation: Lip 2010 Chest Table 6 point assignments + Table 7 stroke-rate column.
- Test case: META example (hypertension + age 65-74 + diabetes).
- Sophie result: 3.
- Reference result: 3 (1+1+1 by Table 6).
- Delta: 0%. PASS.

## Edge-input handling notes
- Inputs are checkboxes; nothing to validate beyond present/absent. The two age tiers (`ageGte65` and `ageGte75`) are independent checkboxes per the source point structure; the renderer's helper text instructs the user to check the highest applicable tier only (age >= 75 implies age >= 65 in the source, but Lip 2010 awards 2 points for the >= 75 stratum, not 2 + 1).
- The output region uses `aria-live="polite"` so the score updates inline as boxes are toggled.

## A11y / keyboard notes
- Eight labeled checkboxes, Tab-reachable in source order, label-bound. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
