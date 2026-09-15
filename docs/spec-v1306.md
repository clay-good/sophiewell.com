# spec-v1306 — narrow BCBS Michigan service checks

BCBS Michigan rules 006–010 inferred specialized requirements from broad
inpatient, imaging, urgent, surgery, and J-code text. They now match BCBSM's
current workflow-specific materials.

- `R-PA-BCBSM-006` checks attachments only for an explicit pended inpatient
  clinical review or extension workflow, because requirements vary by case,
  product, and facility arrangement.
- `R-PA-BCBSM-007` is limited to an identified outpatient high-tech radiology
  request and no longer treats every `7xxxx` code as covered imaging.
- `R-PA-BCBSM-008` requires an explicit expedited authorization request and
  no longer interprets generic urgent or STAT wording as that workflow.
- `R-PA-BCBSM-009` is limited to an explicit TurningPoint site-of-care review
  for select hip or knee surgery; generic hospital surgery does not trigger it.
- `R-PA-BCBSM-010` no longer treats NDC billing guidance as a universal
  authorization-packet requirement. It advises only when the packet explicitly
  says the authorization workflow requires an NDC.

Regression tests cover each generic-category boundary and each explicit
workflow. The source ledger adds BCBSM's current inpatient FAQ, radiology page,
BCN Advantage manual, musculoskeletal FAQ, and medical-drug resources. All
generated PA reports are refreshed.

The source ledger contains 91 registered authorities: 30 fresh and 61 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 162 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
