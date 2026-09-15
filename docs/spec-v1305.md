# spec-v1305 — correct BCBS Michigan intake checks

BCBS Michigan rules 001–005 treated guidance for particular services and
workflows as requirements for every packet. They required a policy citation
and clinical attachment, asked the packet to name its transport channel, and
expected an authorization number before an initial request had been submitted.

The five rules now follow BCBSM's current first-party materials:

- `R-PA-BCBSM-001` is an informational prompt to identify an applicable
  medical-necessity criterion when known; it no longer claims every packet
  must cite one.
- `R-PA-BCBSM-002` is an informational completeness check. Its citation now
  distinguishes workflows that expressly require complete clinical records
  from services using their own questionnaires, criteria, or vendor portals.
- `R-PA-BCBSM-003` points to the member- and service-specific Availity,
  e-referral, or delegated-vendor workflow without requiring the transport
  channel to appear inside the packet.
- `R-PA-BCBSM-004` remains non-enforcing because the linter has no live member
  eligibility, benefit, provider-location, or product-specific requirement
  lookup.
- `R-PA-BCBSM-005` asks for a confirmation reference only when the packet
  explicitly says the authorization request was submitted.

Regression tests cover the advisory severities, the channel and requirement
boundaries, initial versus submitted requests, and a retained confirmation
reference. The BCBSM source ledger now records the current authorization hub,
Getting Started page, requirements page, and June 2026 provider requirements
document. All generated PA reports are refreshed.

The source ledger contains 91 registered authorities: 30 fresh and 61 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 156 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
