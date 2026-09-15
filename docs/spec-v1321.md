# spec-v1321 — correct Blue Cross NC intake checks

Blue Cross NC rules 001–005 previously treated useful workflow context as
universal clinical-packet requirements. They now follow the current provider
site, Care Affiliate guidance, and request forms.

- A missing Medical Policy reference is informational. Blue Cross NC says
  policies inform prior-authorization decisions, but does not require every
  request to cite one.
- Supporting clinical context may appear in the request itself. The rule no
  longer requires a separate clinical attachment for every request.
- Submission-channel text is not required in packet content. Current routing
  uses Care Affiliate through Blue e plus service- and product-specific forms.
- Code-list membership remains a live lookup through the current code search
  or Care Affiliate Precheck; the linter does not infer member-specific scope.
- Initial requests no longer fail for lacking an authorization number. The
  reference check runs only when an In-Network Benefit Review declares that an
  existing authorization is already present.

Regression tests cover each corrected scope, severity, conditional field, and
passing path. The source ledger now records the current Medical Policy search,
general request form, Care Affiliate update, request directory, and In-Network
Benefit Review form. Generated PA reports and the SBOM are refreshed as part
of release verification.

The source ledger contains 91 registered authorities: 34 fresh and 57 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 221 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 737 PA-engine tests, 14,052 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,052 of 14,052 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
