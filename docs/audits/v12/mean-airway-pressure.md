# v12 audit - mean-airway-pressure

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Marini JJ, Ravenscraft SA. Crit Care Med. 1992;20(11):1604-1616 (square-wave formula cross-verified against standard mechanical-ventilation references; ≥ 2 sources, spec-v97).

`lib/oneformula-v167.js meanAirwayPressure()` computes the Mean Airway Pressure. Group E, Class A.

## Source-governance notes
- Pₘₐw = [(PIP·Ti) + (PEEP·Te)] / (Ti + Te), the square-wave approximation.
- The (Ti + Te) denominator is guarded; PEEP accepts 0; PIP/Ti/Te guarded > 0.
- Framed as a determinant of oxygenation that feeds the oxygenation index.

## Boundary worked examples added
- PIP 30, PEEP 5, Ti 1, Te 2 → 13.3 cmH₂O; PEEP 0 accepted; longer Te lowers the mean; blank/zero time → valid:false.

## Edge-input handling notes
- PEEP optional default-guarded to [0,60]; square-wave approximation noted. Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- Four labelled number inputs; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
