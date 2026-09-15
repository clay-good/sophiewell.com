# spec-v1341 — correct BCBSSC core authorization checks

Blue Cross Blue Shield of South Carolina rules 001–005 previously treated
general provider guidance as universal packet requirements and described an
outdated submission model. This slice aligns them with BCBSSC's current prior-
authorization and Medical Policy pages.

- A coded request without a policy citation now receives an informational
  mapping aid instead of a blocking flag. BCBSSC says determinations can use
  Medical Policies, recognized guidelines, BlueCard requirements, and member-
  plan terms, while a published policy does not guarantee coverage.
- Missing clinical material is informational because BCBSSC says only some
  requests need additional documentation and does not publish one document
  schema for every service.
- The packet no longer has to name its transport channel. Current medical and
  most behavioral-health requests enter through My Insurance Manager and route
  to Cohere Health, while several services and products use other workflows.
- Authorization-list review remains non-enforcing because the public standard
  list is not all-inclusive, can change, and must be paired with member-benefit
  verification.
- An initial authorization request no longer fails for lacking the decision it
  is seeking. A case or confirmation reference is requested only when the
  packet says submission is complete.

Nine focused tests cover the corrected severities, non-enforcing routing and
requirement checks, initial versus submitted requests, and complete packets.
Generated PA reports, the source ledger bundle, and the SBOM are refreshed
during release verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 280 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 966 PA-engine tests, 14,281 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,281 of 14,281 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
