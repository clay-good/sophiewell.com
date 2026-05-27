# v48 derivation provenance — GAP Trauma Score (`gap`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4j
- Citation re-verified against: Kondo Y, Abe T, Kohshi K, Tokuda Y, Cook EF, Kukita I. *Revised trauma scoring system to predict in-hospital mortality in the emergency department: Glasgow Coma Scale, Age, and Systolic Blood Pressure score.* Crit Care. 2011;15(4):R191.

## Components — verbatim source mapping

Three items per Kondo 2011 §Methods; range 3-24.

| # | Item | Points |
|---|---|---|
| 1 | GCS (3-15) | raw value enters the sum |
| 2 | Age < 60 | +3 |
| 3 | SBP > 120 mmHg | +6 |
| | SBP 60-120 mmHg | +4 |
| | SBP < 60 mmHg | 0 |

## Bands — source mapping (Kondo 2011)

| Range | In-hospital mortality risk |
|---|---|
| <= 10 | High |
| 11-18 | Moderate |
| 19-24 | Low |

## Population

Kondo 2011: retrospective derivation in 35,732 trauma patients from the Japan Trauma Data Bank (2004-2009); outcome was in-hospital mortality. GAP simplifies MGAP by dropping the mechanism term on grounds that it added little incremental information in the Japanese cohort (where penetrating trauma is uncommon).

## Validity

Adult ED trauma triage. Comparable discrimination to MGAP in cohorts where blunt mechanism dominates. External validation in high-penetrating-trauma systems is limited; MGAP may be preferred there. Not validated for pediatric trauma (use BIG), non-trauma critical illness, or use beyond initial triage.

## Source quote

"The GAP scoring system, composed of three variables: Glasgow Coma Scale, age, and systolic blood pressure." — Kondo 2011 §Methods.

## Renderer assertions

Verified locally:
- `META.gap.derivation` has every required field per `lib/derivation.js validate()` and exactly 3 components.
- Components sum equals `gap().score` at multiple boundary points (GCS 15 + age<60 + SBP 130 -> 24; SBP 50 -> 0 points; GCS 3 + age>=60 + SBP 50 -> 3).

## Defects opened
None.
