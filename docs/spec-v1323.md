# spec-v1323 — scope Blue Cross NC specialty checks

Blue Cross NC rules 011–015 previously inferred specialized requirements from
generic drug, laboratory, and home-service signals. They now follow the current
drug search, code search, authorization directory, and Commercial DME policy.

- Step-therapy evidence is required only when the packet explicitly establishes
  that step therapy applies. A drug name or J-code alone does not establish the
  member's formulary requirement.
- Genetic and molecular review uses the repo's exact molecular-pathology CPT
  ranges instead of every `81xxx` code. Its informational check separately
  requires a specific test and a clinical purpose.
- A supporting-diagnosis reminder applies only to an explicit specialty or
  oncology drug request and is informational because criteria are drug- and
  formulary-specific.
- Retrospective-review justification remains an informational operational check,
  but no longer claims a universal Blue Cross NC eligibility rule unsupported by
  the reviewed provider pages.
- The DME check now asks for the treatment plan, anticipated duration, and
  predicted therapeutic benefit named by the Commercial DME policy. It no longer
  applies a noncovered-charge signature field to authorization packets or extends
  that DME policy to generic home-health requests.

Regression tests cover explicit and absent step-therapy scope, exact molecular
CPT boundaries, separate genetic-test details, specialty-drug detection,
retrospective advisory behavior, and complete and incomplete DME plans. Generated
PA reports and the SBOM are refreshed as part of release verification.

The source ledger contains 91 registered authorities: 34 fresh and 57 warning by
age, with no failures, source orphans, or coverage gaps. Its citations resolve
across 232 registered URLs. Of 876 PA rules, 823 are source-anchored. The
1,722-tile catalog is unchanged.

Verification covers 757 PA-engine tests, 14,072 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,072 of 14,072 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
