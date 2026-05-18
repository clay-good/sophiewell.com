# v11 audit - Pediatric Weight Converter (lb/oz <-> kg) (`peds-weight-conv`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: NIST / SI exact definition: 1 lb (avoirdupois) = 0.45359237 kg (NIST Handbook 44, Appendix C). Newborn / infant weight bands cross-referenced to AAP Pediatric Care Online and the AAP *Bright Futures* growth-reference summary (term newborn ~3.0-3.5 kg; LBW <2500 g; VLBW <1500 g; ELBW <1000 g — WHO definitions adopted by AAP).

`lib/unit-convert.js`:
- `lbToKg(v) = v * 0.45359237` (exact conversion factor).
- `lbOzToKg(lb, oz) = lbToKg(lb + oz/16)` with `lb >= 0` and `0 <= oz < 16` validated.
- `kgToLbOz(kg)` returns `{lb: floor(totalLb), oz: (totalLb - floor) * 16}`.

## Boundary examples added
- low (smallest realistic neonate): 1 lb 0 oz = 0.454 kg (ELBW range).
- mid (META example, normal newborn at the small end): 7 lb 5 oz = (7 + 5/16) * 0.45359237 = 7.3125 * 0.45359237 = 3.3169 kg -> rounds to 3.317 kg. PASS.
- high (older infant): 22 lb 0 oz = 22 * 0.45359237 = 9.979 kg.
- reverse direction (META example): 3.5 kg -> kgToLb = 3.5 / 0.45359237 = 7.71618 lb; lb = 7, oz = 0.71618 * 16 = 11.459 oz -> displays "7 lb 11.5 oz". PASS.
- boundary (oz must be < 16): `lbOzToKg(7, 16)` throws RangeError; renderer treats it as invalid and skips that conversion row.

## Cross-implementation differential
- Reference implementation: NIST exact conversion (0.45359237 kg/lb) hand-computed; cross-checked against the NIST Handbook 44 Appendix C table and a second SI conversion utility (Wolfram Alpha).
- Test case: META example — 7 lb 5 oz, and 3.5 kg.
- Sophie result: 3.317 kg and 7 lb 11.5 oz.
- Reference result: 3.3169 kg and 7 lb 11.459 oz (displayed to 1 decimal place in renderer).
- Delta: 0% within display precision. PASS.

The 0.453592 figure shown in the META citation is a five-decimal rounding of the exact 0.45359237 factor used in code — verified that the rounded citation does not introduce computational error because the code uses the full constant.

## Edge-input handling notes
- `pw-lb` and `pw-oz` accept any number; `lbOzToKg` enforces `lb >= 0`, `0 <= oz < 16` and throws otherwise. The renderer additionally guards with `Number.isFinite(...)` and the same range check before invoking, so a negative or 16+ ounce input is silently skipped rather than surfacing a thrown error — appropriate UX for a converter that supports either lb/oz OR kg input independently.
- `pw-kg` requires `> 0` to convert; zero or negative skips the row.
- The newborn/infant reference list rendered alongside the converter is reference data (term newborn ~3.5 kg with range 2.5-4.5; LBW/VLBW/ELBW thresholds; 6-month-old ~7-8 kg; 1-year-old ~10 kg). All cross-checked against WHO weight-for-age tables and AAP Bright Futures.
- The tile is in Group N (Pediatrics & Neonatal) and is flagged `clinical: false` because it is a pure unit conversion plus a reference table — no clinical-decision output.

## A11y / keyboard notes
- Three labelled inputs (lb, oz, OR kg). The "OR" relationship is conveyed by the label text rather than by a radio group, which is sufficient for the use case (entering one side leaves the other auto-skipped). All inputs Tab-reachable. Reference list below output is a plain `<ul>` for assistive-tech consumption. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
