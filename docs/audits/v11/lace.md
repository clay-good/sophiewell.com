# v11 audit - lace

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: van Walraven C, Dhalla IA, Bell C, et al. *Derivation and validation of an index to predict early death or unplanned readmission after discharge from hospital to the community.* CMAJ. 2010;182(6):551-557. Table 3 (weights) and Figure 2 (risk bands).

`lib/scoring-v4.js lace()` implements the four-component LACE Index: Length of stay (van Walraven 2010 Table 3: 1=1, 2=2, 3=3, 4-6=4, 7-13=5, >=14=7), Acute (emergent) admission = 3, Charlson Comorbidity Index (0=0, 1=1, 2=2, 3=3, >=4=5), and Emergency visits in the prior 6 months (capped at 4 points). Range 0-19. Risk bands per van Walraven 2010 Figure 2: low 0-4, moderate 5-9, high >=10.

## Boundary examples added
- low: LOS 3, no acute, Charlson 0, no ED visits -> 3 (low risk). Tile empty-state example.
- mid: LOS 5 (4 points), acute (3), Charlson 2 (2), 1 ED visit (1) -> 10 (high risk).
- high (maximum): LOS >=14 (7), acute (3), Charlson >=4 (5), >=4 ED visits (4) -> 19 (the published maximum; high risk).

## Cross-implementation differential
- Reference implementation: van Walraven C, et al. CMAJ. 2010;182(6):551-557 Table 3 weights (hand sum).
- Test case: LOS 5, acute admission, Charlson 2, 1 ED visit.
- Sophie result: 4 + 3 + 2 + 1 = 10 (high band).
- Reference result: same sum 10; van Walraven 2010 Figure 2 high band. PASS within one ordinal category.

## Edge-input handling notes
- LOS, Charlson, and ED visits are non-negative integer inputs; negative or non-numeric values are coerced to 0 (renders as the lowest band).
- Charlson links conceptually to the shipped `charlson` tile; the user enters the computed Charlson score directly rather than re-entering all comorbidity flags.

## A11y / keyboard notes
- Three labeled `number` inputs plus one labeled checkbox; all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
