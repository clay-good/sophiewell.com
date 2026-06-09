# v11 audit - Pediatric Quick-Dose Panel (by weight) (`peds-dose`)

- Auditor: CG
- Date: 2026-06-09
- Citation re-verified against: AAP *Red Book* pediatric dosing tables, NLM/DailyMed manufacturer labels, and the *Harriet Lane Handbook* (22e) pediatric formulary. spec-v62 §4.2 converts this tile from a static reference table to a weight-driven calculator (dose = weight x per-kg dose, capped at the per-dose maximum); it now passes the spec-v29 §3 one-line test.

## Boundary examples added
- 20 kg: acetaminophen 10-15 mg/kg -> 200-300 mg q4-6h (cap 1000 mg not reached); dexamethasone 0.6 mg/kg -> 12 mg once (cap 16 mg not reached).
- 80 kg: acetaminophen high end 15 x 80 = 1200 mg -> capped at 1000 mg single dose (`capped` flag set).
- impossible: weight 0 -> RangeError; NaN -> TypeError (caught by `safe()`).

## Cross-implementation differential
- Reference: Harriet Lane Handbook (22e). 20 kg child, acetaminophen 10-15 mg/kg = 200-300 mg; ibuprofen 5-10 mg/kg = 100-200 mg; dexamethasone 0.6 mg/kg = 12 mg. Sophie matches exactly; per-dose caps applied per label. Delta 0%. PASS.

## Edge-input handling notes
- `weightKg` bounded `[0.3, 150]`; out-of-range throws RangeError, non-finite throws TypeError, both caught by `safe()`. Each row's high end is `Math.min(perKg x weight, maxSingleMg)` so the per-dose cap binds visibly. The "planning estimate, not an order; verify against formulary and an independent double-check" notice renders above the result. The panel is illustrative (6 common drugs), not exhaustive; every row that ships is cited and computed. PASS.

## A11y / keyboard notes
- One labeled numeric weight input, `aria-live="polite"` output; Tab order = source order. `npm run test:a11y` clean. PASS.

## Defects opened
- none

## Status
- PASS
