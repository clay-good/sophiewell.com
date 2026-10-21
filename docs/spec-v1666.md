# spec-v1666 — Independent review of the parenteral nutrition, IV admixture and pharmacogenomic tools (v1630, v1640)

> Status: **SHIPPED (2026-10-20)**: hardening, no new tool (catalog stays 2,362). Follows [spec-v1665](spec-v1665.md).

Two reviewers ran the 17 libs in `lib/*-v1630.js` and the 10 in `lib/*-v1640.js` (with `lib/cpic-tables.js`) on edge
inputs. No figure disagreed with its quoted source. Ten defects are fixed.

| Tool | Input | Was | Now |
|---|---|---|---|
| `opioid-cyp2d6-pediatric-check` (with CPIC) | codeine, status not known, activity score 3 | "No ... ultra-rapid statement of the label applies", beside CPIC's "Avoid codeine" | the score decides the status: the label's "ultra-rapid metabolizers should not use" applies, flagged |
| `iv-phosphate-order-check` | serum phosphorus 0.96 mg/dL | rounded to 1.0: the 1-1.7 row, so 0.5 mmol/kg was "above" | the "less than 1" row (0.44-0.64), within; 2.54 is above the 2.5 range and gets no dose |
| `pgx-label-dose-limit` | tetrabenazine 50.004 mg; pimozide 1.004 mg at 20.07 kg; iloperidone 2.999 mg | "50 mg is over the label's 50 mg"; "Entered: 3 mg" beside "under 3 to 6" | the dose and ceiling printed at the digits their order needs |
| `storage-excursion-summary` | 8.004 °C in a 2-8 °C range | "above range ... highest reading 8 °C" | 8.004 °C |
| `mean-kinetic-temperature` | 25.004 °C against a 25 °C limit | "the highest single reading, 25 °C, is above it" | 25.004 °C |
| `in-use-discard-time` | opened "0026-10-05" | "Discard by November 2, 1926" | refused (years outside 1900 to 2100) |
| `pn-calcium-phosphate-check` | 500 g amino acids in 100 mL | "500% final" | refused: above the most concentrated stock, 20% |
| `iv-label-rate-check` | potassium chloride 10 mEq/hour, pediatric | "nothing above the label limits checked" | the same, plus: the potassium chloride and magnesium sulfate labels read give no pediatric limits (neither label mentions pediatric patients) |
| `cyp2d6-activity-score` | *4/*102, duplication not named | "*4x2/*102 n/a (Indeterminate)" | no placeholder printed as a score |
| `cpic-gene-drug` | CYP2D6 "1.50" for codeine | refused, while "1.5" and "1.250" were accepted | scores compared by value |

Not changed: `pn-calcium-phosphate-check` does not check additive volumes against the final volume (it takes amounts,
not volumes); noted for a later change.

## Proof

`test/unit/review-fixes-v1630-v1640.test.js` holds each reviewer input.
