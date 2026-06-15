# v12 audit - mbi-validate

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: CMS Medicare Beneficiary Identifier (MBI) format specification: 11 characters in a fixed position grammar, excluding the easily-confused letters S, L, O, I, B, Z.

`lib/billing-v83.js mbiValidate()` uppercases the input and strips spaces/hyphens, then checks length (exactly 11) and each position against the CMS grammar (C numeric 1-9; A alphabetic excluding SLOIBZ; AN alphanumeric excluding those letters; N numeric). It returns the FIRST offending position and the rule it violates (or the excluded-letter rule when an excluded letter appears in an alphabetic/alphanumeric slot) so the user can fix the character. Validates format only, not active entitlement.

## Boundary examples added
- Valid CMS sample-format MBI 1EG4-TE5-MK73: all 11 positions pass.
- 12G4TE5MK73: position 2 must be alphabetic -> first error position 2.
- 1SG4TE5MK73: excluded letter S -> excluded-letter rule named.

## Cross-implementation differential
- Reference: the CMS published MBI position grammar applied by hand.
- Test case: 1EG4TE5MK73 -> valid; an 11-char string with a digit at position 2 -> first error position 2. Sophie identical. PASS.

## Edge-input handling notes
- Empty -> TypeError; wrong length returns an invalid verdict with the observed length (not a throw, so the renderer shows the precise reason). No NaN/Infinity path.

## A11y / keyboard notes
- A single text input with a real `<label for>`; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
