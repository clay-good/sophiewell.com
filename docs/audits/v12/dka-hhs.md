# v12 audit - dka-hhs

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Kitabchi AE, et al. Hyperglycemic crises in adult patients with diabetes. Diabetes Care. 2009;32(7):1335-1343; 2024 ADA/EASD hyperglycemic-crises consensus.

`lib/metabolic-onc-v88.js dkaHhs()` assembles the ADA hyperglycemic-crisis classification (DKA vs HHS) from glucose, pH, bicarbonate, beta-hydroxybutyrate, mental status, sodium, and chloride. Effective serum osmolality (2 x Na + glucose/18) and anion gap (Na - Cl - HCO3) are computed only when their inputs are present; the four ADA criteria (hyperglycemia, acidosis, ketosis, hyperosmolar) are surfaced as a grid. DKA severity is graded mild/moderate/severe on the ADA pH and HCO3 cutoffs, taking the more severe of the two when they disagree. Glucose, pH, and HCO3 are required to classify; without beta-hydroxybutyrate a strict DKA verdict is withheld (the ketosis criterion is reported as unknown). None of the cutoffs is computed - they are the published ADA thresholds, quoted.

## Boundary worked examples added
- glucose 520, pH 6.95, HCO3 6, beta-OHB 6, Na 130, Cl 95 -> DKA severe; anion gap 29, effective osmolality 289.
- glucose 900, pH 7.35, HCO3 22, beta-OHB 1, Na 155 -> HHS (effective osmolality 360, minimal ketosis).
- glucose 700, pH 7.10, HCO3 12, beta-OHB 5, Na 145 -> mixed DKA/HHS (moderate grade).
- glucose only -> valid:false, complete-the-fields fallback; glucose 400, pH 7.10, HCO3 12, no ketones -> classification withheld, ketosis unknown.

## Cross-implementation differential
- Reference: hand computation. 2*130 + 520/18 = 288.9 -> 289; 130 - 95 - 6 = 29. Sophie matches. PASS.

## Edge-input handling notes
- glucose/pH coerced with pos(), HCO3 with fin(); osmolality and anion gap each gated on their own inputs. No non-finite value reaches a returned string (spec-v59 fuzz harness covers the module, zero leaks).

## A11y / keyboard notes
- Five labeled numeric inputs, one labeled select (mental status); output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
