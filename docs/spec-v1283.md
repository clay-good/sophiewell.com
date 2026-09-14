# spec-v1283 — scope Anthem specialty workflows

Anthem rules 011–015 previously inferred payer workflows from broad service
categories. Every specialty drug was treated as step therapy, every molecular
test as a Carelon case, and every J-code as subject to a universal ICD-10 rule.
The same copied pattern also presented narrow retrospective-review exceptions
and a signed-order requirement as universal Commercial policy.

The rules now require the packet to establish applicability:

- `R-PA-ANTHEM-011` runs only when the packet says medical-specialty step
  therapy applies. It gives an informational reminder if neither a
  prerequisite-drug outcome nor an exception basis is present. Anthem says
  non-preferred drugs may receive this review only for members using the
  Medical Specialty Drug Review program; the drug-specific criteria control.
- `R-PA-ANTHEM-012` runs only for a genetic-testing request explicitly assigned
  to Carelon review. It now independently requires a named test and a clinical
  indication, fixing the former logic that incorrectly passed when either one
  appeared alone.
- `R-PA-ANTHEM-013` runs only when the packet invokes Anthem's drug-specific
  pharmacy Clinical Criteria. It asks for a supporting diagnosis without
  imposing a universal ICD-10-code requirement on every J-code.
- `R-PA-ANTHEM-014` remains an informational operational check but is now
  source-free. The reviewed Commercial pages do not publish universal
  retrospective-review exceptions, so the rule asks only why an explicitly
  retrospective request followed the service.
- `R-PA-ANTHEM-015` is source-free and informational. A DME or home-health
  request no longer fails automatically; the rule checks for a signed order
  only when member-specific instructions explicitly require one.

Regression tests cover inferred versus explicit program scope, complete and
incomplete step-therapy records, each independently missing genetic-test field,
drug-specific diagnosis context, retrospective justification, and explicit
signed-order instructions. Anthem's official pharmacy Clinical Criteria page
is registered in the source ledger, and all generated PA audit reports are
refreshed.

The source ledger contains 91 registered authorities: 24 fresh and 67 warning
by age, with no failures, source orphans, or coverage gaps. Its citations now
resolve across 108 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
