# v11 audit - Burn Fluid Resuscitation Calculator (`burn-fluid`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Baxter CR, Shires T. Physiological response to crystalloid resuscitation of severe burns. Ann N Y Acad Sci. 1968;150(3):874-894 (Parkland: 4 mL/kg/% TBSA over 24 h, half in first 8 h). Modified Brooke formula: 2 mL/kg/% TBSA over 24 h, half in first 8 h.

## Boundary examples added
`burnFluid({weightKg, tbsaPercent, hoursSinceInjury})` in [lib/field.js:172](../../../lib/field.js#L172).
- META example (70 kg, 20% TBSA, h=0): Parkland 4*70*20 = 5600 mL/24h (2800 mL first 8h); Brooke 2*70*20 = 2800 mL/24h. PASS (matches META expected).
- low edge (0.1 kg, 0% TBSA): 0 mL/24h. PASS.
- mid (50 kg, 10% TBSA): Parkland 2000 mL/24h (1000 mL first 8h); Brooke 1000 mL/24h. PASS.
- high (120 kg, 50% TBSA): Parkland 4*120*50 = 24,000 mL/24h (12,000 mL first 8h); Brooke 12,000 mL/24h. PASS.
- hours-since-injury branch (70 kg, 20% TBSA, h=2): remaining first-8h window = 6h. Remaining first-8h = (5600/2) * (6/8) = 2100 mL @ 350 mL/hr. PASS.
- hours-since-injury at 8 (boundary): branch not entered (condition is `< 8`), no remainingInFirst8h fields added. PASS - correct behavior since first-8h window has ended.

## Cross-implementation differential
- Reference implementation: Parkland formula per Baxter & Shires 1968; cross-checked against the ABA Advanced Burn Life Support manual (current edition).
- Test case: META example.
- Sophie result: Parkland 5600 mL/24h (2800 mL first 8h); Brooke 2800 mL/24h.
- Reference result: 4*70*20 = 5600 mL; 2*70*20 = 2800 mL.
- Delta: 0%. PASS.

## Edge-input handling notes
- `num()` rejects weight outside [0.1, 400] kg, TBSA outside [0, 100]%. Hours-since-injury is optional; when blank the renderer passes undefined and the remaining-in-first-8h block is suppressed.
- The result is shown in mL and mL/hr, with both formulas side-by-side; the renderer never silently substitutes one formula for the other.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Three labelled number inputs; output region `aria-live="polite"` with two `<h3>` formula headers and `<ul>` line items per formula. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
