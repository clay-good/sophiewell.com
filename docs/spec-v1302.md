# spec-v1302 — narrow Florida Blue service-specific checks

Florida Blue rules 006–010 extended limited workflows to unrelated requests.
They could require admission and discharge material on an initial inpatient
request, classify every radiology CPT as advanced imaging, apply an expedited
appeal standard to an initial authorization, enforce site review for every
surgery, or require an NDC for every J-code.

The five rules now follow Florida Blue's current, request-specific materials:

- `R-PA-FLBLUE-006` separates initial admission from an explicit continued-stay
  request. Only the latter receives an informational clinical- and
  discharge-update check.
- `R-PA-FLBLUE-007` applies only to named advanced imaging in an outpatient
  hospital or office and excludes inpatient, emergency, and observation care.
  Missing clinical rationale is informational.
- `R-PA-FLBLUE-008` reflects the provider manual's published expedited-review
  standard for pre-service appeals and concurrent-care extensions instead of
  applying it to every urgent initial authorization.
- `R-PA-FLBLUE-009` runs only when the packet explicitly establishes that the
  designated-procedure site-of-care program applies. A hospital-outpatient
  request then needs one of the program's documented exceptions.
- `R-PA-FLBLUE-010` no longer infers a universal NDC requirement from a J-code.
  It checks the value only when request-specific instructions require one.

Regression tests cover generic-category boundaries, excluded settings,
incomplete explicit workflows, and complete packets for all five rules. Three
current Florida Blue and GuideWell resources are added to the source ledger,
and all generated PA reports are refreshed.

The source ledger contains 91 registered authorities: 29 fresh and 62 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 149 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
