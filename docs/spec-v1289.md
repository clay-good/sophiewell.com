# spec-v1289 — correct Humana intake checks

Humana rules 001–005 inherited broad assumptions that the current provider
materials do not support. A request could be flagged for not citing a coverage
policy or attaching one of a fixed set of document types, and packet content
was expected to record its submission channel. A service merely described as
requiring authorization could also be flagged for lacking the authorization
number that the packet was requesting.

The first five Humana rules now follow the published boundaries:

- `R-PA-HUMANA-001` is an informational mapping aid. Humana publishes Medical
  Coverage Policies and service-specific criteria, but does not require every
  packet to cite one.
- `R-PA-HUMANA-002` is informational because Humana publishes different
  clinical-information requirements for different authorization programs
  rather than one fixed document type for every request.
- `R-PA-HUMANA-003` no longer requires transport details in packet content.
  Humana says most requests use Availity, while delegated services use
  partner-specific portal, phone, or fax workflows.
- `R-PA-HUMANA-004` remains non-enforcing. Humana publishes separate lists by
  product and state, and the linter has no member-specific requirement service.
- `R-PA-HUMANA-005` is a source-free operational advisory that checks for a
  retained confirmation reference only after the packet explicitly says the
  request was submitted. An initial request no longer fails for lacking the
  approval it is seeking.

Regression tests cover advisory severity, channel-free packet content, the
non-enforcing list reminder, initial requests, and submitted requests with and
without a confirmation reference. The fixture narrative now reflects the
channel rule, Humana's current prior-authorization list and coverage-policy
pages are registered in the source ledger, and all generated PA audit reports
are refreshed.

The source ledger contains 91 registered authorities: 26 fresh and 65 warning
by age, with no failures, source orphans, or coverage gaps. Its citations now
resolve across 120 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
