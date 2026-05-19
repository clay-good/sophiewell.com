# v11 audit - pecarn-iai

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Holmes JF, Lillis K, Monroe D, et al. *Identifying children at very low risk of clinically important blunt abdominal injuries.* Ann Emerg Med. 2013;62(2):107-116.e2. Seven negative findings; ALL must be absent for very-low-risk classification (NPV 99.9% per Holmes 2013): (1) evidence of abdominal wall trauma or seat-belt sign; (2) GCS <14; (3) abdominal tenderness; (4) vomiting; (5) thoracic wall trauma; (6) complaint of abdominal pain; (7) decreased breath sounds. ANY present -> not very low risk; consider imaging.

`lib/scoring-v4.js pecarnIai()` checks whether each finding is present and returns `veryLowRisk: true` iff zero findings are present, plus a `findingsPresent` list naming which findings disqualified the patient.

## Boundary examples added
- 0 of 7 findings (tile example) -> very low risk; NPV 99.9% band.
- 1 of 7 (e.g., vomiting alone) -> not very low risk.
- 7 of 7 (all present) -> not very low risk.
- single-finding failures cycled through to confirm the present list captures the right items.

## Cross-implementation differential
- Reference: Holmes 2013 §Results.
- Test case: abdominal tenderness + vomiting present (2 of 7) -> not very low risk.
- Sophie result: veryLowRisk false, findingsPresent ['abdominalTenderness', 'vomiting'].
- Reference: same. PASS.

## Edge-input handling notes
- Each input interpreted as truthy boolean. Missing inputs default to "not present" (which contributes to the very-low-risk band).

## A11y / keyboard notes
- Seven labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
