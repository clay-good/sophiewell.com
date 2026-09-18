# spec-v1397 — licensure and practice authority

Program: [scope-state-practice.md](scope-state-practice.md). Depends on spec-v1388 (state
picker, ledger). Group M. Specialties: `nursing-general`, `nursing-ed`, `health-law`.
Audiences: clinicians, educators.

**This wave has the program's only hard external deadline.** Every New York RN, LPN, and NP
must complete New York's **updated** child-abuse identification training by **November 17, 2026**
(Chapter 25, Laws of 2024). That is eight weeks from this spec. If the program ships in pieces,
this tile goes first.

## `nurse-license-training-requirements` — Nurse License Training and CE: What Is Due (NY, NJ, CA, TX)

Inputs: state, license type (RN, LPN/LVN, APRN), license issue date, renewal date, practice setting
(ED, care of older adults), prescriptive authority, and the courses completed with their dates.
Output: each requirement as **met / due by [date] / overdue**, with its source.

| State | Requirements (verified September 2026 unless flagged) |
|---|---|
| NY | Child-abuse identification: a one-time 2-hour course, **but the updated curriculum is required by November 17, 2026** (Ch. 25 L.2024). A **15-minute addendum** satisfies it for those trained between November 1, 2022 and August 31, 2025. Infection control **every 4 years**. Source: NYSED Office of the Professions |
| NJ | N.J.A.C. 13:37-5.3: **30 contact hours** per 2-year cycle, including **1 hour on opioids**, plus a one-time **1 hour on organ donation**. **Flag:** the Board's page blocked automated access; the figures come from summaries citing the rule. Read the rule before the build |
| CA | Board of Registered Nursing: **30 contact hours** every 2 years, including **1 hour of implicit bias** (AB 241). **Flag:** verified on BRN summary pages, not the regulation. Read 16 CCR §1451 before the build |
| TX | 22 TAC 216.3: **20 contact hours**; **2 hours of jurisprudence and ethics** every third renewal; **2 hours of geriatric care** if applicable; a one-time **2 hours of forensic evidence collection** for ED nurses; the HHSC human-trafficking course; APRN pharmacology and opioid hours. **Flag:** research read the 2019 version on Cornell LII. Confirm it is current |

Only the NY row is fully verified against its primary source. **The NY row may ship alone before
November 17**, with the other states added as each flag clears. A picker tile may offer fewer
states (spec-v1388 §1).

## `ca-np-103-104-tracker` — California Nurse Practitioner 103/104 Transition Tracker (B&P §2837.103, §2837.104)

Inputs: NP certification date, full-time practice start, hours or years in transition to
practice, and date of 103 status. Output: eligibility for **103** (practice outside a standardized
procedure in a qualifying group setting, after **3 full-time years or 4,600 hours** of transition
to practice) and for **104** (independent practice after a further **3 years** as a 103 NP), with
the dates each is reached (SB 1451, effective January 1, 2025).

## `tx-prescriptive-authority-agreement` — Texas Prescriptive Authority Agreement Checker (Occ. Code 157.0512)

Inputs: the number of APRNs and PAs under agreement with a physician (as full-time equivalents), any
underserved or hospital-based exemption, quality-assurance meeting dates, and the agreement's
contents. Output: the **7 full-time-equivalent** cap, whether the meeting cadence is met (the monthly
quality-assurance meeting research found in 157.0512(f); confirm its first-year and later cadence
at build), and which 157.0512(e) required elements are missing.
Volatility medium: review after the 2027 session.

## Acceptance

- NY: a nurse trained in March 2024 sees "15-minute addendum due by November 17, 2026". A nurse
  trained in 2019 sees "updated 2-hour course due by November 17, 2026".
- Each flagged state ships only after its flag is cleared, and a test asserts the tile offers only
  cleared states.
- The ledger row for NY expires **November 18, 2026**. After that date the tile's NY copy changes
  from "due by" to "was due by", which the gate forces someone to review.

## Built (2026-09-18): `nurse-license-training-requirements`, New York only

Read from NYSED's Office of the Professions pages. Catalog 1,738 → 1,739. The tile is named
**"Nurse Mandated Training: What Is Due (New York)"** until another state is added, so the name never
lists a state the picker refuses. What the source changed from the table above:

- **LPNs are not on NYSED's child-abuse list.** It names registered nurses and nurse practitioners;
  the tile says so for an LPN instead of printing a deadline.
- **Three groups, three answers:** trained on or after September 1, 2025 (when providers began the
  updated curriculum): met, if that course was the updated one; trained November 1, 2022 to
  August 31, 2025: the 15-minute addendum or the full course; trained earlier or never: the updated
  two-hour course. All by November 17, 2026. Both acceptance cases hold (March 2024 → addendum;
  2019 → full course).
- **Infection control is RNs and LPNs, every four years** (Education Law 6505-b). An NP meets it
  through the RN license. A licensee not practicing in New York is deferred until 90 days after
  resuming practice.
- The ledger row's next review is **November 18, 2026**, so the gate forces the "due by" copy to be
  revisited the day after the deadline.

## Built (2026-09-18): `ca-np-103-104-tracker` and `tx-prescriptive-authority-agreement`

Catalog 1,739 → 1,741. Read from leginfo (B&P 2837.103, 2837.104) and texas.public.law (Occ. Code
157.0512).

- **The 104 years are NP practice past the transition to practice, not years as a 103 NP.**
  2837.104(b)(3): "practiced as a nurse practitioner in good standing for at least three years, not
  inclusive of the transition to practice"; the board may lower it for a DNP. 103's transition to
  practice may also be deemed met by three FTE years or 4,600 hours of direct patient care in the
  last five years.
- **The Texas meeting cadence is monthly throughout.** 157.0512(f) requires documented meetings "at
  least once a month"; the separate first-year cadence (former (f-1)) was repealed by H.B. 278 in
  2019. The seven-FTE cap does not apply in a practice serving a medically underserved population or
  a hospital facility-based practice (157.0512(d)).

The NJ, CA, and TX rows of `nurse-license-training-requirements` are still to come, each after its
source is read.

