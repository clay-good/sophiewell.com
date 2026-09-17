# spec-v1346 — correct Arkansas Blue Cross clinical-review checks

Arkansas Blue Cross rules 006–010 inferred inpatient, imaging, site-of-care,
and drug-coding requirements from broad context. They could demand concurrent-
review material from any packet that used the word "admitted," treat every
7xxxx code as advanced imaging, recite an urgency standard Arkansas Blue Cross
does not publish, direct outpatient surgery away from a hospital under a policy
that does not exist, and require an NDC from every J-code.

The five rules now follow Arkansas Blue Cross's current published guidance:

- `R-PA-ARKBCBS-006` separates an explicit inpatient authorization request from
  an explicit continued-stay or concurrent review. The first is checked for the
  clinical information supporting the admission and level of service that the
  provider manual lists; the second for a current clinical update and the
  discharge plan concurrent review assesses. Inpatient prose alone no longer
  triggers either, because in-network, in-state admissions do not require
  pre-notification.
- `R-PA-ARKBCBS-007` follows the Carelon outpatient program as published: it
  runs on a named CT, MRI/MRA, nuclear-cardiology, or PET study, not on an
  arbitrary radiology code, and exempts the settings Arkansas Blue Cross
  excludes — emergency room, inpatient, observation, urgent care, and
  outpatient surgery. It asks for the clinical elements Carelon requests.
- `R-PA-ARKBCBS-008` is informational and asks for the request-specific reason
  expedited handling is needed. Arkansas Blue Cross publishes a 24-hour urgent
  prospective timeframe and a Carelon expedited-review path, not one universal
  urgency test a packet must recite.
- `R-PA-ARKBCBS-009` runs only when the packet establishes that site-of-care
  steerage applies. The reviewed material describes steerage only through
  Specialty Case Management for high-cost infusions, so a surgical code in a
  hospital-outpatient setting no longer triggers the rule.
- `R-PA-ARKBCBS-010` checks the published 5-4-2 NDC billing format on a packet
  that already carries or declares an NDC. The NDC requirement is a claim-format
  rule, so it is no longer inferred from a J-code.

Nineteen focused tests cover false-positive regressions, excluded settings,
incomplete explicit workflows, and complete packets across the five rules. The
Arkansas Blue Cross golden report loses a site-of-care false positive.
Generated PA reports, the bundled source ledger, and the SBOM are refreshed
during release verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 286 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 1,027 PA-engine tests, 14,342 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
