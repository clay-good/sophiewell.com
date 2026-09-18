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
