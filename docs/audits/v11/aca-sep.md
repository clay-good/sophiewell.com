# v11 audit - ACA SEP Eligibility Checker (`aca-sep`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: 45 CFR 155.420 - Special Enrollment Periods on the federal Marketplace and state-based exchanges that mirror the federal rule. Qualifying life events include loss of qualifying coverage, marriage, birth/adoption, permanent move, becoming a citizen, court order, gaining membership in a federally-recognized tribe, and certain income changes. SEP windows are typically 60 days before AND after the event (loss of coverage advance window) or 60 days after (other QLEs). Coverage effective dates vary by event type; for loss of coverage, plan selection by the 15th typically yields first-of-next-month coverage. All current per 45 CFR 155.420 as of 2026.

## Boundary examples added
- META example: event "loss-of-coverage" -> "60-day window before AND after the event; coverage starts the first of the month after plan selection."
- Marriage: 60 days after; coverage first-of-month following plan selection.
- Birth/adoption: 60 days after; coverage can be retroactive to the birth/adoption date.
- Permanent move: 60 days after.

## Cross-implementation differential
- N/A (decision tree). The differential is "do the QLE windows match 45 CFR 155.420?" — confirmed by re-reading the CFR section.

## Edge-input handling notes
- The renderer surfaces both the window length and the coverage-effective-date rule because the two are independent (window = when you can enroll; effective date = when coverage starts).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- QLE select labelled; output region lists window + effective-date rule per 45 CFR 155.420. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
