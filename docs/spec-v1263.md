# spec-v1263 — restore the current Medicare CGM eligibility paths

The Medicare FFS CGM rule still required insulin therapy together with frequent
finger-stick monitoring or hypoglycemia. Current LCD L33822 instead accepts
either an insulin-treated beneficiary or a beneficiary with documented
problematic hypoglycemia. CMS removed testing four or more times per day as a
CGM prerequisite effective July 18, 2021.

`R-PA-CMS-018` now models those two alternatives directly. Insulin treatment
passes without a finger-stick statement, problematic hypoglycemia passes
without insulin, and a request documenting neither still flags the missing
coverage anchor. Regression tests cover all three cases.

The CMS Medicare Coverage Database source was reread on 2026-09-14. Its ledger
date, generated browser module, PA audit snapshots, and SBOM are refreshed
together. This reduces source-age warnings from 79 to 78 without changing the
1,722-tile catalog.
