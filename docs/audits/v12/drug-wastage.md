# v12 audit - drug-wastage

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: CMS Pub. 100-04 Ch. 17 §40 and the CMS JW/JZ modifier guidance: for a single-dose vial, bill the administered amount on one line and the discarded amount with modifier JW; when no drug is discarded, append JZ (required since 2023-07-01). Multi-dose vials are not JW-eligible.

`lib/billing-v81.js drugWastage()` computes everything in billing units: vials drawn = ceil(dose/vial), total units = drawn/unit, administered = ceil(dose/unit), discarded = total - administered. The vial-type fork is a HARD gate (multi-dose -> JW refused). An optional bounded DP returns the least-waste vial combination from the supplied sizes.

## Boundary examples added
- 35 mg from a 50 mg single-dose vial, 10 mg unit: 4 administered, 5 total, 1 discarded -> JW.
- 50 mg from the same vial: 5 of 5 units, zero waste -> JZ (with the 2023-07-01 attestation note).
- Multi-dose vial: eligibleForJW false, discarded 0, modifier null (waste not billable).
- Dose exceeding one vial: 120 mg / 50 mg vials -> 3 vials (15 units), 12 administered, 3 discarded.
- Least-waste search: 35 mg from {50, 20, 10} -> 20+20 = 40 mg (5 mg waste), not the 50 mg vial (15 mg waste).

## Cross-implementation differential
- Reference: administered + JW must total the units drawn; computed by hand.
- Test case: 35 mg, 50 mg single vial, 10 mg unit -> 4 + 1 = 5. Sophie result identical. PASS.

## Edge-input handling notes
- vialSize/unitSize finite > 0, dose finite >= 0 (num()); an unknown vial type throws TypeError; cross-family divide throws RangeError. discardedUnits floored at 0; all counts integer; no NaN/Infinity path. The least-waste DP is bounded to dose + max vial so it always terminates.

## A11y / keyboard notes
- Numeric inputs + two measure selects + a vial-type select + an optional sizes text field; output aria-live="polite". 320px sweep passes.

## Defects opened
- none

## Status
- PASS
