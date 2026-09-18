# spec-v1368 — correct Arizona AHCCCS clinical-review checks

Arizona rules 006–010 carried the template. AHCCCS publishes its requirements as
Medical Policy Manual Chapter 800, cited to the Arizona Administrative Code, and
reading it corrects the template **in both directions** within one payer: two of
its assumptions turn out to be right here, and three turn out to be absent.

## Two template assumptions that are right for Arizona

- `R-PA-MCAZ-006` — **admission notification is real packet content here, the
  only payer in the program where it is.** Under AAC R9-22-204 the provider
  notifies AHCCCS DFSM within 72 hours of an emergent inpatient admission, and
  AHCCCS may deny payment for untimely notice *or missing documentation*. The
  notification must specify the admission status and carry the hospital face
  sheet, history and physical documentation, and an inpatient admission order
  signed by an MD or DO. The check now asks for those three documents and names
  each one that is missing, rather than looking for a discharge plan.
- `R-PA-MCAZ-008` — **the "regain maximum function" standard is correct here,
  by rule.** An expedited request under AAC R9-34-306(B) applies when the
  standard timeframe could seriously jeopardize the member's life, health, or
  ability to attain, maintain, or regain maximum function. The check keeps its
  teeth and gains the citation, the 72-hour expedited and 14-day standard
  timeframes, and the published consequence: a request that misses the standard
  is processed under the standard timeframe, not denied.

## Three that do not exist in Chapter 800

- `R-PA-MCAZ-007` runs only when the packet identifies an imaging workflow.
- `R-PA-MCAZ-009` runs only when the packet establishes a site-of-care
  requirement.
- `R-PA-MCAZ-010` checks an NDC the packet already carries.

Eight focused tests cover the payer wiring, each missing admission document by
name, the AAC R9-34-306(B) standard, false-positive regressions, and complete
packets. AHCCCS Policies 810 and 820 are registered in the source ledger.

The source ledger contains 91 registered authorities: 43 fresh and 48 warning
by age, with no failures, source orphans, or coverage gaps. Registering AHCCCS
Policies 810 and 820 moved that source to fresh. Its citations resolve across
294 registered URLs, none behind a sign-in wall. Of 876 PA rules, 823 are
source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,241 PA-engine tests, 14,560 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
