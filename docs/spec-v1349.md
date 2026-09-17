# spec-v1349 — source Blue KC and correct its clinical-review checks

All twenty Blue KC rules cited `providers.bluekc.com/login`, a sign-in wall
that can support no claim and cannot be re-verified on the maintenance cadence.
Blue KC does publish an open authority: the 2026 Network Provider Reference
Guide. The ledger source now points there, and rules 006–010 are rewritten
against what it says.

- `R-PA-BLUEKC-006` runs on an explicit continued-stay or concurrent review and
  asks for the clinical information collected since the initial stay approval,
  which is what Blue KC says the provider's review nurse supplies. Blue KC
  sends the admission notification letters itself, so that is not packet
  content, and an inpatient setting alone no longer triggers the rule.
- `R-PA-BLUEKC-007` follows the eviCore program as published: outpatient and
  elective MRI, MRA, CT, CTA, PET, spinal fusion, echocardiogram, and nuclear
  cardiology, with imaging performed during an inpatient stay, a 23-hour
  observation, or in the emergency room exempt. An arbitrary 7xxxx code no
  longer implies the program.
- `R-PA-BLUEKC-008` is informational and asks for the urgent condition. Blue KC
  decides within 36 hours and routes genuinely urgent imaging as expedited; it
  publishes no universal urgency test a packet must recite.
- `R-PA-BLUEKC-009` runs only when the packet establishes a site-of-care
  requirement. The guide publishes no rule steering outpatient surgery or
  imaging away from a hospital outpatient department.
- `R-PA-BLUEKC-010` runs only when the packet declares an NDC requirement. The
  guide requires no National Drug Code for physician-administered drugs.

Eleven focused tests cover false-positive regressions, exempt settings,
incomplete explicit workflows, and complete packets across the five rules.

The login URL stays registered as a transitional citation for rules 011–020,
which still reference it and are corrected in the next two slices. Removing it
from the ledger is the last step of that work.

The source ledger contains 91 registered authorities: 37 fresh and 54 warning
by age, with no failures, source orphans, or coverage gaps. Repointing Blue KC
at its published guide moved that source from warning to fresh. Its citations
resolve across 288 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 1,063 PA-engine tests, 14,378 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
