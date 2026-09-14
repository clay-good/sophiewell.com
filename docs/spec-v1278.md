# spec-v1278 — scope UnitedHealthcare clinical workflow checks

UnitedHealthcare rules 006–010 previously collapsed distinct operational
workflows into broad packet requirements. They treated any inpatient mention as
both admission notification and concurrent review, applied an outpatient
radiology rule without checking setting or plan exclusions, cited a generic
page for expedited-review criteria, inferred surgical site-of-service review
from any hospital-outpatient CPT, and presented an NDC claim requirement as a
prior-authorization requirement.

The rules now follow UnitedHealthcare's current program documents:

- `R-PA-UHC-006` separately checks admission-notification status and the
  clinical and discharge updates needed only in a continued-stay or concurrent
  review. It is informational because the 2026 Administrative Guide lists
  plans and delegated arrangements that use separate protocols.
- `R-PA-UHC-007` applies only to named advanced imaging in an outpatient or
  office setting. It excludes emergency, urgent-care, observation, and
  inpatient settings and does not require CT, MRI, or MRA authorization for a
  Medicare Advantage packet. Missing clinical-review material is advisory
  because UnitedHealthcare says it may request that information when review
  applies.
- `R-PA-UHC-008` retains its flag. The 2026 Administrative Guide explicitly
  requires an expedited request to explain clinical urgency and provide the
  required clinical information that day.
- `R-PA-UHC-009` runs only when the packet establishes that UnitedHealthcare's
  applicable-code site-of-service review applies. It no longer assumes every
  hospital-outpatient surgical code is in scope, and it recognizes the
  patient-risk and ASC-access rationale families in the policy.
- `R-PA-UHC-010` is now an informational claim-handoff check. The cited
  reimbursement policy requires an 11-digit NDC on professional and outpatient
  facility drug claims; it does not make that identifier a prerequisite for
  every physician-administered-drug authorization request.

Regression tests cover initial versus concurrent inpatient review, excluded
imaging settings and Medicare Advantage CT, supported expedited review,
explicit versus inferred site-of-service scope, and prior-authorization versus
claim NDC handling. The source ledger now registers the 2026 radiology FAQ,
outpatient-surgery site-of-service policy, and NDC reimbursement policy. All 46
generated PA audit reports are updated.

The source ledger contains 91 registered authorities: 22 fresh and 69 warning
by age, with no failures, source orphans, or coverage gaps. Its citations now
resolve across 100 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
