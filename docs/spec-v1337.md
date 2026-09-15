# spec-v1337 — correct BCBSAL foundational checks

Blue Cross Blue Shield of Alabama rules 001–005 previously turned broad
workflow assumptions into packet failures. This slice aligns them with the
current BCBSAL precertification page and ProviderAccess pre-service review
instructions.

- A Medical Policy or clinical-guideline reference is now an informational
  mapping aid. BCBSAL's public instructions direct users to member-specific
  benefits and do not require every packet to cite a policy or MCG guideline.
- A missing recognized clinical document is advisory because BCBSAL names
  supporting information on service-specific forms rather than imposing one
  document type on every request.
- Packet content no longer needs to name a submission channel. The rule points
  to the member- and service-specific electronic ProviderAccess workflow and
  removes unsupported Availity and phone-channel claims.
- Requirement-list checking remains non-enforcing because the linter has no
  member-specific Eligibility & Benefits response.
- An initial request no longer fails for lacking the authorization number it is
  seeking. A confirmation reference is requested only when the packet says the
  submission is complete.

Eleven focused tests cover the five rules, including the initial-request and
completed-submission distinction. Generated PA reports, the source ledger
bundle, and the SBOM are refreshed during release verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 266 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 921 PA-engine tests, 14,236 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,236 of 14,236 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
