# v11 audit - pecarn-cspine

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Leonard JC, Browne LR, Ahmad FA, et al. *Cervical spine injury risk factors in children with blunt trauma.* Pediatrics. 2019;144(1):e20183221. Derivation: Leonard JC, Kuppermann N, Olsen C, et al. *Factors associated with cervical spine injury in children after blunt trauma.* Ann Emerg Med. 2011;58(2):145-155. Eight risk factors: (1) altered mental status; (2) abnormal airway/breathing/circulation; (3) focal neurologic deficit; (4) neck pain; (5) torticollis; (6) substantial torso injury; (7) predisposing condition; (8) high-risk MVC. ANY present -> not low-risk. NONE present -> low-risk; cervical-spine imaging not indicated.

`lib/scoring-v4.js pecarnCspine()` follows the same all-or-nothing pattern as PECARN IAI; surfaces a `factorsPresent` list so a clinician sees which factor(s) drove the imaging recommendation.

## Boundary examples added
- 0 of 8 (tile example) -> low risk; imaging not indicated.
- 1 of 8 (e.g., neck pain alone) -> not low risk.
- 8 of 8 -> not low risk.
- factors-present list verified to capture the right item names.

## Cross-implementation differential
- Reference: Leonard 2019 / Leonard 2011 §Results.
- Test case: altered mental status + neck pain -> 2 of 8 -> not low risk.
- Sophie result: lowRisk false, factorsPresent ['alteredMentalStatus', 'neckPain'].
- Reference: same. PASS.

## Edge-input handling notes
- Each factor interpreted as truthy boolean. Missing defaults to "not present" (contributes to low-risk classification).

## A11y / keyboard notes
- Eight labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
