# spec-v1280 — complete the UnitedHealthcare rule audit

UnitedHealthcare rules 016–020 previously turned broad behavioral-health,
transplant, investigational, appeal, and out-of-network language into packet
requirements that the cited general pages did not support. The final UHC audit
slice now follows the narrower workflows in current UHC and Optum materials:

- `R-PA-UHC-016` runs only for an explicitly requested intensive
  behavioral-health level of care. It looks for a supporting clinical
  assessment as an informational reminder without requiring the packet to name
  LOCUS, CALOCUS-CASII, ECSII, or ASAM; the applicable guideline varies by
  member and jurisdiction.
- `R-PA-UHC-017` runs only when the packet says the Optum transplant protocol
  applies. It asks for the approved facility as an informational routing check
  and no longer assumes every transplant request has the same risk arrangement
  or must attach a transplant-center evaluation.
- `R-PA-UHC-018` matches the policy's specific benefit-exception path: a
  medical-benefit specialty drug that a UHC drug policy explicitly lists as
  unproven. It checks health-plan notification and benefit-exception approval;
  generic off-label use and clinical-trial language do not trigger the rule.
- `R-PA-UHC-019` distinguishes urgent pre-service appeals from claim
  reconsiderations and post-service appeals. It advises when an urgent request
  omits UHC's published life, health, function, or severe-pain basis.
- `R-PA-UHC-020` runs only for an explicit Commercial network-gap exception.
  It checks the form's service reference, in-network referrer, and specific
  clinical reason instead of treating every out-of-network or continuity-of-care
  request as a network-gap filing.

Regression tests cover both sides of every scope boundary and the complete
workflow for each active check. The source ledger now records Optum's
level-of-care guidance, UHC's off-label and unproven specialty-drug policy,
the provider appeal workflow, and the Commercial network-gap form. All 46
generated PA audit reports are updated.

The source ledger contains 91 registered authorities: 23 fresh and 68 warning
by age, with no failures, source orphans, or coverage gaps. Its citations now
resolve across 105 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
