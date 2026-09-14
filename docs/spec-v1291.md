# spec-v1291 — scope Humana specialty checks

Humana rules 011–015 applied product- and service-specific requirements to
generic packets. Any J-code or broad drug language could trigger step-therapy
or diagnosis findings, any genetic test could inherit a Medicare
Advantage/Medicaid workflow, and every DME or home-health request was expected
to carry a signed order.

The five rules now run only when their workflow is explicit:

- `R-PA-HUMANA-011` is informational and checks prerequisite therapy or an
  exception rationale only when the packet says step therapy applies. Humana
  publishes separate medication and Part B step-therapy lists by product.
- `R-PA-HUMANA-012` applies the published molecular diagnostic/genetic testing
  fields only when the Humana MD/GT authorization workflow is identified. It
  then checks separately for the specific test and clinical indication; a
  generic Commercial genetic test does not inherit the Medicare
  Advantage/Medicaid workflow.
- `R-PA-HUMANA-013` is informational and checks a diagnosis or indication only
  for an explicit oncology-drug request. Generic J-codes and specialty
  infusions no longer trigger it.
- `R-PA-HUMANA-014` is a source-free operational advisory. An explicit
  retrospective request should state why service preceded authorization, but
  the reviewed Commercial page does not publish one universal packet schema.
- `R-PA-HUMANA-015` checks for a signed order only when request-specific
  instructions explicitly require one. Generic DME and home-health requests
  no longer inherit a universal signed-and-dated-order rule.

Regression tests cover generic and explicit step therapy, MD/GT, oncology,
retroactive review, and written-order workflows. All generated PA reports are
refreshed.

The source ledger contains 91 registered authorities: 26 fresh and 65 warning
by age, with no failures, source orphans, or coverage gaps. Its citations
resolve across 121 registered URLs. Of 876 PA rules, 823 are source-anchored.
The 1,722-tile catalog is unchanged.
