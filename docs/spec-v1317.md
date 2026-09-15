# spec-v1317 — correct CareFirst intake checks

CareFirst rules 001–005 previously treated general portal guidance as mandatory
packet content. They now follow the current product-specific authorization
workflow.

- A known Medical Policy or MCG guideline remains useful context, but omitting
  it is informational rather than a hard packet defect. CareFirst's provider
  manual says policy does not itself certify coverage and benefits vary by
  contract and line of business.
- Clinical-document review is informational because the portal requests
  additional information according to the submitted diagnosis and procedure
  codes; the public guidance does not impose one attachment type on every
  request.
- The transport channel does not need to be repeated inside packet content.
  Most requests use the CareFirst Provider Portal, with service- and
  product-specific workflows where applicable.
- The authorization-list rule points to the live Prior Authorization Lookup
  Tool and remains non-enforcing because requirements vary by product and
  account contract and the linter has no member lookup.
- An initial request no longer fails for lacking an authorization number. The
  informational tracking-reference check runs only after the packet explicitly
  says submission is complete.

Regression tests cover the corrected severity and trigger boundaries. The
CareFirst source is reverified on September 15, 2026, and its current
professional provider manual is added to the source ledger. Generated PA
reports and the SBOM are refreshed as part of release verification.

The source ledger contains 91 registered authorities: 33 fresh and 58 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 203 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 698 PA-engine tests, 14,013 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,013 of 14,013 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
