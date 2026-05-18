# v11 audit - Medical Bill Decoder (`decoder`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CMS billing-code conventions: ICD-10-CM (3-7 alphanumeric, dot after 3 chars); CPT (5 numeric); HCPCS Level II (1 letter + 4 digits); NPI (10-digit Luhn checksum per 45 CFR 162.406, still the current HIPAA TCS NPI rule as of 2026).

## Boundary examples added
- META example: a four-line patient bill -> decoder identifies 99213 (CPT-shaped), J3490 (HCPCS-shaped), I10 (ICD-10-shaped), POS 11, and a Luhn-valid NPI; arithmetic sums to $227.00. PASS.
- Edge: a string that matches a regex but is not a real code (e.g. "Z99" which fits the ICD-10-CM shape but is not currently assigned) is honestly labelled "possible" rather than asserted as valid — the tile reports code-shape matches plus the NPI Luhn check, not authoritative validity.

## Cross-implementation differential
- N/A for a regex-based decoder; the differential is "does the regex set still match the CMS billing-code conventions?" — confirmed by re-reading the CMS pattern documentation for each code family.

## Edge-input handling notes
- The Luhn-10 implementation on the NPI uses the standard CMS doubling rule with the constant prefix "80840" prepended per 45 CFR 162.406; tested against the published 1234567893 example NPI which is Luhn-valid by construction.
- All decoder output is annotated "possible CPT / HCPCS / ICD-10" rather than asserting authoritative validity, consistent with spec-v11 §5.3.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- One labelled textarea; output region announces decoded tokens and arithmetic. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
