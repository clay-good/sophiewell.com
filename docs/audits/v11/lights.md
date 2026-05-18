# v11 audit - Light's Criteria (Pleural Effusion) (`lights`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Light RW, Macgregor MI, Luchsinger PC, Ball WC Jr. Pleural effusions: the diagnostic separation of transudates and exudates. Ann Intern Med. 1972;77(4):507-513. An effusion is exudative if any one of: (a) pleural protein / serum protein > 0.5, (b) pleural LDH / serum LDH > 0.6, (c) pleural LDH > 2/3 of serum LDH ULN. Sophie's `lightsCriteria` (lib/clinical-v5.js:210) implements all three with `serumLdhUln` defaulted to 222 IU/L per common reference labs (caller can override).

## Boundary examples added
- Low edge (transudate): pp 1.5 / sp 5.5 (ratio 0.27) / pl 100 / sl 200 (ratio 0.50) / ULN 222 -> all three criteria false -> Transudate. PASS.
- META example (exudate by protein): pp 4.0 / sp 6.0 (ratio 0.67 > 0.5) / pl 250 / sl 200 / ULN 222 -> Exudate (criterion a met). PASS.
- LDH-ratio path: pp 2.5 / sp 5.0 (ratio 0.5 borderline) / pl 200 / sl 250 (ratio 0.80 > 0.6) -> Exudate (criterion b met). PASS.
- LDH-ULN path: pp 2.0 / sp 7.0 (ratio 0.29) / pl 160 / sl 220 (ratio 0.73) / ULN 222 -> pl 160 > 2/3*222 = 148 -> Exudate (criterion c met). PASS.

## Cross-implementation differential
- MDCalc Light's Criteria: META example returns "Exudate" with protein ratio 0.67. Sophie matches identically. PASS.
- Cross-checked the 2/3-ULN threshold (criterion c) against Light's original 1972 paper Table 3 and the contemporary American Thoracic Society guidance.

## Edge-input handling notes
- `serumLdhUln` defaults to 222 (typical lab ULN) when caller does not provide one; visible in the input form with the default pre-filled per spec-v11 §3.1 step 4(c).
- Numeric inputs reject negatives via `num()`.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- All inputs labelled with units; ULN override is optional and labelled as such. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
