# spec-v1366 — Indiana Medicaid specialty workflows, and a setting rule I had missed

Indiana states most of its prior-authorization requirements as an enumerated
list drawn from 405 IAC 5-3-13(a), so four of these rules stop guessing and cite
the regulation. It also corrects one rule shipped in the previous slice.

## A correction to spec-v1365

`R-PA-MCIN-009` was left packet-declared, on the finding that Indiana publishes
no site-of-care steering rule. That was right about steering and wrong about the
rule: Indiana's list includes **"Procedures ordinarily rendered on an outpatient
basis, when rendered on an inpatient basis."** The obligation attaches to moving
an outpatient-typical procedure into an inpatient setting, not to requesting a
hospital outpatient department. The check now asks whether authorization was
sought for that move, and a hospital outpatient department is still not suspect
by itself.

## Rules 011–015

- `R-PA-MCIN-011` follows "Brand medically necessary drugs" on the
  prior-authorization list and asks why the generic is not appropriate. Indiana
  publishes no step-therapy program of its own.
- `R-PA-MCIN-012` names the one genetic indication Indiana lists: genetic
  testing for detection of cancer of the breasts or ovaries. No delegated
  laboratory program, no unique-test-identifier requirement, no bare 81xxx
  trigger.
- `R-PA-MCIN-013` asks for the supporting diagnosis only when the packet names a
  drug authorization workflow; this module covers nonpharmacy services and
  points pharmacy elsewhere.
- `R-PA-MCIN-014` replaces an invented eligibility claim with Indiana's closed
  list. Retroactive prior authorization is granted only for pending or
  retroactive eligibility, an out-of-state provider not yet enrolled, a
  mechanical or administrative delay by the contractor or county DFR office,
  certain out-of-state or air transportation, or a provider unaware the member
  was eligible — each with its own filing window.
- `R-PA-MCIN-015` follows home health onto the authorization list and honors the
  405 IAC 5-3-12 carve-out: up to 120 hours of continued services within 30 days
  of discharge, on a written discharge order, need no prior authorization. **The
  carve-out expressly does not reach durable medical equipment**, and a test
  asserts that a DME packet relying on it is still flagged.

Twelve focused tests cover the setting rule in both directions, the
post-discharge exemption and its DME exclusion, the retroactive circumstances,
false-positive regressions, and complete packets.

The source ledger contains 91 registered authorities: 42 fresh and 49 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 292 registered URLs, none behind a sign-in wall. Of 876 PA
rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,223 PA-engine tests, 14,542 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
