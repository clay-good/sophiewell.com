# spec-v1293 — correct HCSC intake checks

HCSC rules 001–005 treated useful workflow context as universal packet
requirements. They required every coded request to cite a Medical Policy,
treated one set of clinical-document roles as mandatory, expected the packet
to name its transport channel, and demanded an authorization number from the
initial request that was asking for authorization.

The five rules now reflect BCBSIL's current Commercial instructions:

- `R-PA-HCSC-001` is an informational policy-mapping aid. A policy reference
  helps when known, but BCBSIL's submission checklist does not require one in
  every request.
- `R-PA-HCSC-002` is informational because the required clinical material is
  request-specific. It recognizes a clinical note, medical-necessity letter,
  lab, imaging report, or pathology report without claiming one fixed type is
  universally mandatory.
- `R-PA-HCSC-003` always passes. BCBSIL routes requests through BlueApprovR,
  Availity, phone, or a delegated vendor, but packet content need not record
  that transport choice.
- `R-PA-HCSC-004` remains a non-enforcing reminder to check the member's
  eligibility response and current requirement list. The 2026 Commercial
  summary repeatedly says requirements depend on the member's benefit plan.
- `R-PA-HCSC-005` asks for a case or confirmation reference only when the
  packet says submission is already complete. An initial request passes.

Regression tests cover the broad advisory cases, recognized clinical
attachments, channel neutrality, the non-enforcing lookup reminder, and each
submission state. All generated PA reports are refreshed.

The source ledger contains 91 registered authorities: 27 fresh and 64 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 123 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
