# spec-v1350 — correct Blue KC specialty-workflow checks

Blue KC rules 011–015 inferred step therapy, delegated laboratory review,
drug-diagnosis, retrospective eligibility, and signed-order requirements from
broad codes or service labels. Two of them described programs the published
guide does not contain at all.

- `R-PA-BLUEKC-011` runs only when the packet establishes that step therapy
  applies. Blue KC attaches step therapy to a published list of medications and
  classes, so a J-code, infusion, or specialty-drug label no longer implies it.
- `R-PA-BLUEKC-012` no longer asserts a delegated laboratory or genetic-testing
  prior-authorization program. The guide describes none, so the check runs only
  when the packet identifies such a workflow and asks for the test and its
  indication. The 81xxx trigger is gone.
- `R-PA-BLUEKC-013` asks for the supporting diagnosis only when the packet
  names a specialty-medication or drug prior-authorization workflow. Blue KC
  routes specialty drugs through designated pharmacies under the pharmacy
  benefit rather than one universal diagnosis rule for every injectable.
- `R-PA-BLUEKC-014` corrects a category error. Blue KC's retrospective review
  is its own review after care, assessing reimbursement levels, consistency,
  and adjudication — not a provider request path with published eligibility
  criteria. The advisory now runs on an explicit post-service authorization
  request, asks for its reason, and claims no eligibility.
- `R-PA-BLUEKC-015` asks for the ordering document on an explicit DME or
  home-health request. The separate signed-and-dated written-order requirement
  is dropped: the guide publishes none, and Blue KC has in fact dropped the
  Certificate of Medical Necessity for infusion claims.

Eleven focused tests cover false-positive regressions, incomplete explicit
workflows, and complete packets across the five rules.

The source ledger contains 91 registered authorities: 37 fresh and 54 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 288 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 1,074 PA-engine tests, 14,389 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
