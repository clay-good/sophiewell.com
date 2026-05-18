# v11 audit - QTc Suite (Bazett / Fridericia / Framingham / Hodges) (`qtc-suite`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Bazett 1920; Fridericia 1920; Sagie (Framingham) Am J Cardiol 1992;70(7):797-801; Hodges J Electrocardiol 1983;16(4):371-378. Same four formulas as [[qtc]] above, surfaced as a dedicated suite tile.

`lib/clinical-v4.js qtcAll()` packages `qtcBazett`, `qtcFridericia`, `qtcFramingham`, `qtcHodges` — each identical math to the four-up `qtc()` in `lib/clinical.js`. The two implementations agree by construction at HR=60 and across the typical clinical range.

## Boundary examples added
- low (META example, baseline): QT 400 ms, HR 60 -> RR 1.0; all four formulas yield 400 ms. Matches META expected.
- mid (typical tachycardia): QT 380, HR 90 -> Bazett 465 / Fridericia 435 / Framingham 431 / Hodges 432.
- high (severe tachycardia + long QT): QT 460, HR 120 -> Bazett 651 / Fridericia 579 / Framingham 537 / Hodges 565.

## Cross-implementation differential
- Reference: same four 1920-1992 source papers; hand-computed; cross-checked against `lib/clinical.js qtc()` to ensure the suite and the single-tile match exactly (they share the same formulas).
- Test case: META example. Sophie all-four-400 / reference all-four-400 / `qtc()` all-four-400. Delta 0%. PASS.

## Edge-input handling notes
- Same HR/QT validation as [[qtc]]. The suite differs from the single tile only in surfacing all four formulas in a dedicated tile (some users land here from the home grid; the four-up output is identical).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled inputs; output is a `<ul>`. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
