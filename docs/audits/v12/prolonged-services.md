# v12 audit - prolonged-services

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: AMA CPT 99417 (prolonged office/outpatient) and 99418 (prolonged inpatient/observation); CMS G2212 (Medicare outpatient) and G0316 (Medicare inpatient) prolonged services; CMS Pub. 100-04 Ch. 12. The AMA add-on begins 15 minutes past the primary code's MINIMUM time; the Medicare add-on begins 15 minutes past its MAXIMUM time, a higher threshold. Each unit is a further 15 minutes.

`lib/billing-v80.js prolongedServices()` keys off the primary code (99205/99215/99223/99233), selects the payer's add-on code and floor, and computes units = floor((total - floor)/15) + 1 for total >= floor. The AMA-vs-Medicare floor divergence is surfaced as the headline note on every result.

## Boundary examples added
- 99205 AMA floor 75: 75 -> 99417 x1; 90 -> x2.
- 99205 Medicare floor 89: 75 -> 0 units (below floor); 89 -> G2212 x1.
- 99215 AMA floor 55: 54 -> 0; 55 -> x1.
- 99223 AMA -> 99418 at 90; 99223 Medicare -> G0316 at 104.

## Cross-implementation differential
- Reference: CMS CY2021 final-rule thresholds (G2212 starts 15 min past the primary's max; 99205 max 74 + 15 = 89; 99215 max 54 + 15 = 69).
- Test case: 99205, 75 min, Medicare -> 0 units (the classic "billed 99417 to Medicare" error caught). Sophie result identical. PASS.

## Edge-input handling notes
- An unsupported primary code throws RangeError (only the four time-selectable highest-level codes carry a prolonged add-on); a bad payer throws TypeError; below-threshold returns 0 units with the divergence stated, never a negative unit.

## A11y / keyboard notes
- Primary-code + payer selects, one numeric time input; output aria-live="polite". 320px sweep passes.

## Defects opened
- none

## Status
- PASS
