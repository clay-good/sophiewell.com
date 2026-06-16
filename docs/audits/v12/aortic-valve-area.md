# v12 audit - aortic-valve-area

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Baumgartner H, Hung J, Bermejo J, et al. Echocardiographic assessment of aortic stenosis: a focused update from the EACVI and the ASE. J Am Soc Echocardiogr. 2017;30(4):372-392; severity bands per the 2020 ACC/AHA valvular guideline (Otto CM, et al. Circulation. 2021;143(5)).

`lib/cardio-v90.js aorticValveArea()` computes the continuity-equation aortic valve area AVA = (pi x (LVOT diameter/2)^2 x LVOT VTI) / AV VTI in cm2, the dimensionless index (LVOT VTI / AV VTI), and the guideline severity band (mild > 1.5, moderate 1.0-1.5, severe < 1.0 cm2). Class B: the severity cutoffs follow a revisable society guideline (docs/citation-staleness.md row).

## Boundary worked examples added
- LVOT d 2.0, LVOT VTI 20, AV VTI 100 -> 0.63 cm2 severe, DI 0.20.
- Severity boundary at 1.0 cm2 (AV VTI = 20*pi) reads moderate; just below reads severe.
- Severity boundary at 1.5 cm2 reads moderate; AV VTI 35 (AVA ~1.80) reads mild.
- AV VTI = 0 guarded -> valid:false fallback.

## Cross-implementation differential
- Reference: hand computation. pi x (1.0)^2 x 20 / 100 = 0.6283 -> 0.63; DI = 20/100 = 0.20. Sophie matches. PASS.

## Edge-input handling notes
- The continuity equation divides by AV VTI, guarded against zero (and a non-positive LVOT diameter) -> surfaced valid:false fallback, never a NaN. The spec-v59 fuzz harness covers the module, zero non-finite leaks. Low-flow / low-gradient states need integrated assessment; the note defers the adjudication to the heart team.

## A11y / keyboard notes
- Three labeled numeric inputs (LVOT diameter, LVOT VTI, AV VTI); output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
