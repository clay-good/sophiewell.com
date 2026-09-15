# spec-v1332 — correct BCBST complex-case checks

BlueCross BlueShield of Tennessee rules 016–020 previously inferred narrow
complex-case workflows from broad behavioral-health, transplant, research,
appeal, and out-of-network language. The final BCBST slice now follows the
current request and appeal forms.

- Generic behavioral-health text no longer implies a higher-level psychiatric
  request. An explicit psychiatric authorization checks for presenting acuity
  and safety-risk findings.
- A transplant request no longer requires a universal Blue Distinction routing
  statement. It checks for the history and physical and psychosocial evaluation
  named by the current Commercial/FEP form.
- Experimental, off-label, or clinical-trial wording no longer triggers an
  evidence check. An explicit medical-policy appeal requires attached full-text,
  peer-reviewed research.
- Generic appeals and reconsiderations no longer trigger the commercial
  utilization-management workflow. An explicit UM appeal checks for its denial
  letter and required clinical documentation.
- Out-of-network wording alone no longer requires a network-gap narrative. The
  informational check applies when an out-of-network source requests in-network
  benefits and asks for the attached rationale specified by the form.

Sixteen focused tests cover the five rules, including false-positive
regressions and the explicit contexts that should still produce blocking or
informational findings. Generated PA reports, the source ledger bundle, and the
SBOM are refreshed during release verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning by
age, with no failures, source orphans, or coverage gaps. Its citations resolve
across 255 registered URLs. Of 876 PA rules, 823 are source-anchored. The
1,722-tile catalog is unchanged.

Verification covers 863 PA-engine tests, 14,178 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,178 of 14,178 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
