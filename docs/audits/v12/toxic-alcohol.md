# v12 audit - toxic-alcohol

- Auditor: CG
- Date: 2026-06-16
- Citation re-verified against: Smithline N, Gardner KD. JAMA. 1976;236(14):1594-1597 (osmolality); Barceloux DG, et al (AACT) methanol 2002 / ethylene glycol 1999 guidelines (fomepizole indication).

`lib/tox-v86.js toxicAlcohol()` computes the ethanol-corrected calculated osmolality (2*Na + glucose/18 + BUN/2.8 + ethanol/3.7), the signed osmolar gap (measured - calculated, not clamped), and the AACT fomepizole indication: a documented level >20 mg/dL, recent ingestion + gap >10, or strong suspicion + >=2 of (pH<7.3, bicarbonate<20, gap>10). Carries the hard caveat that a normal gap does not exclude toxic alcohol once metabolized to acids (the anion gap rises instead).

## Boundary examples added
- measured 305, Na 140, glucose 90, BUN 14, ethanol 0 -> calc 290, gap 15 (recent ingestion -> indicated).
- ethanol 37 -> adds 10 to calc -> calc 300, gap 5 (correction applied).
- documented level 25 mg/dL -> indicated (>20 mg/dL limb).
- strong suspicion + pH 7.1 + bicarb 15 (2 of 3) -> indicated.
- measured 280, Na 145 -> gap -20, reported signed, not indicated.
- missing osmolality or sodium -> null.

## Cross-implementation differential
- Reference: 2*140 + 90/18 + 14/2.8 = 290 by hand; gap 305-290 = 15; ethanol 37/3.7 = 10.
- Test cases: as above; Sophie identical. PASS.

## Edge-input handling notes
- measuredOsm and Na required and must be finite + positive, else null (no compute). glucose/BUN/ethanol default to 0 if non-finite/negative (additive terms). pH/bicarbonate/knownLevel applied only when finite (pH in 6.5-8.0). Divisors are fixed nonzero constants. The gap is intentionally not clamped (a strongly negative gap is a measurement-error flag). No NaN/Infinity/undefined string (spec-v59 fuzz harness covers lib/tox-v86.js).

## A11y / keyboard notes
- Eight numeric fields and two labeled checkboxes, each with a real `<label for>`; output aria-live="polite". 320px sweep passes with no horizontal scroll.

## Defects opened
- none

## Status
- PASS
