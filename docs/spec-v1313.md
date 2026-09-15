# spec-v1313 — correct IBX intake and submission checks

Independence Blue Cross rules 001–005 treated useful packet metadata as
universal precertification requirements and named an obsolete submission route.
They now follow current IBX provider guidance.

- A known IBX medical-policy reference and a recognized clinical attachment are
  informational completeness checks, not universal submission prerequisites.
- Packet content no longer needs to name its transport channel. Participating
  providers use PEAR Practice Management, with phone and delegated routes for
  applicable services.
- Service requirements remain a non-enforcing reminder because they depend on
  the current product, member benefits, service, and live PEAR information.
- A confirmation reference is expected only after the packet says the request
  was submitted, never merely because the service requires precertification.

Regression tests cover all five corrected boundaries. The IBX source is
reverified and its current medical-policy, precertification, and provider-contact
pages are registered in the source ledger. Generated PA reports and the SBOM are
refreshed as part of release verification.

The source ledger contains 91 registered authorities: 32 fresh and 59 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 190 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
