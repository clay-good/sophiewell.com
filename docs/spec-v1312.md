# spec-v1312 — correct Blue Shield review and exception workflows

Blue Shield of California rules 016–020 treated broad behavioral-health,
transplant, investigational, appeal, and out-of-network wording as proof that a
specific review requirement applied. They now follow the plan's current,
workflow-specific provider materials.

- Behavioral-health criteria are checked only when the packet identifies a
  level-of-care medical-necessity review.
- Major-organ and bone-marrow transplant checks use Blue Shield transplant
  network routing and evaluation requirements. Kidney-only, corneal, and skin
  transplant wording does not trigger that workflow.
- Investigational determinations no longer invent an evidence attachment; the
  current BSC9.01 policy lists no records required for clinical review.
- Appeals and reconsiderations receive a non-enforcing routing reminder because
  member, authorization, and provider-dispute processes differ.
- Out-of-network wording no longer implies continuity-of-care eligibility. An
  explicit continuity-of-care application checks only for the current treatment
  and provider details requested by that workflow.

Regression tests cover each corrected trigger boundary. The source ledger adds
the current utilization-management guidance, facility manual, investigational
policy, provider-dispute process, and continuity-of-care materials. Generated PA
reports and the SBOM are refreshed as part of the release verification.

The source ledger contains 91 registered authorities: 31 fresh and 60 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 187 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
