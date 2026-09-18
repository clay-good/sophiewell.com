# spec-v1357 — Louisiana Blue specialty workflows, and five tests that asserted nothing

Correcting Louisiana Blue rules 011–015 turned up a test-helper defect that had
been quietly disarming payer tests across three overlays.

## Five tests asserted nothing

`bundleOf` in the PA engine test suite takes **text blocks** — a string, or an
array of strings — and builds one document per block. Five call sites passed a
document object instead: `bundleOf({ documents: [...] })`. That object reaches
`String(d.text)` and becomes the literal `"[object Object]"`.

The consequence is total. Payer detection returns `unknown`, so every
`bundle.payer !== '<payer>'` guard fires and the rule under test returns its
vacuous pass. Document roles all become `other`, so any check for an attached
clinical note sees none. Five tests — covering Arkansas, Blue KC, and Louisiana
Blue attachment and retrospective checks — asserted nothing at all and stayed
green.

All five now pass text blocks, and the roles and payer they intended are real:
`payer=arkbcbs`, `roles=pa-form,clinical-note`. `bundleOf` now throws a
`TypeError` naming the misuse when handed anything but a string, so the next
call site fails loudly at the point of error instead of turning into a false
pass. A test asserts both throw shapes.

## Louisiana Blue rules 011–015

- `R-PA-BCBSLA-011` runs only when the packet establishes step therapy applies,
  and accepts either arm of the published program: a Step 1 drug tried within
  the select class, or Step 1 drugs being clinically inappropriate.
- `R-PA-BCBSLA-012` names the program that exists. Genetic and molecular testing
  is on Louisiana Blue's authorization list and is a utilization-management
  program service authorized through the Carelon MBM Provider Portal. The
  unsourced unique-test-identifier requirement and the bare 81xxx trigger are
  gone.
- `R-PA-BCBSLA-013` asks for the supporting diagnosis only when the packet names
  a drug authorization workflow. Louisiana Blue routes targeted medical-benefit
  drugs through Express Scripts and handles the rest itself.
- `R-PA-BCBSLA-014` replaces an invented eligibility claim with the published
  procedure: upload the medical records **and** the Retrospective Review
  Authorization Form through iLinkBlue, do not submit a retrospective request
  once a claim is filed, and note that availability depends on the member's
  policy — some apply penalties for missing prior authorization and some do not
  cover the service without it.
- `R-PA-BCBSLA-015` asks for the clinical information Louisiana Blue requires
  with a home-health or DME request, an InterQual criteria review among the
  accepted routes. The separate signed-and-dated written-order rule is dropped;
  the manual publishes none.

Nine focused tests cover the five rules, plus one for the helper guard.

The source ledger contains 91 registered authorities: 39 fresh and 52 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 289 registered URLs, none behind a sign-in wall. Of 876 PA
rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,136 PA-engine tests, 14,455 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
