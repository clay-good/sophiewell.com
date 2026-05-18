# v11 audit - Maintenance Fluids (4-2-1) (`maint-fluids`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Holliday MA, Segar WE. *The maintenance need for water in parenteral fluid therapy.* Pediatrics. 1957;19(5):823-832. The 4-2-1 rule: 4 mL/kg/hr for the first 10 kg + 2 mL/kg/hr for the next 10 kg + 1 mL/kg/hr for each kg above 20.

`lib/clinical-v4.js maintenanceFluids()` implements:
- if weight <= 10: 4 * weight.
- if weight <= 20: 40 + 2 * (weight - 10).
- else: 60 + 1 * (weight - 20).

## Boundary examples added
- low (neonate, 4 kg): 4*4 = 16 mL/hr.
- 10 kg boundary: 40 mL/hr (first 10 kg only).
- 20 kg boundary: 60 mL/hr (40 + 20).
- mid (META example, adult): 70 kg -> 60 + 50 = 110 mL/hr. PASS.
- high (large adult, 100 kg): 60 + 80 = 140 mL/hr.

## Cross-implementation differential
- Reference: Holliday-Segar 1957 hand-computation; cross-checked against the standard pediatric anesthesia and PICU teaching tables.
- Test case: META example. Sophie 110 / reference 110. Delta 0%. PASS.

## Edge-input handling notes
- Holliday-Segar is a pediatric maintenance rule by intent (Pediatrics 1957) but is universally applied to adult maintenance in the absence of contrary evidence. Sophie's tile does not constrain by patient age — the result is correct in either case.
- The rule estimates resting requirement only; deficits, ongoing losses, and electrolyte composition are out of scope. The tile's helper text notes this.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- One labelled weight input. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
