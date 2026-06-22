# v12 audit - fullpiers

- Auditor: CG
- Date: 2026-06-22
- Citation re-verified against: von Dadelszen P, Payne B, Li J, et al. Prediction of adverse maternal outcomes in pre-eclampsia: development and validation of the fullPIERS model. Lancet. 2011;377(9761):219-227 (re-fetched; the full logistic equation cross-read across the open St George's full text and a Chinese-population validation reprint).

`lib/ob-v138.js fullPiers()` computes the published log-odds = 2.68 - 0.0541 x GA(wk)
+ 1.23 x chestPainDyspnea - 0.0271 x creatinine(umol/L) + 0.207 x platelets(10^9/L)
+ 4.0e-5 x platelets^2 + 0.0101 x AST(U/L) - 3.05e-6 x AST^2 + 2.5e-4 x (creatinine x
platelets) - 6.99e-5 x (platelets x AST) - 2.56e-3 x (platelets x SpO2), then
1/(1+e^-logit). Class A (fixed 2011 coefficients; journal+author citation, no
ISSUER_PATTERN trip -- no docs/citation-staleness.md row).

## Source-governance catches
- SpO2 has NO main-effect term; it enters ONLY through the platelet x SpO2 interaction.
  A common mis-recall assigns the -0.0271 coefficient to SpO2 -- it is creatinine's, and
  creatinine has no quadratic term (only platelets^2 and AST^2 are quadratic).
- Bands per perinatology.com / the validation literature: < 10% low, 10-30% intermediate,
  >= 30% high-risk rule-in (positive likelihood ratio about 17.5). Not invented.

## Boundary worked examples added
- GA 32, chest pain, SpO2 96, platelets 120, creatinine 90, AST 60 -> 17.6%, intermediate.
- a severe profile crosses the >= 30% rule-in flag.
- probability bounded 0-100 for extreme inputs (logistic exponent clamped to +/-40).
- a missing predictor -> valid:false.

## Edge-input handling notes
- Five positive number inputs plus a boolean; any blank required value surfaces a
  complete-the-fields fallback. The probability is always finite (overflow-safe sigmoid).

## A11y / keyboard notes
- Five labeled number inputs + one checkbox; output aria-live="polite". 320px, no hscroll.

## Defects opened
- none
