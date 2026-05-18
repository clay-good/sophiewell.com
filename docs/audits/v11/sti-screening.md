# v11 audit - STI Screening Intervals (`sti-screening`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: CDC Sexually Transmitted Infections Treatment Guidelines, 2021 (Workowski KA et al. MMWR Recomm Rep 2021;70(4):1-187) plus the current CDC screening recommendations by population (USPSTF aligned for women <25 and pregnant patients; CDC for MSM and high-risk populations).

## Boundary examples added
- Women <25 sexually active: Chlamydia + Gonorrhea annually. Matches CDC / USPSTF.
- Pregnant women: HIV + Syphilis + HepB + Chlamydia at first prenatal visit. Matches CDC perinatal screening guidance.
- MSM: HIV + Syphilis + Chlamydia + Gonorrhea (3-site) at least annually; 3-6 mo if higher risk. Matches CDC MSM screening guidance.
- Additional bundled rows in `data/sti-screening/sti.json` cover the major CDC-defined screening populations (verified by reading the JSON).

## Cross-implementation differential
- N/A (lookup / reference table). The differential is "do the bundled population/test/interval rows match CDC 2021 STI guidelines?" — cross-checked row-by-row.

## Edge-input handling notes
- No user input; pure reference table. The renderer joins the `tests` array with `;` for display via `renderTable`.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- `renderTable` semantic `<table>` with Population / Tests / Interval columns. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
