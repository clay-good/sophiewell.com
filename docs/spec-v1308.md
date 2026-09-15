# spec-v1308 — correct BCBS Michigan exception workflows

BCBS Michigan rules 016–020 inferred specialized requirements from broad
behavioral-health, transplant, clinical-trial, appeal, and out-of-network text.
They now follow BCBSM's current product- and workflow-specific materials.

- Intensive behavioral-health checks require an explicit intensive-service
  authorization and look for both the requested level and clinical support.
- Transplant checks require explicit Human Organ Transplant Program
  applicability and then ask for the facility and evaluation context.
- Off-label use or clinical-trial participation no longer implies an
  investigational determination; the rule requires explicit determination text.
- Only explicit prior-authorization appeals receive an adverse-determination
  check. Generic grievances and unrelated appeals do not.
- Ordinary out-of-network requests no longer imply a network-gap or continuity
  exception. Only explicit exception requests are checked for their basis.

Regression tests cover every generic-category boundary and incomplete explicit
workflow. The source ledger adds current BCBSM behavioral-health, transplant,
e-referral, appeal, and provider-alert resources, and generated PA reports are
refreshed.

The source ledger contains 91 registered authorities: 30 fresh and 61 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 173 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
