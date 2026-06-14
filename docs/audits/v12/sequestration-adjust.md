# v12 audit - sequestration-adjust

- Auditor: CG
- Date: 2026-06-13
- Citation re-verified against: Budget Control Act of 2011 (Pub. L. 112-25), 251A; the Medicare 2% payment reduction applied to the program-payment portion (allowed minus the beneficiary's deductible and coinsurance) after cost-share, never to the allowed amount or the patient's cost-share. CMS MLN sequestration guidance.

`lib/billing-v78.js sequestrationAdjust()` computes the program-payment base, the sequestration dollars withheld, and the net Medicare check in integer cents. The rate defaults to 2% and is overridable to model the suspended/phased rates Congress has set.

## Boundary examples added
- tile example: allowed $100, patient cost-share $20 -> program payment $80; 2% = $1.60 withheld; net check $78.40.
- seqPct 0 (suspension) -> net equals the full program payment; zero withheld.
- patient cost-share > allowed -> RangeError (impossible split, caught by safe()).

## Cross-implementation differential
- Reference: the sequestration rule (2% of the program-payment portion) computed by hand.
- Test case: allowed $100, patient $20.
- Sophie result: program $80.00, withheld $1.60, net $78.40.
- Reference result: identical. PASS. Sequestration applies to the $80 program portion, not the $100 allowed nor the $20 cost-share.

## Edge-input handling notes
- Allowed, patient responsibility, and rate validate as finite >= 0 (num()); patient > allowed throws RangeError; one rounding at the percentage edge.

## A11y / keyboard notes
- Three labeled number inputs (allowed, patient cost-share, percentage); a `<dl>` derivation reads top-to-bottom; output `aria-live="polite"`. `npm run test:a11y` clean; 320px no-horizontal-scroll sweep passes.

## Defects opened
- none

## Status
- PASS
