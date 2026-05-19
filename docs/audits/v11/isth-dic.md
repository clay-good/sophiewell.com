# v11 audit - isth-dic

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Taylor FB Jr, Toh CH, Hoots WK, Wada H, Levi M. *Towards definition, clinical and laboratory criteria, and a scoring system for disseminated intravascular coagulation.* Thromb Haemost. 2001;86(5):1327-1330. Four laboratory components: platelet count (>100 = 0; 50-100 = 1; <50 = 2), fibrin marker D-dimer/FDP (no increase 0; moderate 2; strong 3), prolonged PT (<3 s = 0; 3-6 s = 1; >6 s = 2), fibrinogen (>1 g/L = 0; <=1 = 1). Sum 0-8. Cutoff >=5 = compatible with overt DIC per Taylor 2001. Required gate: an underlying disorder known to be associated with DIC must be present before scoring is applied.

`lib/scoring-v4.js isthDic()` sums the four category weights. The "underlying-disorder" gate is enforced before band emission: when the gate is not met the function returns `gateNotMet: true` and a band that explains why scoring is not applicable, per Taylor 2001's published rubric.

## Boundary examples added
- Gate not met (no underlying disorder; tile example) -> gateNotMet true, scoring not applicable band.
- 0 of 8 with gate met (all baseline categories) -> not overt DIC band.
- 5 of 8 boundary with gate met (e.g., platelet 50-100 (1) + fibrin strong (3) + PT 3-6 s (1)) -> overt DIC band.
- 4 of 8 just below cutoff with gate met -> not overt DIC band.
- 8 of 8 with gate met (platelet <50 + fibrin strong + PT >6 s + fibrinogen <=1) -> overt DIC band.

## Cross-implementation differential
- Reference: Taylor 2001 worked through manually.
- Test case: platelet <50 (2) + fibrin moderate (2) + PT 3-6 s (1) = 5 -> overt DIC band.
- Sophie result: 5 of 8, overt DIC band.
- Reference: same. PASS.

## Edge-input handling notes
- Category selects default to baseline; unrecognized strings contribute 0.
- Underlying-disorder gate blocks band emission when unchecked; the sum is still surfaced so a clinician can verify their work.

## A11y / keyboard notes
- One labeled checkbox gate + four labeled select inputs; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
