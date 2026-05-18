# v11 audit - Corrected Calcium / Sodium Suite (`corrected-ca-na`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Payne RB et al. BMJ. 1973;4(5893):643-646 (corrected Ca). Katz MA. NEJM. 1973;289(16):843-844 (corrected Na, 1.6 factor). Hillier TA, Abbott RD, Barrett EJ. Am J Med. 1999;106(4):399-403 (corrected Na, 2.4 factor at glucose > 400).

This tile renders the two stand-alone corrections (`corrected-calcium` + `corrected-sodium`, audited separately) side by side as a combined workflow tool. Both formulas are unchanged from the stand-alone tiles: Ca_corr = Ca + 0.8 × (4 − alb); Na_corr = Na + ((glucose − 100) / 100) × factor (factor 1.6 Katz / 2.4 Hillier).

## Boundary examples added
- low: Ca 9.0, alb 4.0; Na 140, glucose 100 -> corrected Ca 9.0; corrected Na (Katz) 140, (Hillier) 140 (no corrections needed).
- mid (META example): Ca 8.0, alb 2.0; Na 130, glucose 600 -> corrected Ca 9.6 mg/dL; corrected Na (Katz) 138, (Hillier) 142.
- high: Ca 7.0, alb 1.5; Na 115, glucose 900 -> corrected Ca 7.0 + 0.8 × 2.5 = 9.0; corrected Na (Katz) 115 + 8 × 1.6 = 127.8, (Hillier) 115 + 8 × 2.4 = 134.2.

## Cross-implementation differential
- Reference implementation: Payne 1973 (Ca) + Katz 1973 + Hillier 1999 (Na).
- Test case: META example.
- Sophie result: Ca 9.6, Na 138 / 142.
- Reference result: 8.0 + 0.8 × 2 = 9.6 (Payne); 130 + 5 × 1.6 = 138 (Katz); 130 + 5 × 2.4 = 142 (Hillier).
- Delta: 0%. PASS.

## Edge-input handling notes
- The combined tile uses the same shared `num`-validated number inputs as the stand-alone tiles; no new validation surface.
- The output is laid out so corrected Ca and corrected Na (both factors) are visible together — useful in DKA / HHS workups where both abnormalities co-occur.

## A11y / keyboard notes
- Four labeled number inputs, Tab-reachable in source order. Output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
