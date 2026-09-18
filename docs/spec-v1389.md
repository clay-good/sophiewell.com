# spec-v1389 — involuntary psychiatric holds: the clocks

Program: [scope-state-practice.md](scope-state-practice.md). Depends on spec-v1388 (calendar,
three-state controls, ledger). Group M. Specialties: `nursing-psych`, `emergency-medicine`,
`psychiatry`, `health-law`. Audiences: clinicians, educators.

An ED nurse boarding a psychiatric patient for the third day needs to know **which deadline
comes next and when it falls**. Each state counts differently, and each counting rule has a
trap:

| tile | the trap it prevents |
|---|---|
| `ny-mhl-hold-clock` | 9.37's 72 hours **exclude Sundays and holidays**; 9.39's 48-hour confirmation does not |
| `nj-civil-commitment-clock` | the 72 hours start at the **screening certificate**, not at arrival |
| `ca-5150-hold-timeline` | a 5250 certification is a **new** 14-day clock, and it needs a review hearing within 4 days |
| `ca-ed-psych-detention-1799` | a non-designated ED's hours **count toward** a later 5150 |
| `ca-5585-minor-hold` | the minor's hold is its own section, with a parent-notice duty |
| `tx-emergency-detention-clock` | ED waiting time **counts**, and the end rolls to 4 p.m. on the next business day |
| `tx-protective-custody-hearing-clock` | the 72-hour hearing rolls past weekends and holidays |

Every tile takes **entered times** (never the device clock), prints each deadline as a
date and time plus elapsed hours, and names the section beside it.

## `ny-mhl-hold-clock` — New York Psychiatric Hold Deadlines (MHL 9.39, 9.37, 9.40, 9.27, 9.13)

Inputs: legal status (9.39 emergency, 9.37 director's, 9.40 CPEP, 9.27 involuntary on two
certificates, 9.13 voluntary), admission time, and the time of each certificate or request made
so far. Output: the next deadline for that status.

| Status | Deadlines (verified against nysenate.gov text, September 2026) |
|---|---|
| 9.39 | Second staff physician confirms within **48 h**. Maximum stay **15 days**. A hearing is held within **5 days** of a request. |
| 9.37 | Second certificate within **72 h, excluding Sundays and holidays** (spec-v1388 calendar) |
| 9.40 CPEP | **24 h** in the emergency room; extended observation up to **72 h total**, with a second psychiatrist |
| 9.27 | Two physicians (or a physician and a psychiatric NP); the application must be executed within **10 days** before admission |
| 9.13 | After written notice to leave, release, or retain up to **72 h** while applying for a court order (up to **60 days**) |

## `nj-civil-commitment-clock` — New Jersey Screening to Commitment Clock (N.J.S.A. 30:4-27.10)

Inputs: time of the screening certificate, time of each clinical certificate, whether one
certifier is a psychiatrist. Output: the 72-hour limit on holding without a temporary court
order, the **20-day** final hearing, and a check that at least one of the two clinical
certificates is a psychiatrist's and that the certifier is not a relative.
Source: NJ Courts, *Involuntary Civil Commitment Reference Binder* (June 2024), citing
30:4-27.10. **Excludes the 30:4-27.9a extra 72-hour hold**. Its August 31, 2025 sunset has not been
shown to be extended, so the tile does not offer it.

## `ca-5150-hold-timeline` — California 5150 Hold Timeline (WIC §5150, 5250, 5256, 5260, 5270.15)

Inputs: detention time, criterion (danger to self, danger to others, grave disability), and dates of
any certification. Output: the stage the patient is in, its end, and the next available stage.

| Stage | Rule |
|---|---|
| 5150 | Up to **72 h** (AB 2275, 2022) |
| 5250 | Certification for up to **14 days** of intensive treatment |
| 5256 | Certification review hearing within **4 days** of certification |
| 5260 | A further **14 days** for a patient who is imminently suicidal |
| 5270.15 | A further **30 days** for grave disability, **only in counties that have opted in** (a yes/no input; no county list) |

Shared note: since SB 43, grave disability includes severe substance use disorder, which is
the criterion tile `ca-grave-disability-sb43` (spec-v1390).

## `ca-ed-psych-detention-1799` — California Non-Designated ED Psychiatric Detention (HSC §1799.111)

Inputs: detention start, the time the patient was medically stable, and whether a 5150 was later
written. Output: the **8-hour** and **24-hour** limits under §1799.111(a)(3) and (b) as amended by
SB 43 (effective January 1, 2024), and the time credited toward a later 5150 under (f). This is the
question a community hospital without a designated unit asks at hour six.

## `ca-5585-minor-hold` — California Minor 72-Hour Psychiatric Hold (WIC §5585.50)

