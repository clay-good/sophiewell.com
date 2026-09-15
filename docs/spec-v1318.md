# spec-v1318 — correct CareFirst clinical-program checks

CareFirst rules 006–010 previously generalized product- and service-specific
guidance into broad packet requirements. They now match the current published
program boundaries.

- Inpatient clinical documentation remains an informational check because
  CareFirst exempts hospitals that provide electronic medical-record access
  from uploading it.
- Advanced-imaging enforcement now requires explicit commercial fully insured
  status, uses the current EviCore scope, and no longer classifies every
  `7xxxx` radiology code as advanced imaging.
- Missing clinical urgency on an expedited request is informational because
  the public CareFirst sources establish that standard only for specific
  programs.
- Site-of-care review now applies only to an explicitly identified
  hospital-outpatient medical-drug requirement, not to arbitrary outpatient
  surgery.
- The NDC check is limited to HCPCS `J3490`, the unclassified-drug code named
  in CareFirst's provider manual, instead of every J-code.

Regression tests cover each corrected scope, trigger, severity, and passing
path. The CareFirst source ledger now registers the current inpatient,
EviCore, expedited-review, pharmacy, and specialty-service references.
Generated PA reports and the SBOM are refreshed as part of release
verification.

The source ledger contains 91 registered authorities: 33 fresh and 58 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 208 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 709 PA-engine tests, 14,024 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,024 of 14,024 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
