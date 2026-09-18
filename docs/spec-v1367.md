# spec-v1367 — finish Indiana Medicaid: exception workflows

This closes the Indiana Medicaid overlay, the eighth payer in the program. Four
of the five rules cite the enumerated list in 405 IAC 5-3-13(a) or Indiana's own
published procedure, and one rule changes severity.

- `R-PA-MCIN-016` follows the behavioral-health entries on the authorization
  list: psychiatric inpatient admissions including admissions for substance
  abuse, rehabilitation inpatient admissions, partial hospitalization under
  405 IAC 5-20-8, Medicaid Rehabilitation Option services, and
  neuropsychological and psychological testing. Generic mental-health context no
  longer triggers it.
- `R-PA-MCIN-017` drops the Blue Distinction routing requirement for what
  Indiana actually lists — "Bone marrow or stem-cell transplants" and "All organ
  transplants covered by the Medicaid program" — and asks for the authorization
  itself. The module names no centers-of-excellence network, so the absence of
  one is not a defect.
- `R-PA-MCIN-018` is informational and source-free. The module publishes no
  experimental or investigational classification rule, so the check runs only on
  a packet that declares one.
- `R-PA-MCIN-019` asks for the two things Indiana says an administrative review
  must carry: the authorization reference — the original request form, or a
  summary letter with the authorization number and member identifiers — and the
  pertinent reasons the services are medically necessary. An administrative
  hearing then follows within 33 calendar days of that decision.
- `R-PA-MCIN-020` **is raised from informational to a flag.** Indiana states the
  rule as mandatory: "All services provided by out-of-state providers require PA,
  except in the circumstances presented in the Out-of-State Providers module."
  The 120-hour post-discharge exemption expressly does not reach out-of-state
  services. Out-of-network wording alone still triggers nothing.

Nine focused tests cover the raised severity in both directions,
false-positive regressions, incomplete explicit workflows, and complete packets.

The source ledger contains 91 registered authorities: 42 fresh and 49 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 292 registered URLs, none behind a sign-in wall. Of 876 PA
rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,233 PA-engine tests, 14,552 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
