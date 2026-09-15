# spec-v1334 — correct BCBSMA service-review checks

Blue Cross Blue Shield of Massachusetts rules 006–010 previously expanded
program guidance and claims requirements into broad authorization-packet
findings. The second BCBSMA slice now follows the current authorization pages,
Carelon routing guidance, and Massachusetts medication request form.

- Initial inpatient requests no longer trigger a continued-stay documentation
  finding. The advisory runs only for an explicit concurrent-review or
  additional-days request.
- A radiology CPT alone no longer makes a request subject to the Carelon
  high-tech imaging check, and explicit inpatient imaging is excluded. An
  explicit outpatient MRI, CT, PET, or nuclear-cardiology request still needs a
  clinical indication.
- The expedited or urgent designation is recognized as the workflow
  attestation used by the current form; a duplicate urgency narrative is not
  required inside the packet.
- A hospital place of service and surgical CPT no longer imply a universal
  site-of-care exception. The informational rationale check runs only when the
  packet explicitly requests a hospital-outpatient site exception.
- The medication rule now checks the form's requested medication, strength,
  quantity, dosing schedule, and therapy length. It no longer treats an NDC,
  which belongs to a separate claims-format context, as a universal
  authorization requirement.

Fifteen focused tests cover the five rules, including the false-positive
regressions and the explicit contexts that remain actionable. Generated PA
reports, the source ledger bundle, and the SBOM are refreshed during release
verification.

The source ledger contains 91 registered authorities: 36 fresh and 55 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 260 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.

Verification covers 886 PA-engine tests, 14,201 repository unit tests, and 459
MCP tests. The localhost-only D1 test passes when run outside the filesystem
sandbox, making the effective unit result 14,201 of 14,201 passing. Lint,
accessibility, data integrity, and the 1,722-page production build also pass.
