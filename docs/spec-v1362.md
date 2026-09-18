# spec-v1362 — Michigan Medicaid clinical review, and a guard that disabled an overlay

Correcting Michigan Medicaid rules 006–010 produced a bug worth more than the
rules: a wrong payer guard silently disables an entire overlay, and nothing
fails.

## A payer guard that no packet can match

Every overlay rule self-gates on `bundle.payer !== '<id>'`. Writing that id from
the rule-id prefix — `mcmi`, for the `R-PA-MCMI-*` rules — instead of from
`lib/pa/payer.js`, where the id is `medicaid-mi`, makes the guard fire on every
packet in existence. All five rules return their vacuous pass, and **no test
fails**, because a pass is exactly what an off-payer packet is supposed to
produce. The overlay is dead and green.

A single assertion closes it: every `bundle.payer !== '...'` literal in
`lib/pa/rules.js` must name a member of `PAYER_BUCKETS`. It was written wrong
once first — `PAYER_BUCKETS` is an array of id strings, not objects — and then
negative-tested by reintroducing the `mcmi` guard, which it caught. All 39 other
guards across the ruleset are valid. The Michigan tests also open with an
assertion that a rule actually *fires*, rather than only that clean packets pass.

## Michigan Medicaid rules 006–010

- `R-PA-MCMI-006` follows the manual: all admissions other than **emergency**
  admissions require prior authorization, from the MDHHS Program Review Division
  for fee-for-service medical and surgical admissions, the health plan for an
  enrolled beneficiary, or the PIHP or CMHSP for every psychiatric admission.
  Admission notification is a CHAMPS roster transaction, not clinical packet
  content, so it no longer triggers the rule.
- `R-PA-MCMI-007` drops the claimed advanced-imaging program, which the manual
  does not describe. What it does say is that CT, MRI, and PET need Certificate
  of Need conditions met, that spine imaging is limited to one CT level or two
  MRI levels a day, and that "Providers should be directing the study at the
  area of the suspected problem" — which is what the check now asks for.
- `R-PA-MCMI-008` names the criteria Michigan added on 1 July 2026: a decision
  within 72 hours, and expedited review when the service falls within 10
  calendar days and delay risks life, health, or the ability to attain, maintain
  or regain maximum functional capacity; or it prevents deterioration or
  irreversible loss of function; or it is required for discharge on the
  submission date. A request that misses them is processed as a standard review,
  not denied, and the advisory says so.
- `R-PA-MCMI-009` runs only when the packet establishes a site-of-care
  requirement. The manual publishes none.
- `R-PA-MCMI-010` checks an NDC the packet already carries. Michigan's NDC rule
  governs the claim line, which rejects on invalid or missing NDC information or
  a manufacturer without a signed CMS rebate agreement.

Eleven focused tests cover the wiring assertion, the emergency-admission
exception, each expedited criterion, false-positive regressions, and complete
packets.

The source ledger contains 91 registered authorities: 41 fresh and 50 warning
by age, with no failures, source orphans, or coverage gaps. Registering the
Michigan Medicaid Provider Manual beside the agency landing page moved that
source to fresh. Its citations resolve across 291 registered URLs, none behind a
sign-in wall. Of 876 PA rules, 823 are source-anchored. The 1,722-tile catalog
is unchanged.

Verification covers 1,185 PA-engine tests, 14,504 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
