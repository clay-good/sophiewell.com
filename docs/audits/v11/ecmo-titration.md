# v11 audit - ecmo-titration

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Extracorporeal Life Support Organization (ELSO). *ELSO Adult and Paediatric Respiratory Failure Guidelines, Version 1.5, 2022.* Encodes the linear PaCO2-sweep heuristic (suggested sweep = current sweep x current PaCO2 / target PaCO2) and the DO2i target >= 6 mL/kg/min for VV ECMO. DO2 = pumpFlow(L/min) x 10 x 1.34 x Hb(g/dL) x SaO2(fraction).

`lib/scoring-v4.js ecmoTitration()` accepts `{modality, weightKg, currentSweepLpm, currentFlowLpm, currentPaCO2, targetPaCO2, hb, sao2}` and returns `{modality, suggestedSweepLpm, do2iMlPerKgPerMin, suggestedFlowLpm, banners, text}`.

## Boundary examples added
- Sweep 4 L/min, PaCO2 50, target 40 -> suggested sweep 5 L/min.
- Sweep 5 L/min, PaCO2 32, target 40 -> suggested sweep 4 L/min.
- Flow 4 L/min, Hb 10 g/dL, SaO2 90%, weight 70 kg -> DO2i 6.9 mL/kg/min.
- SaO2 0.9 (fraction) -> DO2i 6.9 mL/kg/min (same result; fraction accepted).
- Flow 3 L/min, Hb 8 g/dL, SaO2 85% -> DO2i < 6 (below ELSO target).
- VA modality -> end-organ perfusion banner.

## Cross-implementation differential
- Reference: ELSO 2022 PaCO2-sweep heuristic and DO2i target.
- Sophie result: matches across the boundary cases. PASS.

## Edge-input handling notes
- Missing weight, sweep, or flow throws.
- Unknown modality throws (must be VV or VA).
- Hb / SaO2 omitted -> DO2i returned null (no false-DO2i banner).

## A11y / keyboard notes
- Modality select + seven labeled number inputs; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
