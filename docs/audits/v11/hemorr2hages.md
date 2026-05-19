# v11 audit - hemorr2hages

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Gage BF, Yan Y, Milligan PE, et al. *Clinical classification schemes for predicting hemorrhage: results from the National Registry of Atrial Fibrillation (NRAF).* Am Heart J. 2006;151(3):713-719. Eleven criteria with prior rebleeding weighted +2 and all others +1: Hepatic/Renal, Ethanol abuse, Malignancy, Older (>75), Reduced platelet count/function, Rebleeding, uncontrolled Hypertension, Anemia, Genetic factors (CYP2C9), Excessive fall risk, Stroke. Sum 0-12. Bleeds per 100 patient-years per Gage 2006 Table 3: score 0 -> 1.9, 1 -> 2.5, 2 -> 5.3, 3 -> 8.4, 4 -> 10.4, >=5 -> 12.3.

`lib/scoring-v4.js hemorr2hages()` sums eleven boolean-weighted contributions (rebleeding weighted +2, others +1) and emits the Gage 2006 Table 3 rate for the computed score, clamping any score >=5 to the published 12.3/100 patient-year ceiling.

## Boundary examples added
- 0 of 12 (no risk factors; tile example) -> 1.9 bleeds per 100 patient-years.
- 2 of 12 (rebleeding +2 alone) -> 5.3 per 100 patient-years.
- 12 of 12 (every criterion) -> 12.3 per 100 patient-years (>=5 ceiling).
- 5 of 12 (any combination summing to 5) -> 12.3 per 100 patient-years (lower edge of high band).
- 4 of 12 (e.g., rebleeding +2 + age >75 +1 + anemia +1) -> 10.4 per 100 patient-years.

## Cross-implementation differential
- Reference: Gage 2006 Table 3 worked through manually.
- Test case: age >75 (1) + reduced platelets (1) + uncontrolled HTN (1) = 3 -> 8.4 per 100 patient-years.
- Sophie result: 3 of 12, 8.4 per 100 patient-years.
- Reference: same. PASS.

## Edge-input handling notes
- Inputs interpreted via `x ? weight : 0` so `undefined` defaults to 0.
- Rebleeding (+2) is the only weighted-2 criterion per Gage 2006; the rest are +1.

## A11y / keyboard notes
- Eleven labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
