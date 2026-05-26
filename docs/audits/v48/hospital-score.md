# v48 derivation provenance — HOSPITAL Score (`hospital-score`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4f
- Citation re-verified against: Donze J, Aujesky D, Williams D, Schnipper JL. *Potentially avoidable 30-day hospital readmissions in medical patients: derivation and validation of a prediction model.* JAMA Intern Med. 2013;173(8):632-638.

## Components — verbatim source mapping

Seven weighted criteria per Donze 2013 Table 2; range 0-13.

| # | Criterion | Points |
|---|---|---|
| 1 | Hemoglobin < 12 g/dL at discharge | +1 |
| 2 | Discharge from an Oncology service | +2 |
| 3 | Sodium < 135 mEq/L at discharge | +1 |
| 4 | Any procedure during hospital stay (ICD-9 procedure code) | +1 |
| 5 | Index admission was urgent / non-elective | +1 |
| 6 | Prior admissions in last 12 months: 0-2 (0) / 3-4 (+2) / >=5 (+5) | 0/+2/+5 |
| 7 | Length of stay >= 5 days | +2 |

## Bands — source mapping (Donze 2013 Table 4)

| Range | 30-day potentially-avoidable readmission |
|---|---|
| 0-4 | ~5.8% (low) |
| 5-6 | ~11.9% (intermediate) |
| >= 7 | ~22.8% (high) |

## Population

Donze 2013: derivation in 9212 adult medical inpatients discharged alive from a Boston tertiary academic medical center (2009-2010); validation in 7769 patients from Lausanne University Hospital. Outcome: 30-day potentially-avoidable readmission, adjudicated by the SQLape algorithm.

## Validity

Adult medical inpatients discharged alive. Predicts *potentially-avoidable* readmission (not all-cause); the cited 5.8 / 11.9 / 22.8% rates are SQLape-adjudicated. Modest discrimination in external validation; ACP / SHM treat the score as one signal among several. Not validated for surgical, obstetric, psychiatric, or pediatric inpatients.

## Source quote

"The HOSPITAL score, comprising seven independent predictors of 30-day potentially avoidable readmission, accurately identified patients at high risk." — Donze 2013 §Conclusions.

## Renderer assertions

Verified locally:
- `META['hospital-score'].derivation` has every required field per `lib/derivation.js validate()` and exactly 7 components.
- Components sum equals `hospitalScore().score` at multiple boundary points including the prior-admissions banded callback (0 -> 0, 3 -> 2, 5 -> 5).

## Defects opened
None.
