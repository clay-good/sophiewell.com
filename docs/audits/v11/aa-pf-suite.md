# v11 audit - A-a Gradient & P/F Suite (`aa-pf-suite`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: West JB. *Respiratory Physiology* (alveolar gas equation; expected A-a gradient ≈ age/4 + 4 per the standard pulmonary teaching). ARDS Definition Task Force (Berlin Definition) JAMA 2012;307(23):2526. See also [[aa-gradient]] and [[pf-ratio]] which audit the underlying single-tile implementations.

`lib/clinical.js aaGradient()` plus `pfRatio()` invoked side-by-side in `views/group-e.js`. The suite additionally computes the age-expected gradient from the heuristic `expected_AA = age/4 + 4`.

## Boundary examples added
- low (young adult, normal): age 25, FiO2 0.21, PaCO2 40, PaO2 95 -> gradient 4.73; expected age/4+4 = 10.25; "within expected for age".
- mid (META example): age 40, FiO2 0.21, PaCO2 40, PaO2 90 -> gradient 9.73; expected 14; "within expected for age"; P/F 90/0.21 = 428.6; "Normal".
- high (elderly with hypoxia, supplemental O2): age 75, FiO2 0.40, PaCO2 30, PaO2 70 -> PAO2 0.4*713 - 37.5 = 247.7; gradient 177.7; expected ~23; "above expected"; P/F 70/0.4 = 175 -> "Moderate ARDS (Berlin)".

## Cross-implementation differential
- Reference: West *Respiratory Physiology*, Berlin Definition Table 1; hand-computed.
- Test case: META example. Sophie A-a 9.73 / P/F 428.6. Reference 9.73 / 428.6. Delta 0%. PASS.

## Edge-input handling notes
- The age-adjusted expected-gradient is a heuristic widely used at the bedside; the suite reports both the measured gradient and the age-expected so the user can compare. Sophie does not band the gradient itself (no "Mild/Moderate/Severe shunt" labels) — the band on the P/F side is sufficient and is the source-supported Berlin categorization.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Four labelled inputs (FiO2, PaO2, PaCO2, age); output region lists gradient, age-expected, and P/F + Berlin band. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
