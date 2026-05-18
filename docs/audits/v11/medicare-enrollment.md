# v11 audit - Medicare Enrollment Period Checker (`medicare-enrollment`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Medicare Part A/B Initial Enrollment Period (IEP) per 42 CFR 407.14 - the 7-month period (3 before, the birth month, 3 after the 65th birthday). General Enrollment Period (GEP) per 42 CFR 407.15 - January 1 through March 31 each calendar year. Part B Special Enrollment Period (SEP) for loss of employer group health coverage per 42 CFR 407.21 - 8 months from the later of loss of coverage or end of employment. Part D Late Enrollment Penalty per 42 CFR 423.46. All sections current per CFR as of 2026.

## Boundary examples added
- META example: DOB 1961-08-15 -> IEP 2026-05-01 through 2026-11-30 (3 months before, the August 2026 birth month, 3 months after); GEP each Jan 1 - Mar 31; Part D LEP applies if Part D enrollment is delayed without creditable coverage.
- Birthday on the 1st of a month: per CMS, the IEP shifts such that Part A/B coverage can be effective the first of the month containing the 65th birthday.
- SEP after loss of employer coverage: 8-month window from the later of loss of coverage or end of active employment.

## Cross-implementation differential
- N/A (date arithmetic against CFR-defined windows). The differential is "do the window calculations match 42 CFR 407?" — confirmed by re-reading 42 CFR 407.14 / 407.15 / 407.21.

## Edge-input handling notes
- DOB input parsed as ISO date; the 7-month IEP arithmetic uses calendar months (not 30-day blocks), matching CMS convention.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- One labelled date input + optional scenario select. Output region lists each enrollment window with its CFR cite. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
