# v11 audit - Acetaminophen 24-Hour Total & Ceiling (`apap-24h-max`)

- Auditor: CG
- Date: 2026-06-09
- Citation re-verified against: US FDA Organ-Specific Warnings: Acetaminophen (OTC labeling) and the 325 mg/dose-unit prescription-combination limit; manufacturer labeling (max 4 g/24 h; lower in hepatic impairment / chronic alcohol use). spec-v62 §3.2.

## Boundary examples added
- under: 650 mg x4 (2600) + 325 mg x4 (1300) = 3900 mg vs 4000 ceiling -> 100 mg remaining, 97.5%.
- over: total 4500 mg vs 4000 ceiling -> over flag set.
- conservative ceiling: same sources vs 2000 mg ceiling (hepatic) -> over.

## Cross-implementation differential
- Reference: hand sum of dose x frequency per source, compared to the selected ceiling. 2600 + 1300 = 3900; 3900/4000 = 97.5%. Sophie matches exactly. PASS.

## Edge-input handling notes
- Each source contributes only when dose > 0 and frequency > 0. `apapCeilingCheck` bounds `ceilingMg` `min: 1`, so a zero ceiling throws RangeError; NaN/'' throw TypeError (caught by `safe()`). The over-ceiling row carries a visible flag class. PASS.

## A11y / keyboard notes
- Six labeled numeric inputs plus a labeled ceiling `<select>`, Tab order = source order; `aria-live="polite"` output. `npm run test:a11y` clean. PASS.

## Defects opened
- none

## Status
- PASS
