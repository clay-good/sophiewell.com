# v12 audit - cardiac-power-output

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Fincke R, Hochman JS, Lowe AM, et al. Cardiac power is the strongest hemodynamic correlate of mortality in cardiogenic shock. J Am Coll Cardiol. 2004;44(2):340-348.

`lib/cardio-v90.js cardiacPowerOutput()` computes CPO = (MAP x cardiac output) / 451 in watts and flags the < 0.6 W cardiogenic-shock mortality threshold. Division is only by the fixed nonzero constant 451; MAP and CO clamp non-negative.

## Boundary worked examples added
- MAP 80, CO 5 -> 0.89 W, above the threshold.
- Threshold flip: MAP 65, CO 4 -> 0.58 W (below 0.6); MAP 70, CO 4 -> 0.62 W (above 0.6).
- Linear scaling: MAP 80, CO 10 -> 1.77 W.

## Cross-implementation differential
- Reference: hand computation. (80 x 5) / 451 = 0.8869 -> 0.89 W. Sophie matches. PASS.

## Edge-input handling notes
- Negative inputs clamp to a non-negative result (0 W, below threshold). A blank input renders the complete-the-fields fallback. The spec-v59 fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Two labeled numeric inputs (MAP, cardiac output); output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
