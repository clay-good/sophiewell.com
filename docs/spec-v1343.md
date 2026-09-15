# spec-v1343 — correct BCBSSC specialty-workflow checks

Blue Cross Blue Shield of South Carolina rules 011–015 previously inferred
step therapy, delegated laboratory review, specialty medical-drug review, and
home-services documentation requirements from broad codes or service labels.
This slice aligns them with BCBSSC's current provider guidance and removes an
unsupported retrospective-review eligibility claim.

- A J-code or generic drug request no longer implies step therapy. The
  prior-trial check runs only when the packet declares a step-therapy
  requirement and remains informational.
- An 81xxx code or generic genetic-test reference no longer implies Avalon
  program scope. An explicit delegated laboratory request is checked
  separately for both the requested test and its clinical indication.
- A J-code, injectable, or infusion no longer triggers the specialty
  medical-drug diagnosis check. The advisory runs only when the packet names
  BCBSSC's applicable medical-benefit drug workflow.
- The retrospective check no longer claims that BCBSSC universally limits
  review to specific circumstances. For an explicit retrospective request, it
  asks only for the request-specific reason the service preceded authorization
  and notes that eligibility still requires member-specific verification.
- DME, home-health text, and E/K codes no longer imply an IHCS workflow or a
  universal signed-order requirement. An explicit IHCS request is checked for
  an attached prescription, medical order, or discharge document.

Fourteen focused tests cover false-positive regressions, incomplete explicit
workflows, and complete packets across the five rules. Generated PA reports
and the SBOM are refreshed during release verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 282 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 992 PA-engine tests, 14,307 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,307 of 14,307 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
