# v11 audit - crb65

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Lim WS, van der Eerden MM, Laing R, et al. *Defining community acquired pneumonia severity on presentation to hospital: an international derivation and validation study.* Thorax. 2003;58(5):377-382. Four binary criteria; 30-day mortality bands 0: 1.2%; 1-2: 8.2%; 3-4: 31.4%.

`lib/scoring-v4.js crb65()` sums the four binary criteria and returns the Lim 2003 mortality band. Ships alongside the existing `curb-65` tile so a site without BUN at presentation can still risk-stratify.

## Boundary examples added
- low (tile example): no criteria -> 0; ~1.2% mortality.
- mid: confusion + age >=65 -> 2; ~8.2% mortality.
- high: confusion + RR + BP + age -> 4; ~31.4% mortality.
- threshold check: score 3 maps to the >=3 high-mortality band (the Lim 2003 published cut).

## Cross-implementation differential
- Reference: Lim WS, et al. Thorax. 2003;58(5):377-382 hand sum.
- Test case: confusion + BP + age.
- Sophie result: 3 (high band).
- Reference: same. PASS.

## Edge-input handling notes
- Four boolean inputs only.

## A11y / keyboard notes
- Four labeled checkboxes; Tab-reachable. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
