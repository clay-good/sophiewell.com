# spec-v1271 — scope behavioral-health packet checks to their authorities

The behavioral-health overlay previously treated a mixed APA, ASAM, and Joint
Commission citation as permission to impose four broad packet requirements.
That could flag an otherwise valid request for omitting a literal DSM citation,
a treatment plan on an initial request, ASAM level-of-care detail for non-
addiction care, or a combined suicide, homicide, and self-harm assessment based
only on a behavioral code.

The five-rule family now keeps each authority inside its documented boundary:

- `R-PA-BH-001` still requires an ICD-10-CM `F` code when a behavioral CPT is
  present, but no longer invents a requirement to cite DSM-5-TR in the packet.
- `R-PA-BH-002` is an informational, source-free completeness reminder only
  when the packet explicitly requests reauthorization or continued services.
- `R-PA-BH-003` uses ASAM only for an explicit step-up request with an `F10`-
  `F19` substance-use diagnosis. It looks for both the current or prior level
  and a reassessment or clinical-rationale anchor, and reports only information.
- `R-PA-BH-004` uses the Joint Commission's primary-reason-for-care scope and
  asks for a validated suicide-screening anchor, not a universal combined risk
  assessment inferred from a code.
- `R-PA-BH-005` retains the SAMHSA split added in v1270: methadone for opioid
  use disorder needs an OTP anchor, while buprenorphine has no federal
  X-waiver requirement and naltrexone does not inherit the methadone rule.

APA DSM classification, ASAM Criteria, Joint Commission suicide screening, and
SAMHSA medication treatment now have separate machine-readable source entries.
Tests pin every scope boundary and the positive evidence paths. The generated
browser ledger, PA audit snapshots, and SBOM are refreshed together. The source
ledger contains 87 registered authorities: 19 fresh and 71 warning by age, with
no failures, source orphans, or coverage gaps. The 1,722-tile catalog and
876-rule PA surface are unchanged.
