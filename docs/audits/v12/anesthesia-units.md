# v12 audit - anesthesia-units

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: CMS Pub. 100-04 Ch. 12 50 (anesthesia payment = (base units + time units + modifying units) x the anesthesia conversion factor; one time unit = 15 minutes); ASA Relative Value Guide base units (entered by the user, not shipped -- doctrine clause 2); medical-direction modifiers AA/QZ (100%), QK/QY/QX (50%), AD (flat 3 base units; +1 if present at induction).

`lib/billing-v80.js anesthesiaUnits()` converts time to 15-minute units (one decimal), sums base + time + modifying, multiplies by the conversion factor in integer cents, then applies the medical-direction percentage (or the AD flat-3-base-unit rule).

## Boundary examples added
- 5 base + 60 min (4 time units) + 1 mod = 10 units; x $22 = $220; QK 50% = $110.
- AA / QZ -> 100% (directed payment equals full payment).
- AD -> flat 3 base units x CF, independent of time (5 base + 600 min ignored -> 3 x $22 = $66).
- Time-unit boundary: 15 min -> 1.0 unit; 7 min -> 0.5 unit (remainder not dropped).

## Cross-implementation differential
- Reference: the ASA/CMS formula (base+time+mod) x CF and the 50% medical-direction reduction, computed by hand.
- Test case: base 5, 60 min, mod 1, CF $22, QK -> 10 units, $220 full, $110 directed. Sophie result identical. PASS.

## Edge-input handling notes
- baseUnits, timeMinutes, modifyingUnits, conversionFactor all validate as finite >= 0 (num()); an unknown medical-direction modifier throws TypeError. Money is integer cents, formatted once at the edge; no NaN/Infinity path. The default CF (CY2025 $20.3178) is a ledger-tracked, overridable constant.

## A11y / keyboard notes
- Four numeric inputs + a medical-direction select; output aria-live="polite". 320px sweep passes.

## Defects opened
- none

## Status
- PASS
