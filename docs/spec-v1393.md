# spec-v1393 — controlled substances: monitoring program checks, day limits, delegation

Program: [scope-state-practice.md](scope-state-practice.md). Depends on spec-v1388 (state picker).
Group M. Specialties: `pharmacy`, `emergency-medicine`, `pain-management`, `family-medicine`,
`health-law`. Audiences: clinicians, educators.

`opioid-mme`, `opioid-conversion`, and `opioid-risk-tool` answer the pharmacology. None of them
says whether this prescription requires a query first, or how many days the law allows. Those
two questions come up on every ED and urgent-care opioid prescription, and all four states answer
them differently.

## `pmp-check-required` — Must I Check the Prescription Monitoring Program? (NY, NJ, CA, TX)

Inputs: state (required), drug schedule and class, first prescription or continuing (with the
date of the last check), setting (ED, post-surgical, inpatient, hospice), and days' supply.
Output: **required**, **exempt** (naming the exemption and the note the record needs), or **not
required**; plus, where the state sets one, the date the next check is due.

| State | Rule (verified September 2026) |
|---|---|
| NY (I-STOP) | PHL 3343-a(2): query before prescribing Schedule II–IV. Exempt: veterinarian; administering; **ED prescription ≤5 days**; hospice; access impossible and ≤5 days; registry down; waiver |
| NJ | N.J.A.C. 13:45A-35.9: the first Schedule II or opioid prescription for pain; the first Schedule III/IV benzodiazepine; **every 3 months** while continuing; **every** ED Schedule II prescription for pain. Exempt: hospice; no timely access and ≤5 days; surgery or trauma ≤5 days within 24 h |
| CA (CURES) | HSC §11165.4: consult no earlier than 24 h (or the previous business day) before the first prescription, then **at least every 6 months**. Exempt: ED or post-surgical supply **≤7 days, nonrefillable**; terminal illness; inpatient/facility; system outage |
| TX | HSC 481.0764: check before prescribing an **opioid, benzodiazepine, barbiturate, or carisoprodol**. Exempt: diagnosis of cancer or sickle cell disease, or hospice care, documented in the record (481.0764(b)). 481.0765 covers system unavailability |

**The trap:** a class matters as much as a schedule. Texas requires a check for carisoprodol, a
Schedule IV drug that a schedule-only rule of thumb misses. New Jersey's 3-month re-check is
stricter than California's 6-month one.

## `acute-opioid-rx-limit` — Initial Opioid Prescription Day Limit for Acute Pain (NY, NJ, TX)

Inputs: state, acute pain versus an exempt category (chronic, cancer, hospice, palliative, long-term
care, SUD treatment), days' supply, refills, and for NJ the date of the previous prescription.
Output: within the limit, over it by N days, or exempt (naming the category).

| State | Rule |
|---|---|
| NY | PHL 3331(5): **7 days** for an initial prescription for acute pain |
| NJ | Board of Medical Examiners rule and FAQ: **5 days**, lowest effective dose, immediate release; a subsequent prescription at least **4 days** later, after consultation |
| TX | HSC 481.07636: **10 days**, **no refills**, for acute pain |

**California is not offered.** No general adult day limit was found in statute during research,
and CA's minors' opioid consent and prescribing provisions (HSC §11158.1) were not read. Add CA only
after reading them; until then the tile lists three states, in keeping with spec-v1388 §1.

## `tx-aprn-pa-controlled-delegation` — Texas APRN/PA Controlled-Substance Delegation Check (Occ. Code 157.0511)

Inputs: schedule (II–V), days' supply, refill requested, patient younger than 2, and setting
(hospital-based with a stay of 24 hours or more, ED, hospice). Output: whether the physician may
delegate this prescription under 157.0511(b)/(b-1), and what the chart must note. Schedule II
delegation is **setting-limited** (hospital-facility-based practice and hospice), which is the
question an APRN in a Houston clinic actually has. Volatility medium; scope-of-practice bills
come up every session, so review after the 2027 session.

