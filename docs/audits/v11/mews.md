# v11 audit - mews

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Subbe CP, Kruger M, Rutherford P, Gemmel L. *Validation of a modified Early Warning Score in medical admissions.* QJM. 2001;94(10):521-526. Table 1 (parameter scoring) and Table 2 (outcome bands).

Aggregate score 0-14 over systolic BP, pulse, respiratory rate, temperature, and AVPU consciousness. MEWS predates NEWS2 and omits SpO2 and supplemental-oxygen scoring; that omission is the v12 distinction from `news2` and is documented inline in the tile description. `lib/scoring-v4.js mews()` implements the five-parameter sum and the four-band split (0-2 / 3 / 4 / >=5) exactly as Subbe 2001 Table 2 reports it.

## Boundary examples added
- low: sbp 120, pulse 78, rr 14, t 37.0, A -> 0 (low band 0-2).
- mid: sbp 95, pulse 105, rr 22, t 38.6, V -> 1 + 1 + 2 + 2 + 1 = 7 (>=5 band: increased risk of death, ICU admission, and HDU admission per Subbe 2001 Table 2).
- high: sbp 65, pulse 140, rr 35, t 34.5, U -> 3 + 3 + 3 + 2 + 3 = 14 (>=5 band).

Band-edge cases:
- score 3: sbp 95, pulse 105, rr 14, t 37.0, V -> 1 + 1 + 0 + 0 + 1 = 3 (low-intermediate band 3 per Subbe 2001 Table 2).
- score 4: sbp 95, pulse 105, rr 14, t 37.0, P -> 1 + 1 + 0 + 0 + 2 = 4 (intermediate band 4 per Subbe 2001 Table 2).

## Cross-implementation differential
- Reference implementation: Subbe CP, et al. QJM. 2001;94(10):521-526, Table 1.
- Test case: sbp 95, pulse 105, rr 22, t 38.6, V.
- Sophie result: 7, >=5 band.
- Reference result: 7, >=5 band per Subbe 2001 Table 2.
- Delta: 0 / one ordinal category. PASS.

## Edge-input handling notes
- Inputs are typed `number` and validated by the renderer's `safe()` wrapper; the AVPU select defaults to A. The select intentionally omits "C - new Confusion": MEWS predates the NEWS2 ACVPU revision and Subbe 2001 Table 1 uses AVPU.
- Subbe 2001 Table 1 caps SBP at >=200 with a 2-point band; the implementation matches.
- The view labels the omission of SpO2 / supplemental O2 indirectly by surfacing only the five Subbe 2001 fields and by sitting next to the `news2` tile in the catalog; the patient-decoder distinction is also called out in spec-v12 §3.1.2.

## A11y / keyboard notes
- Four labeled `number` inputs, one labeled select. All Tab-reachable in source order; output region `aria-live="polite"`. `npm run test:a11y` clean after the tile was added.

## Defects opened
- none

## Status
- PASS
