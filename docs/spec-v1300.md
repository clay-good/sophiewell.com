# spec-v1300 — separate Highmark exception workflows

Highmark rules 016–020 treated broad category words as proof that one universal
packet requirement applied. That could flag routine outpatient behavioral
health, every transplant, off-label or clinical-trial treatment, unrelated
grievances, and ordinary out-of-network requests.

The five rules now follow Highmark's current, request-specific materials:

- `R-PA-HIGHMARK-016` applies to an explicit intensive behavioral-health
  authorization and checks both the requested level of care and supporting
  level-specific clinical information.
- `R-PA-HIGHMARK-017` runs only when member-specific instructions explicitly
  require a Blue Distinction or other designated transplant center. Highmark
  says this benefit is plan-dependent rather than universal.
- `R-PA-HIGHMARK-018` no longer infers experimental or investigational status
  from off-label use or clinical-trial language. An explicit determination is
  checked for its policy or denial basis.
- `R-PA-HIGHMARK-019` applies only to an explicit clinical prior-authorization
  appeal and asks it to identify the original determination. General claim
  grievances pass.
- `R-PA-HIGHMARK-020` reflects Highmark's published distinction between prior
  authorization and a separately submitted out-of-network gap exception. Only
  an explicit gap-exception request is checked for the specific service the
  network lacks.

Regression tests cover generic-category boundaries, incomplete explicit
workflows, and complete packets for all five rules. Six official Highmark
resources are added to the source ledger, and all generated PA reports are
refreshed.

The source ledger contains 91 registered authorities: 28 fresh and 63 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 143 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
