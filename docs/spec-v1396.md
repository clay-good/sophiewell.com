# spec-v1396 — nurse staffing and the workplace

Program: [scope-state-practice.md](scope-state-practice.md). Depends on spec-v1388. Group M.
Specialties: `nursing-general`, `nursing-icu`, `nursing-psych`, `geriatrics`, `health-law`.
Audiences: clinicians, educators.

The catalog has `nems` (spec-v544), which states plainly that it is **not** a nurse-to-patient
ratio. Nothing answers the question a charge nurse asks at 6:45 a.m.: *with this census and these
nurses, does this unit meet the law?* Two states set ratios by law, and all four set rules for
mandatory overtime, staffing committees, or both.

## `nurse-staffing-ratio-check` — Hospital Nurse-to-Patient Ratio Check (CA Title 22, NY ICU)

Inputs: state (CA or NY), unit type, patient count (or mix, for L&D and postpartum), licensed nurses
giving direct care, and for CA whether the charge nurse has patients. Output: required minimum
licensed nurses, the count entered, and **"meets"** or **"is N short"**. Each unit type is checked
separately, because **§70217 forbids averaging** across units or shifts.

| State | Rule (verified September 2026) |
|---|---|
| CA, acute hospital | 22 CCR §70217(a) (current through Register 2026 No. 36): ICU, burn, CCU, respiratory 1:2 · NICU 1 **RN**:2 · OR one RN circulator per room · L&D 1:2 active labor, 1:4 antepartum · postpartum 1:4 couplets (no more than 8 total), 1:6 mothers only · LDRP 1:3 · pediatrics 1:4 · PACU 1:2 · ED 1:4, with at least 2 licensed nurses present, the triage RN and base-radio RN **not counted**, ED critical care 1:2, critical trauma 1:1 RN-only · step-down 1:3 · telemetry 1:4 · med-surg 1:5 · specialty care 1:4 · psychiatric 1:6 |
| CA, acute psychiatric hospital | **22 CCR §71215.1(h)–(l), emergency rule operative June 1, 2026**: adults 1:6, under 18 1:5, and LVNs plus psych techs **no more than 50%** of licensed staff. **Volatility high**: the Certificate of Compliance is due November 30, 2026. Ledger review that day |
| NY | 10 NYCRR 405.22: at least **1 RN per 2** ICU/CCU patients. NY sets no other unit ratios; the tile says so |

New Jersey and Texas are not offered. Research did not confirm from a primary source that
either state has no hospital ratio law, so the tile says nothing about them (spec-v1388 §1).
The CA well-baby nursery ratio of 1:8, common in union summaries, **is not in §70217**, so it is
not encoded.

## `nursing-home-staffing-check` — Nursing Home Minimum Staffing Check (NY, NJ, CA)

Inputs: state, census, shift, and hours or head count by role. Output: meets / short, per measure.

| State | Rule |
|---|---|
| NY | PHL 2895-b: **3.5** hours of care per resident-day, of which **2.2** are CNA and **1.1** licensed nurse |
| NJ | N.J.S.A. 30:13-18 (P.L.2020 c.112): CNA to resident **1:8 day**, **1:10 evening** (at least half of direct-care staff CNAs), **1:14 night** |
| CA | HSC §1276.65: **3.5** direct-care hours and **2.4** CNA hours per patient day. Distinct-part SNFs are exempt |

## `staffing-committee-check` — Hospital Nurse Staffing Committee Requirements (NY, TX)

Inputs: state, members by role and whether each is direct-care (for TX, the share of time at the
bedside), and meeting dates. Output: the composition test and the cadence test.
NY PHL 2805-t: **at least half** frontline RNs, LPNs, and ancillary staff; the staffing plan is due
**July 1** each year. TX HSC 257.004: **at least 60%** RNs who spend at least **50%** of their time
at the bedside, chosen by their peers; the committee meets **quarterly**, evaluates the plan
**semiannually**, and reports to the governing body.

## `tx-safe-harbor-decision-aid` — Texas Nurse Safe Harbor: How to Invoke It (Occ. Code 303.005, 22 TAC 217.20)

Inputs: whether the assignment has been given, whether the nurse has already begun it, and whether
a written request can be made now. Output: how to invoke it (written, or orally with the **seven
elements** the supervisor records, signed by both), the protections, when protection does not apply,
and the deadlines: the comprehensive form **by the end of the shift**, the peer review committee
decides **within 14 days**, and the administrator notifies the nurse **within 48 h**. Research read
22 TAC 217.20 on Cornell LII (last amended 2019). **Confirm against the Secretary of State's
current text before the build.**

## `mandatory-overtime-check` — Can a Nurse Be Required to Work Overtime? (NY, NJ, TX)

Inputs: state, the situation (declared disaster in this or an adjacent county, an unforeseen
emergency, a procedure already under way, chronic short staffing), and the employer's documented
efforts to find volunteers. Output: permitted / not permitted, with the section.
NY Labor Law 167 (voluntary coverage attempted first). NJ N.J.S.A. 34:11-56a31 with N.J.A.C. 8:43E-8
(an unforeseeable emergent circumstance, last resort, **never for chronic short staffing**, four
listed reasonable efforts, and up to **1 h** to arrange dependent care). TX HSC 258.003–258.004
(on-call time cannot be used to substitute). **The trap it prevents:** "we're short again" is
never an emergency under any of the three.

