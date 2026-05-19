# v11 audit - bps

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Payen JF, Bru O, Bosson JL, et al. *Assessing pain in critically ill sedated patients by using a behavioral pain scale.* Crit Care Med. 2001;29(12):2258-2263. Three behaviors each scored 1-4 (facial expression, upper limb movements, compliance with mechanical ventilation). Range 3-12; cutoff >5 = unacceptable pain.

`lib/scoring-v4.js bps()` sums the three Payen 2001 behaviors and returns the score plus a pain-band interpretation per spec-v11 §5. The tile is for sedated, ventilated patients.

## Boundary examples added
- low (tile example): all three behaviors at 1 -> BPS 3; acceptable pain.
- mid: facial 2 + upper limb 1 + vent 2 = 5 -> still acceptable (cutoff is >5).
- threshold: facial 2 + upper limb 2 + vent 2 = 6 -> unacceptable pain.
- high: all three at 4 = 12 -> BPS 12 (Payen 2001 maximum); unacceptable pain.

## Cross-implementation differential
- Reference implementation: Payen JF, et al. Crit Care Med. 2001;29(12):2258-2263 (BPS scoring table).
- Test case: facial 3, upper limb 2, vent 3.
- Sophie result: score 8; unacceptable-pain band.
- Reference result: same sum 8; >5 cutoff met. PASS within one ordinal category.

## Edge-input handling notes
- Three numeric inputs each clamped to 1-4 via `Math.max(1, Math.min(4, Math.round(...)))`.

## A11y / keyboard notes
- Three labeled `<select>` controls; Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
