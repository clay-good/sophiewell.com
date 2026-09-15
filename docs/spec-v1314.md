# spec-v1314 — narrow IBX service and drug checks

Independence Blue Cross rules 006–010 mixed distinct utilization-management
workflows and inferred requirements from broad code or wording matches. They now
follow the current IBX manuals and program materials.

- Initial inpatient admissions no longer trigger concurrent-review requirements.
  Explicit continued-stay reviews check for the current clinical status,
  treatment plan, progress on goals, and discharge-plan update.
- The Carelon imaging check recognizes named advanced-imaging modalities instead
  of treating every `7xxxx` radiology code as advanced imaging. It excludes
  inpatient and emergency imaging and remains informational because self-funded
  groups can opt out of the program.
- Generic urgent or STAT wording no longer implies an expedited request. The
  informational clinical-rationale check runs only when the packet explicitly
  requests expedited authorization or review.
- Site-of-care review is limited to specialty drugs explicitly identified as
  subject to IBX's Most Cost-Effective Setting Program. Hospital-outpatient
  surgery does not trigger that program.
- A J-code alone no longer creates an unsupported NDC requirement. For an
  explicitly applicable medical-benefit drug precertification, the rule instead
  checks the member height and weight required by the current Provider Manual.

Regression tests cover each corrected boundary. The IBX source registration now
includes the current professional and hospital utilization-management manuals,
the Carelon request form, and the current Most Cost-Effective Setting drug list.
Generated PA reports and the SBOM are refreshed as part of release verification.

The source ledger contains 91 registered authorities: 32 fresh and 59 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 194 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
