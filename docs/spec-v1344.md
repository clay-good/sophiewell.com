# spec-v1344 — correct BCBSSC exception-workflow checks

Blue Cross Blue Shield of South Carolina rules 016–020 previously applied
behavioral-health, transplant, investigational-service, appeal, and network
exception requirements too broadly. This slice aligns them with current
provider guidance and the published product boundary for transplant routing.

- Generic mental-health context no longer triggers a level-of-care rule or
  implies that BCBSSC requires a specific instrument. An identified intensive
  setting receives an informational request for clinical support.
- The Blue Distinction transplant-center check is limited to the Health
  Insurance Exchange benefit plan or an explicit packet requirement. A generic
  transplant request no longer inherits that product-specific rule.
- Off-label, compassionate-use, and clinical-trial context no longer imply an
  investigational classification. An explicit BCBSSC classification is checked
  only for its Medical Policy or exception basis.
- Generic appeals and grievances no longer trigger a prior-authorization
  reconsideration check. An explicit authorization appeal is checked for the
  original determination it addresses.
- Out-of-network care no longer implies a network-gap request. An explicit gap
  or continuity exception is checked for its request-specific rationale.

Fifteen focused tests cover false-positive regressions, incomplete explicit
workflows, and complete packets across the five rules. Generated PA reports,
the bundled source ledger, and the SBOM are refreshed during release
verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 283 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 1,005 PA-engine tests, 14,320 repository unit tests, and
459 MCP tests. The localhost-only D1 test passes when run outside the
filesystem sandbox, making the effective unit result 14,320 of 14,320 passing.
Lint, accessibility, data integrity, and the 1,722-page production build also
pass.
