# v11 audit - urine-anion-gap

- Auditor: CG
- Date: 2026-06-06 (spec-v55)
- Citation re-verified against: Goldstein MB, et al. Am J Med Sci. 1986;292(4):198-202. UAG = urine Na + urine K - urine Cl.

`lib/clinical-v6.js urineAnionGap()` returns UAG and the interpretation: negative = appropriate renal ammonium excretion (GI bicarbonate loss); positive = impaired ammonium excretion (renal tubular acidosis).

## Boundary examples added
- negative (GI loss): 40 + 30 - 90 = -20.
- positive (RTA): 50 + 20 - 40 = +30.
- zero boundary: 30 + 25 - 55 = 0 (impaired-excretion side).

## Cross-implementation differential
- Hand-calc 40+30-90 = -20. Sophie -20. PASS.

## Edge-input handling notes
- All three electrolytes validated finite; no division (additive), so no divide-by-zero path.

## A11y / keyboard notes
- Three labeled inputs, aria-live results. test:a11y clean.

## Defects opened

- none

## Status
- PASS
