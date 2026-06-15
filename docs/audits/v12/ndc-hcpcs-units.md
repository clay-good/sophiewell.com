# v12 audit - ndc-hcpcs-units

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: CMS HCPCS Level II drug code descriptors (each J-code carries a billing unit of measure, e.g. "per 10 mg"); CMS Pub. 100-04 Ch. 17 (drugs and biologicals). Doctrine clause 2: the unit size is entered from the descriptor -- no drug-pricing file ships.

`lib/billing-v81.js ndcHcpcsUnits()` converts the dose and the billing-unit size to a common measure-family base (mass via mg; "units" and "mL" are their own families), divides, and rounds per the explicit rule (up / nearest / down), reporting the exact ratio and a not-a-clean-multiple flag.

## Boundary examples added
- 35 mg / 10 mg per unit = 3.5 -> 4 units (rounded up); flagged non-multiple.
- 40 mg / 10 mg = 4.0 -> 4 units; clean multiple, not flagged.
- Rounding boundary at 3.5: down -> 3, nearest -> 4, up -> 4.
- Cross-unit: 700 mcg / 0.5 mg per unit = 1.4 -> 2 units (mass family conversion).

## Cross-implementation differential
- Reference: dose / billing-unit, by hand, with the descriptor's rounding rule.
- Test case: 35 mg, 10 mg unit, round up -> 4 units. Sophie result identical. PASS.

## Edge-input handling notes
- dose validates finite >= 0; unitSize finite > 0 (num()); an unknown unit or a cross-family divide (IU dose vs mg unit) throws TypeError/RangeError. No NaN/Infinity path; the ratio is r3()-rounded and the unit count is integer.

## A11y / keyboard notes
- Two numeric inputs + two measure selects + a rounding select; output aria-live="polite". 320px sweep passes (no horizontal scroll).

## Defects opened
- none

## Status
- PASS
