# v11 audit - apri

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Wai CT, Greenson JK, Fontana RJ, et al. *A simple noninvasive index can predict both significant fibrosis and cirrhosis in patients with chronic hepatitis C.* Hepatology. 2003;38(2):518-526. Equation §Methods and Table 4 cutoffs; WHO 2014 HCV guideline endorses the cutoffs for resource-limited settings.

`lib/clinical-v4.js apri()` implements APRI = ((AST / AST_ULN) * 100) / platelets (x10^9/L) per Wai 2003 §Methods, with Wai 2003 cutoffs: >0.7 predicts significant fibrosis; >1.0 predicts cirrhosis.

## Boundary examples added
- low: AST 30, ULN 40, platelets 250 -> (30/40*100)/250 = 0.30 (below the Wai 2003 significant-fibrosis cutoff).
- mid: AST 60, ULN 40, platelets 150 -> (60/40*100)/150 = 1.00 (predicts significant fibrosis per Wai 2003). Tile empty-state example.
- high: AST 200, ULN 40, platelets 50 -> (200/40*100)/50 = 10.00 (predicts cirrhosis per Wai 2003).

## Cross-implementation differential
- Reference implementation: Wai CT, et al. Hepatology. 2003;38(2):518-526 Equation 1 (hand calculation).
- Test case: AST 60, ULN 40, platelets 150.
- Sophie result: 1.0000 (significant fibrosis band).
- Reference result: ((60/40)*100)/150 = 150/150 = 1.0000. PASS within 0.5%.

## Edge-input handling notes
- AST ULN defaults to 40 in the tile per common US/UK lab references; user-editable for local labs per Wai 2003 (the source normalized AST to local ULN).
- Platelets in x10^9/L (equivalent to x10^3/uL) per Wai 2003 §Methods.
- All three inputs must be positive numbers; zero/negative throws a RangeError surfaced by `safe()`.

## A11y / keyboard notes
- Three labeled `number` inputs; all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
