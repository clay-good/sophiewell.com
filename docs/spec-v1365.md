# spec-v1365 — correct Indiana Medicaid clinical-review checks

Indiana Medicaid rules 006–010 carried the template. The IHCP Prior
Authorization provider reference module is public and precise, and it replaces
the inpatient rule with something the template could not have guessed while
confirming that three of the other four programs do not exist here at all.

- `R-PA-MCIN-006` follows Indiana's actual sequence. Emergency services need no
  prior authorization, but *"any resulting inpatient stay does require PA, with
  the exception of inpatient stays for burn care with an admission of type 1
  (emergency) or type 5 (trauma)"* — and every other emergency admission must be
  reported to the PA contractor within 48 hours, excluding weekends and legal
  holidays. The check accepts either the authorization or that report, and
  exempts the burn-care case, which has its own test.
- `R-PA-MCIN-007` runs only when the packet identifies an imaging authorization
  workflow. The module describes no delegated advanced-imaging program.
- `R-PA-MCIN-008` is informational and source-free. The module publishes no
  expedited standard or timeframe.
- `R-PA-MCIN-009` runs only when the packet establishes a site-of-care
  requirement. The module publishes none.
- `R-PA-MCIN-010` checks an NDC the packet already carries. On the IHCP request
  the NDC is simply one of the acceptable service-code types, alongside CPT,
  HCPCS and revenue codes — not an extra demanded of every J-code.

Seven focused tests cover the payer wiring, the burn-care exception, the
48-hour report, false-positive regressions, and complete packets.

The source ledger contains 91 registered authorities: 42 fresh and 49 warning
by age, with no failures, source orphans, or coverage gaps. Registering the IHCP
Prior Authorization module beside the agency landing page moved that source to
fresh. Its citations resolve across 292 registered URLs, none behind a sign-in
wall. Of 876 PA rules, 823 are source-anchored. The 1,722-tile catalog is
unchanged.

Verification covers 1,212 PA-engine tests, 14,531 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
