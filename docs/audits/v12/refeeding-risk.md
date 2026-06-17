# v12 audit - refeeding-risk

- Auditor: CG
- Date: 2026-06-17
- Citation re-verified against: National Institute for Health and Care Excellence (NICE). Nutrition support for adults (CG32). 2006, updated 2017.

`lib/idcrit-v99.js refeedingRisk()` applies the NICE CG32 stratification: high risk if one major criterion (BMI < 16, weight loss > 15%, > 10 days little/no intake, low pre-feeding K/Mg/PO4) or two minor criteria (BMI < 18.5, weight loss > 10%, > 5 days little/no intake, alcohol/drug history). A threshold that meets a major is not double-counted as a minor. Class B: NICE guidance is revisable, so a docs/citation-staleness.md row names the 2017 update.

## Boundary worked examples added
- BMI 15 -> one major -> high risk.
- BMI 17 + weight loss 12% + > 5 days -> two minors -> high risk.
- BMI 17 + one minor only -> not high risk.

## Cross-implementation differential
- Reference: the NICE CG32 major/minor criteria. Match. PASS.

## Edge-input handling notes
- Blank BMI / weight loss / days surfaces valid:false; the BMI and weight-loss bands are mutually exclusive major-vs-minor; no NaN reaches the DOM. Fuzz harness covers the module.

## A11y / keyboard notes
- Labeled inputs; output aria-live="polite". 320px sweep passes with no horizontal scroll. Decision support, not a verdict.

## Defects opened
- none

## Status
- PASS
