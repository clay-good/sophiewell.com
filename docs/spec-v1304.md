# spec-v1304 — correct Florida Blue exception workflows

Florida Blue rules 016–020 inferred specialized requirements from broad
category words. They could apply intensive level-of-care documentation to
routine behavioral health, require every transplant to name Blue Distinction,
treat off-label or clinical-trial care as an investigational determination,
apply clinical-appeal checks to unrelated grievances, and require every
out-of-network request to prove a network gap.

The five rules now follow Florida Blue's current, request-specific materials:

- `R-PA-FLBLUE-016` applies only to an explicit intensive behavioral-health
  authorization and checks both the requested level and request-specific
  clinical support.
- `R-PA-FLBLUE-017` reflects Florida Blue's transplant-specific workflow
  without inventing a universal Blue Distinction mandate. A center evaluation
  is checked only when member-specific instructions require a designated
  center.
- `R-PA-FLBLUE-018` no longer infers investigational status from off-label use
  or clinical-trial participation. An explicit determination is checked for
  its actual Medical Coverage Guideline, criterion, or denial basis.
- `R-PA-FLBLUE-019` is limited to an explicit clinical prior-authorization
  appeal and asks it to identify the adverse determination being challenged.
- `R-PA-FLBLUE-020` distinguishes an ordinary out-of-network authorization
  from an explicit network-gap or continuity-of-care exception. Only the
  latter receives an informational exception-basis check.

Regression tests cover generic-category boundaries, incomplete explicit
workflows, and complete packets for all five rules. The current Florida Blue
member prior-authorization resource is added to the source ledger, and all
generated PA reports are refreshed.

The source ledger contains 91 registered authorities: 29 fresh and 62 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 151 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
