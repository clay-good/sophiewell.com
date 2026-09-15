# spec-v1345 — correct Arkansas Blue Cross intake checks

Arkansas Blue Cross rules 001–005 previously treated payer identification,
submission metadata, and follow-up details as universal packet requirements.
This slice limits each check to the workflow where the information is useful.

- A policy reference is now an informational member-plan reminder rather than
  a blocking requirement for every Arkansas Blue Cross packet.
- Clinical support is required only when the packet explicitly identifies
  itself as a prior-authorization request. Generic payer and procedure context
  no longer triggers the rule.
- Submission-channel selection is treated as transport metadata, not content
  that must appear inside the packet.
- The current product-specific lookup reminder is non-enforcing because the
  public guidance does not establish a universal packet field.
- An authorization or case reference is checked only after the packet states
  that a submission has already been completed. Initial requests are not
  expected to carry a reference that does not yet exist.

Eleven focused tests cover false-positive regressions, incomplete explicit
workflows, and complete packets across the five rules. Generated PA reports,
the bundled source ledger, and the SBOM are refreshed during release
verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 284 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 1,012 PA-engine tests, 14,327 repository unit tests, and
459 MCP tests. The localhost-only D1 test passes when run outside the
filesystem sandbox, making the effective unit result 14,327 of 14,327 passing.
Lint, accessibility, data integrity, and the 1,722-page production build also
pass.
