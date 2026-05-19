# v11 audit - rochester

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Jaskiewicz JA, McCarthy CA, Richardson AC, et al. *Febrile infants at low risk for serious bacterial infection -- an appraisal of the Rochester criteria and implications for management.* Pediatrics. 1994;94(3):390-396. Seven criteria; ALL must be met for low-risk classification: age <=60 days; term and previously healthy; no focal infection on exam; WBC 5-15 x10^9/L; bands <=1.5 x10^9/L; urine WBC <=10/HPF; stool WBC <=5/HPF (when diarrhea).

`lib/scoring-v4.js rochester()` coerces each input to a boolean and returns `lowRisk: true` iff every criterion is met, plus a `failing` list of criteria that did NOT meet threshold so a clinician can see which item disqualified the patient.

## Boundary examples added
- 0 of 7 criteria (tile example) -> not low risk; band names "any failed criterion disqualifies".
- 6 of 7 (one missing) -> not low risk (still disqualified by single failure).
- 7 of 7 (all met) -> LOW risk band.
- single-criterion failures cycled through to confirm the failing list captures the right items.

## Cross-implementation differential
- Reference: Jaskiewicz 1994 §Methods.
- Test case: age + term + no focal + WBC + bands + urine met, stool not met -> 6/7 -> not low risk.
- Sophie result: lowRisk false, failing ['stoolWbcLte5PerHpf'].
- Reference: same. PASS.

## Edge-input handling notes
- Every criterion interpreted as truthy boolean. Missing inputs default to "not met".

## A11y / keyboard notes
- Seven labeled checkboxes; Tab-reachable; aria-live result region; the failing-criterion list is surfaced in the band. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
