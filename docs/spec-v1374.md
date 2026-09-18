# spec-v1374 — correct Ohio Medicaid clinical-review checks

Ohio publishes its prior-authorization rules as statute and administrative code
— ORC 5160.34 and OAC 5160-1-31 — rather than as a provider manual. Reading
them replaces two template rules with requirements Ohio actually states, and
leaves three packet-declared.

- `R-PA-MCOH-006` **changes subject, because Ohio's source has no inpatient
  content and does have an intake rule.** OAC 5160-1-31 says a paper
  prior-authorization request "cannot be processed" except as ORC 5160.34
  allows, and ORC 5160.34 requires electronic submission and provides that a
  facsimile is not a secure electronic transmission. A paper or fax request is
  acceptable only under the statute's financial-hardship or connectivity
  exception. The rule now checks that, and exempts the hardship case. The
  template's admission-notification content has no Ohio source.
- `R-PA-MCOH-008` follows the statutory definition of an urgent care service.
  ORC 5160.34 has two prongs: the routine timeframe could seriously jeopardize
  the life, health, or safety of the recipient or others due to the recipient's
  psychological state, **or**, in the opinion of a practitioner with knowledge of
  the recipient's condition, would subject the recipient to adverse health
  consequences without the care. The second prong means a practitioner's
  statement is itself sufficient, and a test asserts it. Urgent requests are
  answered within 48 hours against 10 calendar days.
- `R-PA-MCOH-007`, `009`, and `010` run only on packet-declared imaging,
  site-of-care, or NDC requirements; neither the statute nor the rule publishes
  those programs.

Eight focused tests cover the payer wiring, the fax and hardship cases, the
practitioner-opinion prong, and false-positive regressions. ORC 5160.34 and
OAC 5160-1-31 are registered in the source ledger.

## A gap this slice exposed

Rule `R-PA-MCOH-003` still carries the original intake template, claiming Ohio
accepts requests "by phone using the number on the member ID card" and asking
the packet to name its channel. The scan that built this program's queue looked
only for the 006–010 boilerplate, so it never saw the intake rules: **17 payers
still carry uncorrected rules 001–005**, including seven whose 006–020 were
corrected in v1353–v1373. Only Arkansas Blue Cross and Blue KC have all twenty
corrected. The intake rules are the next work.

The source ledger contains 91 registered authorities: 45 fresh and 46 warning
by age, with no failures, source orphans, or coverage gaps. Registering ORC
5160.34 and OAC 5160-1-31 moved the Ohio source to fresh. Its citations resolve
across 298 registered URLs, none behind a sign-in wall. Of 876 PA rules, 823 are
source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,295 PA-engine tests, 14,614 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
