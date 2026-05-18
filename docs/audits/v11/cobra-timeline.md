# v11 audit - COBRA Timeline (`cobra-timeline`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Consolidated Omnibus Budget Reconciliation Act, 29 USC 1162 (and the DOL implementing regulations at 29 CFR 2590.606-1 through 2590.606-4). Key durations: 18-month standard maximum (job loss / reduction in hours); 29-month disability extension (Social Security disability determination within first 60 days); 36-month for divorce, death of covered employee, dependent child aging off, or covered employee becoming Medicare-entitled. Election deadline: 60 days from qualifying event or notice (whichever is later). First premium due: 45 days after election. All durations remain current per 29 USC 1162 / 29 CFR 2590 as of 2026.

## Boundary examples added
- META example: qualifying-event date 2026-03-15, type "job-loss-involuntary" -> 18-month max; election deadline 2026-05-14 (60 days); first payment 45 days after election; coverage end 2027-09-15 (18 months from event).
- 29-month disability: qualifying-event 2026-03-15 + SSDI within 60 days -> coverage end 2028-08-15.
- 36-month divorce: qualifying-event 2026-03-15 + type "divorce" -> coverage end 2029-03-15.
- Election deadline boundary: event date + 60 calendar days (not 60 business days).

## Cross-implementation differential
- N/A (date arithmetic). The differential is "do the durations match 29 USC 1162?" — confirmed by re-reading the COBRA statute and DOL regulations.

## Edge-input handling notes
- Date inputs use ISO format; the renderer computes deadlines in calendar days, not business days, consistent with COBRA's day-count convention.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- One labelled date input + qualifying-event-type select. Output region lists each deadline. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
