# spec-v1322 — scope Blue Cross NC service-review checks

Blue Cross NC rules 006–010 previously generalized product- and workflow-specific
requirements across every packet. They now follow the current provider site,
Care Affiliate guidance, code search, metrics, and reimbursement policy.

- Initial inpatient requests no longer require concurrent-review or discharge
  content. The informational clinical-update check runs only for an explicit
  concurrent or continued-stay review.
- Advanced-imaging guidance is informational, excludes inpatient and emergency
  settings, and no longer treats every `7xxxx` radiology code as MRI, CT, PET,
  or nuclear cardiology.
- An explicitly urgent request still receives an informational reminder when it
  does not explain the health risk of waiting. The rule no longer presents one
  product's wording as a universal eligibility standard.
- Hospital-outpatient site-of-care rationale is required only when the packet
  confirms that Blue Cross NC site-of-care review applies. The linter does not
  infer program enrollment from every surgical code.
- Blue Cross NC's NDC policy applies to professional and outpatient claims, not
  every J-code authorization packet. Drug requests remain subject to the
  applicable formulary-specific criteria and form.

Regression tests cover initial and continued inpatient requests, precise imaging
scope, urgent-request severity, confirmed site-of-care review, and the claims-only
NDC boundary. Generated PA reports and the SBOM are refreshed as part of release
verification.

The source ledger contains 91 registered authorities: 34 fresh and 57 warning
by age, with no failures, source orphans, or coverage gaps. Its citations resolve
across 228 registered URLs. Of 876 PA rules, 823 are source-anchored. The
1,722-tile catalog is unchanged.

Verification covers 746 PA-engine tests, 14,061 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,061 of 14,061 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
