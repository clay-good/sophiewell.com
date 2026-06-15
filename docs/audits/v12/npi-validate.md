# v12 audit - npi-validate

- Auditor: CG
- Date: 2026-06-15
- Citation re-verified against: 45 CFR §162.406 (National Provider Identifier); the NPI check digit is computed by the Luhn algorithm (ISO/IEC 7812) over the 9-digit identifier prefixed with the 80840 issuer prefix.

`lib/billing-v83.js npiValidate()` takes a digits-only string (hyphens/spaces stripped). A 9-digit base is treated as a generate request -- it returns the 10th (Luhn) check digit and the complete NPI. A 10-digit value is validated by recomputing the check digit from its first 9 digits over the `80840` prefix and comparing to the stated 10th digit; a mismatch returns `valid:false` with the expected digit shown so a transposition is visible, not just "invalid". Verifies the format/check digit only -- not NPPES enrollment.

## Boundary examples added
- Validate 1234567893 (canonical valid NPI): valid, recomputed check digit 3.
- Validate 1234567890 (wrong final digit): invalid, expected check digit 3 shown.
- Generate from 123456789: check digit 3 -> 1234567893.

## Cross-implementation differential
- Reference: Luhn over 80840123456789 by hand -> check digit 3.
- Test case: 1234567893 -> valid; Sophie result identical. PASS.

## Edge-input handling notes
- Empty -> TypeError; non-digit characters -> RangeError; any length other than 9 or 10 -> RangeError with the observed length. No NaN/Infinity path; the fuzz harness scalar matrix is throw-safe.

## A11y / keyboard notes
- A single text input with a real `<label for>`; numeric inputmode; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
