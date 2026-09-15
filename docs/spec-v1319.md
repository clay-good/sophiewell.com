# spec-v1319 — correct CareFirst specialty-request checks

CareFirst rules 011–015 previously converted plan- or form-specific guidance
into universal packet requirements. They now preserve the useful completeness
checks without inferring program scope.

- Step-therapy review runs only when the packet explicitly identifies a
  step-therapy requirement, then looks for a prior trial, intolerance, or
  contraindication.
- Genetic-testing review no longer treats every `81xxx` laboratory code as a
  genetic test and independently checks for both the specific test and its
  clinical indication.
- A missing diagnosis on a medical-benefit drug request is informational; the
  rule no longer claims every drug policy requires an ICD-10 code.
- Retrospective authorization remains program-specific. The linter no longer
  invents universal emergency or retroactive-eligibility exceptions.
- Home-care review follows the current CareFirst form's diagnosis and
  requested-service fields. It no longer applies that form to DME or requires
  a signature the form does not request.

Regression tests cover each corrected scope, trigger, severity, and passing
path. The source ledger registers CareFirst's current pharmacy form, Carelon
genetic guidelines, and Home Care Authorization Form. Generated PA reports and
the SBOM are refreshed as part of release verification.

The source ledger contains 91 registered authorities: 33 fresh and 58 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 211 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 723 PA-engine tests, 14,038 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,038 of 14,038 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
