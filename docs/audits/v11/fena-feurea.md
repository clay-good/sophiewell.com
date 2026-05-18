# v11 audit - FENa / FEUrea (`fena-feurea`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Espinel CH. *The FENa test. Use in the differential diagnosis of acute renal failure.* JAMA. 1976;236(6):579-581 (FENa). Carvounis CP, Nisar S, Guro-Razuman S. *Significance of the fractional excretion of urea in the differential diagnosis of acute renal failure.* Kidney Int. 2002;62(6):2223-2229 (FEUrea).

Formulas:
- FENa (%) = ((urine Na × plasma Cr) / (plasma Na × urine Cr)) × 100. Prerenal threshold < 1%; intrinsic > 2% per Espinel 1976.
- FEUrea (%) = ((urine urea × plasma Cr) / (plasma urea × urine Cr)) × 100. Prerenal threshold < 35%; intrinsic > 50% per Carvounis 2002. Useful when the patient is on a diuretic (which invalidates FENa).

`lib/clinical-v4.js feNa()` and `feUrea()` implement both verbatim and short-circuit to `null` if any input is <= 0 (avoids division-by-zero and protects against negative entries).

## Boundary examples added
FENa:
- low (prerenal): urineNa 20, plasmaNa 140, urineCr 50, plasmaCr 2.0 -> (20×2)/(140×50) × 100 = 40/7000 × 100 = 0.571%. Below 1%; prerenal pattern per Espinel 1976.
- mid (META example, same): FENa ~0.57%.
- high (intrinsic ATN): urineNa 80, plasmaNa 138, urineCr 30, plasmaCr 3.0 -> (80×3)/(138×30) × 100 = 240/4140 × 100 = 5.80%. Above 2%; intrinsic pattern per Espinel 1976.

FEUrea:
- low: urineUrea 200, plasmaUrea 30, urineCr 50, plasmaCr 1.5 -> (200×1.5)/(30×50) × 100 = 300/1500 × 100 = 20%. Below 35%; prerenal pattern per Carvounis 2002.
- mid (META example): urineUrea 300, plasmaUrea 60, urineCr 50, plasmaCr 2.0 -> (300×2)/(60×50) × 100 = 600/3000 × 100 = 20%. Below 35%; prerenal.
- high: urineUrea 200, plasmaUrea 80, urineCr 25, plasmaCr 3.0 -> (200×3)/(80×25) × 100 = 600/2000 × 100 = 30%. Borderline; consult clinical context.

Zero-input edge: any input = 0 returns `null`, rendered as "insufficient data" rather than `NaN` or `Infinity`.

## Cross-implementation differential
- Reference implementation: Espinel 1976 JAMA formula + Carvounis 2002 Kidney Int formula.
- Test case: META example (FENa: 20, 140, 50, 2.0; FEUrea: 300, 60, ...).
- Sophie result: FENa 0.571%, FEUrea 20.0%.
- Reference result: hand-trace 0.571% and 20.0% exactly.
- Delta: 0%. PASS.

## Edge-input handling notes
- Both functions guard against any non-positive input (returning `null`); the renderer translates `null` to the inline message "insufficient data" rather than rendering as a number.
- The tile carries helper text noting that FENa is invalidated by diuretic use within 24 h and that FEUrea should be preferred in that context (per Carvounis 2002).
- The standard cutoff thresholds (FENa < 1% prerenal vs > 2% intrinsic; FEUrea < 35% prerenal) are noted in helper text but the tile reports the percentage and leaves interpretation to the clinician — this is reference, not prescription.

## A11y / keyboard notes
- Six labeled number inputs (urine Na, plasma Na, urine Cr, plasma Cr; urine urea, plasma urea — the two Cr fields shared), Tab-reachable in source order. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
