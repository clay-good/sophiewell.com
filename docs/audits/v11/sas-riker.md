# v11 audit - sas-riker

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Riker RR, Picard JT, Fraser GL. *Prospective evaluation of the Sedation-Agitation Scale for adult critically ill patients.* Crit Care Med. 1999;27(7):1325-1329. Seven-row picker (1 unarousable through 7 dangerous agitation) plus the SCCM PADIS 2018 goal band SAS 3-4 (Devlin JW, et al. Crit Care Med. 2018;46(9)).

`lib/scoring-v4.js sasRiker()` exposes the 7-row picker and returns the Riker 1999 descriptor with a Sophie-quoted SCCM PADIS 2018 goal-band interpretation per spec-v11 §5. Ships side by side with the `rass` tile.

## Boundary examples added
- low: SAS 1 (Unarousable) -> deeper than goal.
- mid (tile example): SAS 4 (Calm and cooperative) -> goal band per Riker 1999 / SCCM PADIS 2018.
- mid: SAS 3 (Sedated) -> still within the goal band (3-4).
- high: SAS 7 (Dangerous agitation) -> agitated; review sedation, analgesia, and delirium.

## Cross-implementation differential
- Reference implementation: Riker RR, et al. Crit Care Med. 1999;27(7):1325-1329 (SAS table).
- Test case: SAS 5.
- Sophie result: level 5, descriptor 'Agitated...'; agitated band.
- Reference result: same descriptor; SAS 5 is above the goal band 3-4. PASS.

## Edge-input handling notes
- Input clamped to 1-7 via `Math.max(1, Math.min(7, ...))`.

## A11y / keyboard notes
- One labeled `<select>` with seven options; Tab-reachable; output region `aria-live="polite"`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
