# v11 audit - aldrete-padss

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Aldrete JA. *The post-anesthesia recovery score revisited.* J Clin Anesth. 1995;7(1):89-91 (five domains each 0-2; total 0-10; >=9 ready for PACU-to-floor discharge). Chung F, Chan VW, Ong D. *A post-anesthetic discharge scoring system for home readiness after ambulatory surgery.* J Clin Anesth. 1995;7(6):500-506 (five domains each 0-2; total 0-10; >=9 ready for home discharge).

`lib/scoring-v4.js padss()` and the existing `aldrete()` are composed side-by-side in the renderer. Both return `{score, parts, band, ...}`.

## Boundary examples added (PADSS; existing aldrete tests cover Aldrete bands)
- 0 (all zeros) -> not ready for discharge.
- 8 (upper edge of not-ready) -> not ready.
- 9 (cutoff edge) -> ready for home discharge.
- 10 (all maxima) -> ready for home discharge.

## Cross-implementation differential
- Reference: Chung 1995 worked example "9 or 10 of 10 -> ready for home."
- Sophie result: PADSS 9 -> ready, PADSS 8 -> not ready. PASS.

## Edge-input handling notes
- Each domain is clamped to [0, 2]; non-numeric coerces to 0.

## A11y / keyboard notes
- Ten labeled range inputs with linked output spans; Tab-reachable; aria-live result region.

## Defects opened
- none

## Status
- PASS
