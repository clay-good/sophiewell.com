# spec-v1347 — correct Arkansas Blue Cross specialty-workflow checks

Arkansas Blue Cross rules 011–015 inferred step therapy, delegated laboratory
review, drug-diagnosis, retrospective-eligibility, and signed-order
requirements from broad codes or service labels. Two of them described programs
Arkansas Blue Cross does not run the way the rule claimed.

- `R-PA-ARKBCBS-011` runs only when the packet establishes that step therapy or
  a formulary exception applies. Step therapy is drug-specific and routed
  through the Prior Approval and Exception Request form, so a J-code or
  infusion no longer implies it.
- `R-PA-ARKBCBS-012` is retargeted to what Arkansas Blue Cross actually
  publishes: a molecular-diagnostic (83890–83914) or cytogenetic (88230–88299)
  claim must carry the name of the test performed and the reason it was
  ordered. The Avalon laboratory-benefit program is automated post-service and
  pre-payment claim review, not prior authorization, and emergency,
  observation, and inpatient settings are excluded. The unsourced "unique test
  identifier" requirement and the 81xxx trigger are gone.
- `R-PA-ARKBCBS-013` asks for the supporting diagnosis only when the packet
  names a drug coverage or prior-approval workflow. Arkansas Blue Cross
  governs drug coverage through drug-specific criteria rather than one
  universal diagnosis rule for every injectable.
- `R-PA-ARKBCBS-014` no longer claims Arkansas Blue Cross grants retrospective
  review under a published list of circumstances. An explicit retrospective
  request is asked for its request-specific reason, and the advisory says
  plainly that eligibility still depends on the member's plan.
- `R-PA-ARKBCBS-015` runs on an explicit DME or home-health prior-approval
  request and asks for the ordering document. The separate signed-and-dated
  written-order rule is dropped because the reviewed material does not publish
  one.

Fourteen focused tests cover false-positive regressions, excluded settings,
incomplete explicit workflows, and complete packets across the five rules.
Generated PA reports and the SBOM are refreshed during release verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 286 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 1,041 PA-engine tests, 14,356 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
