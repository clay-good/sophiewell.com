# spec-v1399 — ED throughput and discharge

Program: [scope-state-practice.md](scope-state-practice.md). Depends on spec-v1388. Group H.
Specialties: `emergency-medicine`, `nursing-er`, `ems`, `case-management`, `social-work`.

Los Angeles and San Francisco EDs face two statutory yardsticks no other state sets this way:
how long an ambulance crew may wait to hand off a patient, and what a hospital must do before
discharging a patient who is homeless.

## `ca-apot-calculator` — California Ambulance Patient Offload Time (HSC §1797.120, §1797.120.5)

Inputs: a pasted or typed list of (ambulance arrival, transfer of care) time pairs, up to a month
of rows. Output: the **90th-percentile** APOT, the share offloaded **within 30 minutes**, and
pass/fail against AB 40's standard: offload in 30 minutes or less, **90 percent of the time**
(effective January 1, 2024). The APOT definition follows §1797.120. The percentile method is
nearest-rank, stated on the page, because a ward manager will check the number against the
LEMSA's report. Rows with a missing time are listed and excluded, never counted as zero. That
follows the blank-is-a-gap rule.

Mobile: pairs are entered one row at a time, with an "add row" control, and pasted CSV is
accepted. No horizontal table scroll at 320px. The row list collapses to a count.

## `ca-homeless-discharge-1262-5` — California Homeless Patient Discharge Checklist (HSC §1262.5, SB 1152)

Inputs: a checklist of what §1262.5 requires before a homeless patient is discharged: a
destination identified, a meal, weather-appropriate clothing, discharge medications, follow-up
care, infectious-disease screening, vaccinations offered, a behavioral-health screening,
screening for coverage eligibility, and transportation offered to a destination within **30
minutes or 30 miles**. Output: complete, or the missing items by name, suitable to copy into
the discharge note. Items are three-state; "not assessed" is never counted as done.

**Before the build:** research did not confirm the current subdivision letters of §1262.5. Read
the section and cite subdivisions exactly.

## Acceptance

- APOT: ten pairs with offloads of 10–40 minutes give a known 90th percentile. A row with a blank
  transfer time is excluded and named.
- Discharge: an all-blank checklist says "incomplete, 10 items not documented" and never
  "complete".

## Built (2026-09-18)

| tile | group | source read |
|---|---|---|
| `ca-apot-calculator` | H | leginfo, HSC 1797.120 and 1797.120.5 |
| `ca-homeless-discharge-1262-5` | H | leginfo, HSC 1262.5 |

- AB 40 does not itself set the standard. Each LEMSA adopts one "not to exceed 30
  minutes, 90 percent of the time" (1797.120.5(b)(1)). The tile checks that ceiling
  and says a LEMSA may be stricter.
- Clock-only pairs that cross midnight are counted into the next day and flagged.
  Full date-times are taken as given.
- The homeless checklist has **11** items, not the plan's 10: the (n)(4) destination
  plus (o)(1)-(o)(10). The subdivisions are cited exactly as read. "Not needed" is
  offered for every item and counts only where the statute has an exception: the
  meal, clothing, follow-up, prescription, vaccinations, and transportation. Anywhere
  else it counts as missing.
- Rows are entered in one text box (paste or type). The page has no table, so there is
  no horizontal scroll.
