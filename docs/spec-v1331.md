# spec-v1331 — correct BCBST specialty checks

BlueCross BlueShield of Tennessee rules 011–015 previously inferred narrow
specialty-workflow requirements from broad drug, laboratory, post-service, and
equipment context. The third BCBST slice now follows the current specialty-drug
guide and request forms.

- A J-code or specialty-drug label no longer implies step therapy. An explicit
  step-therapy requirement still needs a preferred-product trial,
  contraindication / intolerance, or exception request.
- A broad 81xxx laboratory code no longer implies genetic testing. Explicit
  genetic requests are checked separately for test identity and indication.
- A generic J-code or infusion no longer triggers the provider-administered
  medication form check. The explicit workflow still requires a diagnosis.
- Generic post-service text no longer triggers a retrospective-authorization
  advisory. An explicit retro request is checked for its reason.
- DME requests no longer require a universally signed order. The informational
  check instead asks for the diagnosis and expected duration, prognosis,
  limitations, or ability to use the equipment described by current materials.

Fifteen focused tests cover the five rules, including false-positive
regressions and the explicit contexts that should still produce blocking or
informational findings. Generated PA reports, the source ledger bundle, and the
SBOM are refreshed during release verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning by
age, with no failures, source orphans, or coverage gaps. Its citations resolve
across 250 registered URLs. Of 876 PA rules, 823 are source-anchored. The
1,722-tile catalog is unchanged.

Verification covers 849 PA-engine tests, 14,164 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,164 of 14,164 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
