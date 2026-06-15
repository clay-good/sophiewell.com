# v12 audit - mue-check

- Auditor: CG
- Date: 2026-06-13
- Citation re-verified against: CMS Medically Unlikely Edits (MUE) program. MUE Adjudication Indicator (MAI): 1 = claim-line edit; 2 = date-of-service edit, absolute (per anatomic/policy limits, never payable); 3 = date-of-service edit, denied but reviewable with documentation.

`lib/billing-v79.js mueCheck()` compares the units billed to the entered MUE value under the entered MAI and returns the pass/deny decision, the payable units, the units at risk, and whether the excess is rescuable. No MUE value table ships (doctrine clause 2); the value and MAI are user inputs.

## Boundary examples added
- 2 units vs MUE 3, MAI 1 -> passes, all 2 payable, 0 at risk.
- 5 units vs MUE 3, MAI 1 -> over: 3 payable, 2 at risk, rescuable on a separate line with a modifier.
- 4 units vs MUE 1, MAI 2 -> 1 payable, 3 at risk, ABSOLUTE: never payable, not rescuable, must not be appealed as a units error.
- 10 units vs MUE 8, MAI 3 -> 8 payable, 2 at risk, reviewable with documentation.

## Cross-implementation differential
- Reference: the CMS MUE MAI semantics applied by hand.
- Test case: MAI 2 over the value -> the excess is reported as permanently non-payable (the case the tool exists to stop a coder from appealing). PASS.
- MAI 1 over the value -> cut-to-limit with the rescue path named; matches the program description. PASS.

## Edge-input handling notes
- Units and MUE value validate as finite integers >= 0; a negative or non-finite input throws RangeError/TypeError. An MAI outside {1,2,3} throws RangeError.
- payableUnits and unitsAtRisk are integers by construction; no fractional or NaN units can reach the DOM.

## A11y / keyboard notes
- Two labeled number inputs, one labeled `<select>`, one labeled checkbox; output region `aria-live="polite"`; numeric fields carry inputmode="numeric". `npm run test:a11y` clean; 320px no-horizontal-scroll sweep passes.

## Defects opened
- none

## Status
- PASS
