# v11 audit - rass

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Sessler CN, Gosnell MS, Grap MJ, et al. *The Richmond Agitation-Sedation Scale: validity and reliability in adult intensive care unit patients.* Am J Respir Crit Care Med. 2002;166(10):1338-1344. Table 1 (10-row picker, -5 unarousable through +4 combative). SCCM PADIS 2018 light-sedation target band (-2 to 0) per Devlin JW, et al. Crit Care Med. 2018;46(9):e825-e873.

`lib/scoring-v4.js rass()` exposes the 10-row picker and returns the canonical Sessler 2002 descriptor with a Sophie-quoted SCCM PADIS 2018 target-band interpretation per spec-v11 §5.

## Boundary examples added
- low: RASS -5 (Unarousable) -> deeper than SCCM PADIS 2018 target band.
- mid (tile example): RASS 0 (Alert and calm) -> in the SCCM PADIS 2018 light-sedation target band (-2 to 0).
- mid+: RASS -2 (Light sedation) -> in the target band.
- high: RASS +4 (Combative) -> agitated; consider sedation review.

## Cross-implementation differential
- Reference implementation: Sessler CN, et al. Am J Respir Crit Care Med. 2002;166(10):1338-1344 Table 1.
- Test case: RASS -3.
- Sophie result: level -3, descriptor 'Moderate sedation...'; deeper-than-target band.
- Reference result: same descriptor; SCCM PADIS 2018 target band -2 to 0 means -3 is outside the goal. PASS.

## Edge-input handling notes
- Input clamped to -5..+4 via `Math.max(-5, Math.min(4, Math.round(...)))`.

## A11y / keyboard notes
- One labeled `<select>` with ten options; Tab-reachable; output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
