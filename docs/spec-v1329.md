# spec-v1329 — correct BCBST foundational checks

BlueCross BlueShield of Tennessee rules 001–005 previously treated reviewer
resources and transmission details as universal fields inside every request.
The first BCBST slice now follows the plan's current commercial materials.

- A procedure request no longer needs to cite a Medical Policy. When the
  rationale explicitly relies on one, an informational check asks for its title
  or number.
- The supporting-clinical check runs only for an identifiable service
  authorization request. It remains a blocking finding when such a request has
  no clinical attachment, matching the current inpatient / outpatient form.
- Availity, phone, and service-specific fax routing remain documented guidance,
  but transmission metadata is no longer required inside the clinical packet.
- The unversioned membership reminder points to the current commercial list and
  does not infer authorization requirements from a CPT code.
- An initial request no longer needs the future authorization number it is
  requesting. An informational reference check runs only when a post-decision
  record claims that approval was already issued.

Focused tests cover the false-positive regressions and the explicit contexts
that should still produce blocking or informational findings. Generated PA
reports, the source ledger bundle, and the SBOM are refreshed during release
verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning by
age, with no failures, source orphans, or coverage gaps. Its citations resolve
across 243 registered URLs. Of 876 PA rules, 823 are source-anchored. The
1,722-tile catalog is unchanged.

Verification covers 820 PA-engine tests, 14,135 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,135 of 14,135 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
