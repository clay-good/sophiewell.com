# spec-v1281 — correct Anthem intake checks

Anthem rules 001–005 previously turned general provider resources into hard
packet requirements. They required every request to cite a utilization
criterion, described supporting records as mandatory, asked packet content to
name its transport channel, and required an authorization number from the
initial request that was seeking that authorization.

The rules now match Anthem's current provider pages:

- `R-PA-ANTHEM-001` is an informational preparation check. Anthem describes
  Medical Policies and Clinical UM Guidelines as references, notes that local
  plan adoption varies, and may also use MCG or Carelon criteria; it does not
  require every packet to cite one.
- `R-PA-ANTHEM-002` accurately describes the Clinical Documentation Lookup
  Tool's service-specific documents as highly recommended. A missing
  recognized clinical document is advisory rather than a hard failure.
- `R-PA-ANTHEM-003` no longer inspects packet prose for Availity, ICR, EDI, or
  phone-channel language. Anthem directs providers to its digital workflow but
  does not require transported content to record that provenance.
- `R-PA-ANTHEM-004` remains neutral because Anthem publishes separate state
  and plan code lists and this repository intentionally ships no universal
  membership table.
- `R-PA-ANTHEM-005` runs only after the packet says an authorization was
  submitted. It then advises when the case or tracking reference is absent;
  an initial request no longer fails for lacking the future authorization
  number.

Regression tests cover advisory criteria and documentation checks, packets
with and without transport-channel prose, the neutral state-and-plan list
boundary, and initial versus submitted authorization workflows. Anthem's
digital-solutions page is registered in the source ledger, and all 46
generated PA audit reports are updated.

The source ledger contains 91 registered authorities: 24 fresh and 67 warning
by age, with no failures, source orphans, or coverage gaps. Its citations now
resolve across 106 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
