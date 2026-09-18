# spec-v1388 — shared machinery for state-law tiles

Program: [scope-state-practice.md](scope-state-practice.md). This spec builds no tile. It builds
the five things the 64 tiles in spec-v1389 through spec-v1401 all need, so no wave has to invent
them and no two waves invent them differently. Every new tile still follows the standing 24-file
recipe: lib, view, MCP adapter, unit test, META with worked example, synonyms, search corpus,
field index, sitemap, report catalog (which gives it the **Report a problem** button), tools
index, SBOM, and all 13 count surfaces.

## 1. The state picker

- One shared field definition: `state`, `kind: 'enum'`, values `NY`, `NJ`, `CA`, `TX`, labels
  `New York`, `New Jersey`, `California`, `Texas`. **Required, no default.** A preselected state
  would answer a Texas nurse with New York law.
- A tile covering fewer states lists only those states. It does not show a state and then
  refuse it.
- On mobile it is a native `<select>`, not four buttons, so it fits 320px at any label length.
- The URL fragment carries the state like any other input, so a shared link reopens on the
  same state.
- **Search prefill.** `data/synonyms.json` routes state-specific words to the picker tile with
  the state preselected: `i-stop` → `pmp-check-required` + `NY`, `cures` → + `CA`,
  `5150` → `ca-5150-hold-timeline`, `9.39` and `kendra` → the NY tiles. Each route gets a row
  in `test/mcp/mcp-search-relevance.test.js`.

## 2. Legal-holiday and business-day calendar (`lib/state-calendar.js`)

Several statutes count time excluding Sundays and holidays (NY MHL 9.37), roll a deadline to
"4 p.m. on the next business day" (TX HSC 573.021), or count working days (CA WIC §15630). All of
these need each state's legal holidays, **computed from the statutory rule, not listed by year**:

| State | Source to encode | Note |
|---|---|---|
| NY | General Construction Law §24 | Includes Lincoln's Birthday and Election Day |
| NJ | N.J.S.A. 36:1-1 | Includes General Election Day |
| CA | Government Code §6700 | Includes Cesar Chavez Day and Native American Day |
| TX | Government Code §662.003 | National vs state holidays; optional holidays are not closures |

Exports: `isLegalHoliday(state, date)`, `nextBusinessDay(state, date)`, `addHours(...)`,
`addExcludingSundaysAndHolidays(state, start, hours)`. **Every rule's Saturday/Sunday observance
shift is its own test case**, because the observance rules differ by statute.

Pure functions with no clock. **A tile never reads `Date.now()`**: the clinician enters the
start time, and the answer is the same next year. That keeps the `clock-dependent` sweep
(test/integration/clock-dependent.spec.js) meaningful for these tiles.

## 3. State-law staleness ledger

`ISSUER_PATTERN` in `scripts/check-citations.mjs` matches CDC, AHA, and similar bodies. It does not
match a statute, so none of these tiles would be gated. Add:

- A second pattern, `STATE_LAW_PATTERN`, matching `N.Y.|NYCRR|MHL|PHL|N.J.S.A.|N.J.A.C.|WIC|HSC|
  CCR|Tex\. |TAC|Fam\. Code|Occ\. Code|Prob\. Code` in `META[id].citation`.
