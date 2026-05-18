# v11 audit - SAAG (Serum-Ascites Albumin Gradient) (`saag`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Runyon BA, Montano AA, Akriviadis EA, Antillon MR, Irving MA, McHutchison JG. The serum-ascites albumin gradient is superior to the exudate-transudate concept in the differential diagnosis of ascites. Ann Intern Med. 1992;117(3):215-220 (also Hepatology 1992;16:240-245 referenced in META). SAAG = serum albumin (g/dL) - ascites albumin (g/dL); >=1.1 g/dL indicates portal hypertension, <1.1 g/dL indicates non-portal causes. Sophie's `saag` (lib/clinical-v5.js:253) computes the subtraction and applies the 1.1 threshold.

## Boundary examples added
- Low (non-portal): serum alb 3.0 / ascites alb 2.5 -> SAAG 0.5 -> "non-portal cause (e.g., peritoneal carcinomatosis, TB peritonitis)". PASS.
- High (portal): serum 4.0 / ascites 1.0 -> SAAG 3.0 -> "portal hypertension (e.g., cirrhosis, CHF)". PASS.
- META example: serum 3.5 / ascites 1.5 -> SAAG 2.0 -> "portal hypertension". PASS.
- Threshold edge: serum 3.0 / ascites 1.9 -> SAAG 1.1 -> portal band (inclusive at 1.1 per Runyon 1992). PASS.

## Cross-implementation differential
- Hand computation matches Sophie's output exactly to 1 decimal place.
- MDCalc SAAG calculator: META example returns 2.0 g/dL / portal hypertension. Sophie matches. PASS.
- Threshold direction (>=1.1 portal) cross-checked against Runyon 1992 Table 2 and AASLD ascites management guidelines.

## Edge-input handling notes
- Both inputs in g/dL; unit label prominent.
- Negative SAAG (ascites albumin > serum albumin) is mathematically valid and displays as a negative number with the non-portal band; this is the source's behavior.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled numeric inputs; compute button keyboard-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
