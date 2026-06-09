# v11 audit - Neonatal Feeding Volume (`neonatal-feeding-volume`)

- Auditor: CG
- Date: 2026-06-09
- Citation re-verified against: Kleinman RE, Greer FR, eds. Pediatric Nutrition (AAP). Term-newborn requirement 120-180 mL/kg/day (typ. 150), advanced per day of life in preterm infants. spec-v62 §3.3.

## Boundary examples added
- mid: 3.2 kg @ 150 mL/kg/day, q3h (8 feeds) -> 480 mL/day, 60 mL/feed.
- low: 2 kg @ 120 mL/kg/day, q2h (12 feeds) -> 240 mL/day, 20 mL/feed.
- envelope: an adult weight (70 kg) is rejected (RangeError) since the neonate envelope caps `weightKg` at 10.

## Cross-implementation differential
- Reference: hand calculation. 3.2 x 150 = 480; 480 / 8 = 60. Sophie matches exactly. PASS.

## Edge-input handling notes
- `weightKg` bounded `[0.3, 10]` (neonate), `mlPerKgDay` `[1, 300]`, `feedsPerDay` `[1, 24]`. Zero feeds throws RangeError (no divide-by-zero); NaN/'' throw TypeError (caught by `safe()`). The term/preterm advancement band renders as a note. PASS.

## A11y / keyboard notes
- Two labeled numeric inputs plus a labeled frequency `<select>`, Tab order = source order; `aria-live="polite"` output. `npm run test:a11y` clean. PASS.

## Defects opened
- none

## Status
- PASS
