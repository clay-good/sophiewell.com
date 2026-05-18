# v11 audit - Defibrillation Energy Calculator (`defib`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: AHA ECC 2020 guidelines, defibrillation/cardioversion energy ranges. Adult VF/pVT: 120-200 J biphasic (manufacturer-specific; 200 J if unknown) or 360 J monophasic. Adult cardioversion: 50-100 J narrow regular SVT; 120-200 J synchronized for AF; 100 J synchronized for monomorphic VT. Pediatric VF/pVT: 2 J/kg first shock, 4 J/kg subsequent (max 10 J/kg or adult dose). Pediatric cardioversion: 0.5-1 J/kg first, then 2 J/kg.

## Boundary examples added
`defibEnergy({population, scenario, weightKg, shockNumber, waveform})` in [lib/field.js](../../../lib/field.js).
- low (META example: adult biphasic VF/pVT, shock 1): "120-200 J (manufacturer specific); 200 J if unknown". PASS.
- mid (adult cardioversion AF): "120-200 J synchronized". PASS.
- mid (adult monophasic VF/pVT): "360 J". PASS.
- pediatric first shock VF/pVT @ 20 kg: 2 x 20 = 40 J. PASS.
- pediatric subsequent shock VF/pVT @ 20 kg: 4 x 20 = 80 J (>= 4 J/kg, capped at 10 J/kg = 200 J / adult dose). PASS.
- pediatric subsequent shock @ 60 kg: 4 x 60 = 240 J, capped at 10 x 60 = 600 J (no cap reached). PASS.
- pediatric cardioversion first shock @ 10 kg: 0.5 x 10 = 5 J synchronized. PASS.
- pediatric weight boundary low (1 kg): accepted; subsequent shock = 4 J. PASS.

## Cross-implementation differential
- Reference implementation: AHA PALS Provider Manual (2020) and AHA ACLS Provider Manual (2020).
- Test case: pediatric VF/pVT first shock @ 20 kg.
- Sophie result: 40 J.
- Reference result: 2 J/kg x 20 = 40 J.
- Delta: 0%. PASS.

## Edge-input handling notes
- `num('weightKg', ...)` for pediatric scenarios; rejects weights outside [1, 80] kg (high end matches typical pediatric upper bound; >80 kg uses adult dose per AHA).
- Unknown population/scenario combinations throw a clear TypeError caught by `safe()` in the renderer.
- Waveform selector defaults to biphasic (current standard); monophasic remains available for legacy gear documentation.
- Shock number defaults to 1 when input is empty (matches the "first shock" default).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- All inputs are labelled selects/number fields; output region `aria-live="polite"`. Reset-to-example produces a non-alarming "Adult biphasic VF/pVT: 120-200 J" result. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
