# v12 audit - global-period

- Auditor: CG
- Date: 2026-06-13
- Citation re-verified against: CMS Pub. 100-04 Ch. 12 §40 (global surgery package); the MPFS GLOB DAYS indicator (000 = 0-day; 010 = minor 10-day; 090 = major 90-day with a 1-day preoperative period; XXX = concept does not apply; YYY/ZZZ/MMM = carrier-priced / add-on / maternity). CMS MLN Global Surgery Booklet. Post-op modifiers 24/58/78/79; pre-op decision modifiers 57 (major) / 25 (minor).

`lib/billing-v79.js globalPeriod()` computes whether a subsequent encounter falls inside the global package from the surgery date and the GLOB DAYS indicator (UTC calendar math, day-0 = the day of surgery, reusing `lib/deadline.js`), and names the modifier that unlocks separate payment for the encounter's nature.

## Boundary examples added
- Surgery 2026-01-01, 090, subsequent 2026-02-01, unrelated E/M -> inside (window 2025-12-31..2026-04-01); modifier 24.
- Subsequent 2026-04-01 (day 90 exactly) -> still inside (boundary day). 2026-04-02 -> outside, bill normally.
- 000 indicator, subsequent the next day -> outside (day-of-service-only global).
- Related post-op visit inside the window -> bundled, not separately billable, no modifier.
- Return to OR -> 78; decision-for-surgery on the preop day of a 090 -> 57; on the day of a 010 -> 25.
- XXX -> no package; bill normally (gate, no fixed window computed).

## Cross-implementation differential
- Reference: surgery date + global days computed by hand against the Global Surgery Booklet.
- Test case: 090 inclusive window end = surgery + 90 days; the boundary day is inside, the next day outside. PASS.
- 090 preop day (surgery - 1) is inside for the decision-for-surgery case. PASS.

## Edge-input handling notes
- Dates parse via `parseIsoStrict` (UTC midnight); a non-YYYY-MM-DD string throws RangeError, a non-string throws TypeError -- no Invalid Date, no timezone drift.
- A subsequent date before surgery yields a negative daysFromSurgery handled explicitly (only the 090 preop day counts as inside); a mis-tagged decision-for-surgery visit far from the date is flagged, not given a wrong modifier.

## A11y / keyboard notes
- Two labeled `<input type=date>`, two labeled `<select>`s; output region `aria-live="polite"`. Native date control respects `color-scheme` (spec-v73). `npm run test:a11y` clean; 320px no-horizontal-scroll sweep passes.

## Defects opened
- none

## Status
- PASS
