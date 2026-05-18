# v11 audit - fib4

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Sterling RK, Lissen E, Clumeck N, et al. *Development of a simple noninvasive index to predict significant fibrosis in patients with HIV/HCV coinfection.* Hepatology. 2006;43(6):1317-1325. Equation §Methods and Table 4 cutoffs.

`lib/clinical-v4.js fib4()` implements the published equation FIB-4 = (age * AST) / (platelets * sqrt(ALT)) with Sterling 2006 Table 4 cutoffs: <1.45 rules out advanced fibrosis (NPV 90%), >3.25 rules in advanced fibrosis (PPV 65%), 1.45-3.25 indeterminate.

## Boundary examples added
- low: age 30, AST 25, ALT 25, platelets 250 -> (30*25)/(250*5) = 0.60 (rules out advanced fibrosis per Sterling 2006).
- mid: age 55, AST 60, ALT 40, platelets 150 -> (55*60)/(150*sqrt(40)) = 3300/948.68 = 3.48 (rules in advanced fibrosis per Sterling 2006). Tile empty-state example.
- high: age 80, AST 200, ALT 100, platelets 50 -> (80*200)/(50*10) = 32.00 (deep into rules-in band).

## Cross-implementation differential
- Reference implementation: Sterling RK, et al. Hepatology. 2006;43(6):1317-1325 Equation 1 (hand calculation).
- Test case: age 55, AST 60, ALT 40, platelets 150.
- Sophie result: 3.4786 (rules in advanced fibrosis).
- Reference result: 3300 / (150 * 6.3246) = 3300 / 948.68 = 3.4786. PASS within 0.5%.

## Edge-input handling notes
- All four inputs must be positive numbers; zero/negative input throws a RangeError surfaced by the renderer's `safe()` guard.
- Platelets are entered as x10^9/L (interchangeable with x10^3/uL; ratio is 1:1) per Sterling 2006 §Methods.
- AST and ALT are entered in U/L per the source.

## A11y / keyboard notes
- Four labeled `number` inputs; all Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
