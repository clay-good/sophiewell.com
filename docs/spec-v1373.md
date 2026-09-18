# spec-v1373 — finish Washington Apple Health: specialty workflows

This closes the Washington Apple Health overlay, the tenth payer in the program.
Rules 011–015 draw on HCA's Inpatient Hospital Services and Home Health Services
billing guides; three topics those guides do not cover stay packet-declared, and
their citations say so rather than borrowing another payer's program.

- `R-PA-MCWA-011`, `012`, and `013` — step therapy, a genetic-testing program,
  and a universal drug-diagnosis rule — appear in neither guide. Each now runs
  only when the packet itself establishes the workflow, and none infers one from
  a J-code or an 81xxx code.
- `R-PA-MCWA-014` follows HCA's actual retroactive intake, which is the same as
  prior authorization: ProviderOne direct data entry, or the written or fax
  process opening with form HCA 13-835, with the medical justification. The guide
  publishes no separate list of qualifying circumstances, so the check invents
  none.
- `R-PA-MCWA-015` follows the home health guide: the client record must document
  the face-to-face encounter required by **WAC 182-551-2040** and all orders,
  with new or changed orders signed by an authorized practitioner. Because these
  are record requirements HCA can request, the check is informational — and it
  exempts home health delivered through telemedicine, which HCA says needs no
  prior authorization.

Eight focused tests cover the telemedicine exemption, the face-to-face citation,
the retroactive intake, and false-positive regressions. The HCA Home Health
Services billing guide is registered in the source ledger.

The source ledger contains 91 registered authorities: 44 fresh and 47 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 296 registered URLs, none behind a sign-in wall. Of 876 PA
rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,287 PA-engine tests, 14,606 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
