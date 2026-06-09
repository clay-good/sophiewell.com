# v11 audit - ICU Energy & Protein Target (`icu-nutrition-target`)

- Auditor: CG
- Date: 2026-06-09
- Citation re-verified against: McClave SA, et al. Guidelines for the Provision and Assessment of Nutrition Support Therapy in the Adult Critically Ill Patient (ASPEN/SCCM). JPEN J Parenter Enteral Nutr. 2016;40(2):159-211. 25-30 kcal/kg/day; 1.2-2.0 g/kg/day protein. spec-v62 §3.1.

## Boundary examples added
- mid: 70 kg @ 25-30 kcal/kg, 1.2-2.0 g/kg -> 1750-2100 kcal/day; 84-140 g/day.
- low: 50 kg @ 25-30 -> 1250-1500 kcal/day.
- high-protein band: 70 kg @ 2.0-2.5 g/kg -> 140-175 g/day (CRRT/burns).

## Cross-implementation differential
- Reference: hand calculation. 70 x 25 = 1750; 70 x 30 = 2100; 70 x 1.2 = 84; 70 x 2.0 = 140. Sophie matches exactly. PASS.

## Edge-input handling notes
- `weightKg` bounded `[0.3, 500]`; the band selects split to numeric low/high. Zero weight throws RangeError; NaN/'' throw TypeError (caught by `safe()`). The obesity adjusted-weight and CRRT/burns protein caveats render as a note. PASS.

## A11y / keyboard notes
- One labeled numeric input plus two labeled band `<select>`s, Tab order = source order; `aria-live="polite"` output. `npm run test:a11y` clean. PASS.

## Defects opened
- none

## Status
- PASS
