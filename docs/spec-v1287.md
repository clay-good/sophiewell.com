# spec-v1287 — scope Cigna specialty checks

Cigna rules 011–015 treated broad drug, genetic-testing, retrospective, DME,
and home-health categories as proof that specific documentation rules applied.
The current Cigna materials instead make those requirements dependent on the
member's benefit, drug policy, code, or request-specific instructions.

- `R-PA-CIGNA-011` now runs only when the packet explicitly establishes a
  Cigna step-therapy requirement, then checks for prerequisite use or an
  allowed exception.
- `R-PA-CIGNA-012` is informational and separately requires the specific
  genetic test and its clinical indication. Cigna routes only certain molecular
  CPT codes through EviCore.
- `R-PA-CIGNA-013` no longer infers a diagnosis-documentation requirement from
  every J-code or specialty drug. It runs only when the applicable drug policy
  is documented as requiring a diagnosis.
- `R-PA-CIGNA-014` is a source-free informational advisory because the reviewed
  Commercial page does not publish one retrospective-review packet schema.
- `R-PA-CIGNA-015` no longer requires a signed order for every DME or
  home-health request. It checks the order only when request-specific
  instructions explicitly require one.

Regression tests cover generic and explicit step-therapy requests, both halves
of a genetic-testing request, generic and diagnosis-gated drug requests,
retrospective review, and generic versus order-required DME workflows. Cigna's
step-therapy, genetic-program, and coverage-policy indexes are registered in
the source ledger, and all generated PA audit reports are refreshed.

The source ledger contains 91 registered authorities: 25 fresh and 66 warning
by age, with no failures, source orphans, or coverage gaps. Its citations now
resolve across 116 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
