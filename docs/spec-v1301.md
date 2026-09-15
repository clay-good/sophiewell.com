# spec-v1301 — correct Florida Blue intake checks

Florida Blue rules 001–005 treated helpful workflow details as universal packet
requirements. They could block a request for omitting a Medical Coverage
Guideline, a recognized attachment type, a transport-channel label, or an
authorization number that does not exist until after submission.

The five rules now follow Florida Blue's current public guidance:

- `R-PA-FLBLUE-001` makes the Medical Coverage Guideline reference an
  informational mapping aid. Member contracts and benefits remain controlling.
- `R-PA-FLBLUE-002` keeps missing recognized clinical support informational
  because the required material varies by service and review workflow.
- `R-PA-FLBLUE-003` no longer asks packet content to record whether the request
  traveled through Availity, a phone workflow, or a delegated vendor.
- `R-PA-FLBLUE-004` remains non-enforcing because the public service list can
  change and the linter has no member-specific eligibility or benefit lookup.
- `R-PA-FLBLUE-005` asks for an authorization, case, or transaction reference
  only when the packet says submission is complete. An initial request passes.

Regression tests cover incomplete and complete policy and clinical-support
cases, the transport and lookup boundaries, and initial versus submitted
requests. Three current Florida Blue provider resources are added to the source
ledger, and all generated PA reports are refreshed.

The source ledger contains 91 registered authorities: 29 fresh and 62 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 146 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
