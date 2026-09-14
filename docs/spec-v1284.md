# spec-v1284 — complete the Anthem rule audit

Anthem rules 016–020 completed the payer overlay with the same copied,
over-broad assumptions corrected in the preceding slices. Generic behavioral
health, transplant, off-label, appeal, and out-of-network language could all
produce findings that the reviewed Commercial sources did not support.

The final five rules now honor their actual boundaries:

- `R-PA-ANTHEM-016` is informational and applies only to an explicitly
  requested intensive behavioral-health level of care. It looks for a current
  clinical assessment, not a mandatory named scoring tool; Anthem says MCG use
  and local guideline adoption vary by plan.
- `R-PA-ANTHEM-017` no longer treats Blue Distinction routing as universal. It
  checks for a selected facility only when member-specific instructions say a
  designated transplant center is required.
- `R-PA-ANTHEM-018` no longer equates off-label use or clinical-trial
  participation with an Anthem investigational classification. When the packet
  explicitly records that classification, the rule asks for the controlling
  plan definition or policy. ADMIN.00005 itself says the member's plan
  definition controls benefit determinations.
- `R-PA-ANTHEM-019` is a source-free operational advisory. An explicit appeal
  should identify the determination being challenged, but Anthem's reviewed
  Commercial page does not publish one universal appeal-packet schema.
- `R-PA-ANTHEM-020` distinguishes ordinary out-of-network use from an explicit
  network-gap or continuity-of-care exception. Only the latter prompts for an
  access or treatment-continuity reason.

Regression tests cover generic and intensive behavioral-health requests,
explicit transplant-routing instructions, off-label and investigational
classification boundaries, appeal references, and ordinary versus exception
out-of-network workflows. Anthem's ADMIN.00005 and Commercial continuity-of-
care definition are registered in the source ledger, and all generated PA
audit reports are refreshed.

The source ledger contains 91 registered authorities: 24 fresh and 67 warning
by age, with no failures, source orphans, or coverage gaps. Its citations now
resolve across 110 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
