# spec-v1394 — prenatal and newborn: infection screening schedule, newborn screen, levels of care

Program: [scope-state-practice.md](scope-state-practice.md). Depends on spec-v1388. Groups: N for
the clinical tiles, M for `tx-neonatal-level-match`. Specialties: `nursing-ob`, `obstetrics`,
`nursing-nursery`, `nursing-nicu`, `neonatology`, `health-law`.

Congenital syphilis is the fastest-growing preventable newborn infection in the country, and
Texas and California carry much of it. All four states now require **more** prenatal syphilis
testing than the national default. The existing `sti-screening` tile answers with CDC's
intervals and cannot tell a Houston L&D nurse that a patient with no third-trimester result
needs an expedited HIV test and a syphilis test **before delivery**.

## `prenatal-infection-screening-schedule` — Prenatal Syphilis, HIV and Hepatitis B Testing Schedule (NY, NJ, CA, TX)

Inputs: state, gestational age (or EDD/LMP), which tests were done and when, and the setting
(prenatal visit, L&D admission, ED/urgent care). Output: the tests due now, tests overdue, and the
next due window.

| State | Required (verified September 2026) |
|---|---|
| NY | PHL 2308 and DOH FAQ: syphilis at diagnosis of pregnancy, **at 28 weeks (no later than 32)** (effective May 3, 2024), and at delivery |
| NJ | N.J.S.A. 26:4-49.1: syphilis at the first examination and at delivery; birth centers also test in the last trimester. N.J.A.C. 8:61-4.2: HIV early and again in the **third trimester**, opt-out |
| CA | HSC §120685 and the CDPH SB 306 fact sheet: syphilis **three times for all patients** (first visit, about 28 weeks, delivery). An ED or hospital urgent care screens **before discharge** if there is no result for this pregnancy |
| TX | HSC 81.090: syphilis, HIV, and hepatitis B at the first visit; syphilis and HIV **at 28 weeks or later**; syphilis and hepatitis B at delivery admission. With no third-trimester result: **expedited HIV** with a result within 6 h, or a newborn sample **within 2 h of birth** |

The California ED rule is the one a non-obstetric clinician misses: a pregnant patient in any ED
visit is due a syphilis test if the pregnancy has none on record. CDPH also states that treatment
must **begin at least 30 days before delivery** to count as adequate. The tile prints that date from
the EDD and links to `congenital-syphilis-scenario` (spec-v1400).

## `nys-newborn-screen-planner` — New York Newborn Screen Specimen Planner (Wadsworth Center)

Inputs: birth time, birth weight, NICU admission, collection times so far, transfusion times,
TPN start, and any readmission within 28 days. Output: each required specimen with its window.

- Routine: collect **after 24 h**. Discharged before 24 h: a second specimen at **24–120 h**.
- NICU: the first on admission. A second at **48–72 h** if the first was drawn before 24 h or the
  birth weight is **under 2,000 g**. A third at **28 days or discharge** if under 2,000 g.
- Transfused with no prior screen: collect **3 or more days** after the transfusion, **and** again
  **4 months** after the last transfusion. On TPN: collect 3 or more days after it starts.
- Readmitted within 28 days with no screen on record: screen.

This is New York's own protocol. It is not the national one, and it decides whether a NICU
nurse has drawn the right number of specimens.

## `tx-neonatal-level-match` — Texas Neonatal Level of Care Matcher (25 TAC 133.186–133.189)

Inputs: gestational age, birth weight, expected ventilation (none, CPAP, under 24 h, longer), need for
surgery or subspecialty, and distance to a Level III/IV unit. Output: the lowest appropriate
designated level. Level I is ≥35 weeks. Level II is ≥32 weeks and ≥1,500 g, with mechanical
ventilation under 24 h or CPAP, and an exception when the unit is more than **75 miles** from a
Level III/IV. Level III and Level IV cover everything above that. Rule amended effective June 22, 2023.
Research read the rule on Cornell LII. **Confirm against the Secretary of State's current text
before the build.**

## `tx-maternal-level-reference` — Texas Maternal Level of Care Reference (25 TAC 133.205–133.209)

**Partly blocked.** Only Level I (133.206) was read: a physician or CNM, with backup and anesthesia
at the bedside **within 30 minutes**. Levels II–IV (133.207–133.209) must be read before the tile is
built. It is included here so the sibling of `tx-neonatal-level-match` is not forgotten. If
Levels II–IV are not sourced, it ships in a later wave.

## `ca-safe-surrender` — California Safely Surrendered Baby Checklist (HSC §1255.7)

Inputs: the infant's age in hours, whether a coded bracelet was applied, and the time of
surrender. Output: eligible if **72 hours old or younger**, CPS notification due **within 48
hours**, and the **14-day** reclaim window with its end date. A triage nurse sees this once a
career and has to get it right that one time. NY, NJ, and TX safe-haven laws were not researched,
so this tile is California only.

## Acceptance

- The prenatal tile's TX example at 36 weeks with no third-trimester HIV result prints the
  expedited HIV test (6-hour result) **and** the 2-hour newborn sample alternative.
- The CA example is an ED visit at 20 weeks with no syphilis result this pregnancy, and it says
  "due before discharge".
- The newborn-screen planner covers a 1,450 g NICU infant transfused on day 2. The output lists
  specimens 1–3 plus the 4-month post-transfusion specimen.
- `tx-maternal-level-reference` is not built until 133.207–133.209 are read.

## Built (2026-09-18)

| tile | group | source read |
|---|---|---|
| `prenatal-infection-screening-schedule` | N | TX HSC 81.090 (official mirror); CA HSC 120685, 125085, 125090 (leginfo) and the CDPH SB 306 fact sheet; NY PHL 2308 (nysenate.gov); N.J.S.A. 26:4-49.1 (FindLaw) |
| `nys-newborn-screen-planner` | N | Wadsworth Center specimen collection page and guide (March 2026) |
| `tx-neonatal-level-match` | M | 25 TAC 133.186-133.189 (Cornell LII, amended June 22, 2023) |
| `tx-maternal-level-reference` | M | 25 TAC 133.206-133.209 (Cornell LII, amended January 8, 2023) |
| `ca-safe-surrender` | M | leginfo, HSC 1255.7 |

- **New York:** PHL 2308 sets syphilis at the first examination and in the third
  trimester "consistent with" the Commissioner's guidance. The Department's page
  (the 28-to-32-week window, any delivery test) returned 403 twice, so the tile names
  the guidance and prints no week. New York's prenatal HIV and hepatitis B rules, and
  New Jersey's HIV rule (N.J.A.C. 8:61), were not read and are named as not covered.
- **New Jersey:** the statute read covers syphilis at the first examination and at
  delivery. The plan's birth-center third-trimester test was not in that text.
- **California "treatment at least 30 days before delivery"** was not in the CDPH
  document read, so it is not printed. The congenital syphilis tool is linked.
- **Newborn screen:** the source's TPN rule counts from the *last* TPN dose, not the
  start. The transfusion pair (3+ days after the most recent, 4 months after the final)
  applies only with **no prior screen**. The acceptance case is therefore an infant
  transfused before the admission specimen. One drawn first removes the pair, and a
  test covers that.
- **Levels of care:** the Secretary of State's register had moved and did not load. The
  Cornell LII copies carry the June 22, 2023 (neonatal) and January 8, 2023 (maternal)
  amendment dates, and the ledger row says so. Levels II-IV of the maternal rule were
  read, so `tx-maternal-level-reference` ships in this wave.
