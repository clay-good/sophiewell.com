# v11 audit - cao2-do2

- Auditor: CG
- Date: 2026-06-06 (spec-v55)
- Citation re-verified against: oxygen-transport physiology (Marino PL, The ICU Book, 4th ed., 2014). CaO2 = (1.34 x Hb x SaO2/100) + (0.0031 x PaO2); DO2 = CaO2 x cardiac output (L/min) x 10.

`lib/clinical-v6.js cao2Do2()` returns CaO2, the Hb-bound and dissolved contributions, and DO2 (only when cardiac output is supplied).

## Boundary examples added
- normal: Hb 15, SaO2 98, PaO2 100, CO 5 -> CaO2 20.01 mL/dL, DO2 1000 mL/min.
- anemic/hypoxemic: Hb 8, SaO2 90, PaO2 60 -> CaO2 9.83, DO2 null (no CO).
- high delivery: Hb 12, SaO2 100, PaO2 200, CO 8 -> CaO2 16.7, DO2 1336.

## Cross-implementation differential
- Hand-calc 1.34*15*0.98 + 0.0031*100 = 19.698 + 0.31 = 20.008. Sophie 20.01. PASS.
- DO2 20.008*5*10 = 1000.4 -> 1000. Sophie 1000. PASS.

## Edge-input handling notes
- Hb/SaO2/PaO2 validated; cardiac output optional (null when blank) and floored at 0.5 when present.

## A11y / keyboard notes
- Four labeled inputs (CO optional), aria-live results. test:a11y clean.

## Defects opened

- none

## Status
- PASS
