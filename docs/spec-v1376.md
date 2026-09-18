# spec-v1376 — finish Ohio Medicaid

This closes the Ohio Medicaid overlay: with rules 011–020, and the intake rules
fixed in spec-v1375, all twenty are corrected. Ohio publishes its
prior-authorization law as statute and administrative code, so five of these ten
rules now cite a section, and five that no Ohio rule addresses become
packet-declared with citations that say exactly that.

**Sourced to Ohio law**

- `R-PA-MCOH-011` follows the Medicaid step therapy exemption statute,
  **ORC 5164.7514**. ODM must grant an exemption when the required drug is
  contraindicated under its FDA prescribing information, or the recipient already
  tried it or an equivalent — under Medicaid or other coverage — and it was
  discontinued for lack of efficacy, diminished effect, or an adverse event; it
  may grant one when the recipient is stable on the prescribed drug. A request
  that is not decided within 48 hours if urgent, or 10 calendar days otherwise,
  is approved automatically. A test exercises each ground.
- `R-PA-MCOH-013` honors OAC 5160-1-31's emergency exception: an emergency
  prescribed drug may be dispensed without prior authorization under rule
  5160-9-03.
- `R-PA-MCOH-014` replaces an invented eligibility list with Ohio's three
  published bases: delay detrimental to health, a retroactive authorization ODM
  instructs, and ORC 5160.34's rule that a new service directly related to an
  already-approved one cannot be denied solely for lacking prior authorization.
- `R-PA-MCOH-019` asks which adverse determination a reconsideration contests;
  ODM must receive it within sixty calendar days, and the appeal is a
  conversation with a clinical peer.
- `R-PA-MCOH-020` follows **OAC 5160-1-11**, which lists five circumstances for
  paying an out-of-state provider and requires authorization for only one —
  a service unavailable in Ohio. An emergency during a temporary absence, a
  bordering-state provider in usual local use, and endangered health need none.

**Packet-declared: no Ohio source addresses them**

`R-PA-MCOH-012` (genetic testing), `015` (DME and home-health orders), `016`
(behavioral health), `017` (transplant), and `018` (investigational
classification) run only when the packet itself establishes the workflow. The
test that asserted a "Medicaid-designated transplant-center routing" requirement
is replaced by one asserting Ohio imposes none.

Ten focused tests cover each statutory ground, the emergency and related-service
exceptions, the out-of-state circumstances, and the replaced pinned test.
ORC 5164.7514 and OAC 5160-1-11 are registered in the source ledger.

The source ledger contains 91 registered authorities: 45 fresh and 46 warning
by age, with no failures, source orphans, or coverage gaps. Rule citations
reference 240 distinct URLs, all among the 300 registered in the ledger and none
behind a sign-in wall. Of 876 PA rules, 823 are source-anchored. The 1,722-tile
catalog is unchanged.

Verification covers 1,309 PA-engine tests, 14,628 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
