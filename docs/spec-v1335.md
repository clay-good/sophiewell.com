# spec-v1335 — correct BCBSMA pharmacy and specialty checks

Blue Cross Blue Shield of Massachusetts rules 011–015 previously inferred
program requirements from broad code and service categories. This slice now
matches the current medication form, Carelon genetic-testing instructions, and
outpatient cancer-program materials.

- Step therapy is established only by an explicit requirement or exception,
  not by a J-code or specialty-drug label. An identified requirement remains an
  informational reminder for prior therapy or an exception rationale.
- The Carelon genetic check no longer treats every `81xxx` code as in scope. An
  explicit genetic-testing request must separately identify the test,
  performing laboratory, and clinical indication.
- The diagnosis check runs only for an identified outpatient oncology
  authorization request. A generic infusion, injectable, or J-code does not
  establish cancer-program scope.
- The retrospective-review check accepts any documented case-specific reason
  instead of implying that only a short, unsupported list of reasons qualifies.
- DME, home-health, and E/K-code context no longer creates a universal signed
  order requirement. The informational signature check runs only when the
  packet explicitly declares that requirement.

Fifteen focused tests cover the five rules, including false-positive
regressions and each explicit actionable context. Generated PA reports, the
source ledger bundle, and the SBOM are refreshed during release verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 262 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 901 PA-engine tests, 14,216 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,216 of 14,216 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
