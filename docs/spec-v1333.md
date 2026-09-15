# spec-v1333 — correct BCBSMA foundational checks

Blue Cross Blue Shield of Massachusetts rules 001–005 previously treated broad
workflow guidance as mandatory packet content. The first BCBSMA slice now
matches the current Medical Policy and Authorization Manager materials.

- A policy citation is requested only when the packet explicitly relies on a
  Medical Policy, and the resulting completeness finding is informational.
- The supporting-documentation advisory runs only for an identifiable service
  authorization request instead of every document mentioning the plan.
- Submission routing is external to clinical packet completeness. The linter
  points to Authorization Manager or the applicable program-specific route
  without requiring the channel to appear in the packet.
- Authorization status is not guessed from a CPT or HCPCS code because the
  current tool performs member-specific requirement lookup and no versioned
  benefit list is bundled.
- An authorization number is requested only from a post-decision record that
  states approval has already been obtained, never from the initial request.

Fourteen focused tests cover the five rules, including false-positive
regressions and the explicit contexts that should still produce informational
findings. Generated PA reports, the source ledger bundle, and the SBOM are
refreshed during release verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning by
age, with no failures, source orphans, or coverage gaps. Its citations resolve
across 257 registered URLs. Of 876 PA rules, 823 are source-anchored. The
1,722-tile catalog is unchanged.

Verification covers 873 PA-engine tests, 14,188 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,188 of 14,188 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
