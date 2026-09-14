# spec-v1288 — complete the Cigna rule audit

Cigna rules 016–020 completed the payer overlay audit by removing broad
assumptions from behavioral-health, transplant, investigational, appeal, and
out-of-network workflows.

- `R-PA-CIGNA-016` is informational and applies only to facility-based
  behavioral-health requests. It asks for a clinical assessment rather than a
  named score; routine outpatient care and some PHP/IOP requirements vary.
- `R-PA-CIGNA-017` applies LifeSOURCE or designated-facility routing only when
  member-specific instructions explicitly require it. Cigna says transplant
  network access and requirements vary by plan.
- `R-PA-CIGNA-018` no longer infers an EIU classification from off-label use or
  clinical-trial language. An explicit Cigna EIU classification prompts for the
  applicable coverage policy or EviCore guideline.
- `R-PA-CIGNA-019` is a source-free operational advisory that asks an appeal to
  identify the challenged determination without applying Cigna's provider
  payment-appeal document list to prospective customer appeals.
- `R-PA-CIGNA-020` distinguishes ordinary out-of-network use from an explicit
  network-gap or continuity-of-care exception and asks only the latter for an
  access or treatment-continuity reason.

Regression tests cover routine and facility behavioral health, generic and
explicit LifeSOURCE routing, off-label versus explicit EIU classifications,
appeal references, and ordinary versus exception out-of-network workflows.
Cigna's behavioral-care guidance and LifeSOURCE plan disclaimer are registered
in the source ledger, and all generated PA audit reports are refreshed.

The source ledger contains 91 registered authorities: 25 fresh and 66 warning
by age, with no failures, source orphans, or coverage gaps. Its citations now
resolve across 118 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
