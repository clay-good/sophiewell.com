# spec-v1327 — correct Horizon BCBSNJ specialty checks

Horizon Blue Cross Blue Shield of New Jersey rules 011–015 previously applied
drug, laboratory, retrospective-review, and order requirements more broadly than
the reviewed public guidance supports. The rules now preserve useful packet
checks without treating member- and service-specific workflow as universal.

- A J-code, specialty-drug phrase, or nonpreferred-drug phrase no longer proves
  that step therapy applies. When the packet explicitly confirms step therapy,
  the informational check accepts either prior drug use or an exception reason,
  matching Prime Therapeutics' definition without inventing failure-duration
  requirements.
- Genetic testing no longer triggers on every `81xxx` pathology/laboratory CPT.
  The code trigger is limited to molecular pathology and multianalyte assay
  ranges, and test identity is checked separately from clinical indication.
- A J-code, injectable, biologic, or generic infusion no longer automatically
  becomes a specialty- or oncology-drug review. An explicit specialty-drug
  context may receive an informational diagnosis prompt, while member- and
  drug-specific policy selection remains external.
- Generic post-service wording no longer implies a retrospective authorization
  request. Only an explicit retrospective authorization or review request is
  checked for a request-specific reason.
- DME, home-health wording, and E/K codes no longer imply one universal signed
  order requirement. A signature prompt appears only when the packet declares
  that a supporting order or plan of care is required for that request.

The Horizon golden fixture description now matches the corrected overlay: its
hospital-outpatient setting does not itself assert site-of-care review. Fifteen
focused tests cover the five specialty rules. Generated PA reports and the SBOM
are refreshed as part of release verification.

The source ledger contains 91 registered authorities: 35 fresh and 56 warning by
age, with no failures, source orphans, or coverage gaps. Its citations resolve
across 240 registered URLs. Of 876 PA rules, 823 are source-anchored. The
1,722-tile catalog is unchanged.

Verification covers 801 PA-engine tests, 14,116 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,116 of 14,116 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
