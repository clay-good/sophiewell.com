# spec-v1377 — correct Illinois Medicaid intake and clinical-review checks

Illinois rules 001–010 carried both templates — the intake one and the
clinical-review one. HFS publishes its general prior approval policy as Section
111 of the Chapter 100 provider handbook, and it replaces the template with
rules that are specific to how Illinois actually works.

**Intake (001–005)**

- `001` becomes informational and states the basis HFS itself uses: a service
  must be appropriate to the patient's needs, necessary to avoid institutional
  care, and medically necessary to preserve health, alleviate sickness, or
  correct a debilitating condition. HFS names no external criteria set.
- `002` asks, once the packet identifies itself as a prior approval request, for
  three items on HFS's published list — the diagnosis, the treatment plan, and
  how long the service will be needed — and names each one missing.
- `003` treats the submission channel as transport metadata.
- `004` points at the Chapter 200 handbook and fee schedule where HFS lists which
  services need prior approval.
- `005` checks for the written decision notice HFS requires the provider to
  retain for audit, and only once the packet says a decision was made.

**Clinical review (006–010)**

- `006` follows HFS's managed care rule for post-stabilization services: two
  documented good-faith attempts to contact the plan, which must pay if it was
  unreachable or did not deny within 60 minutes.
- `007` runs only on a packet-declared imaging workflow.
- `008` follows the route HFS actually publishes instead of an urgency test:
  **prior approval outside ordinary processing**, available to facilitate a
  hospital discharge or because of an unforeseen circumstance, with the date a
  decision is needed.
- `009` follows the setting rule HFS states, which is a cost-alternative rule:
  the Department approves a less expensive service or item when it meets the
  patient's needs.
- `010` checks an NDC the packet already carries; HFS uses NDCs as claim codes.

Ten focused tests cover the payer wiring, the itemized request content, the
post-stabilization and outside-ordinary-processing routes, and false-positive
regressions. One pinned test is updated. The Chapter 100 handbook is registered
in the source ledger.

The source ledger contains 91 registered authorities: 46 fresh and 45 warning
by age, with no failures, source orphans, or coverage gaps. Registering the
Chapter 100 handbook moved the Illinois source to fresh. Rule citations
reference 241 distinct URLs, all among the 301 registered and none behind a
sign-in wall. Of 876 PA rules, 823 are source-anchored. The 1,722-tile catalog
is unchanged.

Verification covers 1,319 PA-engine tests, 14,638 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
