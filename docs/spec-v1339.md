# spec-v1339 — correct BCBSAL treatment-program checks

Blue Cross Blue Shield of Alabama rules 011–015 previously inferred
program-specific requirements from broad drug, genetic-testing, retrospective,
DME, and home-care context. This slice aligns them with current BCBSAL program
pages, Carelon genetic-testing guidance, and home-health instructions.

- A J-code or generic drug request no longer implies step therapy. The
  informational trial-or-exception check runs only when the packet establishes
  that a product is subject to step therapy.
- An arbitrary 81xxx code no longer establishes Carelon genetic-program scope.
  An explicit genetic-testing precertification is checked separately for the
  requested test and its clinical indication.
- A J-code, injectable, or infusion no longer implies that the drug appears on
  BCBSAL's provider-administered precertification list. Diagnosis review is
  limited to packets that identify that workflow.
- Retrospective review is non-enforcing because BCBSAL says its availability is
  member- and service-specific and generally unavailable under the standard
  benefit when precertification was not obtained.
- The initial home-health certification packet is no longer imposed on DME or
  generic home-care requests. Explicit initial certifications retain BCBSAL's
  assessment, treatment-plan, medication-list, and physician-signature check.

Thirteen focused tests cover the five rules, including false-positive
regressions and each explicit actionable context. Generated PA reports, the
source ledger bundle, and the SBOM are refreshed during release verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 275 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 948 PA-engine tests, 14,263 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,263 of 14,263 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
