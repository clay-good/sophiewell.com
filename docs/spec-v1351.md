# spec-v1351 — finish Blue KC: intake, exception workflows, and the last login citation

This closes the Blue KC overlay. Rules 016–020 are corrected against the
published guide, rules 001–005 get the intake corrections the other overlays
already have, and the `providers.bluekc.com/login` citation leaves the
repository: no rule references it and it is no longer registered in the ledger.

**Exception workflows (016–020)**

- `R-PA-BLUEKC-016` names the instruments Blue KC actually publishes through
  Lucet, which vary by member age and service: LOCUS for adults 19 and over,
  CALOCUS for ages 6 to 18, ECSII for birth through 5, and ASAM for
  substance-use treatment. Generic mental-health context no longer triggers it.
- `R-PA-BLUEKC-017` drops the Blue Distinction routing requirement. Blue
  Distinction is a facility designation program covering eight specialty areas,
  not a transplant routing rule. An explicit transplant authorization is asked
  for its evaluation or coverage basis; the word transplant alone is not enough.
- `R-PA-BLUEKC-018` asks which policy or coverage document establishes an
  investigational classification the packet declares. Blue KC makes that
  determination through its own policies, with the member's coverage document
  governing conflicts, and requires no peer-reviewed evidence from the packet.
- `R-PA-BLUEKC-019` runs on an explicit appeal, reconsideration, or
  peer-to-peer and asks which denial it contests — the peer-to-peer window is
  2 business days from that denial. A grievance no longer triggers it.
- `R-PA-BLUEKC-020` follows the plan boundary Blue KC publishes: out-of-network
  prior authorization is required for HMO and EPO members only, and for a PPO
  member who opts out it is neither required nor reviewed. Emergency and No
  Surprises Act situations are exempt.

**Intake (001–005)**

- `001` is informational; Blue KC supplies the governing criteria on a denial
  rather than expecting the packet to recite them.
- `002` requires clinical material once the packet identifies itself as an
  authorization request, which is when Blue KC asks for it.
- `003` treats the submission channel as transport metadata. Its previous
  citation named Availity Essentials, which appears nowhere in Blue KC's guide.
- `004` points at the published requirement list and notes that a BlueCard
  member follows their home plan.
- `005` checks for a confirmation reference only after the packet says a
  submission is complete. An initial request cannot carry the number it will
  produce.

Twenty-one focused tests cover false-positive regressions, plan and setting
boundaries, incomplete explicit workflows, and complete packets. Five tests
that had pinned corrected false positives are replaced.

The source ledger contains 91 registered authorities: 37 fresh and 54 warning
by age, with no failures, source orphans, or coverage gaps. Retiring the login
citation leaves 287 registered URLs, all resolving. Of 876 PA rules, 823 are
source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,089 PA-engine tests, 14,404 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
