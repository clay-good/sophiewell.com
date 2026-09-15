# spec-v1309 — correct Blue Shield California intake checks

Blue Shield of California rules 001–005 treated plan- and service-specific
guidance as universal packet requirements. They required every request to cite
a policy and attach a recognized clinical document, asked the packet to name
its transport channel, and expected a reference before initial submission.

The rules now follow Blue Shield's current provider materials:

- Policy and clinical-document checks are informational because criteria and
  required support vary by service, product, benefits, and delegation.
- Submission guidance recognizes Availity, AuthAccel, Evolent, IPA, and other
  service-specific workflows without requiring the channel inside the packet.
- Requirement-list checking remains non-enforcing without live member,
  eligibility, benefit, and delegation data.
- A confirmation or inquiry reference is expected only when the packet says
  the authorization request was submitted.

Regression tests cover advisory severities, channel and live-list boundaries,
initial versus submitted requests, and a retained confirmation reference. The
source ledger records current Blue Shield policy, list, and submission pages,
and all generated PA reports are refreshed.

The source ledger contains 91 registered authorities: 31 fresh and 60 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 177 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
