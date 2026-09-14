# spec-v1282 — scope Anthem clinical workflow checks

Anthem rules 006–010 previously generalized familiar prior-authorization
patterns beyond the reviewed Commercial sources. They treated every inpatient
request as a concurrent review, inferred Carelon review from every advanced-
imaging request, imposed unsupported universal expedited and NDC requirements,
and misdescribed CG-SURG-10 as a hospital-outpatient-versus-ASC policy.

The rules now stay within the evidence:

- `R-PA-ANTHEM-006` is an informational check only for an explicit concurrent
  or continued-stay review. An initial inpatient request no longer needs a
  premature progress or discharge update.
- `R-PA-ANTHEM-007` runs only when the packet establishes that Carelon imaging
  review applies to the outpatient request. An MRI or a `7xxxx` radiology code
  alone no longer establishes program scope.
- `R-PA-ANTHEM-008` is a source-free operational advisory. It asks an
  explicitly urgent request to explain its urgency without presenting a
  universal Anthem Commercial criterion.
- `R-PA-ANTHEM-009` now implements the published CG-SURG-10 boundary: when the
  packet says that guideline applies, it looks for the procedure, anesthesia,
  monitoring, recovery, or patient-condition reason an ambulatory or outpatient
  surgery-center facility is needed instead of an office. It no longer invents
  a hospital-outpatient-versus-ASC rule.
- `R-PA-ANTHEM-010` is also source-free and informational. It checks for an
  actual 10- or 11-digit product code only when member-specific instructions
  explicitly require an NDC; a generic J-code request passes.

Regression tests cover initial and concurrent inpatient workflows, inferred
versus explicit Carelon scope, complete and incomplete urgent requests, the
exact CG-SURG-10 applicability boundary, and explicit NDC requirements. The
official CG-SURG-10 page is registered in the source ledger, and all generated
PA audit reports are refreshed.

The source ledger contains 91 registered authorities: 24 fresh and 67 warning
by age, with no failures, source orphans, or coverage gaps. Its citations now
resolve across 107 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
