# v11 audit - Medicare Summary Notice Decoder (`msn-decoder`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CMS Medicare Summary Notice (MSN) format. The MSN is Medicare's quarterly EOB-equivalent for Original Medicare beneficiaries; structural fields (Medicare-approved amount, Medicare paid, provider adjustment, maximum the beneficiary may be billed) are defined by CMS Medicare Claims Processing Manual Pub 100-04 Chapter 21.

## Boundary examples added
- META example: MSN with "Medicare-approved amount: $185.00 / Medicare paid: $148.00 / Provider adjustment: $37.00 / Maximum you may be billed: $0.00" -> renderer summarizes the four amounts plus reconciliation ($148 + $37 = $185 approved).

## Cross-implementation differential
- N/A (parser, no formula). The differential is "does the parsed-field labelling match the CMS MSN field names?" — confirmed by re-reading the CMS MSN sample available at CMS-published reference.

## Edge-input handling notes
- "Maximum you may be billed" $0.00 is a key MSN field that distinguishes assignment-accepted vs not — the parser captures this verbatim so the user does not confuse "approved" with "billable".
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- One labelled textarea; output region announces parsed fields. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
