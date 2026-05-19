# v11 audit - smart-cop

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Charles PGP, Wolfe R, Whitby M, et al. *SMART-COP: a tool for predicting the need for intensive respiratory or vasopressor support in community-acquired pneumonia.* Clin Infect Dis. 2008;47(3):375-384. Table 1 (weights and age-adjusted RR / oxygenation thresholds).

`lib/scoring-v4.js smartCop()` implements the eight-criterion weighted sum. Age-adjusted thresholds applied per Charles 2008 §Methods: RR threshold is >=25 if age <=50 else >=30; oxygenation positive if PaO2 <70, SpO2 <94%, or P/F <333 when age <=50, or PaO2 <60, SpO2 <90%, or P/F <250 when age >50.

## Boundary examples added
- low (tile example): age 55, no criteria -> 0 (low).
- moderate: SBP <90 (2) + multilobar (1) = 3 (moderate).
- high: all eight present -> 2 + 1 + 1 + 1 + 1 + 1 + 2 + 2 = 11 (high; Charles 2008 maximum).
- age-adjusted RR: age 45 + RR 26 -> oxygenation off -> 1; age 60 + RR 26 -> RR threshold not met (needs >=30) -> 0.

## Cross-implementation differential
- Reference: Charles PGP, et al. Clin Infect Dis. 2008;47(3):375-384 hand sum.
- Test case: age 60, SBP 85, multilobar, RR 32, SpO2 89.
- Sophie result: 2 (SBP) + 1 (multilobar) + 1 (RR >=30) + 2 (SpO2 <90 with age >50) = 6 (high).
- Reference: same. PASS.

## Edge-input handling notes
- Oxygenation positive uses an OR of PaO2/SpO2/PF; missing inputs are treated as not satisfying the criterion.
- Age <=50 vs >50 threshold split is encoded explicitly.

## A11y / keyboard notes
- One age input + five checkboxes + three optional number inputs + two more checkboxes; Tab-reachable in source order. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
