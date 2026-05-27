# v48 derivation provenance — MGAP Trauma Score (`mgap`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4j
- Citation re-verified against: Sartorius D, Le Manach Y, David JS, Rancurel E, Smail N, Thicoipe M, Wiel E, Ricard-Hibon A, Berthier F, Gueugniaud PY, Riou B. *Mechanism, glasgow coma scale, age, and arterial pressure (MGAP): a new simple prehospital triage score to predict mortality in trauma patients.* Crit Care Med. 2010;38(3):831-837.

## Components — verbatim source mapping

Four items per Sartorius 2010 Table 2; range 3-29.

| # | Item | Points |
|---|---|---|
| 1 | Mechanism: blunt | +4 |
| | Mechanism: penetrating | 0 |
| 2 | GCS (3-15) | raw value enters the sum |
| 3 | Age < 60 | +5 |
| 4 | SBP > 120 mmHg | +5 |
| | SBP 60-120 mmHg | +3 |
| | SBP < 60 mmHg | 0 |

## Bands — source mapping (Sartorius 2010 Table 3)

| Range | In-hospital mortality risk |
|---|---|
| < 18 | High |
| 18-22 | Moderate |
| 23-29 | Low |

## Population

Sartorius 2010: prospective derivation in 1360 prehospital trauma patients (SMUR units in France); external validation in 1003 from the German Trauma Society registry. Outcome: in-hospital mortality. MGAP outperformed RTS using prehospital-only variables.

## Validity

Prehospital adult trauma triage. Uses widely-available variables without anatomic injury scoring. External validation in non-European cohorts is mixed. Not validated for pediatric trauma (use BIG), non-trauma critical illness, or use beyond initial triage.

## Source quote

"The MGAP score [is] based on four variables: mechanism, GCS, age, and arterial pressure." — Sartorius 2010 §Methods.

## Renderer assertions

Verified locally:
- `META.mgap.derivation` has every required field per `lib/derivation.js validate()` and exactly 4 components.
- Components sum equals `mgap().score` at multiple boundary points (blunt + GCS 15 + age<60 + SBP 130 -> 29; SBP 50 -> 0 points; penetrating mechanism -> 0).

## Defects opened
None.