- A new table in `docs/citation-staleness.md`, **State law (gate-enforced)**, with columns: tile,
  section(s), state, verified date, last amendment known, **next review** (the first day after the
  state's next session adjourns, or the date a pending rule is due to become permanent).
- The gate fails when a row's next-review date is in the past. That makes "review after the
  session" a CI fact rather than a memory.
- Rows flagged **high** volatility in their own spec (the CA emergency psych-hospital ratio rule,
  the NY aid-in-dying law) carry the specific date that could change them.

## 4. Copy rules for a legal answer

- **The answer states the rule and its section. It never says "you are compliant" or "this is
  legal."** Staffing tiles say "meets the §70217 ratio for this unit type" or "is 1 RN short of it".
- One closing scope sentence, in the house pattern: *"This states the statute as of [date]. It
  does not replace your facility's policy, its counsel, or the court."* Only one. The
  `one-disclaimer` sweep enforces that.
- **A checklist item that has not been answered is not "no."** Criteria tiles (holds, AOT, CARE
  Court, DNR validity) use three-state controls (met / not met / not assessed), following the
  NIHSS fix. An unassessed criterion withholds both "meets" and "does not meet" and names what is
  missing. Holds are the clearest case: an unticked danger criterion must not read as "does not
  meet criteria, release."
- A missing start time asks for it by its label and prints no deadline, in line with spec-v1006
  onward.
- Deadlines print as a date and time **and** as the elapsed interval ("Thursday Sept 24, 4:00 pm,
  51 h after presentation"), because a nurse checks against the clock on the wall.

## 5. Catalog wiring

- **Group M, "State & Coverage Reference,"** takes the legal-rule tiles. It already exists in
  `GROUP_LABELS` and has had no tiles since spec-v5. Check that hub-page and tools-index builds
  render a group that goes from 0 to N (they have never done so). Clinical tiles in spec-v1400 and
  v1401 go to group J; environmental tiles in v1398 go to group G.
- **Specialty tags:** use existing terms only (`nursing-psych`, `emergency-medicine`,
  `case-management`, `nursing-ob`, `nursing-nursery`, `palliative-care`, `ems`,
  `infectious-disease`, `pharmacy`, `psychiatry`, `social-work`). This program adds **two** terms
  to the closed vocabulary in `test/unit/specialty-coverage.test.js`. `health-law` lets a coverage
  map show how much of the catalog is legal rather than clinical. `occupational-health` covers
  the Cal/OSHA tiles in v1398, which have no home in the vocabulary today; the September 5, 2026
  catalog-depth audit found the same gap.
- **Adapter summary first sentence:** 130 characters or fewer, and no abbreviation with a period.
  `N.J.S.A.` and `Tex.` go in the second sentence, never the first, or the hub row is cut at
  "N." (the tile-line trap).
- **Names for search:** state first, then the everyday phrase clinicians search, then the
  section. For example, "California 5150 Hold Timeline (WIC §5150–5270)" and "New York Psychiatric
  Hold Deadlines (MHL 9.39, 9.37, 9.27, 9.13)."

## Acceptance

`lib/state-calendar.js` with unit tests for every holiday rule of all four states across 2026–2030,
including each observance shift. The ledger gate is negative-tested: backdate one row and confirm
the gate fails. The synonym routes are added once their tiles exist. No catalog count changes.

## Built (2026-09-18)

| Part | What shipped |
|---|---|
| 1. State picker | `STATES` and `stateOptions(covered)` in `lib/state-calendar.js`: fixed order, no default, and a tile covering fewer states lists only those. Search-prefill routes wait for their tiles, as this spec says. |
| 2. Calendar | `lib/state-calendar.js`: `holidaysInYear`, `isLegalHoliday`, `isBusinessDay`, `nextBusinessDay`, `addHours`, `addExcludingSundaysAndHolidays`, `elapsedHours`, `formatDeadline`. Hours are real elapsed time across the daylight-saving changes. `test/unit/state-calendar.test.js` checks every weekday-rule holiday for all four states, 2026–2030, against dates computed independently, plus each observance shift in that window. |
| 3. Ledger gate | Rule 9 in `scripts/check-citations.mjs`: `STATE_LAW_PATTERN`, a **State law (gate-enforced)** table in `docs/citation-staleness.md`, and a failure once a row's next-review date passes. Negative-tested with a backdated row. No current citation matches the pattern. |
| 4. Copy rules | `scopeSentence(asOf)` returns the one closing sentence; `formatDeadline` prints the wall-clock time **and** the interval ("Thursday, September 24, 2026, 4:00 pm, 51 h after presentation"). |
| 5. Wiring | `health-law` and `occupational-health` added to the closed specialty vocabulary. Group M is already labeled in `build-tools-index.mjs` and the architecture table, and a group appears there once it has a tile. |

The statutes were read before they were encoded, and four facts differ from this plan:

- **California renamed March 31.** AB 2156 (effective March 26, 2026) made it **Farmworkers Day**; it was Cesar Chavez Day. §6700 now also lists **Lunar New Year** and **Diwali**, both defined by lunar calendars. Neither the statute nor CalHR gives their Gregorian dates, so the calendar does not guess them: it counts those days as working days (the earlier deadline) and any count that crosses their window (January 21–February 20, October 15–November 15) returns a caveat naming the holiday. California's Good Friday is a holiday from noon to 3 p.m. only, and is reported as partial. Sunday observance applies only to the seven dates in §6701(a), and a Saturday Veterans Day moves to Friday (§6701(b)).
- **Texas has two kinds of state holiday.** Confederate Heroes, Texas Independence, San Jacinto, Emancipation, and LBJ Days keep agencies staffed (Gov. Code §662.004), so they are reported as **staffed** and count as business days; the Friday after Thanksgiving, December 24, and December 26 are closures. Texas moves no weekend holiday (§662.005). On January 19, 2026, Martin Luther King Jr. Day and Confederate Heroes Day fall on the same date; the closure wins and both are named.
- **New Jersey's Juneteenth is the third Friday in June** (P.L. 2020, c.76), not June 19. Good Friday and every general election day are legal holidays.
- **New York** includes Lincoln's Birthday, Juneteenth, and every general election day; a Sunday holiday moves to Monday (Flag Day excepted), and no Saturday holiday moves.
