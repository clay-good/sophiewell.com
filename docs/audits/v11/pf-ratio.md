# v11 audit - P/F Ratio (`pf-ratio`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: ARDS Definition Task Force (Ranieri VM et al). *Acute respiratory distress syndrome: the Berlin Definition.* JAMA. 2012;307(23):2526-2533. Berlin P/F bands: 201-300 Mild; 101-200 Moderate; <=100 Severe (all measured at PEEP >=5).

`lib/clinical.js pfRatio()`: `ratio = pao2 / fio2`; bands: <=100 Severe; <=200 Moderate; <=300 Mild; else Normal.

## Boundary examples added
- low (severe ARDS): PaO2 80 / FiO2 1.0 -> 80; "Severe ARDS (Berlin)".
- mid (META example, moderate ARDS): PaO2 90 / FiO2 0.5 -> 180; "Moderate ARDS (Berlin)".
- high (normal): PaO2 90 / FiO2 0.21 -> 428.6; "Normal".
- boundary at 300 (mild cutoff): PaO2 150 / FiO2 0.5 -> 300; "Mild ARDS (Berlin)" (Sophie's <=300 bins into Mild — matches the Berlin spec where 201-300 inclusive is Mild).
- boundary at 200: PaO2 100 / FiO2 0.5 -> 200; "Moderate ARDS (Berlin)" (101-200 is Moderate per Berlin).

## Cross-implementation differential
- Reference: Berlin Definition Table 1 (JAMA 2012); cross-checked against MDCalc P/F.
- Test case: META example. Sophie 180/Moderate; reference 180/Moderate (101-200). Delta 0%. PASS.

## Edge-input handling notes
- The Berlin Definition requires PEEP >=5 for ARDS classification; the P/F number alone does not establish ARDS. Sophie's tile reports the band as a P/F category label, not an ARDS diagnosis — consistent with spec-v11 §5.3 (reference, not prescription).
- FiO2 validation: `num('fio2', fio2, { min: 0.01, max: 1 })` throws on out-of-range values; a typo of "50" instead of "0.5" surfaces as an inline error.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled inputs; output region announces ratio and band. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
