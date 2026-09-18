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
