# spec-v1754 — A Glasgow Coma Scale between its steps

> Status: **SHIPPED (2026-11-16)**: 16 tools. The catalog stays 2,387.

spec-v1753's finder found BATT checking its GCS as 0-15. Driving every GCS-total field in the catalog with 2, 1.5,
16 and 12.5 found sixteen tools that refused out-of-range values but scored a GCS of 12.5 from wherever it fell
between their cutoffs. The scale is defined on whole numbers 3 to 15, and the house rule since spec-v1722 is to
refuse a fraction on a whole-step instrument rather than score or round it.

Fixed with `gradeFault([['the Glasgow Coma Scale', gcs, 3, 15, true]])` beside each tool's existing GCS check, in
its own refusal shape: `apache2`, `big`, `func-score`, `gap`, `hacor`, `hunt-hess-wfns`, `ich-score`, `iss-rts`,
`lods`, `mgap`, `mods`, `oasis`, `pelod2`, `psofa`, `rems`, `saps-ii`.

Not changed: `possum` and `p-possum` looked like they accepted a GCS of 2, but their input is a points grade (1, 2,
4 or 8 for GCS 15, 12-14, 9-11, 8 or less), not a GCS total, and it already refuses anything else.

Tests: one spec-v1754 case in each tool's own unit test file.
