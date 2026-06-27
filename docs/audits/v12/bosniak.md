# v12 audit - bosniak

- Auditor: CG
- Date: 2026-06-26
- Citation re-verified against: Silverman SG, Pedrosa I, Ellis JH, et al. Radiology. 2019;292(2):475-488 (class criteria and boundaries cross-verified against the Radiology Assistant Bosniak-2019 page and PMC8017011; ≥ 2 sources, spec-v97).

`lib/radiology-v165.js bosniak()` computes the Bosniak Classification (2019). Group G, Class A.

## Source-governance notes
- Top-down first-match: enhancing nodule (obtuse ≥4 mm or acute any size) → IV; thick (≥4 mm) wall/septa or obtuse ≤3 mm protrusion → III; minimal (3 mm) thickening or ≥4 thin enhancing septa → IIF; 1–3 thin septa or calcification → II; thin smooth wall → I.
- Calcification never upgrades class in v2019 (a deliberate change from older versions) — modelled as a II-qualifier only.
- Every feature combination resolves to exactly one defined class (no undefined/NaN).

## Boundary worked examples added
- thick wall → III; minimal thickening → IIF; obtuse ≤3 mm → III, obtuse ≥4 mm / acute → IV; 1–3 septa or calcification → II; simple → I.

## Edge-input handling notes
- three feature selects required; calcification an optional checkbox; IIF→III and III→IV transitions unit-tested. Blank/non-finite inputs surface a complete-the-fields fallback; covered by the spec-v59 fuzz harness with zero non-finite leaks.

## A11y / keyboard notes
- Three selects + one checkbox, each labelled; output aria-live. 320px sweep, no horizontal scroll.

## Defects opened
- none

## Status
- PASS