Inputs: age under 18, criterion, detention time. Output: the **72-hour** end, and the "every effort
to notify" parent or guardian duty as a timed checklist item. It refuses age 18 and over and points
to `ca-5150-hold-timeline`.

## `tx-emergency-detention-clock` — Texas Emergency Detention Clock (HSC 573.021, 573.001, 573.025)

Inputs: apprehension time, time presented to the facility, admission time, and a disaster/severe
weather extension (yes/no). Output, verified against HSC ch. 573 as amended by SB 1164
(effective September 1, 2025):

- Physician examination: within **12 h** of apprehension (573.001(g)).
- Detention end: **48 h from presentation, with ED waiting time counted**. If that falls on a
  Saturday, Sunday, legal holiday, or before 4 p.m. on the next business day, detention runs to
  **4 p.m. on the next business day**. Otherwise it runs to **4 p.m. on the day the 48 hours end**
  (573.021(b)–(c)).
- Rights advisement: within **24 h** of admission (573.025(b)).

The worked example is a Friday 6 p.m. presentation, whose 48 hours end Sunday 6 p.m. The printed
end is **Monday 4 p.m.**, or Tuesday if Monday is a holiday. That roll-forward is the reason the tile
exists.

## `tx-protective-custody-hearing-clock` — Texas Probable-Cause Hearing Clock (HSC 574.025, 574.005)

Inputs: time detained under a protective custody order; date an application for court-ordered
services was filed. Output: the probable-cause hearing within **72 h**, rolled to the next business
day when it lands on a weekend or holiday. Also the court-ordered services hearing within **14
days** of filing, with a **30-day** cap on continuances.

## Acceptance (per tile, beyond the recipe)

- A worked example that crosses a weekend, and one that crosses a legal holiday.
- A blank start time prints no deadline.
- The NY 9.37 test crosses a Sunday **and** Lincoln's Birthday. The TX test uses a holiday Monday.
- One ledger row per tile. TX next review: after the 90th Legislature (2027). CA, NY, NJ: after
  January 1 each year.

## Built so far (2026-09-18): the two Texas tiles

`tx-emergency-detention-clock` and `tx-protective-custody-hearing-clock` are live in group M, built on
`lib/state-calendar.js` (spec-v1388), with `test/unit/tx-hold-clocks-v1389.test.js` and one
state-law ledger row each (next review 2027-06-01, after the 90th Legislature). Catalog 1,728 → 1,730.
The New York, New Jersey, and California tiles are still to come.

What the statute text changed from the plan above:

- **S.B. 1164 (2025) did not touch the time rule.** It rewrote the detention criteria in ch. 573 and
  repealed three subsections. Section 573.021(b)'s 48 hours and 4 p.m. rule date from S.B. 344 (2017).
  The citation says so.
- **Section 573.021(b) reads two ways when the 48 hours end on a business day.** "Before 4 p.m. on the
  first succeeding business day" can cover that day (4 p.m. on the next business day) or not (4 p.m.
  on the day the period ends, which can be earlier than the 48th hour). Each reading leaves one of
  the section's two sentences with nothing to do. The tile prints both, gives the earlier as the time
  to have the protective custody order in hand, and flags when that time comes before the 48th hour.
  A period ending on a Saturday, Sunday, or legal holiday is unambiguous.
- **Texas's five staffed state holidays** (Confederate Heroes, Texas Independence, San Jacinto,
  Emancipation, LBJ Days) count as business days, and each tile flags one that touches the count:
  whether it is a "legal holiday" for these sections is for the court.
- **The 574.025 roll-forward is to a day, not to 4 p.m.:** "the next day that is not a Saturday,
  Sunday, or legal holiday."
- **Rights advisement (573.025(b)) is not in the tile.** Its timing could not be read from the statute
  text when this was built, and a deadline is not printed from memory.

## Built (2026-09-18): `ny-mhl-hold-clock`

One tile for five statuses, each read from the nysenate.gov text. Catalog 1,730 → 1,731. What the
text added to or changed in the table above:

- **9.40 adds a 6-hour examination:** a staff physician begins the examination within 6 hours of
  the person being received, and **every** 9.40 period runs from registration into the CPEP
  emergency room.
- **9.37's 72 hours start at admission** and exclude "Sunday and holidays": New York's holidays
  under General Construction Law §24, including Lincoln's Birthday and Election Day, from
  `lib/state-calendar.js`. The acceptance case (Thursday, February 11, 2027) skips Lincoln's
  Birthday, a Sunday, and Washington's Birthday, and lands on Wednesday, February 17 at 10 a.m.
- **9.13's 72 hours run from receipt of the written notice** and exclude nothing.
- **9.27's 60-day retention is not in 9.27.** It lives in §9.33, which was not read, so the tile
  checks only the 10-day execution window.
- 9.37(c)'s 24-hour confirmation for certain less-populous counties is not in the tile.
