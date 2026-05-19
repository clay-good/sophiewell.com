# v11 audit - orbit-bleeding

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: O'Brien EC, Simon DN, Thomas LE, et al. *The ORBIT bleeding score: a simple bedside score to assess bleeding risk in atrial fibrillation.* Eur Heart J. 2015;36(46):3258-3264. Five weighted criteria (low Hb/Hct +2, age >74 +1, bleeding history +2, renal insufficiency eGFR <60 +1, antiplatelet treatment +1); sum 0-7; bands 0-2 low, 3 intermediate, 4-7 high (annual major-bleed rates 2.4% / 4.7% / 8.1% per O'Brien 2015 Table 3).

`lib/scoring-v4.js orbitBleeding()` sums the five weighted contributions and returns the per-input subscores plus a band citing O'Brien 2015 Table 3. The two +2 contributors (Hb/Hct, bleeding history) are weighted explicitly via the boolean-to-weight pattern; no per-item floor is required because each input is a clinical fact rather than a continuous variable.

## Boundary examples added
- 0 of 7 (no risk factors; tile example) -> low risk 2.4%/yr per O'Brien 2015.
- 3 of 7 (low Hb/Hct +2 + antiplatelet +1) -> intermediate 4.7%/yr.
- 7 of 7 (all five criteria) -> high 8.1%/yr.
- 2 of 7 boundary (e.g., age >74 + renal insufficiency) -> low band (upper edge of 0-2).
- 4 of 7 boundary (e.g., bleeding history +2 + low Hb +2... wait that's 4) -> high band.

## Cross-implementation differential
- Reference: O'Brien 2015 Table 3 worked through manually.
- Test case: low Hb/Hct (2) + age >74 (1) + antiplatelet (1) = 4 -> high band, 8.1%/yr.
- Sophie result: 4 of 7, high band.
- Reference: same. PASS.

## Edge-input handling notes
- Inputs interpreted via `x ? weight : 0` so `undefined` defaults to 0.
- The Hb/Hct criterion is a single clinical boolean (clinician resolves sex-specific thresholds offline) per the published rubric.

## A11y / keyboard notes
- Five labeled checkboxes; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
