# spec-v1748 — An envelope in one unit only

> Status: **SHIPPED (2026-11-16)**: 2 tools. The catalog stays 2,387.

The envelope finders drive each tool's worked example, so they only ever test a field in the unit the example
uses. A sweep switched every unit selector to its other values and drove the paired number field to 10,000,000.
Most of the 142 rows were pharmacy arithmetic (apothecary conversions, dilutions), where a large quantity has no
physiologic ceiling; two were real:

| Tool | Before | Now |
|---|---|---|
| `kings-college` | creatinine had no envelope in either unit; 10,000,000 umol/L met the renal limb, "poor prognosis" | `BOUNDS.scr` (mg/dL) after conversion, refused in the entered unit: 9 to 2210 umol/L or 0.1 to 25 mg/dL |
| `isaric-4c-mortality` | urea had no envelope in either unit | `BOUNDS.bun` after conversion (urea mmol/L x 2.8), refused as 0.4 to 107.1 mmol/L or BUN 1 to 300 mg/dL |

Left: `non-hdl-remnant` total cholesterol, urine albumin and creatinine (`uacr-upcr`), hepatic iron and milk
concentrations have no recorded envelope; `conc-rate`'s weight is only read in per-kg mode, where it is bounded.

Tests: new cases in `kings-college.test.js` and `isaric-4c-mortality.test.js`.
