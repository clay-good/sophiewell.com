# spec-v1326 — correct Horizon BCBSNJ service-review checks

Horizon Blue Cross Blue Shield of New Jersey rules 006–010 previously turned
plausible workflow details into universal packet requirements. They now prompt
only when the packet and reviewed public guidance support the narrower context.

- Initial inpatient requests no longer need concurrent-review fields. The
  informational check asks for current clinical or discharge-planning context
  only when the packet explicitly requests concurrent or continued-stay review.
- The advanced-imaging check no longer treats every `7xxxx` radiology CPT as
  MRI, CT, or PET. It uses explicit advanced-imaging text or the repository's
  MRI CPT ranges, excludes inpatient, emergency, and urgent-care settings, and
  remains informational because requirements vary by member and product.
- Generic "urgent" and "STAT" language no longer implies an expedited
  authorization request. An informational urgency prompt appears only when the
  packet explicitly requests expedited or urgent prior-authorization review.
- Hospital-outpatient surgery no longer triggers a universal ASC exception.
  Horizon's affordability page supports asking why hospital care is requested,
  but does not publish a universal affected-service list. The informational
  check therefore runs only when the packet confirms site-of-care review applies.
- A J-code no longer creates an unsupported universal NDC requirement. Current
  member-, product-, and drug-specific coding requirements remain external.

Fourteen focused tests cover the five rules, including initial versus concurrent
inpatient review, ordinary radiology and excluded settings, generic versus
explicit urgency, confirmed site-of-care review, and a J-code without an NDC.
Generated PA reports and the SBOM are refreshed as part of release verification.

The source ledger contains 91 registered authorities: 35 fresh and 56 warning by
age, with no failures, source orphans, or coverage gaps. Its citations resolve
across 239 registered URLs. Of 876 PA rules, 823 are source-anchored. The
1,722-tile catalog is unchanged.

Verification covers 786 PA-engine tests, 14,101 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,101 of 14,101 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
