# v11 audit - Unit Converter (`unit-converter`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: NIST SP 811 (Guide for the Use of the International System of Units) and NIST Handbook 44 Appendix C for the exact conversion factors used: 1 lb = 0.45359237 kg; 1 in = 2.54 cm (exact); F<->C affine conversion `C = (F-32)*5/9`.

`lib/clinical.js convert()` dispatches by kind (`weight`, `length`, `temp`) to `lib/unit-convert.js` primitives:
- weight: lbToKg(v) = v * 0.45359237; kgToLb is the inverse.
- length: inchesToCm = v * 2.54; cmToInches is the inverse.
- temperature: handled separately via `convertTemp(value, from, to)`.

## Boundary examples added
- weight (META example): 70 kg -> lb = 70 / 0.45359237 = 154.32 lb. PASS.
- weight reverse: 150 lb -> kg = 150 * 0.45359237 = 68.04 kg. PASS.
- length: 70 in -> 177.8 cm; 100 cm -> 39.37 in. PASS.
- temperature: 98.6 F -> 37.0 C; 37 C -> 98.6 F; 100 C -> 212 F; 32 F -> 0 C. PASS.

All six cases above are pinned by `test/unit/*.test.js` (the "lab-convert" / unit-convert test file).

## Cross-implementation differential
- Reference: NIST SP 811 exact factors; hand-computed.
- Test case: META example. Sophie 154.32 lb / reference 154.323... -> 154.32. Delta 0%. PASS.

## Edge-input handling notes
- `convert()` throws on unknown kind (TypeError); the renderer's safe-wrap surfaces this as an inline error rather than NaN. Temperature conversions are handled via `convertTemp()` which special-cases the affine transform so the relationship 0 °C = 273.15 K = 32 °F is preserved exactly to display precision.
- The tile is the entry-level converter; the more comprehensive lab+vitals converter (`unit-converter-v4`) handles lab-result-specific factors (mg/dL <-> mmol/L for glucose, creatinine, BUN, cholesterol, calcium, uric acid; A1C %, IFCC mmol/mol; mmHg <-> kPa) — that tile is in Group N and is separately audited under wave 3g via `peds-weight-conv` (its weight-conversion path).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Four labelled inputs (value, from-unit select, to-unit select, kind select). Output region is a single labelled value. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
