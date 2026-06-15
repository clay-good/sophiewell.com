# v12 audit - allowed-amount

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: standard third-party-payer contract accounting and the prohibition on balance-billing a contracted allowable: the patient owes only the benefit cost-share (deductible / coinsurance / copay) on the ALLOWED amount, and the charge-minus-allowed gap is a contractual adjustment, not patient debt. allowed = payer payment + patient responsibility; charge = allowed + write-off.

`lib/billing-v82.js allowedAmount()` applies the deductible-then-coinsurance helper to the allowed amount, derives the payer payment (allowed - patient responsibility), and reports the charge-minus-allowed gap. The network status is a HARD gate: in-network the gap is a required contractual write-off the patient may NOT be billed (balanceBillProhibited flagged when the gap is positive); out-of-network there is NO write-off and the gap may be balance-billed, so the tool refuses to invent one. Money is integer cents.

## Boundary examples added
- In-network, charge $1,000, allowed $600, $100 deductible left, 20% coinsurance: write-off $400; patient $100 + 20% of $500 = $200; payer $400; balance billing prohibited.
- Accounting identity: payer ($400) + patient ($200) = allowed ($600); allowed + write-off ($400) = charge ($1,000).
- Out-of-network, same inputs: write-off $0; the $400 gap may be balance-billed; cost-share on the allowed unchanged ($200).

## Cross-implementation differential
- Reference: the contractual-accounting identity computed by hand.
- Test case: in-network $1,000/$600/$100/20% -> write-off $400, patient $200, payer $400. Sophie result identical, both identities hold. PASS.

## Edge-input handling notes
- All money integer cents; billedCharge/allowed finite >= 0 (num()); coinsurance in [0,100]. The deductible is capped at the allowed and the patient total capped at the allowed, so cost-share never exceeds the recognized amount and the write-off is floored at 0. No NaN/Infinity path.

## A11y / keyboard notes
- Money inputs + a coinsurance-percent input + an in-network checkbox, each with a real `<label for>`; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
