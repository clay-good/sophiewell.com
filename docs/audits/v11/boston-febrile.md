# v11 audit - boston-febrile

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Baskin MN, O'Rourke EJ, Fleisher GR. *Outpatient treatment of febrile infants 28 to 89 days of age with intramuscular administration of ceftriaxone.* J Pediatr. 1992;120(1):22-27. Seven criteria; ALL must be met for outpatient ceftriaxone-management eligibility: age 28-89 days; well-appearing; no focal source on exam; WBC <20 x10^9/L; UA <10 WBC/HPF; CSF <10 WBC/mm^3; chest x-ray clear (if obtained).

`lib/scoring-v4.js bostonFebrile()` follows the same all-or-nothing pattern as Rochester and Philadelphia. Note that Boston uses a wider WBC threshold (<20) and age range (28-89 d) than Philadelphia (<15; 29-60 d), reflecting Baskin 1992's ceftriaxone-prophylaxis-based protocol vs Baker's no-antibiotic outpatient management.

## Boundary examples added
- 0 of 7 (tile example) -> not eligible.
- 6 of 7 (one missing) -> not eligible.
- 7 of 7 (all met) -> eligible for outpatient ceftriaxone band.

## Cross-implementation differential
- Reference: Baskin 1992 §Methods.
- Test case: well + 28-89 d + no focal + WBC <20 + UA <10 + CSF <10, CXR not clear -> 6/7 -> not eligible.
- Sophie result: lowRisk false, failing ['cxrClearOrNotObtained'].
- Reference: same. PASS.

## Edge-input handling notes
- Each criterion truthy-boolean; CXR conditional ("if obtained") collapsed into a single checkbox.

## A11y / keyboard notes
- Seven labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
