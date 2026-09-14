# spec-v1285 — correct Cigna intake checks

Cigna rules 001–005 inherited several assumptions that the current Commercial
provider materials do not support. A request could be flagged for not citing a
coverage policy, not carrying a fixed clinical document type, or not recording
its submission channel. A packet for a service merely marked as requiring
precertification could also be flagged for lacking an authorization number even
though the packet was the initial request for that number.

The first five Cigna rules now follow the published boundaries:

- `R-PA-CIGNA-001` is an informational mapping aid. Cigna says review considers
  the member's plan, clinical guidelines, and specific situation, but it does
  not require every submission to cite a Medical Coverage Policy.
- `R-PA-CIGNA-002` is informational because Cigna asks for request-specific
  required information rather than one fixed clinical-document type on every
  request.
- `R-PA-CIGNA-003` no longer requires the transport channel in packet content.
  Cigna's current page lists EDI 278, phone, and fax for direct medical requests
  and separate workflows for delegated services and medications.
- `R-PA-CIGNA-004` remains non-enforcing. The March 2026 Master Precertification
  List varies by care-management model and can delegate codes, while the linter
  has no member-specific requirement service.
- `R-PA-CIGNA-005` checks for a retained confirmation reference only after the
  packet explicitly says precertification was submitted. An initial request no
  longer fails for lacking the authorization it is seeking.

Regression tests cover advisory severity, channel-free packet content, the
non-enforcing list reminder, initial requests, and submitted requests with and
without a confirmation reference. Cigna's coverage-policy page and March 2026
Master Precertification List are registered in the source ledger, and all
generated PA audit reports are refreshed.

The source ledger contains 91 registered authorities: 25 fresh and 66 warning
by age, with no failures, source orphans, or coverage gaps. Its citations now
resolve across 112 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
