# spec-v1290 — separate Humana review workflows

Humana rules 006–010 conflated distinct authorization workflows and inferred
requirements more broadly than the current provider materials support. An
initial inpatient request was treated like a concurrent review, every 7xxxx
radiology code was treated as advanced imaging, every hospital-outpatient
surgery was presumed subject to site-of-care review, and every J-code request
was expected to include an NDC.

The five rules now honor explicit workflow boundaries:

- `R-PA-HUMANA-006` is a source-free informational completeness check that
  runs only for an explicit continued-stay request. Initial inpatient requests
  no longer require concurrent-review progress or discharge content.
- `R-PA-HUMANA-007` is informational and triggers only on advanced-imaging
  language, not the full 7xxxx radiology range. Humana says Cohere generally
  manages advanced imaging, with state, plan, and delegation exceptions, and
  asks for clinical rationale and supporting documentation.
- `R-PA-HUMANA-008` is a source-free informational check. An explicitly
  expedited request should explain why standard handling is clinically unsafe,
  without claiming one universal Commercial packet rule.
- `R-PA-HUMANA-009` no longer infers a site-of-care mandate from a surgical CPT
  and POS 19 or 22. It asks for a rationale only when the packet explicitly
  identifies a site-of-care review.
- `R-PA-HUMANA-010` no longer requires an NDC for every J-code. It checks for an
  NDC-shaped value only when the packet explicitly says an NDC is required;
  Humana publishes different drug workflows and forms by product and state.

Regression tests cover initial versus continued-stay review, advanced imaging
versus other radiology, complete and incomplete expedited requests, generic
hospital-outpatient surgery versus explicit site review, and generic J-codes
versus explicit NDC instructions. The Humana fixture narrative now reflects
the corrected site-of-care boundary, the current prior-authorization search
tool is registered in the source ledger, and all generated PA reports are
refreshed.

The source ledger contains 91 registered authorities: 26 fresh and 65 warning
by age, with no failures, source orphans, or coverage gaps. Its citations now
resolve across 121 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
