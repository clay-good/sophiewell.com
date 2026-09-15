# spec-v1328 — correct Horizon BCBSNJ complex-case checks

Horizon Blue Cross Blue Shield of New Jersey rules 016–020 previously activated
narrow administrative requirements from broad clinical words. The final Horizon
slice now distinguishes explicit workflows from ordinary clinical context.

- Generic mental-health care no longer triggers a level-of-care requirement.
  An explicit inpatient or facility-based behavioral-health request receives an
  informational prompt only when either its treatment plan or requested-level
  rationale is absent.
- A transplant request no longer implies universal Blue Distinction routing.
  The informational facility check runs only when the packet also declares a
  designated-center, transplant-network, or center-of-excellence requirement.
- Off-label use, compassionate use, and clinical-trial participation no longer
  automatically classify a service as investigational. When the packet
  explicitly says a service is experimental or investigational, the check asks
  for the applicable Horizon Medical Policy or benefit / trial-coverage basis.
- A generic claim appeal or grievance no longer triggers the prior-authorization
  reconsideration check. Only an explicit authorization appeal is checked for
  the original determination, case number, or denial date.
- An out-of-network authorization no longer implies a network-gap request. The
  reason check applies only to an explicit network exception, continuity-of-care
  request, or transition-of-care request.

Fifteen focused tests cover the five complex-case rules, including false-positive
regressions and the explicit contexts that should still produce informational
guidance. Generated PA reports and the SBOM are refreshed as part of release
verification.

The source ledger contains 91 registered authorities: 35 fresh and 56 warning by
age, with no failures, source orphans, or coverage gaps. Its citations resolve
across 240 registered URLs. Of 876 PA rules, 823 are source-anchored. The
1,722-tile catalog is unchanged.

Verification covers 814 PA-engine tests, 14,129 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,129 of 14,129 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
