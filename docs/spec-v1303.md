# spec-v1303 — separate Florida Blue specialty workflows

Florida Blue rules 011–015 inferred plan- or request-specific requirements
from broad category words. They could flag any specialty drug or J-code for
step therapy, every genetic test for a nonexistent universal lab workflow,
every specialty drug for the Medicare oncology-program diagnosis rule, and
every DME or home-health request for a signed order. The retrospective rule
also presented example reasons as if they were Florida Blue's exhaustive
published exceptions.

The five rules now follow Florida Blue's current, request-specific materials:

- `R-PA-FLBLUE-011` applies only when Responsible Steps or step therapy is
  explicit and treats missing prerequisite-therapy or exception evidence as
  informational.
- `R-PA-FLBLUE-012` no longer infers one genetic-review workflow from a CPT or
  test name. An explicit member-specific review is checked for both the test
  and clinical indication.
- `R-PA-FLBLUE-013` limits the diagnosis requirement to an explicit Florida
  Blue Medicare Advantage oncology or hematology request routed through New
  Century Health.
- `R-PA-FLBLUE-014` asks an explicit retrospective request for its reason and
  the applicable non-portal route without inventing a universal exception
  list.
- `R-PA-FLBLUE-015` checks for a signed order or plan of care only when the
  request-specific instructions require one. DME or home-health context alone
  passes.

Regression tests cover generic-category boundaries, incomplete explicit
workflows, and complete packets for all five rules. The current Florida Blue
pharmacy-utilization resource is added to the source ledger, and all generated
PA reports are refreshed.

The source ledger contains 91 registered authorities: 29 fresh and 62 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 150 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
