# spec-v1315 — correct IBX specialty and retrospective checks

Independence Blue Cross rules 011–015 inferred specialized requirements from
generic drug, genetic-testing, post-service, and equipment language. They now
follow the current IBX forms and provider manuals.

- Step-therapy history is informational and runs only when the packet says the
  requirement applies. Recent pharmacy claims may already satisfy the step.
- An `81xxx` code no longer establishes eviCore applicability. The genetic rule
  checks for an authorization reference only when an applicable request has
  reached the testing laboratory.
- The ICD-10 requirement is scoped to the current Direct Ship general drug form
  instead of every J-code or specialty-drug request.
- Retrospective-review reasons are checked only for inpatient stays and match
  the Hospital Manual's limited coverage-discovery, pre-discharge-review, and
  missed emergency-notification circumstances.
- DME and home-health language no longer creates an unsupported universal
  signed-order packet requirement. Current authorization requirements remain
  service- and member-specific.

Regression tests cover each corrected positive and negative boundary. The IBX
source registration now includes the current pharmacy PA page, step-therapy
list, general pharmacy form, Specialty Programs manual, and Direct Ship form.
Generated PA reports and the SBOM are refreshed as part of release verification.

The source ledger contains 91 registered authorities: 32 fresh and 59 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 199 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
