# spec-v1342 — correct BCBSSC clinical-review checks

Blue Cross Blue Shield of South Carolina rules 006–010 previously inferred
continued-stay, delegated imaging, site-of-care, and NDC requirements from
broad clinical or code context. This slice aligns them with BCBSSC's current
provider guidance and keeps unsupported operational checks informational.

- Inpatient status alone no longer triggers a continued-stay packet check.
  Explicit continued-stay reviews are checked for current clinical material
  and confirmation that the continuation workflow was started.
- An MRI, CT, PET, or arbitrary 7xxxx code no longer implies delegated
  advanced-radiology review. The clinical-indication check runs only when the
  packet identifies that workflow.
- Expedited-request support remains a request-specific, informational packet
  check because the current general provider page does not publish one
  universal urgency test.
- Hospital-outpatient surgery and imaging no longer trigger a specialty-drug
  site-of-care rule. Only packets declaring that drug-specific requirement are
  checked for the selected setting or an exception basis.
- A J-code no longer implies that an NDC is mandatory. The formatted-code
  check runs only when the packet declares an NDC requirement.

Fourteen focused tests cover false-positive regressions, incomplete explicit
workflows, and complete packets across the five rules. Generated PA reports,
the source ledger bundle, and the SBOM are refreshed during release
verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 282 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 978 PA-engine tests, 14,293 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,293 of 14,293 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
