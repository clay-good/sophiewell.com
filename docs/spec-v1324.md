# spec-v1324 — scope Blue Cross NC complex-case checks

Blue Cross NC rules 016–020 previously turned broad behavioral-health,
transplant, investigational, appeal, and out-of-network language into universal
packet requirements. They now follow the scope supported by current first-party
forms and policies.

- The behavioral-health rule applies only to an explicit inpatient or
  facility-based level-of-care request. It checks for the proposed treatment
  plan and the rationale for that level rather than less-intensive care, as the
  Commercial Inpatient Behavioral Health form requests; generic mental-health
  care no longer triggers it.
- Transplant routing is informational and runs only when the packet itself says
  a designated center is required. A transplant request alone no longer implies
  a universal Blue Distinction requirement unsupported by the reviewed public
  guidance.
- The investigational rule no longer treats off-label use or clinical-trial
  participation as proof that a service is investigational. When the packet
  explicitly assigns that status, it asks for the applicable Medical Policy or
  the covered-clinical-trial or benefit-exception basis.
- The appeal advisory is limited to an explicit prior-authorization appeal or
  reconsideration. It asks only for the original decision reference and no
  longer invents a universal new-clinical-information requirement.
- The network advisory applies to explicit network-exception and
  continuity-of-care requests, not every out-of-network authorization. It asks
  for the access gap or active treatment relationship supporting the exception.

Fourteen focused tests cover the five rules' true triggers, accepted evidence,
and former false-positive paths. Generated PA reports and the SBOM are refreshed
as part of release verification.

The source ledger contains 91 registered authorities: 34 fresh and 57 warning by
age, with no failures, source orphans, or coverage gaps. Its citations resolve
across 236 registered URLs. Of 876 PA rules, 823 are source-anchored. The
1,722-tile catalog is unchanged.

Verification covers 769 PA-engine tests, 14,084 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,084 of 14,084 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
