# spec-v1354 — correct Blue Cross MN specialty-workflow checks

Blue Cross MN rules 011–015 inferred step therapy, delegated lab review,
drug-diagnosis, retrospective eligibility, and signed-order requirements from
broad codes or service labels. Unlike the payers before it, Blue Cross MN
publishes most of these programs — so three rules gain the specifics they were
missing rather than being narrowed away.

- `R-PA-BCBSMN-011` runs only when the packet establishes that step therapy
  applies. Blue Cross MN requires a subscriber to first try certain drugs as a
  prerequisite to a brand-name drug in the same category, and authorizes a
  published list of selected drugs; a J-code no longer implies either.
- `R-PA-BCBSMN-012` names the program that exists: the MN EviCore Genetic
  Testing (Molecular/Genetic Lab) Program, covering fully-insured and select
  self-insured commercial and Medicare Advantage members, reviewed by EviCore
  clinicians against Blue Cross medical policy and accepted up to 60 days from
  specimen collection. The unsourced "unique test identifier" requirement and
  the bare 81xxx trigger are gone.
- `R-PA-BCBSMN-013` names Prime MPS, which manages medical specialty drugs and
  chemotherapy for all lines of business. The advisory runs on a packet naming
  that workflow rather than on every injectable.
- `R-PA-BCBSMN-014` replaces an invented eligibility claim with the published
  window: retrospective clinical review is considered within 14 days of the date
  of service and before the claim is submitted, for scenarios such as
  after-hours urgent situations — 60 days from specimen collection for EviCore
  molecular lab.
- `R-PA-BCBSMN-015` asks for the plan of care on an explicit DME or home-health
  request, which is what the documentation standards call for, carrying the
  practitioner's date and legible signature. It is informational, because those
  standards govern the medical record rather than a DME-specific form.

Eleven focused tests cover false-positive regressions, incomplete explicit
workflows, and complete packets across the five rules.

The source ledger contains 91 registered authorities: 38 fresh and 53 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 288 registered URLs, none behind a sign-in wall. Of 876 PA
rules, 823 are source-anchored. The 1,722-tile catalog is unchanged.

Verification covers 1,109 PA-engine tests, 14,428 repository unit tests, and
459 MCP tests, all passing. Lint, accessibility, data integrity, and the
1,722-page production build also pass.
