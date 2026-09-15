# spec-v1338 — correct BCBSAL service-review checks

Blue Cross Blue Shield of Alabama rules 006–010 previously inferred broad
requirements from inpatient settings, radiology codes, urgent requests,
hospital-outpatient surgery, and J-codes. This slice aligns them with current
BCBSAL hospital, advanced-imaging, Blue Advantage, and drug-review materials.

- An inpatient setting alone no longer triggers a combined admission,
  progress, and discharge-plan requirement. The informational clinical-update
  check runs only for an explicit continued-stay request.
- Advanced-imaging review is limited to named PET, CT, CTA, MRI, and MRA
  requests. Generic 7xxxx radiology codes no longer trigger it, and emergency,
  observation, and inpatient imaging are excluded as BCBSAL documents.
- The life, health, or maximum-function expedited-review standard is limited to
  Blue Advantage, the product whose current manual publishes that language.
- Hospital-outpatient surgery no longer implies a universal site-of-care
  exception. A rationale is requested only when the packet itself declares an
  exception requirement.
- A J-code no longer implies a universal NDC requirement. The informational
  format check runs only when the packet says an NDC is required.

Sixteen focused tests cover the five rules, including false-positive
regressions, excluded imaging settings, product scope, and each explicit
actionable context. Generated PA reports, the source ledger bundle, and the
SBOM are refreshed during release verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 270 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 935 PA-engine tests, 14,250 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,250 of 14,250 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
