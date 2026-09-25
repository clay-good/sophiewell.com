# spec-v1474 — stroke work indices in the hemodynamics suite

The hemodynamics suite already took every input needed for the left and right ventricular stroke
work indices (cardiac output, heart rate, body surface area, MAP, CVP, mPAP, PCWP), but did not report
them. A screen of hemodynamic metric names found both absent from the catalog.

## What it adds

| Output | Formula | Needs |
|---|---|---|
| LVSWI | SVI × (MAP − PCWP) | heart rate, BSA, MAP, PCWP |
| RVSWI | SVI × (mPAP − CVP) | heart rate, BSA, mPAP, CVP |

Each is shown two ways, because the literature reports both: as the bare product in mmHg·mL/m², and
multiplied by 0.0136 to give g·m/m². A study that uses the second form notes that "there is
disagreement over the correct units for RVSWI". Each index appears only when its inputs are entered.
Otherwise its row names the missing inputs, the same way the suite's other rows do.

No normal range or cutoff is applied. The cutoffs in the open literature are study-specific (for
example, one defines post-operative RV dysfunction after mitral surgery as RVSWI below 300
mmHg·mL/m²), and none is general enough to print as a band.

## Sources

- LVSWI = SVI × (MAP − PCWP) × 0.0136, "generally calculated by the formula": PMC7616760.
- RVSWI = (SV/BSA) × (mPAP − mRAP) × 0.0136, with the note on disputed units: Front Cardiovasc Med
  2020 (PMC7203784).
- Both indices as the bare product, in mmHg·mL/m²: PMC7083509 and PMC9773778.

## Tests

`test/unit/hemodynamic-suite.test.js`: both indices in both units for a worked case, checked by hand;
LVSWI absent without PCWP while RVSWI still computes; no index without a heart rate.
