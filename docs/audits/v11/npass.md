# v11 audit - npass

- Auditor: CG
- Date: 2026-05-21
- Citation re-verified against: Hummel P, Puchalski M, Creech SD, Weiss MG. *Clinical reliability and validity of the N-PASS: neonatal pain, agitation and sedation scale with prolonged pain.* J Perinatol. 2008;28(1):55-60. Five behavioral / physiological items (Crying/Irritability, Behavior/State, Facial expression, Extremities/Tone, Vital signs HR/RR/BP/SaO2), each scored on a bidirectional -2..+2 ordinal where negative values score sedation and positive values score pain/agitation. Preterm adjustment: add 1 point per week below 30 weeks gestational age to the pain side. Pain >3 indicates intervention.

`lib/scoring-v4.js npass()` validates each item as an integer in [-2, 2], requires gestationalAgeWeeks in [20, 44], sums the positive items as the pain score, sums the negative items as the sedation score, and applies the preterm +1/week<30 wk adjustment to the pain side. Returns `{painScore, sedationScore, pretermAdjust, parts, painBand, sedationBand, text}`.

## Boundary examples added

- All zeros at term (38 wk) -> pain 0, sedation 0 (tile example).
- Pain 3 at term -> below intervention threshold (no significant pain).
- Pain 4 at term -> pain/agitation present (lower edge of intervention).
- Preterm 26 wk + crying 1 -> preterm +4, pain 5, intervention indicated.
- All positive 2s at term -> pain 10 (max), no sedation.
- Sedation -1 / -3 / -5 boundary checks for light / deep / over-sedation bands.
- Mixed positive + negative items separate cleanly into pain vs sedation totals.

## Cross-implementation differential

- Reference: Hummel 2008 Table 2 worked example "intubated 28-wk preterm with crying 1, behavior 1, facial 1, extremities 0, vitals 0 -> raw pain 3, preterm +2 (30-28), total 5, intervention indicated."
- Sophie result: `npass({crying:1, behavior:1, facial:1, extremities:0, vitals:0, gestationalAgeWeeks:28})` returns `painScore: 5, pretermAdjust: 2, painBand: 'pain/agitation present'`. PASS.

## Edge-input handling notes

- Non-integer or out-of-range items throw. GA outside 20-44 throws.

## A11y / keyboard notes

- Five labeled signed range inputs (-2..+2) plus one labeled number input (GA), each with linked output spans; Tab-reachable; aria-live result region. `npm run test:a11y` clean.

## Defects opened

- none

## Status

- PASS
