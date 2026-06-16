# v12 audit - truelove-witts

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Truelove SC, Witts LJ. Cortisone in ulcerative colitis; final report on a therapeutic trial. BMJ. 1955;2(4947):1041-1048.

`lib/hepgi-v93.js trueloveWitts()` classifies acute ulcerative colitis as mild / moderate / severe and names which systemic-toxicity criteria are met.

## Boundary worked examples added
- 8 bloody stools, temp 38, HR 100, Hgb 9.5, ESR 40 -> severe (4 systemic criteria).
- 7 bloody stools, no systemic criterion -> moderate (near-miss, not rounded up).
- 2 stools, none -> mild.
- >= 6 stools without bleeding -> not severe.

## Cross-implementation differential
- Reference: Truelove & Witts 1955 severe definition (>= 6 bloody stools/day plus >= 1 of temp > 37.8 C, HR > 90, Hgb < 10.5 g/dL, ESR > 30). Match. PASS.

## Edge-input handling notes
- Missing stool count returns a surfaced guard; blank systemic values are simply not counted. Fuzz harness covers the module, zero non-finite leaks.

## A11y / keyboard notes
- Four labeled numeric inputs + one labeled bleeding <select>; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
