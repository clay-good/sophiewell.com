# spec-v1297 — correct Highmark intake checks

Highmark rules 001–005 treated helpful workflow context as universal packet
requirements. They required every coded request to cite a coverage policy,
treated one set of clinical-document roles as mandatory, expected the packet
to name its transport channel, and demanded an authorization number from the
initial request that was asking for authorization.

The five rules now follow Highmark's current authorization workflow:

- `R-PA-HIGHMARK-001` is an informational policy-mapping aid. Highmark uses
  Medical Policies and MCG guidelines, but its submission instructions do not
  require every packet to cite one.
- `R-PA-HIGHMARK-002` is informational because supporting documentation is
  request-specific. It recognizes a clinical note, medical-necessity letter,
  lab, imaging report, or pathology report without claiming one fixed type is
  universally mandatory.
- `R-PA-HIGHMARK-003` always passes. Highmark directs initial requests through
  Availity and later-stage work through the applicable workflow, but packet
  content need not record that transport choice.
- `R-PA-HIGHMARK-004` remains a non-enforcing reminder to check the current
  coding list, eligibility, benefits, and member contract. Highmark says its
  published list is not all-inclusive and requirements can vary.
- `R-PA-HIGHMARK-005` asks for a case or confirmation reference only when the
  packet says submission is complete. An initial request passes.

Regression tests cover policy-reference boundaries, recognized clinical
attachments, channel neutrality, the member-specific lookup reminder, and
initial, submitted, and confirmed request states. The Highmark source is
re-verified and two supporting official pages are added to the ledger. All
generated PA reports are refreshed.

The source ledger contains 91 registered authorities: 28 fresh and 63 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 130 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
