# v12 audit - nsa-cost-share

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: No Surprises Act (PHS Act §2799A-1/§2799A-2; 45 CFR Part 149): for protected out-of-network emergency services and certain ancillary services at in-network facilities, the patient cost-share is computed as if in-network off the Qualifying Payment Amount (QPA), and balance billing is prohibited.

`lib/billing-v82.js nsaCostShare()` gates on the service category. A non-protected service gets a flat refusal -- the cap does NOT apply, the provider may bill the full out-of-network amount. A protected service (emergency, or ancillary at an in-network facility) is cost-shared as if in-network off the QPA via the deductible-then-coinsurance helper, the plan payment is QPA minus the cost-share, and the charge-minus-QPA amount is reported as the PROHIBITED balance bill. Money is integer cents. Computes the cost-share number only -- it does not revive the v29-retired NSA/IDR eligibility infographic.

## Boundary examples added
- Protected emergency, QPA $800, billed $1,000, 20% coinsurance, deductible met: cost-share $160 (20% of $800); plan pays $640; $200 prohibited balance bill.
- Protected, with a remaining deductible: deductible applied first, then coinsurance on the QPA remainder (shared helper, tested at the partial-deductible boundary in billing-v82.test.js).
- Non-protected, same QPA/charge: protected=false, patientCostShare null, prohibitedBalanceBill 0 (the $200 above the QPA is NOT shielded).

## Cross-implementation differential
- Reference: the QPA-based in-network cost-share and the prohibited-balance-bill gap computed by hand.
- Test case: emergency, QPA $800, billed $2,000, 20% -> cost-share $160, plan $640, prohibited $1,200. Sophie result identical. PASS.

## Edge-input handling notes
- All money integer cents; an unknown category throws TypeError; qpa/charge finite >= 0 (num()). The protection gate is hard, not patient-favorable by default -- a non-protected service is refused, not capped. The cost-share is capped at the QPA and the prohibited-bill gap floored at 0. No NaN/Infinity path.

## A11y / keyboard notes
- A service-category select + money inputs + a coinsurance-percent input, each with a real `<label for>`; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
