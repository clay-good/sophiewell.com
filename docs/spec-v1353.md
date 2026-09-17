# spec-v1353 — correct Blue Cross MN clinical-review checks

Blue Cross MN rules 006–010 carried the same copy-paste template as the other
overlays. Its Provider Policy and Procedure Manual is public, and reading it
corrects four of the five — and confirms the fifth, which matters just as much.

- `R-PA-BCBSMN-006` follows what Blue Cross MN actually requires: continued stay
  notification for an admission extending beyond the initially approved days.
  Admission notification is a notice needing no medical-necessity review, filed
  as an Availity transaction within 24 hours, and for MHCP members at facilities
  on the MN Encounter Alert Service it is automated away entirely. It was never
  packet content, so an inpatient setting no longer triggers the check.
- `R-PA-BCBSMN-007` drops the claimed advanced-imaging program. Blue Cross MN's
  delegated vendors are EviCore for molecular lab and Prime MPS for medical
  specialty drugs and chemotherapy; the manual describes no imaging program. The
  advisory now runs only when the packet identifies an imaging workflow.
- `R-PA-BCBSMN-008` is **confirmed, not removed**. Blue Cross MN publishes a
  real three-part urgency definition — serious deterioration from an unforeseen
  illness or injury, jeopardy to regaining maximum function on a prudent
  layperson's judgment, or severe pain that cannot be adequately managed — so
  the check keeps its teeth and now names those conditions instead of a generic
  standard. It also honors the published exclusion: care already provided is not
  urgent, and such a request is handled as non-urgent rather than flagged as
  unjustified.
- `R-PA-BCBSMN-009` runs only when the packet establishes a site-of-care
  requirement. The manual publishes no such rule.
- `R-PA-BCBSMN-010` checks an NDC the packet already carries. Blue Cross MN's
  NDC rule governs the pharmacy claim — the code must come from the container
  dispensed and match the manufacturer and package size — not the request.

Ten focused tests cover false-positive regressions, each of the three urgency
conditions, the already-provided exclusion, and complete packets.

The source ledger contains 91 registered authorities: 38 fresh and 53 warning
by age, with no failures, source orphans, or coverage gaps. Registering the
Blue Cross MN manual beside the provider landing page moved that source to
fresh. Its citations resolve across 288 registered URLs, none behind a sign-in
wall. Of 876 PA rules, 823 are source-anchored. The 1,722-tile catalog is
unchanged.

Verification covers 1,098 PA-engine tests, 14,417 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
