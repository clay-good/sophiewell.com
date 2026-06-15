# v12 audit - modifier-order

- Auditor: CG
- Date: 2026-06-13
- Citation re-verified against: CMS Pub. 100-04 Ch. 12 / 23 modifier-reporting guidance and the payer claim-editing convention: pricing (payment-affecting) modifiers are reported before informational/statistical modifiers; the wrong order can mis-price or reject the line.

`lib/billing-v79.js modifierOrder()` re-sequences up to four modifiers into the correct claim order (pricing first, ranked by payment effect, then informational in original order), tags each modifier pricing vs informational, flags conflicting pairs, and names any unrecognized modifier so the coder verifies its placement.

## Boundary examples added
- LT, 26, 59, 50 -> claim order 26 50 LT 59 (26 and 50 are pricing; LT and 59 informational).
- LT + RT -> conflict flagged (a bilateral service uses modifier 50, not LT+RT).
- 26 + TC -> conflict flagged (professional + technical = the global service).
- ZZ + 50 -> ZZ reported unrecognized; 50 (pricing) still leads.

## Cross-implementation differential
- Reference: the pricing-before-informational ordering convention applied by hand.
- Test case: a pricing modifier in the last input position sorts to the front; informational modifiers keep their relative order. PASS.
- Duplicate modifier, LT/RT, 26/TC, and multiple assistant-at-surgery modifiers each raise a specific conflict. PASS.

## Edge-input handling notes
- A non-array `modifiers` throws TypeError; an empty list throws RangeError; more than four modifiers throws RangeError (a claim line carries at most four). Blank/empty entries are dropped before validation.
- An unrecognized modifier is placed in the informational group and flagged, never silently mis-classified as pricing.

## A11y / keyboard notes
- Four labeled text inputs; output region `aria-live="polite"`; conflicts rendered as a flagged list. `npm run test:a11y` clean; 320px no-horizontal-scroll sweep passes.

## Defects opened
- none

## Status
- PASS
