# spec-v1244 — the last value a refusal called missing

The catalog-wide envelope probe had ten rows left where a reader entered an
out-of-range value and the calculator answered as though the field were blank.
For example, an ADHERE systolic blood pressure of 3,000 mmHg returned no field
message, and an electrolyte-free water clearance plasma sodium of 2,500 mEq/L
said to enter plasma sodium again. Retyping either value could not resolve the
refusal.

The cause was the same sentinel doing three jobs. Each calculator's local
reader returned `null` for a blank, a non-number, and an out-of-range number;
the caller then treated every `null` as missing. The affected probe rows were:

| calculator | input(s) found by the probe |
| --- | --- |
| `adhere-hf` | systolic blood pressure, creatinine |
| `compartment-delta-pressure` | diastolic blood pressure |
| `scai-shock` | lactate |
| `mecki` | hemoglobin, sodium |
| `efw-clearance` | plasma sodium |
| `cart-score` | diastolic blood pressure |
| `lipi` | total white-cell count |
| `effective-osmolality` | sodium |

`gradeFault` now checks the raw value before each calculator's existing
missing-value branch. It skips blanks, so a field that was not entered still
reaches the calculator's own prompt. An entered number outside the existing
local bound instead names the measurement and range, ending with "Check the
value entered."

The change covers all 23 numeric inputs read by the same local branches, not
only the ten inputs the probe could reach through its shared-envelope mapping.
No bound moved, no formula changed, and valid worked examples return the same
answers.

## Proof

- `test/unit/remaining-range-refusals.test.js` pins all ten reported rows,
  sibling inputs governed by the same readers, and blank-field behavior.
- `node scripts/probe-envelope-unbounded.mjs` now reports **0** under "ASKED FOR
  A VALUE THE READER ENTERED," down from 10.
- Catalog count remains 1,722.