## `ca-wpv-report-clock` — California Hospital Workplace Violence Report Deadline (8 CCR §3342)

Inputs: incident type (injury requiring more than first aid, a firearm or dangerous weapon, an urgent
or emergent threat) and incident time. Output: report to Cal/OSHA within **24 h** or **72 h**
(§3342(g)(2)–(3)), and the incident's Type 1–4 classification by the regulation's definitions.

## `tx-workplace-violence-plan-audit` — Texas Workplace Violence Prevention Plan Audit (HSC 331.002–331.004)

A checklist against SB 240 (2023): committee membership (direct-care RN, physician, security), the
**eight** required plan elements, annual training, and reassignment of staff away from a patient who
assaulted them. Output: complete, or the missing elements by name.

## Acceptance

- Ratio: a CA ED test with 12 patients and 3 nurses, one of them the triage RN. The result is
  **"1 short"**, because triage is not counted. A CA med-surg test at 1:5 exactly meets.
- A test that NJ and TX are **not offered** by `nurse-staffing-ratio-check`.
- Overtime: "chronic short staffing" returns **not permitted** in all three states.

## Built, first three tiles (2026-09-19)

| tile | source read |
|---|---|
| `ca-wpv-report-clock` | dir.ca.gov, 8 CCR 3342(b) and (g) |
| `mandatory-overtime-check` | nysenate.gov, Labor Law 167; N.J.S.A. 34:11-56a33 (FindLaw, current as of January 1, 2024); official mirror, HSC 258 |
| `nurse-staffing-ratio-check` | 22 CCR 70217(a) (Cornell LII copy, Register 2013, No. 11); 10 NYCRR 405.22(5) (Cornell LII) |

- The ratios are the current ones after 70217's phase-ins: step-down 1:3, telemetry
  1:4, and specialty care 1:4 from 2008, and medical/surgical 1:5 from 2005.
- The count of nurses outside the ratio (triage RN, base-radio RN, a charge nurse
  without patients) is **required**, with 0 allowed. A blank would silently count a
  triage nurse and overstate staffing.
- New York's ratio is by acuity: it covers patients the attending says need
  intensive care, not beds, and the tile says so.
- Not built yet: the California acute psychiatric hospital emergency rule
  (71215.1), `nursing-home-staffing-check`, `staffing-committee-check`,
  `tx-safe-harbor-decision-aid`, and `tx-workplace-violence-plan-audit`. Their sources are not read yet.
- 3342(g)(1)(A) covers force by a patient or someone with a patient. Force by a
  coworker, a stranger, or a personal acquaintance is reportable under (g) only if a
  firearm or dangerous weapon is involved. The tile names the incident type either way.
- Overtime: New York's good-faith voluntary effort (Labor Law 167(5)(d)) applies to
  every exception; Texas asks it only for the unforeseen-emergency exception
  (258.004(b)). New Jersey's section, as read, names one exception, so a disaster,
  a declaration, or a procedure qualifies there only as an unforeseeable emergent
  circumstance. The tile says so instead of assuming. The plan's N.J.A.C. 8:43E-8
  details (four listed efforts, one hour for dependent care) were not read.

## Built, second part (2026-09-19)

| tile | source read |
|---|---|
| `staffing-committee-check` | nysenate.gov, PHL 2805-t; official mirror, HSC 257.004 |
| `tx-workplace-violence-plan-audit` | official mirror, HSC 331.002-331.004 |
| `tx-safe-harbor-decision-aid` | official mirror, Occupations Code 303.005 |
| `nursing-home-staffing-check` | nysenate.gov, PHL 2895-b; N.J.S.A. 30:13-18 (FindLaw, current as of January 1, 2024); leginfo, HSC 1276.65 |

- New York's 2805-t sets no meeting frequency, so the tile checks composition, peer or
  bargaining-agreement selection, and the July 1 plan only.
- Safe Harbor: the Board rule 22 TAC 217.20 (the comprehensive form by end of shift,
  14-day committee decision, 48-hour notice) did not load from the Secretary of
  State, so none of those deadlines is printed. The statute's oral-request path
  (seven items, both signatures) is.
- Still not built: California's acute psychiatric hospital emergency rule
  (22 CCR 71215.1), which was not read.

## Built (2026-09-19): California acute psychiatric hospitals

`nurse-staffing-ratio-check` now offers two more California unit types: acute psychiatric
hospital adults (1:6) and patients under 18 (1:5). Source: 22 CCR 71215.1, CDPH emergency
rulemaking DPH-19-001E (text dated May 7, 2026; OAL file 2026-0522-01EFP; effective June 1,
2026), read on cdph.ca.gov.

- **Changed from the plan:** the plan cited "71215.1(h)–(l)". The CDPH draft of December 1, 2025
  (AFL 25-37) put the rule in 71215 and had an RN assessment cap of 24 patients per 12-hour shift
  and 16 per 8-hour shift. The adopted text moved the rule to a new 71215.1, left 71215 for
  Department of State Hospitals facilities only, and dropped the 24/16 cap. The tool follows the
  adopted text and prints no assessment cap.
- "Licensed nurse" includes RNs, LVNs, and psychiatric technicians (b). LVNs and psych techs
  together may be no more than half (i). The tool takes no LVN count, so it states that limit
  instead of checking it.
- An emergency rule lasts no more than 180 days unless readopted. The citation ledger's next
  review is November 28, 2026, and the tool tells the reader to check that the rule is still in
  force.
