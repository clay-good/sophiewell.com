# v11 audit - QTc Correction (`qtc`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Bazett HC. *An analysis of the time-relations of electrocardiograms.* Heart. 1920;7:353-370 (QTc = QT / sqrt(RR)). Fridericia LS. *Die Systolendauer im Elektrokardiogramm bei normalen Menschen.* Acta Med Scand. 1920;53:469-486 (QTc = QT / cbrt(RR)). Sagie A et al. *An improved method for adjusting the QT interval for heart rate (the Framingham Heart Study).* Am J Cardiol. 1992;70(7):797-801 (QTc = QT + 154 * (1 - RR)). Hodges M et al. *Bazett's QT correction reviewed.* J Electrocardiol. 1983;16(4):371-378 (QTc = QT + 1.75 * (HR - 60)).

`lib/clinical.js qtc()` implements all four formulas; `RR = 60 / HR`. Result rounded to whole ms.

## Boundary examples added
- low (slow heart rate, baseline): QT 400 ms, HR 60 -> RR 1.0; all four formulas yield 400 (this is the reference point where every correction collapses to QT itself). Matches META example.
- mid (typical tachycardia): QT 380 ms, HR 90 -> RR 0.667; Bazett 380/sqrt(0.667) = 465; Fridericia 380/cbrt(0.667) = 435; Framingham 380 + 154*(1-0.667) = 431; Hodges 380 + 1.75*30 = 432.
- high (severe tachycardia, prolonged QT): QT 460 ms, HR 120 -> RR 0.5; Bazett 460/sqrt(0.5) = 651; Fridericia 460/cbrt(0.5) = 579; Framingham 460 + 154*0.5 = 537; Hodges 460 + 1.75*60 = 565. (Demonstrates how Bazett over-corrects at high HR — exactly why all four formulas are reported.)

## Cross-implementation differential
- Reference: each of the four original 1920-1992 papers, hand-computed.
- Test case: META example. Sophie all-four-400 / reference all-four-400. Delta 0%. PASS.

## Edge-input handling notes
- HR validated `min:1` to avoid divide-by-zero. QT validated `min:0`. The renderer presents all four formulas side-by-side rather than picking one, because the choice is institution-dependent (cardiology often prefers Fridericia; many ICUs use Bazett; the Framingham and Hodges formulas are linear and reduce over-correction at HR extremes).
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled inputs; output is a `<ul>` listing all four formulas with units. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
