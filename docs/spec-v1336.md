# spec-v1336 — correct BCBSMA complex-case checks

Blue Cross Blue Shield of Massachusetts rules 016–020 previously inferred
requirements from broad service and request language. This slice aligns them
with current behavioral-health guidance, Medical Policy materials, and the
current out-of-network request form.

- Generic mental-health context no longer triggers a level-of-care finding. An
  identified intensive setting gets an informational reminder when the packet
  lacks request-specific clinical support, using BCBSMA's current InterQual
  terminology rather than the unsupported MCG and ASAM claim.
- Transplant context alone no longer implies a Blue Distinction network
  mandate. The selected-center advisory runs only when request-specific
  instructions declare a designated-center requirement.
- Off-label use and clinical-trial context no longer imply that BCBSMA has
  classified a service as experimental or investigational. An explicit payer
  classification gets an informational check for its policy or determination
  basis.
- Generic appeal and grievance language no longer triggers a clinical
  prior-authorization appeal finding. An explicit authorization appeal gets a
  source-free informational check for the original case reference.
- Ordinary out-of-network use no longer implies a network exception. The
  current BCBSMA form expressly excludes commercial PPO members with
  out-of-network benefits, so the qualifying-reason check runs only for an
  explicit exception request.

Fifteen focused tests cover the five rules, including false-positive
regressions and each explicit actionable context. Generated PA reports, the
source ledger bundle, and the SBOM are refreshed during release verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 265 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 914 PA-engine tests, 14,229 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,229 of 14,229 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
