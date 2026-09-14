# spec-v1286 — scope Cigna clinical checks

Cigna rules 006–010 combined distinct workflows and extended narrow policies
beyond their published scope. An initial inpatient request could be treated as
an admission notification and concurrent review, any `7xxxx` radiology code
could trigger an EviCore imaging finding, all outpatient surgery could inherit
a site-of-care policy, and every physician-administered drug could be treated
as requiring an NDC.

The corrected rules follow the current Commercial materials:

- `R-PA-CIGNA-006` enforces Cigna's one-business-day reporting requirement only
  for an explicitly documented emergency service resulting in inpatient
  admission. It no longer asks an initial elective request for progress or
  discharge-plan material.
- `R-PA-CIGNA-007` is an informational clinical-indication check for explicit
  MRI, CT, PET, or nuclear-cardiology requests. It no longer infers advanced
  imaging from every radiology CPT, and it acknowledges member-specific EviCore
  delegation.
- `R-PA-CIGNA-008` is a source-free informational advisory because the reviewed
  Commercial page does not publish a universal expedited-review packet schema.
- `R-PA-CIGNA-009` now implements the actual boundary of Medical Coverage
  Policy 0550: MRI, MRA, CT, or CTA at a hospital-based imaging facility. It is
  informational, recognizes the policy's listed rationales, and does not apply
  to generic outpatient surgery.
- `R-PA-CIGNA-010` is a source-free informational check that runs only when the
  packet or member-specific instructions explicitly require an NDC.

Regression tests cover initial versus emergency inpatient workflows, explicit
advanced imaging versus other radiology, urgent requests, outpatient surgery,
hospital-based imaging with and without a Policy 0550 rationale, and generic
versus explicitly NDC-required drug requests. Policy 0550 is registered in the
source ledger, and all generated PA audit reports are refreshed.

The source ledger contains 91 registered authorities: 25 fresh and 66 warning
by age, with no failures, source orphans, or coverage gaps. Its citations now
resolve across 113 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
