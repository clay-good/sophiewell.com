# v11 audit - No Surprises Act Eligibility Checker (`no-surprises`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: No Surprises Act (NSA), added by Title I of Division BB of the Consolidated Appropriations Act, 2021, codified as Public Health Service Act Section 2799A-1 through 2799A-9; implementing regulations at 45 CFR 149. Federal floor; state surprise-billing laws may layer on top. Both the PHSA section numbers and 45 CFR 149 remain current as of 2026.

## Boundary examples added
- META example: `nsa-sel` = "er-out-of-network" -> "Out-of-network emergency care: covered by the No Surprises Act per PHSA Section 2799A-1." PASS.
- Other tree branches cover: out-of-network at in-network facility (2799A-1(b)), air ambulance (2799A-2), good-faith estimate for uninsured/self-pay (2799A-7).

## Cross-implementation differential
- N/A (decision tree). The differential is "does the tree branch text match the cited PHSA / CFR section?" — confirmed by re-reading PHSA Section 2799A-1 / -2 / -7 and 45 CFR 149.110-130.

## Edge-input handling notes
- The tile is a guided decision tree, not a calculator. State-specific surprise-billing laws are noted in the citation as adding to (not displacing) the federal floor.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Decision-tree selects are labelled; each branch surfaces a citation paragraph. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
