# v11 audit - Naegele Pregnancy Due Date (`due-date`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Naegele rule (universally taught obstetric heuristic): estimated due date (EDD) = last menstrual period (LMP) + 280 days. Equivalent to "subtract three months, add seven days, add one year" with a regular 28-day cycle assumption. The rule is attributed to Franz Karl Naegele (1778-1851) and is consistent with ACOG Committee Opinion 700 (2017, reaffirmed) on estimating due date.

`lib/clinical.js naegele()` implements: parse LMP as ISO date, add exactly 280 days in milliseconds (`lmp.getTime() + 280 * 86400000`), report due date and current gestational age (weeks and days from LMP to today).

## Boundary examples added
- low (start of common-era ISO range; META example): LMP 2025-01-01 -> due 2025-10-08 (280 days = 23 Jan + 28 Feb + 31 Mar + 30 Apr + 31 May + 30 Jun + 31 Jul + 31 Aug + 30 Sep + 8 Oct = 280 + the initial Jan 1 offset). Pinned by `test/unit/clinical.test.js` line 104.
- mid: LMP 2025-06-15 -> due 2026-03-22 (15 Jun + 280d = 22 Mar following year).
- high (leap-year crossing): LMP 2024-01-01 -> due 2024-10-07 (one day earlier than non-leap 2025 because 2024 includes Feb 29 within the 280-day window).
- across year boundary: LMP 2025-12-15 -> due 2026-09-21.

## Cross-implementation differential
- Reference implementation: ACOG Committee Opinion 700 hand-rule (LMP + 280 days) and the publicly-documented MDCalc due-date calculator.
- Test case: META example — LMP 2025-01-01.
- Sophie result: due 2025-10-08.
- Reference result: 2025-01-01 + 280 days = 2025-10-08 (hand computed and node-Date-verified during audit).
- Delta: 0 days. PASS.

Leap-year cross-check (LMP 2024-01-01 -> 2024-10-07): manual count 30+29+31+30+31+30+31+31+30+7 from Jan 1 = 280 days. PASS.

## Edge-input handling notes
- Input is a `<input type="date">` (parsed as YYYY-MM-DD UTC midnight to avoid TZ drift). Invalid date strings throw TypeError -> inline error.
- The calculation uses UTC millisecond arithmetic, sidestepping DST and locale-zone drift that have historically tripped naive `setDate(+280)` implementations across the spring-forward/fall-back boundary.
- Naegele rule's well-known limitation (assumes 28-day cycle, ovulation on day 14) is documented in the source — the tile does not pretend to correct for cycle length. Users with a known later ultrasound-derived EDD should use the `preg-dating` tile, which is cross-linked from the citation copy in `META['preg-dating']`.

## A11y / keyboard notes
- Single labelled date input. Tab-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
