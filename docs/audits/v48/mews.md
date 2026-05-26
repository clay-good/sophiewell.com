# v48 derivation provenance — MEWS (`mews`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4c
- Citation re-verified against: Subbe CP, Kruger M, Rutherford P, Gemmel L. *Validation of a modified Early Warning Score in medical admissions.* QJM. 2001;94(10):521-526.

## Components — verbatim source mapping

Five per-parameter scores per Subbe 2001 Table 1.

| Parameter | Source ranges |
|---|---|
| Systolic BP (mmHg) | ≤70 → 3; 71-80 → 2; 81-100 → 1; 101-199 → 0; ≥200 → 2 |
| Pulse (/min) | <40 → 2; 41-50 → 1; 51-100 → 0; 101-110 → 1; 111-129 → 2; ≥130 → 3 |
| Respiratory rate (/min) | <9 → 2; 9-14 → 0; 15-20 → 1; 21-29 → 2; ≥30 → 3 |
| Temperature (°C) | <35 → 2; 35-38.4 → 0; ≥38.5 → 2 |
| AVPU level of consciousness | A → 0; V → 1; P → 2; U → 3 |

Each component's `points` callback evaluates the banded threshold.

## Bands — source mapping (Subbe 2001 Table 2)

| Range | Source label |
|---|---|
| 0-2 | low risk band |
| 3 | low-intermediate risk band |
| 4 | intermediate risk band |
| ≥ 5 | increased risk of death, ICU admission, and HDU admission |

## Population

Subbe 2001: 709 consecutive medical admissions to a UK district general hospital. Subsequently validated in surgical, ED, and obstetric populations (the obstetric variant MEOWS is a separate Sophie tile).

## Validity

Adult medical-ward inpatients. MEWS predates NEWS2 (Royal College of Physicians 2017, a separate Sophie tile). NEWS2 is the contemporary UK standard with additional SpO2 / supplemental-oxygen items and Scale 1/Scale 2 SpO2 stratification. MEWS remains in active use where NEWS2 has not yet been adopted. NOT validated in pediatric populations.

## Source quote

"The Modified Early Warning Score correlates with patient outcome in medical admissions. The MEWS provides an objective measurement that may be used to compare nurse-driven and physician-driven escalation of care." — Subbe 2001 §Abstract.

## Renderer assertions

Verified locally:
- `META.mews.derivation` has every required field per `lib/derivation.js validate()` and exactly 5 components.
- Components sum equals `mews().score` at three boundary points (baseline 0, multi-parameter high 12, AVPU = A/V/P/U each scoring 0/1/2/3 correctly).

## Defects opened
None.
