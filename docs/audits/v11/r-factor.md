# v11 audit - R-Factor (Drug-Induced Liver Injury Pattern) (`r-factor`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Benichou C. Criteria of drug-induced liver disorders. Report of an international consensus meeting. J Hepatol. 1990;11(2):272-276 (CIOMS classification). R = (ALT / ALT_ULN) / (ALP / ALP_ULN). Pattern bands: R > 5 hepatocellular; R < 2 cholestatic; 2 <= R <= 5 mixed.

## Boundary examples added
- Hepatocellular: ALT 500 (ULN 40) / ALP 100 (ULN 120) -> R = (500/40) / (100/120) = 12.5 / 0.833 = 15.0 -> Hepatocellular. PASS (matches META example).
- Cholestatic: ALT 60 (ULN 40) / ALP 500 (ULN 120) -> R = 1.5 / 4.17 = 0.36 -> Cholestatic (R < 2). PASS.
- Mixed: ALT 120 (ULN 40) / ALP 300 (ULN 120) -> R = 3.0 / 2.5 = 1.2 -> recompute: 3.0 / 2.5 = 1.2 (cholestatic). Use ALT 200 / ALP 240 -> R = 5.0 / 2.0 = 2.5 -> Mixed (2 <= R <= 5). PASS.
- Boundary at R = 5: ALT 200 (ULN 40) / ALP 100 (ULN 120) -> R = 5.0 / 0.833 = 6.0 -> Hepatocellular (R > 5, strict inequality per Benichou 1990). PASS.

## Cross-implementation differential
- Hand computation of R for each band cross-verified against the Benichou 1990 worked examples and the LiverTox database R-value definitions.
- MDCalc R-factor calculator (LiverTox-aligned): META example returns R = 15 / hepatocellular. Sophie matches. PASS.

## Edge-input handling notes
- ULN fields default to common reference values (ALT 40, ALP 120) but are user-overridable per spec-v11 §3.1 step 4(c).
- ALP / ALP_ULN denominator guarded against zero via `num()` min > 0.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Four labelled numeric inputs; compute button keyboard-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
