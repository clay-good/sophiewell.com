# spec-v1320 — correct final CareFirst workflow checks

CareFirst rules 016–020 previously generalized product guidance into
universal behavioral-health, transplant, investigational, appeal, and
out-of-network packet requirements. They now follow the scope of the current
official sources.

- Behavioral-health review no longer demands level-of-care criteria for every
  mental-health request. The rule checks the published treatment-setting field
  only for an explicit ASAM level 3.7 detoxification request.
- Transplant review no longer requires Blue Distinction language or a
  transplant-center evaluation in every packet. CareFirst publishes a
  dedicated submission route, but not those universal packet fields.
- Off-label and clinical-trial language no longer triggers the experimental /
  investigational rule. An explicit classification receives an informational
  reminder to identify its applicable policy or coverage determination.
- Appeal review independently checks for the original denial and the clinical
  rationale. It no longer claims that the supporting information must be new.
- Out-of-network justification is limited to BlueChoice requests, matching the
  current form. Other CareFirst products may include out-of-network benefits.

Regression tests cover each corrected scope, trigger, severity, and passing
path. The source ledger registers CareFirst's current behavioral-health
disclosure, utilization-management form, transplant-network description,
provider appeal checklist, and product guide. Generated PA reports and the
SBOM are refreshed as part of release verification.

The source ledger contains 91 registered authorities: 33 fresh and 58 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 216 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 733 PA-engine tests, 14,048 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,048 of 14,048 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
