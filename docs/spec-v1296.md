# spec-v1296 — separate HCSC exception workflows

HCSC rules 016–020 inferred request requirements from broad service labels.
Generic mental-health care inherited an intensive level-of-care check, every
transplant was expected to use a Blue Distinction center, off-label use was
treated as an investigational classification, and every out-of-network request
was treated as a network-gap exception.

The five rules now preserve the workflow boundaries in current BCBSIL sources:

- `R-PA-HCSC-016` is informational and checks clinical support only for an
  explicit intensive behavioral-health setting. Generic counseling passes.
- `R-PA-HCSC-017` asks for a selected transplant center or evaluation only when
  request-specific instructions explicitly require a designated center.
- `R-PA-HCSC-018` does not infer experimental or investigational status from
  off-label use or a clinical trial. It checks the policy basis only after an
  explicit BCBSIL classification.
- `R-PA-HCSC-019` runs only for a clinical prior-authorization appeal and asks
  it to identify the original determination. A generic claim-payment appeal
  passes.
- `R-PA-HCSC-020` distinguishes ordinary out-of-network utilization review from
  an explicit network-gap, transition, or continuity-of-care request. Only the
  latter receives the exception-rationale advisory.

Regression tests cover the generic boundaries, incomplete explicit workflows,
and complete evidence for all five rules. Five current BCBSIL pages are added
to the source ledger, and all generated PA reports are refreshed.

The source ledger contains 91 registered authorities: 27 fresh and 64 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 128 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
