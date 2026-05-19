# v11 audit - dapt-score

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Yeh RW, Secemsky EA, Kereiakes DJ, et al. *Development and validation of a prediction rule for benefit and harm of dual antiplatelet therapy beyond 1 year after percutaneous coronary intervention.* JAMA. 2016;315(16):1735-1749. Nine criteria: Age (<65 = 0; 65-74 = -1; >=75 = -2); CHF or LVEF <30% (+2); vein graft PCI (+2); MI at presentation (+1); prior MI or PCI (+1); diabetes (+1); stent diameter <3 mm (+1); paclitaxel-eluting stent (+1); current smoker (+1). Sum -2 to +10. Cutoff: >=2 favors continuing DAPT beyond 12 months per Yeh 2016.

`lib/scoring-v4.js daptScore()` sums the nine weighted contributions. Age band is modeled as a mutually-exclusive select (`'<65' / '65-74' / '>=75'`) so a single patient cannot double-count; unknown values default to 0 ("<65"). Negative scores are admissible per the published rubric.

## Boundary examples added
- 0 (tile example: age <65, no risk factors) -> does not favor extended DAPT.
- -2 (age >=75, no other factors) -> does not favor extended DAPT.
- +2 boundary (e.g., CHF/LVEF <30% alone) -> favors extended DAPT.
- +1 just below cutoff (e.g., diabetes alone) -> does not favor.
- +10 (max: age <65 + every checkbox) -> favors extended DAPT.

## Cross-implementation differential
- Reference: Yeh 2016 Table 4 worked through manually.
- Test case: CHF (2) + diabetes (1) + age 65-74 (-1) = 2 -> favors extended DAPT.
- Sophie result: 2, favors extended DAPT band.
- Reference: same. PASS.

## Edge-input handling notes
- Age select defaults to '<65' (0); unrecognized strings contribute 0.
- All boolean inputs interpreted via `x ? weight : 0`. Negative composite scores are admissible per Yeh 2016 (lowest possible = -2).

## A11y / keyboard notes
- One labeled select + eight labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
