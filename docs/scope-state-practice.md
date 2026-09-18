# Scope — state practice: New York, New Jersey, California, Texas

**Status:** Proposed, September 18, 2026. Docs only; nothing is built.
**Specs:** spec-v1388 (shared machinery) through spec-v1401 (backfills).
**Catalog effect if fully built:** +64 new tiles (one of them, `tx-maternal-level-reference`, is blocked on an unread rule) and state data added to 9 existing tiles.

## What this does for a clinician

A nurse in the Bronx, Newark, East LA, or Houston works under clinical guidelines that are
national and **state laws that are not**. The laws decide how long a psychiatric hold lasts, who
signs for a patient without capacity, when the prescription drug monitoring program must be
checked, how many patients one nurse may take, and how fast a case must be reported. The
catalog answers the clinical question and is silent on the legal one. **No tile names a state
law today.** Group M, "State & Coverage Reference", has been empty since spec-v5.

These four states hold about 29% of the US population (roughly 99 million people) and carry a disproportionate share of
urban public-health burden: TB (CA, TX, and NY lead the nation in cases), congenital syphilis
(TX and CA), HIV (NYC, Houston, Dallas, LA), heat and wildfire smoke (TX and inland CA), and
arrival screening for migrants (NYC and the Texas border). Two of the waves below are national
clinical tools weighted to that burden.

## Why spec-v5 does not forbid this, and the rule that replaces its objection

spec-v5 §6 put "any state-by-state Medicaid/SEP/patient-rights matrix" and "any tool whose
correctness materially decays in under 12 months" permanently out of scope. That was right about
**matrices** (fifty rows of eligibility figures that each go stale every year) and **annual
figures**. It does not reach a statute that has been stable for a decade and whose sections are
named. The prior-auth program has since shown that state rules can be maintained: 14 state Medicaid
overlays, each sourced to its manual, with a staleness ledger (spec-v52, spec-v1362–v1387).

**Admission rule (every tile in this program must pass all five):**

1. **A named primary source.** A statute or regulation section, or a state agency publication
   with an edition date. Secondary summaries (union pages, law-firm blogs, search snippets) never
   supply a number.
2. **At least 12 months of expected stability.** Anything reissued yearly (FPL charts, school
   vaccine charts, county outbreak lists, EMS protocol books) is rejected. See the table at the end.
3. **A question, not a matrix.** A tile answers one question ("when must this hold be reviewed?")
   for up to four states. It never lists all fifty.
4. **The edition is printed.** Every answer names the section and the date it was verified:
   *"WIC §5150, verified September 2026."*
5. **A ledger row with a legislative review date.** See spec-v1388 §3. Texas legislates in odd
   years (next regular session January 2027). New York, New Jersey, and California legislate every
   year, and most California laws take effect January 1.

## Two tile shapes

| Shape | When | Example |
|---|---|---|
| **One tile, required state picker** | The question is identical across states and only the numbers or sections differ | `pmp-check-required` (NY I-STOP, NJ PMP, CA CURES, TX PMP) |
| **One tile per state** | The legal structure differs, not just the numbers | `ca-5150-hold-timeline` and `tx-emergency-detention-clock` share no stages |

Picker tiles put all four states in the name ("… (NY, NJ, CA, TX)") so each state's search reaches
it. A state with no such law is a real answer ("New Jersey has no statutory hospital nurse ratio"),
and is printed only where a primary source confirms it.

## The queue

| Spec | Wave | New tiles |
|---|---|---|
| v1388 | Shared machinery: state picker, legal-holiday calendar, state-law ledger, copy rules | 0 |
| v1389 | Involuntary psychiatric holds: the clocks | 7 |
| v1390 | Hold criteria and court-ordered outpatient treatment | 4 |
| v1391 | Who decides: surrogates, proxies, MOLST, DNR | 7 |
| v1392 | End of life: aid in dying, ethics-committee review, death declaration | 6 |
| v1393 | Controlled substances: monitoring program checks, day limits, delegation | 3 |
| v1394 | Prenatal and newborn: syphilis/HIV/HBV schedule, newborn screen, levels of care | 5 |
| v1395 | Reporting and consent: reportable conditions, mandated reports, minors, forensic exams | 6 |
| v1396 | Nurse staffing and the workplace | 7 |
| v1397 | Licensure and practice authority | 3 |
| v1398 | Heat, smoke, air, and Valley fever | 5 |
| v1399 | ED throughput and discharge | 2 |
| v1400 | City-burden infectious disease I: serology and TB | 6 |
| v1401 | City-burden infectious disease II and state backfills to 9 existing tiles | 3 |
| | **Total** | **64** |

Build order recommendation: v1388 first (everything depends on it), then v1389, v1393, v1395, and
v1400. Those are the questions a floor nurse or ED clinician asks most often. v1397 contains the
only hard external deadline: New York's updated child-abuse training is due **November 17, 2026**.

## Existing tiles: data backfill, not new tiles

Nine existing tiles answer correctly for the nation and incompletely for one of these states.
spec-v1401 adds a state line to each; none of them becomes a new tile.

`blood-lead` · `restraint-timer` · `hiv-pep-occupational` · `sepsis-bundle-clock` · `rabies-pep` ·
`sti-screening` · `opioid-mme` · `heat-index` · `qbl-pph` (a note on what it deliberately does not use)

The prior-auth overlays for all four states' Medicaid programs (`medicaid-ny`, `medicaid-nj`,
`medicaid-ca`, `medicaid-tx`) were corrected against their provider manuals in spec-v1379 through
spec-v1386 (Medi-Cal v1379–v1380, Texas v1381–v1382, New Jersey v1385, New York v1386). They need no further work from this program.

## Researched and rejected

| Candidate | Why not |
|---|---|
| Medicaid / CHIP / Essential Plan / NJ FamilyCare / Medi-Cal income screeners | Reset every year; NY's Essential Plan limit changed mid-year (July 1, 2026). spec-v5 §6 applies. |
| TX and CA school-entry immunization checkers | New chart every school year; same reasoning spec-v5 applied to ACIP schedules. |
| TX measles outbreak early-MMR guide | Outbreak counties change weekly. |
| LA County EMS base-contact rules (Ref. 1200.2) | Revised every July. |
| CMQCC hemorrhage, preeclampsia, sepsis staging | Terms of use allow internal organizational use only and bar derivative works. |
| Texas abortion exceptions (HSC 170A, SB 31) | A yes/no answer would read as legal advice on the highest-stakes question in the set. |
| Texas "majority of adult children" surrogate rule | Not in HSC 313.004 or 166.039 as read. Do not build from memory. |
| New Jersey default-surrogate finder | New Jersey has no general default-surrogate statute (N.J.S.A. 26:14-5 covers research only). |
| NY Nurse Practitioner Modernization Act status | The July 1, 2026 sunset's renewal is unconfirmed; the SED page returns 404. |
| NJ 72-hour hospital hold extension (N.J.S.A. 30:4-27.9a) | Scheduled to sunset August 31, 2025; extension unconfirmed. Excluded from v1389's NJ clock. |
| CA well-baby nursery 1:8 | Cited by union summaries; absent from 22 CCR §70217 as read. |
| CA pharmacist PrEP/PEP furnishing (B&P §4052.02/.03) | Statute text did not load; only secondary summaries. |
| TX trauma service area lookup | The county list lives on a DSHS page not yet fetched. |
| NYC cooling-tower Legionella sampling | A facilities-compliance tool, not a clinical one. |

Each rejection is a research result, not an opinion. It can be reopened by supplying the missing
primary source.
