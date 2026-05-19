# v11 audit - cfs

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Rockwood K, Song X, MacKnight C, et al. *A global clinical measure of fitness and frailty in elderly people.* CMAJ. 2005;173(5):489-495 (derivation). The v2 (2020) descriptors are the Dalhousie public CFS PDF wording; the citation records both the 2005 derivation and the 2020 v2 wording source.

`lib/scoring-v4.js cfs()` exposes a single 9-level picker (1-9) returning the canonical descriptor and a Sophie-quoted summary band per Rockwood 2005. Per the [spec-v11 §5](../../../docs/spec-v11.md) interpretation contract, the descriptors are reproduced verbatim and the band text quotes the Rockwood 2005 / Dalhousie 2020 outcome-association language.

## Boundary examples added
- low: CFS 1 (Very fit) -> 'not frail' band.
- mid (tile example): CFS 2 (Well) -> 'not frail' band.
- vulnerable: CFS 4 (Living with very mild frailty) -> 'vulnerable / pre-frail' band.
- moderate: CFS 6 (Living with moderate frailty) -> 'mild-to-moderate frailty; increased risk' band.
- severe: CFS 8 (Living with very severe frailty) -> 'severe frailty; high risk' band.
- end-of-life: CFS 9 (Terminally ill) -> 'approaching end of life' band.

## Cross-implementation differential
- Reference implementation: Rockwood K, et al. CMAJ. 2005;173(5):489-495 Figure 1 (the canonical CFS chart) and the Dalhousie public v2 (2020) PDF.
- Test case: CFS 6.
- Sophie result: level 6, descriptor 'Living with moderate frailty', mild-to-moderate band.
- Reference result: same level / descriptor / band. PASS.

## Edge-input handling notes
- Level input is clamped to 1-9 inclusive via `Math.max(1, Math.min(9, Math.round(...)))`; out-of-range inputs are coerced to the nearest valid level.
- Non-numeric input falls through `Number(...)` to NaN -> coerced to 1 via the clamp (renders as 'Very fit').

## A11y / keyboard notes
- One labeled `<select>` with 9 options carrying both the numeric level and the canonical descriptor; Tab-reachable; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
