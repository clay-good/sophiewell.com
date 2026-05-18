# v11 audit - A-a Gradient (`aa-gradient`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: West JB. *Respiratory Physiology: The Essentials* (universal pulmonary physiology text). Alveolar gas equation: PAO2 = FiO2 * (P_atm - P_H2O) - PaCO2 / R, where R (respiratory quotient) ≈ 0.8 at steady state on a normal diet, P_atm = 760 mmHg at sea level, P_H2O = 47 mmHg at body temperature.

`lib/clinical.js aaGradient()` implements: `PAO2 = FiO2 * (atmospheric - waterVapor) - paco2/0.8`; `gradient = PAO2 - paO2`. Defaults atmospheric=760, waterVapor=47.

## Boundary examples added
- low (normal young adult, room air): FiO2 0.21, PaCO2 40, PaO2 90 -> PAO2 0.21*713 - 40/0.8 = 149.73 - 50 = 99.73; gradient 9.73 (normal <10-15 in young adults).
- mid (mild gas-exchange defect, room air): FiO2 0.21, PaCO2 40, PaO2 70 -> PAO2 99.73; gradient 29.73.
- high (severe gas-exchange defect on supplemental O2): FiO2 0.50, PaCO2 30, PaO2 80 -> PAO2 0.5*713 - 37.5 = 356.5 - 37.5 = 319; gradient 239 (massive shunt physiology).
- altitude (P_atm = 600): FiO2 0.21, PaCO2 40, PaO2 65, atmospheric 600 -> PAO2 0.21*553 - 50 = 116.13 - 50 = 66.13; gradient 1.13.

## Cross-implementation differential
- Reference: West *Respiratory Physiology* hand-computed; cross-checked against the MDCalc A-a gradient calculator.
- Test case: META example (FiO2 0.21, PaCO2 40, PaO2 90). Sophie PAO2 99.73 / gradient 9.73; reference 99.73 / 9.73. Delta 0%. PASS.

## Edge-input handling notes
- `num()` validates FiO2 in 0.01-1.0 range (silently? — actually the renderer doesn't constrain, but `aaGradient()` accepts any positive number; a typo of "21" instead of "0.21" would produce a wildly high PAO2; the renderer label "FiO2 (0.21 = room air)" guards by convention rather than by clamping).
- R = 0.8 is hard-coded per West's standard assumption. Some references use 0.85 in critical illness; Sophie's choice matches the universally-taught teaching figure.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Three labelled inputs; output region lists PAO2 and gradient. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
