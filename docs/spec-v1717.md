# spec-v1717 — Kidney Donor Profile Index (KDPI) and Kidney Donor Risk Index (KDRI)

> Status: **SHIPPED (2026-11-07)**: `kdri-kdpi`, tool 1 of the
> [transplant-allocation-scores](../openspec/changes/transplant-allocation-scores/) change. Catalog 2,387.

## Sources, read November 7, 2026

Both PDFs were saved by hand: the site serves them only as downloads and refuses a scripted fetch.

| Document | Edition | SHA-256 | Used for |
|---|---|---|---|
| OPTN, *A Guide to Calculating and Interpreting the KDPI* | updated April 23, 2026 | `7e6f39ad54923f8d84ad85b55e6b3fb8baad4467e40feff490cbdcafb9e56bb7` | Table 1 (the October 31, 2024 refit: eight factors, no race or HCV), KDRI_RAO = e^Xβ, the scaling, the worked example, the cautions |
| OPTN, *KDRI to KDPI Mapping Table* | 2025 reference population, OPTN data as of April 3, 2026 | `4ffb25a37f15e9851ee4f382008ff438cc83c5c9a2a4bd1a2fdc5e3b260a400e` | the 101 bins, the 2025 scaling factor 1.45737870501158, and the shares used for unknown diabetes (18.70%) and hypertension (46.63%) |
| OPTN KDPI calculator page | last reviewed December 2025 | — | an unknown status is entered as "the same chance as a randomly selected donor having the condition" |

The coefficients and the design notes are in the change's [design.md](../openspec/changes/transplant-allocation-scores/design.md).

## What the tool does

- **Inputs:** age (whole years), height and weight (US-default unit toggles; the compute gets cm and kg), creatinine
  (mg/dL), hypertension and diabetes history (yes, no or unknown), CVA as cause of death, and DCD.
- **Outputs:** Xβ, then KDRI_RAO, then KDRI scaled by the 2025 median, then KDPI from the table's integer bins. Each
  bin's upper bound is inclusive and its lower bound exclusive, as the table prints them. Above 2.0147 the KDPI is
  100%.
- **Unknown history** enters at the 2025 share and is named on the page. A blank answer is refused.
- **Fences:** age 0 to 100 whole years, height 30 to 250 cm, weight 1 to 300 kg, creatinine 0.1 to 20 mg/dL. Feet
  typed as cm, or µmol/L typed as mg/dL, are refused.
- **Text on the page:** the guide's cautions, always (c about 0.60, no yes/no cutoffs, never alone to rule a kidney
  in). The longevity-matching sentence appears at a KDPI of 20% or less.
- **Re-read date:** after June 30, 2027 the tool refuses until OPTN's next spring table is read.

## Checks

- The guide's worked example (52 years, 183 cm, 81 kg, hypertensive, CVA, creatinine 1.7, DCD) reproduces Xβ 0.53787
  and KDRI_RAO 1.71235565748184 exactly. Its scaled value, 1.21930679808076, also reproduces, using the 2024 factor
  the guide prints.
- With the 2025 table the same donor is KDRI 1.17496 and KDPI 67%, in the row "1.16396000119226 to 1.17559521522287
  → 67%". The guide's 72% is on the 2024 table, which is not held.
- `test/unit/kdri-kdpi-v1717.test.js` (7 tests): the example; the bin edges, including inclusive and exclusive
  bounds at 0%, 1%, 19% and 100%; every piecewise term at its edge; the imputation; refusals; and the re-read
  date.

## Not done

- **EPTS (tool 2):** waits on the EPTS mapping table. The guide is read.
- **OPTN Policy 8 (task 1.3):** not read. The longevity-matching sentence is the guide's own.
- **Deviations from tasks.md:** one lib per tool, and a re-read date instead of a weekly hash watch (the PDFs cannot
  be fetched by script).
