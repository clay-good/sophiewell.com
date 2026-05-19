# v11 audit - cpot

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Gelinas C, Fillion L, Puntillo KA, Viens C, Fortier M. *Validation of the Critical-Care Pain Observation Tool in adult patients.* Am J Crit Care. 2006;15(4):420-427. Four behaviors (facial expression 0-2; body movements 0-2; muscle tension 0-2; ventilator compliance OR vocalization 0-2). Range 0-8; cutoff >=3 = unacceptable pain.

`lib/scoring-v4.js cpot()` sums the four Gelinas 2006 behaviors and returns the score plus a pain-band interpretation per spec-v11 §5.

## Boundary examples added
- low (tile example): all four behaviors at 0 -> CPOT 0; acceptable pain.
- mid: facial 1 + body 1 = 2 -> CPOT 2; still acceptable.
- threshold: facial 1 + body 1 + muscle 1 = 3 -> unacceptable pain (cutoff met).
- high: all four at 2 = 8 -> CPOT 8 (Gelinas 2006 maximum); unacceptable pain.

## Cross-implementation differential
- Reference implementation: Gelinas C, et al. Am J Crit Care. 2006;15(4):420-427 (CPOT scoring table).
- Test case: facial 2, body 1, muscle 0, ventilator 1.
- Sophie result: score 4; unacceptable-pain band.
- Reference result: same sum 4; >=3 cutoff met. PASS within one ordinal category.

## Edge-input handling notes
- Four numeric inputs each clamped to 0-2 via `Math.max(0, Math.min(2, Math.round(...)))`.

## A11y / keyboard notes
- Four labeled `<select>` controls; Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
