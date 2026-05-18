# v11 audit - Body Surface Area (`bsa`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Du Bois D, Du Bois EF. *A formula to estimate the approximate surface area if height and weight be known.* Arch Intern Med. 1916;17:863-871. Mosteller RD. *Simplified calculation of body-surface area.* N Engl J Med. 1987;317(17):1098.

`lib/clinical.js`:
- `bsaDuBois(weightKg, heightCm) = 0.007184 * weight^0.425 * height^0.725` (Du Bois 1916 exact).
- `bsaMosteller(weightKg, heightCm) = sqrt(weight * height / 3600)` (Mosteller 1987 exact).

## Boundary examples added
- low (small adult): 50 kg / 160 cm -> Du Bois ~1.50; Mosteller ~1.49.
- mid (META example): 70 kg / 175 cm -> Du Bois 1.85; Mosteller 1.84.
- high (large adult): 120 kg / 190 cm -> Du Bois ~2.49; Mosteller ~2.52.

## Cross-implementation differential
- Reference: Du Bois 1916 nomogram and Mosteller 1987 NEJM formula; cross-checked by hand and against the publicly-documented MDCalc BSA calculator.
- Test case: META example. Sophie Du Bois 1.85 / Mosteller 1.84 vs reference 1.846 / 1.840. Delta < 0.5%. PASS.

## Edge-input handling notes
- Both formulas accept positive numbers; degenerate inputs (zero height or weight) produce zero or NaN which the `safe()` wrapper surfaces. Sophie deliberately reports both formulas side-by-side because oncology dosing protocols often specify one or the other and they can differ by 1-2% in adults.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled inputs; output region lists both formulas. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
