# spec-v1316 — correct final IBX packet checks

Independence Blue Cross rules 016–020 previously converted broad behavioral
health, transplant, off-label, appeal, and out-of-network language into
requirements that the cited general policy page did not establish. They now
track the current IBX guidance directly.

- The behavioral-health rule is scoped to current ABA authorization requests
  and checks for both the current ABA form and supporting documents.
- Blue Distinction remains a useful quality designation, but it is no longer
  treated as a universal transplant routing or attachment requirement.
- Experimental/investigational review requires an explicit classification
  anchor. Off-label or generic clinical-trial language alone does not trigger
  the rule, and the evidence check follows the manual's reliable-evidence and
  accepted-compendium criteria.
- The appeal rule runs only when a provider files a member appeal and checks
  the manual's signed-consent and supporting-record requirements. Grievances
  and other appeal paths are not conflated with that workflow.
- Out-of-network referral criteria run only for HMO and PCP-referred POS
  requests. Generic and PPO out-of-network requests no longer receive a
  network-gap warning.

Regression tests cover each corrected positive and negative boundary. The IBX
source registration adds the current ABA transition notice, Blue Distinction
quality page, and Appeals manual. Generated PA reports and the SBOM are
refreshed as part of release verification.

The source ledger contains 91 registered authorities: 32 fresh and 59 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 202 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 693 PA-engine tests, 14,008 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,008 of 14,008 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
