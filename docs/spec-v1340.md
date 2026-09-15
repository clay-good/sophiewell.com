# spec-v1340 — correct BCBSAL review and exception checks

Blue Cross Blue Shield of Alabama rules 016–020 previously turned broad
behavioral-health, transplant, experimental, appeal, and out-of-network wording
into requirements that BCBSAL's current public provider materials do not state
universally. This slice limits each advisory to the workflow the packet actually
identifies.

- Generic mental-health context no longer implies an intensive level-of-care
  review. Identified inpatient, residential, partial-hospitalization, intensive-
  outpatient, and detoxification requests receive an informational check for
  request-specific clinical support without inventing an MCG or ASAM mandate.
- A transplant request no longer implies Blue Distinction or center-of-
  excellence routing. The selected-center check runs only when the packet says
  a designated transplant center is required.
- Off-label use and clinical-trial participation no longer imply that BCBSAL
  classified a service as experimental or investigational. An explicit payer
  classification is checked for its Medical Policy or determination basis.
- Generic claim appeals and grievances no longer trigger a prior-authorization
  appeal check. Explicit preservice and concurrent authorization appeals are
  checked for the original determination or case reference.
- Ordinary out-of-network care no longer implies a network-exception workflow.
  An explicit exception request is checked for its request-specific reason.

Fifteen focused tests cover false-positive regressions, incomplete explicit
workflows, and complete packets across the five rules. Generated PA reports,
the source ledger bundle, and the SBOM are refreshed during release
verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 278 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 961 PA-engine tests, 14,276 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,276 of 14,276 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
