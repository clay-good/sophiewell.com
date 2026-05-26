# v48 derivation provenance — RACE (`race`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-3c
- Citation re-verified against: Pérez de la Ossa N, Carrera D, Gorchs M, Querol M, Millán M, Gomis M, Dorado L, López-Cancio E, Hernández-Pérez M, Chicharro V, Escalada X, Jiménez X, Dávalos A. *Design and validation of a prehospital stroke scale to predict large arterial occlusion: the rapid arterial occlusion evaluation scale.* Stroke. 2014;45(1):87-91.

## Components — verbatim source mapping

Five NIHSS-derived items per Pérez de la Ossa 2014 Table 1. Range 0-9.

| Item | Source levels |
|---|---|
| Facial palsy | 0 absent / 1 mild / 2 moderate-severe |
| Arm motor function | 0 normal-mild / 1 moderate / 2 severe |
| Leg motor function | 0 normal-mild / 1 moderate / 2 severe |
| Head / gaze deviation | 0 absent / 1 present |
| Aphasia (R hemiparesis) OR agnosia (L hemiparesis) | 0 normal / 1 mild / 2 severe |

Each `points` callback clamps to the item's range (0-2 except gaze which is 0-1).

## Bands — source mapping

| Range | Source label |
|---|---|
| 0-4 | LVO less likely |
| 5-9 | LVO likely (sensitivity 85%, specificity 68% per Pérez de la Ossa 2014) |

## Population

Pérez de la Ossa 2014: derivation in 357 prehospital stroke patients in Catalonia, Spain. Reference standard: arterial occlusion on CTA / MRA / DSA within 24 hours.

## Validity

Adults with suspected stroke in the prehospital setting. RACE is one of several LVO-triage instruments (LAMS, FAST-ED, VAN); each has trade-offs in sensitivity / specificity. RACE includes a language/agnosia item that LAMS does not — yielding slightly better specificity for posterior-circulation strokes at the cost of more complex administration. The language/agnosia item is hemiparesis-side-dependent (aphasia for R hemiparesis, agnosia for L hemiparesis). NOT designed for stroke diagnosis (use CPSS or ROSIER); RACE assumes a stroke screen is already positive.

## Source quote

"The Rapid Arterial oCclusion Evaluation (RACE) scale was designed to be a simple prehospital scale ... that allows paramedics to assess stroke severity and to suspect the presence of large artery occlusion." — Pérez de la Ossa 2014 §Methods.

## Renderer assertions

Verified locally:
- `META.race.derivation` has every required field per `lib/derivation.js validate()` and exactly 5 components.
- Components sum equals `race().score` at three boundary points (zero, cutoff 5 with `lvoLikely === true`, max 9).

## Defects opened
None.
