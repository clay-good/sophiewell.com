# v12 audit - isaric-4c-mortality

- Auditor: CG
- Date: 2026-06-21
- Citation re-verified against: Knight SR, Ho A, Pius R, et al. Risk stratification of patients admitted to hospital with covid-19 using the ISARIC WHO Clinical Characterisation Protocol: development and validation of the 4C Mortality Score. BMJ. 2020;370:m3339.

`lib/id-v137.js isaric4cMortality()` returns the 0-21 total, the risk group, and the derivation-cohort in-hospital mortality. Class A (fixed additive points; journal+author citation - no docs/citation-staleness.md row).

## Source-governance / point-table note
- Point table cross-verified across MDCalc and the official ISARIC4C calculator (identical), with the strata mortality from the BMJ paper. Age <50/50-59/60-69/70-79/>=80 = 0/2/4/6/7; male +1; comorbidities 0/1/>=2 = 0/1/2; RR <20/20-29/>=30 = 0/1/2; SpO2 <92% = +2; GCS <15 = +2; urea <7/7-14/>14 mmol/L = 0/1/3; CRP <50/50-99/>=100 mg/L = 0/1/2.
- Applies the published Table-2 correction: urea cut is `< 7` (not `<= 7`) and CRP is in mg/L (not mg/dL). Exposes a urea/BUN unit selector; BUN mg/dL = urea mmol/L x 2.8 (so BUN 19.6 mg/dL == urea 7 mmol/L).
- Derivation-cohort mortality (1.2 / 9.9 / 31.4 / 61.5%) is used, NOT the validation-cohort set (0 / 8.0 / 27.2 / 54.2%); the two must not be conflated.

## Boundary worked examples added
- total 8 (intermediate upper edge) vs 9 (high lower edge); urea band edges <7/=7/=14/>14; BUN-vs-mmol unit equivalence at 19.6 mg/dL; max 21 (very high); min 0 (low).

## Edge-input handling notes
- Requires every input plus the urea unit and GCS in [3,15]; blank/out-of-range surfaces valid:false. Joined the spec-v59 fuzz harness (zero non-finite leaks).

## A11y / keyboard notes
- Labeled number inputs + sex and urea-unit selects; output aria-live="polite". 320px sweep, no hscroll; renders the clinical-posture note.

## Defects opened
- none
