# v11 audit - sas-riker

- Auditor: CG
- Date: 2026-06-11 (spec-v70 re-audit: SAS 3 now reads as in-goal, matching this audit's documented intent). Original audit 2026-05-19.
- Citation re-verified against: Riker RR, Picard JT, Fraser GL. *Prospective evaluation of the Sedation-Agitation Scale for adult critically ill patients.* Crit Care Med. 1999;27(7):1325-1329. Seven-row picker (1 unarousable through 7 dangerous agitation) plus the SCCM PADIS 2018 goal band SAS 3-4 (Devlin JW, et al. Crit Care Med. 2018;46(9)).

`lib/scoring-v4.js sasRiker()` exposes the 7-row picker and returns the Riker 1999 descriptor with a Sophie-quoted SCCM PADIS 2018 goal-band interpretation per spec-v11 §5. Ships side by side with the `rass` tile.

## Boundary examples added
- low: SAS 1 (Unarousable) -> deeper than goal.
- mid (tile example): SAS 4 (Calm and cooperative) -> goal band per Riker 1999 / SCCM PADIS 2018.
- **mid: SAS 3 (Sedated) -> within the light-sedation goal band (3-4). spec-v70 FIX: before v70 the code reported SAS 3 as "deeper than the goal of SAS 3-4; consider lightening sedation" — contradicting both the printed band and this audit's documented intent (and the paired rass(), which accepts its whole -2 to 0 band). Now correctly in-goal.**
- mid: SAS 2 (Very sedated) -> deeper than the 3-4 goal; lower bound now enforced at 2/3.
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
- spec-v70 (fixed this PR): SAS 3 rendered "deeper than the goal of SAS 3-4; consider lightening sedation" although 3 is the lower edge of the goal band the same function prints. The goal branch was `lv === 4` only; widened to accept SAS 3 (`lv === 3`), matching the printed band, the paired rass() range semantics, and this audit's "still within the goal band (3-4)" intent. Root cause: the existing SAS 3 test asserted only `/goal of SAS 3-4/`, which the contradictory "deeper than ... goal of SAS 3-4" string also matched, so it passed vacuously; strengthened to assert in-goal + a SAS 2 lower-bound test.

## Status
- PASS-WITH-FIXES
