# spec-v1369 — correct Arizona AHCCCS specialty-workflow checks

Arizona rules 011–015 inferred step therapy, lab review, drug-diagnosis,
retrospective eligibility, and signed-order requirements from broad codes. AHCCCS
Chapter 800 turns two of them into the most specific checks in the program — and
confirms, for one service, that the template's order requirement was right.

- `R-PA-MCAZ-011` runs only when the packet establishes step therapy applies;
  AHCCCS routes medication PA to its fee-for-service Pharmacy Benefits Manager.
- `R-PA-MCAZ-012` follows a published minimum-documentation list. Genetic
  testing, rapid whole genome sequencing, and biomarker testing all require PA,
  and a request must include how the test meets the coverage criteria, a
  recommendation from a licensed genetic counselor or the ordering provider, and
  clinical findings including family history and previous results. The check
  names each missing item individually, and a test asserts it does not report
  one that is present.
- `R-PA-MCAZ-013` asks for the supporting diagnosis only when the packet names a
  drug authorization workflow.
- `R-PA-MCAZ-014` follows the retroactive-eligibility rule: a member who becomes
  eligible while still hospitalized needs notice to DFSM within 72 hours of the
  eligibility posting date, and the requirement is **waived** when eligibility
  posts after discharge. The waiver has its own test.
- `R-PA-MCAZ-015` **keeps an order requirement, because here it is real.**
  Home health nursing and aide services need PA except for the first five visits
  after an acute discharge, and an initial request must carry a prescription
  stating the specific nursing duties and duration of need plus face-to-face
  encounter documentation under AMPM 310-I. Both exemptions — the first five
  visits, and rehabilitative therapy by a home health agency — are honored.

Ten focused tests cover each named exemption, the itemized genetic-testing
list, false-positive regressions, and complete packets.

The source ledger contains 91 registered authorities: 43 fresh and 48 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 294 registered URLs, none behind a sign-in wall. Of 876 PA
rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,251 PA-engine tests, 14,570 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
