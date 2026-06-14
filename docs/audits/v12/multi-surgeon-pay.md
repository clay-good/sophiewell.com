# v12 audit - multi-surgeon-pay

- Auditor: CG
- Date: 2026-06-13
- Citation re-verified against: CMS Pub. 100-04 Claims Processing Manual, Ch. 12 20.4.3 and 40.8; the MPFS ASST SURG / CO SURG / TEAM SURG indicators. Payment percentages: assistant at surgery (modifier 80/81/82, or AS for a non-physician) = 16% of the primary fee; co-surgeon (modifier 62) = 62.5% to each surgeon; team surgeon (modifier 66) = by report (carrier-priced). The matching surgical indicator gates whether the role is payable at all (0/9 = not separately payable).

`lib/billing-v78.js multiSurgeonPay()` returns the allowed amount for the assisting/co/team role as a percentage of the primary fee, with the indicator-0/9 not-payable gate and a by-report path for team surgeons, in integer cents.

## Boundary examples added
- tile example: $2000 primary fee, assistant, indicator 2 -> 16% = $320.00.
- co-surgeon, indicator 2 -> 62.5% = $1250.00 to each (verified at $2000).
- team surgeon -> by report (no fixed percentage; allowedCents null).
- indicator 0 -> not separately payable for every role (hard gate); indicator 1 -> payable with a documentation note.

## Cross-implementation differential
- Reference: Pub. 100-04 Ch. 12 surgical payment percentages computed by hand.
- Test case: $100000-cents fee, role assistant / co / team, indicator 2.
- Sophie result: $160.00 (16%) / $625.00 (62.5%) / by-report.
- Reference result: identical. PASS. The indicator gate returns not-payable for 0/9 regardless of role.

## Edge-input handling notes
- Indicator validates as an integer in [0, 9]; an unknown role throws TypeError; a non-positive fee prompts rather than computing.

## A11y / keyboard notes
- One labeled money input and two labeled `<select>` (role, indicator); output `aria-live="polite"`; the not-payable line uses the `flag` class. `npm run test:a11y` clean; 320px no-horizontal-scroll sweep passes.

## Defects opened
- none

## Status
- PASS
