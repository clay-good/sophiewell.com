# v11 audit - Tetanus Prophylaxis Decision Tree (`tetanus`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CDC ACIP tetanus prophylaxis recommendations (Kretsinger K et al. MMWR Recomm Rep 2006; reaffirmed in the current CDC Pinkbook chapter "Tetanus"). The clean-minor / dirty-wound split, the 10-year and 5-year booster intervals, and the TIG indication for unknown / <3 doses on a dirty wound are unchanged in the current edition.

## Boundary examples added
- Clean minor + unknown/<3 doses: Tdap Yes, TIG No. Matches CDC table verbatim.
- Clean minor + >=3 doses last >10 yr: Tdap Yes, TIG No. PASS.
- Clean minor + >=3 doses last <=10 yr: Tdap No, TIG No. PASS.
- Dirty/serious + unknown/<3 doses: Tdap Yes, TIG Yes. PASS.
- Dirty/serious + >=3 doses last >5 yr: Tdap Yes, TIG No. PASS.
- Dirty/serious + >=3 doses last <=5 yr: Tdap No, TIG No. PASS.
- All six rows in `data/tetanus/tetanus.json` cross-checked against the CDC ACIP guidance table.

## Cross-implementation differential
- N/A (decision tree). The differential is "does the bundled six-row table match the CDC table?" — cross-checked row-by-row; all six rows match.

## Edge-input handling notes
- Two-step tree (wound type -> immunization status) via shared `renderDecisionTree`; back navigation preserves prior choices via `stateKey: 'tet'`.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Decision tree renders labelled radio/button options; selection is keyboard-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
