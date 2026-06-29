# v12 audit - gnri

- Auditor: CG
- Date: 2026-06-29
- Citation re-verified against: Bouillanne O, Morineau G, Dupont C, et al. Geriatric Nutritional Risk Index. Am J Clin Nutr. 2005;82(4):777-783. The coefficients (1.489, 41.7), the Lorentz ideal-body-weight equations, the ratio cap at 1, and the four bands cross-verified (>= 2 sources, spec-v97).

`lib/ltcga-v178.js gnri()` computes GNRI from albumin and weight/IBW. Group E, Class A.

## Source-governance notes
- GNRI = 1.489 x albumin(g/L) + 41.7 x (weight / IBW), ratio capped at 1; IBW men 0.75*height_cm - 62.5, women 0.60*height_cm - 40. Bands > 98 / 92-98 / 82-<92 / < 82. Journal issuer; no ISSUER_PATTERN trip; no staleness row.

## Boundary worked examples added
- low-risk worked example (alb 35, 60 kg, 165 cm, female -> 93.8); ratio cap at 1 when weight > ideal; major risk < 82; non-positive IBW and blanks -> valid:false.

## Edge-input handling notes
- Inputs positive-finite; the IBW denominator is positive-guarded -> valid:false rather than Infinity/NaN (spec-v59 fuzz pass, division path).
