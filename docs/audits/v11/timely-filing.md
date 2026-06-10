# v11 audit - Claim Timely-Filing Deadline (`timely-filing`)

- Auditor: CG
- Date: 2026-06-10
- Citation re-verified against: 42 CFR 424.44 (Medicare: one calendar year after the date of service; ACA 6404). spec-v63 §3.2.

## Boundary examples added
- Medicare, DOS 2026-03-01 -> deadline 2027-03-01 (365 days).
- other payer, DOS 2026-03-01, 90-day limit -> deadline 2026-05-30 (past-due relative to a mid-2026 clock).
- non-Medicare without a positive integer limit -> TypeError (caught by safe(); renderer prompts for the limit).

## Cross-implementation differential
- Computed through lib/deadline.js. 2026-03-01 + 365 d = 2027-03-01; + 90 d = 2026-05-30. Hand-checked. PASS.

## Edge-input handling notes
- Medicare basis is the fixed 365-day constant; any other payer requires a user-supplied positive-integer limit (no payer directory is shipped — respects the v29 code/payer-index retirement). Optional business-day basis available via the engine. PASS.

## A11y / keyboard notes
- Native date input + payer <select> + numeric limit field, all labeled; aria-live output. test:a11y clean; 320px no-hscroll clean. PASS.

## Defects opened
- none

## Status
- PASS
