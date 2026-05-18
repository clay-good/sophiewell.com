# v11 audit - AVPU <-> GCS Quick Reference (`avpu-gcs`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: McNarry AF, Goldhill DR. Simple bedside assessment of level of consciousness: comparison of two simple assessment scales with the Glasgow Coma Scale. Anaesthesia. 2004;59(1):34-37. Approximate AVPU -> GCS mapping: A (alert) ~ GCS 15 (range 14-15), V (responds to voice) ~ GCS 13 (range 12-14), P (responds to pain) ~ GCS 8 (range 7-9), U (unresponsive) ~ GCS 3 (range 3-6).

## Boundary examples added
`avpuToGcs(level)` in [lib/clinical-v5.js:406](../../../lib/clinical-v5.js#L406).
- A: typical 15, range 14-15, "Alert and oriented." PASS.
- V: typical 13, range 12-14, "Responds to voice." PASS.
- META example (P): typical 8, range 7-9, "Responds to pain only." PASS (matches META expected).
- U: typical 3, range 3-6, "Unresponsive." PASS.
- Coverage spans all four AVPU levels; the audit confirms the renderer prints the range AND the muted footer reminder that AVPU does not finely map to GCS.

## Cross-implementation differential
- Reference implementation: McNarry & Goldhill 2004 mapping.
- Test case: META example (P).
- Sophie result: P -> typical GCS 8 (range 7-9).
- Reference result: McNarry/Goldhill mapping for P responds-to-pain centers at GCS 8 with bedside variation in 7-9.
- Delta: 0/0. PASS.

## Edge-input handling notes
- `avpuToGcs` upper-cases and trims input; unknown levels throw a clear RangeError caught by `safe()` in the renderer.
- Select is a closed list with four options; non-AVPU input is impossible from the UI.
- The renderer's footer reminds the user "AVPU does not finely map to GCS; ranges are approximations" - the guardrail against treating this as a precise conversion.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Single labelled select; output is an `<ul>` inside `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
