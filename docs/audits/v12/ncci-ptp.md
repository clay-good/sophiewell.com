# v12 audit - ncci-ptp

- Auditor: CG
- Date: 2026-06-13
- Citation re-verified against: CMS National Correct Coding Initiative (NCCI) Policy Manual, Chapter I (general correct-coding); CMS Pub. 100-04 Ch. 23. The PTP modifier indicator: 0 = no modifier permitted; 1 = a permitted NCCI-associated modifier may bypass; 9 = edit deleted / not active.

`lib/billing-v79.js ncciPtp()` determines the Column 1 (comprehensive, payable) vs Column 2 (component, bundled) code, whether the entered modifier indicator permits a bypass, and whether a proposed modifier is one of the CMS NCCI-associated modifiers (anatomic, global-surgery, 59/X{EPSU}). No PTP edit file ships (doctrine clause 2); the indicator is a user input, so the tool can never be silently stale.

## Boundary examples added
- 11042 / 97597, Column 1 = 11042, indicator 1, proposed 59 -> bypass permitted; 59 is NCCI-associated.
- 80048 / 80053, indicator 0, proposed 59 -> hard gate: no modifier can unbundle; 59 explicitly cannot rescue an indicator-0 pair.
- 99213 / 99214, indicator 9 -> not an active edit; report both normally; unknown Column ordering explained rather than guessed.

## Cross-implementation differential
- Reference: the NCCI Policy Manual Ch. I modifier-indicator semantics, applied by hand.
- Test case: indicator 1 with a non-associated modifier (22) -> the tool reports 22 is NOT an NCCI-associated modifier and cannot bypass. PASS.
- Indicator 0 with any modifier -> bypass refused. Matches the manual ("no modifier permitted"). PASS.

## Edge-input handling notes
- Identical codes throw RangeError; an empty/blank code throws TypeError; an indicator outside {0,1,9} throws RangeError (caught by the renderer safe() wrapper).
- The proposed modifier is optional; when omitted, proposedIsNcciAssociated is null (not a guess).

## A11y / keyboard notes
- Two labeled text inputs, two labeled `<select>`s, one optional labeled text input; output region `aria-live="polite"`. `npm run test:a11y` clean; 320px no-horizontal-scroll sweep passes.

## Defects opened
- none

## Status
- PASS