## Acceptance

- `pmp-check-required` has a worked example for each state and an exemption example for each state.
  One test is carisoprodol in Texas (**required**); the same drug in the NY branch follows its
  schedule rule.
- `acute-opioid-rx-limit` offers only NY, NJ, and TX (spec-v1388 §1) and has a test asserting that.
- Search routes: `i-stop`, `istop`, `cures`, `texas pmp`, `nj pmp`, `pmp check` → `pmp-check-required`
  with the state prefilled where the word names it.

## Built (2026-09-18): `pmp-check-required` and `acute-opioid-rx-limit`

Each rule was read from its source: nysenate.gov (PHL 3343-a, 3331), Cornell LII (N.J.A.C.
13:45A-35.9, 13:35-7.6), leginfo (HSC 11165.4), and texas.public.law (HSC 481.0764, 481.0765,
481.07636). Catalog 1,735 → 1,738, with `tx-aprn-pa-controlled-delegation` (Occupations Code 157.0511, read at
texas.public.law): Schedule II only in a hospital facility-based practice under medical-staff policy
(inpatient 24 hours or more, or the emergency department) or under a hospice plan of care;
Schedules III to V up to 90 days including refills, with chart-noted consultations for a refill or
a child under 2. What the text
changed from the plan:

- **The Texas exemption is 481.0765(a), not 481.0764(b)**, and it applies only when the cancer,
  sickle cell, or hospice status is **clearly noted in the prescription record**; the tile says so.
  481.0765(c) adds the good-faith-attempt exception for access failures.
- **California has more exemptions than listed**: buprenorphine in the emergency department (any
  supply), and procedures in clinics and offices, not only hospitals; and every short-supply
  exemption requires the supply to be **nonrefillable**. The check window is "no earlier than 24
  hours, or the previous business day".
- **New York's statute sets no 24-hour window**; the tile does not add one.
- **Texas limits every acute-pain opioid prescription** to 10 days and no refill, not only the first,
  and exempts opioids approved for treating addiction.
- **New Jersey's initial prescription must be immediate-release**, and a subsequent one is allowed
  no less than four days later, after consultation, up to 30 days. The tile checks both.
- The specialty is `pain-medicine`: `pain-management` was merged into it in spec-v935.

## Update (2026-09-19): California HSC 11158.1

11158.1 was read on leginfo (as amended by SB 607, effective January 1, 2025). It is a counseling
duty before the first opioid prescription in a course (addiction and overdose risk, co-occurring
disorders, and benzodiazepines, alcohol, or other depressants, with the parent or guardian of a minor),
not a day limit, and it does not apply to emergency services or emergency surgery. California stays
out of `acute-opioid-rx-limit`, which checks day limits; the lib comment records why.

## Hardening (2026-09-19): a blank answer is asked, not read as "no"

Three answers treated an unanswered question as "no" and printed a reassuring result:

| tool | blank | was | now |
|---|---|---|---|
| `acute-opioid-rx-limit`, Texas | refills | "Within the limit" | asks whether refills are ordered (Texas allows none) |
| `acute-opioid-rx-limit`, New Jersey initial | extended-release | "Within the limit" | asks, since an initial prescription must be immediate-release |
| `pmp-check-required`, California ED, procedure, or no access | refills | "Exempt" | asks, since the exemption needs a nonrefillable supply |

Each question is asked only when the answer would change the result: over the day limit, or over
seven days in California, the answer stands without it. One test had pinned the old Texas behavior
("10 days, refills blank, within") and now passes "no" explicitly.

`ny-hiv-hcv-test-offer` (spec-v1395) had the same shape: under 13 (HIV) or 18 (hepatitis C), a blank
risk answer printed "No offer required now". It now asks, and two tests that relied on the blank pass
"no" explicitly.
