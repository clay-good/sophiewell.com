# spec-v1348 — correct Arkansas Blue Cross exception-workflow checks

Arkansas Blue Cross rules 016–020 applied behavioral-health, transplant,
non-coverage, appeal, and out-of-network requirements too broadly, and three of
them described requirements Arkansas Blue Cross does not publish. Two existing
tests had pinned the false positives.

- `R-PA-ARKBCBS-016` triggers on the behavioral-health services that actually
  require prior approval — inpatient behavioral-health admissions, intensive
  outpatient, residential treatment, applied behavior analysis, and rTMS — and
  asks for the material Lucet Health names: the proposed treatment plan, risk
  and safety concerns, and the tentative discharge plan or estimated length of
  treatment. The unsourced ASAM and LOCUS instrument claim is gone.
- `R-PA-ARKBCBS-017` exempts kidney and cornea transplants, which Arkansas Blue
  Cross excludes from prior approval, and asks for the transplant evaluation or
  the Coverage Policy criteria. Blue Distinction Centers for Transplant is a
  benefit-maximization network, so its absence is no longer treated as a
  defect. The test that flagged a kidney transplant is replaced by one that
  asserts the exemption.
- `R-PA-ARKBCBS-018` follows the published rule: a service that does not meet
  the Primary Coverage Criteria may be billed to the member only under a signed
  waiver of health-plan liability obtained beforehand. Off-label,
  compassionate-use, and clinical-trial context no longer imply the
  classification, and the unsourced peer-reviewed-evidence requirement is gone.
- `R-PA-ARKBCBS-019` runs on an explicit authorization appeal or re-review and
  asks which adverse determination it contests. A grievance is a different
  process and no longer triggers it.
- `R-PA-ARKBCBS-020` follows the published out-of-area and out-of-state
  workflow: prior approval for services not available from a True Blue PPO
  provider, or continuity of care for a complex condition on a continuation of
  care election form. Out-of-network status alone no longer triggers it, and
  the test that asserted otherwise is replaced.

Seventeen focused tests cover false-positive regressions, the kidney and cornea
exemption, incomplete explicit workflows, and complete packets across the five
rules. Generated PA reports and the SBOM are refreshed during release
verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 286 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 1,053 PA-engine tests, 14,368 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
