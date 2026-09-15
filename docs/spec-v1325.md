# spec-v1325 — correct Horizon BCBSNJ intake checks

Horizon Blue Cross Blue Shield of New Jersey rules 001–005 previously treated
workflow aids as universal packet requirements. They now distinguish clinical
content from external routing and member-specific benefit logic.

- The Medical Policy reference is an informational mapping aid. Horizon's
  manual says policies help clinicians understand benefit decisions and vary by
  line of business; it does not require every request to cite one.
- Supporting clinical context may appear in the request itself or in a
  recognized clinical document. The check is informational because the reviewed
  public guidance does not require a separate attachment for every service.
- Submission-channel text is no longer required inside the clinical packet.
  Providers should verify the current product-specific route externally;
  Horizon, Horizon NJ Health, and Braven Health provider access has moved to
  Availity Essentials.
- Requirement-list membership remains a vacuous check because the repository
  does not bundle member- and product-specific Horizon authorization data. Its
  stale wave label and universal-list wording are removed.
- An authorization reference is requested only when the packet declares that
  an authorization already exists. An initial request may state that prior
  authorization is required without somehow containing its future approval
  number.

Nine focused tests cover the five intake rules, including embedded clinical
context, absent transport metadata, member-specific requirement handling, and
initial versus existing authorization references. Generated PA reports and the
SBOM are refreshed as part of release verification.

The source ledger contains 91 registered authorities: 35 fresh and 56 warning by
age, with no failures, source orphans, or coverage gaps. Its citations resolve
across 238 registered URLs. Of 876 PA rules, 823 are source-anchored. The
1,722-tile catalog is unchanged.

Verification covers 774 PA-engine tests, 14,089 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,089 of 14,089 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
