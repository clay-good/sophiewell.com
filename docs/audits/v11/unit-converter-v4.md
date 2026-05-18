# v11 audit - Unit Converter (lab + vitals + basics) (`unit-converter-v4`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Standard SI <-> conventional conversion factors per NIH/NLM (glucose: 1 mg/dL = 0.05551 mmol/L; cholesterol: 1 mg/dL = 0.02586 mmol/L; creatinine: 1 mg/dL = 88.4 µmol/L; BUN urea: 1 mg/dL = 0.357 mmol/L; calcium: 1 mg/dL = 0.2495 mmol/L; uric acid: 1 mg/dL = 59.48 µmol/L). HbA1c NGSP<->IFCC per IFCC master equation: IFCC (mmol/mol) = 10.93 × NGSP% − 23.50. mmHg<->kPa: 1 mmHg = 0.133322 kPa. Temperature: C = (F−32)·5/9. Length: 1 in = 2.54 cm exactly. Weight: 1 lb = 0.45359237 kg exactly. All constants centralized in `lib/unit-convert.js`.

## Boundary examples added
- META example (glucose): 90 mg/dL × 0.05551 = 4.996 mmol/L -> displayed 5.0 mmol/L. PASS.
- low (glucose hypo edge): 50 mg/dL -> 2.776 mmol/L. Reference 2.78 mmol/L. PASS.
- high (glucose DKA edge): 600 mg/dL -> 33.306 mmol/L. Reference 33.3 mmol/L. PASS.
- HbA1c: 7.0% NGSP -> 10.93·7.0 − 23.50 = 53.01 mmol/mol IFCC -> displayed 53.0. PASS.
- Temperature: 98.6 °F -> 37.0 °C. 100.4 °F -> 38.0 °C. PASS.
- Height: 70 in × 2.54 = 177.80 cm. PASS.
- Weight: 154 lb × 0.45359237 = 69.85 kg. PASS.
- Feet+inches: 5 ft 10 in -> 60+10 = 70 in × 2.54 = 177.8 cm. PASS.

## Cross-implementation differential
- Reference implementation: NIH/NLM "SI Unit Conversion" reference table, hand-computed; cross-checked against the NIST physical-constants table for the exact lb/in factors and against the IFCC master equation for HbA1c.
- Test case: each category above.
- Sophie result: matches reference within displayed precision (3 decimal places for lab; 2 for temperature/length; 1 for IFCC HbA1c).
- Delta: ≤0.5% across all categories. PASS.
- Existing `test/unit/unit-convert.test.js` pins the factor constants and edge cases (verified clean in npm test).

## Edge-input handling notes
- Empty `uc-v1` / `uc-v2` produce no result row (the renderer only pushes a line when `Number.isFinite(v)`); no spurious zero output.
- Category select drives the active conversion; switching category clears the result via the `change` listener.
- The renderer uses `step="any"` for numeric inputs to allow decimals (e.g., 7.2% HbA1c, 4.5 mg/dL calcium).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Three labelled inputs (category select, value1, value2); result rendered as a `<ul>`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
