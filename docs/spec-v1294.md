# spec-v1294 — separate HCSC review workflows

HCSC rules 006–010 conflated several distinct workflows. Every inpatient
admission inherited concurrent-review requirements, every `7xxxx` radiology
code became advanced imaging, any hospital-outpatient surgery inherited a
site-of-care policy, and every physician-administered drug was expected to
carry an NDC.

The five rules now use narrower evidence:

- `R-PA-HCSC-006` runs only for an explicit continued-stay or concurrent-review
  request and asks for both a current clinical update and discharge planning.
  An initial inpatient admission does not inherit those later-stage fields.
- `R-PA-HCSC-007` is informational and recognizes explicit MRI, CT, PET, or
  nuclear-cardiology language rather than every radiology code. Inpatient,
  emergency, and urgent-care imaging are excluded from the outpatient check.
- `R-PA-HCSC-008` is a source-free informational advisory. An explicit
  expedited request should explain why standard handling is clinically unsafe,
  without claiming one universal BCBSIL Commercial criterion.
- `R-PA-HCSC-009` runs only when the packet names a site-of-care or
  site-of-service review. A generic hospital-outpatient surgery passes.
- `R-PA-HCSC-010` asks for an NDC only when request-specific instructions say
  it is required. A generic J-code no longer creates an NDC requirement.

Regression tests cover initial and continued inpatient review, radiology and
setting boundaries, expedited handling, explicit site review, and generic
versus explicitly required NDCs. All generated PA reports are refreshed.

The source ledger contains 91 registered authorities: 27 fresh and 64 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 123 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
