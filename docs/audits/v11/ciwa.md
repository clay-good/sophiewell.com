# v11 audit - CIWA-Ar (alcohol withdrawal) (`ciwa`)

- Auditor: CG
- Date: 2026-05-17
- Citation re-verified against: Sullivan JT, Sykora K, Schneiderman J, Naranjo CA, Sellers EM. *Assessment of alcohol withdrawal: the revised Clinical Institute Withdrawal Assessment for Alcohol scale (CIWA-Ar).* Br J Addict. 1989;84(11):1353-1357. Ten-item scorecard: nine symptom items each 0-7 + orientation/clouding 0-4; max 67.

`lib/scoring-v4.js ciwaAr()` implements verbatim:
- Nine 0-7 items: nausea/vomiting, tremor, paroxysmal sweats, anxiety, agitation, tactile disturbances, auditory disturbances, visual disturbances, headache.
- One 0-4 item: orientation / clouding of sensorium.
- Per-item clamping via `Math.max/min` to source-defined ranges; sum returned.
- Severity bands per Sullivan 1989 / VA standard:
  - <8: Mild withdrawal (supportive care).
  - 8-15: Moderate.
  - 16-20: Severe.
  - >20: Very severe (high seizure / DT risk).

## Boundary examples added
- low: all 0 -> 0; "Mild withdrawal (<8): supportive care".
- mid (META example): 2+2+2+2+1+0+0+0+1+0 = 10; "Moderate (8-15)" per renderer.
- boundary 8 (moderate cutoff): seven 1s + 1 = 8 -> "Moderate (8-15)".
- boundary 16 (severe cutoff): 16 -> "Severe (16-20)".
- high: 9 items at 7 + orientation 4 = 63+4 = 67 -> "Very severe".

## Cross-implementation differential
- Reference implementation: Sullivan 1989 scorecard hand-summation; cross-checked against the VA/SAMHSA-distributed CIWA-Ar instrument.
- Test case: META example after fix.
- Sophie result: 10, "Moderate (8-15)".
- Reference result: 10, moderate (within 8-15).
- Delta: 0%. PASS.

## Edge-input handling notes
- Per-item ranges enforced by clamping (not throwing). Out-of-range entries silently snap to the source-allowed max/min — acceptable because CIWA-Ar is a bedside scorecard where typos shouldn't produce inline errors mid-assessment.
- The "symptom-triggered protocol" language in the band copy is paraphrased from the source's discussion of using CIWA-Ar to guide protocol-driven benzodiazepine dosing; it is reference language, not Sophie-authored treatment guidance (per spec-v11 §5.3).
- **Defect found (META example expected)**: prior expected text said "CIWA-Ar 10 (mild withdrawal; ...)". With the example inputs, the actual computed score is 10, which lands in the Moderate (8-15) band per Sullivan 1989 and Sophie's banding — not Mild. Fixed in this PR by updating the expected text to "CIWA-Ar 10 (moderate withdrawal, 8-15 band; symptom-triggered protocol typically considers active treatment)." Live tile rendering was always correct (it correctly outputs "Moderate (8-15)" for the example inputs); only the documented narrative was wrong.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Ten labelled number inputs (nine 0-7, one 0-4). Tab-reachable in source order. Output region announces total and band. `npm run test:a11y` clean.

## Defects opened
- **META `ciwa` example expected text said "mild withdrawal" for a computed score of 10 (Moderate band).** Live rendering unaffected. Fixed in this PR per spec-v11 §3.6 #3.

## Status
- PASS-WITH-FIXES
