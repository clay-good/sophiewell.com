# spec-v1370 — finish Arizona AHCCCS: exception workflows

This closes the Arizona AHCCCS overlay, the ninth payer in the program. Two of
its rules follow requirements no other payer in the program has published.

- `R-PA-MCAZ-016` asks for what AHCCCS actually requires of a behavioral-health
  PA request: documented evidence of **care coordination** with the member's
  outpatient treatment team — the Health Care Decision Maker, the TRBHA, the
  Tribal ALTCS case manager, and the Special Assistance Advocate, each when
  applicable — on both initial and continued-stay requests, plus the
  psychiatric evaluation or behavioral-health treatment plan for an admission.
  Generic mental-health context no longer triggers it.
- `R-PA-MCAZ-017` drops Blue Distinction for AHCCCS's actual rule: PA for all
  organ and tissue transplants, bone grafts, **and corneal transplants** — which
  some commercial plans exempt and AHCCCS does not. It also knows the published
  eligibility bar: a Federal Emergency Services enrollee is not eligible for
  transplantation under SSA Section 1903(v)(2)(C) and AAC R9-22-206, and the
  check says so rather than asking for paperwork that cannot help.
- `R-PA-MCAZ-018` is informational and source-free; Chapter 800 publishes no
  investigational classification rule.
- `R-PA-MCAZ-019` runs on an explicit reconsideration or appeal and asks which
  determination it contests.
- `R-PA-MCAZ-020` follows the out-of-state boundary AHCCCS actually publishes,
  which runs through transportation: emergency transport to an out-of-state
  facility is covered only when that facility is the nearest appropriate one.
  Out-of-network wording no longer triggers it.

Ten focused tests cover the care-coordination requirement, the corneal and FES
cases, false-positive regressions, and complete packets.

The source ledger contains 91 registered authorities: 43 fresh and 48 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 294 registered URLs, none behind a sign-in wall. Of 876 PA
rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,261 PA-engine tests, 14,580 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
