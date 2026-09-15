# spec-v1330 — correct BCBST service-review checks

BlueCross BlueShield of Tennessee rules 006–010 previously inferred narrow
administrative requirements from broad inpatient, radiology, urgency, facility,
and drug context. The second BCBST slice now follows the current commercial
manual and high-tech imaging form.

- Initial inpatient authorization no longer requires concurrent-review data.
  Only an explicit concurrent or continued-stay request is checked for a current
  clinical update.
- The high-tech imaging check recognizes named MRI, CT, PET, MRA, and nuclear
  cardiac requests without treating every 7xxxx radiology CPT as high tech. It
  does not run in inpatient, emergency, or urgent-care settings.
- Generic urgent or STAT clinical language no longer requests expedited review.
  Explicit expedited requests still require the clinician's serious-jeopardy
  justification.
- Hospital-outpatient surgery no longer implies a universal freestanding-site
  rule. An informational rationale check runs only when the packet explicitly
  declares a site-of-care requirement or review.
- A J-code no longer implies a universal NDC field in an authorization packet.
  An informational NDC check runs only when the packet declares it required.

Sixteen focused tests cover the five rules, including false-positive
regressions and the explicit contexts that should still produce blocking or
informational findings. Generated PA reports, the source ledger bundle, and the
SBOM are refreshed during release verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning by
age, with no failures, source orphans, or coverage gaps. Its citations resolve
across 246 registered URLs. Of 876 PA rules, 823 are source-anchored. The
1,722-tile catalog is unchanged.

Verification covers 834 PA-engine tests, 14,149 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,149 of 14,149 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
