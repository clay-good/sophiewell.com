# v11 audit - BMI Calculator (`bmi`)

- Auditor: CG
- Date: 2026-05-18
- Citation re-verified against: Quetelet A. *Sur l'homme et le developpement de ses facultes.* 1835 (original definition of weight/height^2). Keys A, et al. *Indices of relative weight and obesity.* J Chronic Dis. 1972;25(6):329-343 (modern adoption as "BMI"). Adult BMI categories per WHO and CDC: <18.5 underweight; 18.5-24.9 normal; 25-29.9 overweight; 30+ obese.

`lib/clinical.js bmi()` implements `weight_kg / height_m^2` and bands per WHO categories. Sophie's banding: <18.5 Underweight; <25 Normal; <30 Overweight; else Obese.

## Boundary examples added
- low: 50 kg / 1.80 m -> BMI 15.4 -> "Underweight".
- mid (META example): 70 kg / 1.75 m -> 70/(1.75^2) = 70/3.0625 = 22.86 -> 22.9; "Normal".
- boundary 25 (overweight cutoff): 76.5625 kg / 1.75 m -> 25.0; "Overweight".
- boundary 30 (obese cutoff): 91.875 kg / 1.75 m -> 30.0; "Obese".
- high: 120 kg / 1.70 m -> 41.5; "Obese".

## Cross-implementation differential
- Reference: Quetelet/WHO definition; cross-checked against CDC adult BMI calculator (cdc.gov/healthyweight).
- Test case: META example. Sophie 22.9 / WHO 22.86 -> rounds to 22.9. Delta 0%. PASS.

## Edge-input handling notes
- `num()` validates weight and height as positive numbers; height-in-cm typos (e.g. "175" instead of "1.75") produce a tiny BMI that is obviously wrong on the face of it, but the label "Height (m)" in the renderer is unambiguous. WHO BMI is not validated for children (separate growth-chart BMI percentiles are used in pediatrics); Sophie's tile is implicitly adult-only and the calculator placeholder text reflects adult ranges.
- Citation passes spec-v11 §3.5 no-bare-URL guard.

## A11y / keyboard notes
- Two labelled number inputs; output region announces BMI and category. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
