# v11 audit - four-ts

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Lo GK, Juhl D, Warkentin TE, Sigouin CS, Eichler P, Greinacher A. *Evaluation of pretest clinical score (4 T's) for the diagnosis of heparin-induced thrombocytopenia in two clinical settings.* J Thromb Haemost. 2006;4(4):759-765. Four domains each scored 0-2: Thrombocytopenia, Timing of platelet fall, Thrombosis or other sequelae, oTher causes of thrombocytopenia. Sum 0-8. Bands per Lo 2006 Table 2: 0-3 low, 4-5 intermediate, 6-8 high pretest probability of HIT.

`lib/scoring-v4.js fourTs()` sums the four 0-2 domain scores after clamping each per-domain value to [0, 2] so a slider drift cannot push a single domain outside the published per-item range.

## Boundary examples added
- 0 of 8 (all zeros; tile example) -> low band.
- 3 of 8 (upper edge of low band) -> low band.
- 4 of 8 (lower edge of intermediate) -> intermediate band.
- 5 of 8 -> intermediate band.
- 6 of 8 (lower edge of high band) -> high band.
- 8 of 8 (all 2s) -> high band.
- per-domain clamp: 99 / -1 -> 2 / 0 respectively.

## Cross-implementation differential
- Reference: Lo 2006 Table 2.
- Test case: thrombocytopenia 2 + timing 2 + thrombosis 1 + other 0 = 5 -> intermediate.
- Sophie result: 5 of 8, intermediate band.
- Reference: same. PASS.

## Edge-input handling notes
- Per-item clamp to [0, 2] handles slider out-of-range, non-finite, and negative values.

## A11y / keyboard notes
- Four labeled range inputs (0-2) with live `<output>` echoing the current value; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
