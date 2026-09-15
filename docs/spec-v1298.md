# spec-v1298 — separate Highmark review workflows

Highmark rules 006–010 conflated distinct request stages and service programs.
Every inpatient admission inherited concurrent-review requirements, every
`7xxxx` radiology code became advanced imaging, arbitrary hospital-outpatient
surgery inherited site-of-care policy, and every physician-administered drug
was expected to carry an NDC.

The five rules now follow current Highmark workflow boundaries:

- `R-PA-HIGHMARK-006` runs only for an explicit concurrent-review or
  continued-stay request and independently checks current clinical and
  discharge updates. Initial admission requests pass.
- `R-PA-HIGHMARK-007` reflects Highmark's December 2025 move of RadCard review
  from eviCore to Highmark's Availity workflow. It is informational, recognizes
  explicit MRI, CT, PET, or nuclear-cardiology language, and excludes inpatient,
  emergency, and urgent-care imaging.
- `R-PA-HIGHMARK-008` remains a source-free informational completeness
  advisory because the reviewed general page does not publish one expedited
  criterion across every product and request type.
- `R-PA-HIGHMARK-009` runs only when the packet explicitly identifies
  outpatient-surgery site-of-care review under the applicable workflow. A
  generic hospital-outpatient surgery no longer inherits policies Z-109 or
  Z-129.
- `R-PA-HIGHMARK-010` asks for an NDC only when request-specific instructions
  explicitly require it. A generic J-code request passes.

Regression tests cover initial and concurrent inpatient review, imaging and
setting boundaries, expedited handling, explicit site review, and generic
versus explicitly required NDCs. Three current Highmark pages are added to the
source ledger, and all generated PA reports are refreshed.

The source ledger contains 91 registered authorities: 28 fresh and 63 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 133 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
