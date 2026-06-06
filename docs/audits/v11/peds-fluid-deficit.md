# v11 audit - peds-fluid-deficit

- Auditor: CG
- Date: 2026-06-06 (spec-v56).
- Citation re-verified against: Holliday MA, Segar WE. Pediatrics 1957;19(5):823-832 (4-2-1 maintenance).

lib/medication-v5.js pedsFluidDeficit() computes 4-2-1 hourly maintenance, total deficit (% x weight x 10 mL), and the replacement schedule (1/2 over 8 h, 1/2 over 16 h on top of maintenance).

## Boundary examples added
- 12 kg 10%: maint 44 mL/h, deficit 1200 mL, first 8 h 119 mL/h, next 16 h 81.5 mL/h.
- 8 kg: maint 32 mL/h.
- 25 kg: maint 65 mL/h.

## Cross-implementation differential
- Hand-calc 40 + 2x2 = 44 mL/h; deficit 10x12x10 = 1200. Sophie matches. PASS.

## Edge-input handling notes
- weight/dehydration bounded; boluses subtracted and ongoing losses replaced separately (noted).

## A11y / keyboard notes
- Labeled inputs (label for=), aria-live results, select/checkbox where applicable. test:a11y clean.

## Defects opened

- none

## Status
- PASS
