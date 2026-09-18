# spec-v1360 — correct HMSA specialty-workflow checks

HMSA rules 011–015 inferred step therapy, delegated lab review, drug-diagnosis,
retrospective eligibility, and signed-order requirements from broad codes. Its
Provider Manual for Prior Authorization names the programs that actually exist,
so two rules gain their real vendor and scope.

- `R-PA-HMSA-011` runs only when the packet establishes step therapy applies.
  The manual routes pharmacy-benefit drugs to CVS Caremark and publishes no
  step-therapy requirement of its own.
- `R-PA-HMSA-012` names Avalon Healthcare Solutions, HMSA's genetic testing
  management partner, which reviews against HRS-432 — the Hawaii state statute
  for medical necessity — and the genetic testing medical policies.
  Precertification is required across all lines of business: commercial,
  Medicare, and QUEST Integration. The bare 81xxx trigger is gone.
- `R-PA-HMSA-013` names CVS Specialty Guideline Management, which reviews most
  medical specialty drugs, with selected drugs reviewed by HMSA and marked in
  the policy index. The advisory runs on a packet naming that workflow rather
  than on every injectable.
- `R-PA-HMSA-014` corrects the same category error Blue KC had. HMSA's
  retrospective review is its own: *"HMSA may conduct concurrent or
  retrospective reviews to confirm that services meet clinical and payment
  criteria. Providers must maintain supporting documentation in the medical
  record and make it available upon request."* That is a payer-initiated review
  with a record-keeping duty, so the advisory asks an explicit post-service
  request for its documentation and claims no eligibility.
- `R-PA-HMSA-015` asks for the clinical assessment on an explicit DME or
  home-health precertification request — HMSA publishes a Home Health Assessment
  request for QUEST Integration. The separate signed-order rule is dropped.

Ten focused tests cover false-positive regressions, incomplete explicit
workflows, and complete packets across the five rules.

The source ledger contains 91 registered authorities: 40 fresh and 51 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 290 registered URLs, none behind a sign-in wall. Of 876 PA
rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,164 PA-engine tests, 14,483 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
