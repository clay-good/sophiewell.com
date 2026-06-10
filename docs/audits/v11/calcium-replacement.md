# v11 audit - calcium-replacement

- Auditor: CG
- Date: 2026-06-10 (spec-v64).
- Citation re-verified against: AHA ACLS 2020 (Panchal AR, et al. Circulation 2020;142:S366-S468) for the hyperkalemia membrane-stabilization calcium recommendation; elemental-calcium content per USP / product labeling (calcium chloride 10% = 27.3 mg / 1.36 mEq per mL; calcium gluconate 10% = 9.3 mg / 0.465 mEq per mL).

lib/clinical-v7.js calciumReplacement() — given a calcium salt (gluconate 10% / chloride 10%) and a dose in grams, returns the elemental calcium delivered (mg and mEq), the 10%-solution volume (mL), and the equivalent dose of the OTHER salt that delivers the same elemental calcium, plus the standard adult dose for the chosen indication. The clinical purpose is to compute away the recurring, dangerous gluconate-vs-chloride "1 g vs 1 g" confusion: chloride carries ~3x the elemental calcium per gram.

## Boundary examples added
- See test/unit/calcium-replacement.test.js (5 cases): gluconate 1 g (tile example: 93 mg / 4.6 mEq / 0.34 g chloride equivalent), chloride 1 g (273 mg / 13.6 mEq / 2.94 g gluconate equivalent — the ~3x check), linear scaling at 2 g, the unknown-product null path (fuzz-safe), and the impossible-dose TypeError/RangeError path.

## Cross-implementation differential
- Elemental-calcium content transcribed from USP / product labeling (gluconate 93 mg/g; chloride 273 mg/g; 20.04 mg elemental Ca per mEq), spot-checked against an independent hand calculation (273 / 93 = 2.94 ≈ 3); PASS. Hyperkalemia dose band cross-checked against AHA ACLS 2020.

## Edge-input handling notes
- product is gated first: an unknown / non-string product returns null (no throw, no NaN) — fuzz-safe under the spec-v59 object-aware harness (clinical-v7.js is already enrolled). doseGrams is validated via lib/num.js num({min:0, max:100}); a missing/non-finite/out-of-range value throws TypeError/RangeError, caught by the renderer safe() wrapper. Every interpolated number routes through fmt()/fmtInt()/fmtNum(), so no NaN/Infinity/undefined reaches the DOM. The renderer guards an empty dose with a friendly prompt before computing.

## A11y / keyboard notes
- Labeled select (product, indication) + number input (dose) with label for=; aria-live results region. test:a11y clean.

## Defects opened

- none

## Status
- PASS
