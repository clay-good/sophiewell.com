# v11 audit - minute-ventilation

- Auditor: CG
- Date: 2026-06-10 (spec-v65).
- Citation re-verified against: Marino PL. The ICU Book, 4th ed., 2014 (VE = respiratory rate x tidal volume; alveolar ventilation = RR x (Vt - dead space); PaCO2 proportional to 1 / alveolar ventilation). Anatomic dead space ~2.2 mL/kg ideal body weight (West JB. Respiratory Physiology).

`lib/clinical-v8.js` `minuteVentilation()` — given respiratory rate (/min) and tidal volume (mL), returns total minute ventilation (L/min); when ideal body weight is supplied it also returns alveolar minute ventilation (subtracting the ~2.2 mL/kg anatomic dead space); and when a current/target PaCO2 pair is supplied it returns the respiratory rate required to reach the target at the current tidal volume (RR x currentPaCO2/targetPaCO2). The clinical purpose is the gas-exchange calculation the existing vent-mechanics tiles (`driving-pressure`, `pbw-ardsnet`, `rsbi`) do not compute: the CO2-targeted rate adjustment at the bedside.

## Boundary examples added
- See test/unit/minute-ventilation.test.js (5 cases): VE 16 x 450 mL = 7.2 L/min (no IBW/PaCO2 -> alveolar and required-rate both null), the alveolar-ventilation dead-space path (IBW 70 -> 4.74 L/min), the target-PaCO2 inverse round-trip (60 -> 40 at RR 16 => RR 24), the RR-0 / target-PaCO2-0 null path (VE itself a finite 0), and the impossible-input throw path.

## Cross-implementation differential
- Worked example reproduced by hand: 16 x 450 / 1000 = 7.2 L/min; PASS. Inverse: 16 x 60/40 = 24/min; PASS. Alveolar: dead space 2.2 x 70 = 154 mL; (450 - 154) x 16 / 1000 = 4.736 -> 4.74 L/min; PASS.

## Edge-input handling notes
- requiredRate is null unless respiratoryRate > 0, currentPaco2 > 0, and targetPaco2 > 0 (guards the divide-by-zero and the no-target case). alveolarVentilationLMin is null unless ibwKg > 0, and the effective tidal volume is floored at 0 so a dead space larger than Vt cannot produce a negative VA. All inputs validated through lib/num.js num() (RR 0-80, Vt 0-3000, IBW 0-250, PaCO2 0-300); out-of-range/non-finite throws TypeError/RangeError caught by the renderer safe() wrapper. clinical-v8.js is enrolled in the spec-v59 fuzz harness — zero non-finite leaks. Every interpolated number routes through fmt(). The renderer flags a computed rate above ~35/min with the lung-protective note.

## A11y / keyboard notes
- Five labeled number inputs (RR, Vt, optional IBW, optional current/target PaCO2) with label for=; aria-live results region; planning-estimate note as muted text. test:a11y clean.

## Defects opened

- none

## Status
- PASS
