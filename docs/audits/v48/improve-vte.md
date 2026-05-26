# v48 derivation provenance — IMPROVE VTE (`improve-vte`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4e
- Citation re-verified against: Spyropoulos AC, Anderson FA Jr, FitzGerald G, Decousus H, Pini M, Chong BH, Zotz RB, Bergmann JF, Tapson V, Froehlich JB, Monreal M, Merli GJ, Pavanello R, Turpie AGG, Nakamura M, Piovella F, Kakkar AK, Spencer FA. *Predictive and associative models to identify hospitalized medical patients at risk for VTE.* Chest. 2011;140(3):706-714.

## Components — verbatim source mapping

Seven weighted yes/no criteria; range 0-12 per Spyropoulos 2011 Table 2 (predictive model).

| # | Criterion | Points |
|---|---|---|
| 1 | Prior VTE | +3 |
| 2 | Known thrombophilia | +2 |
| 3 | Lower-limb paralysis | +2 |
| 4 | Active cancer | +2 |
| 5 | Immobilized >= 7 days | +1 |
| 6 | ICU / CCU stay | +1 |
| 7 | Age > 60 years | +1 |

## Bands — source mapping (Spyropoulos 2011 §Discussion)

| Range | Action |
|---|---|
| < 2 | Low VTE risk; prophylaxis not routinely indicated |
| 2-3 | Candidate for inpatient VTE prophylaxis |
| >= 4 | Candidate for extended-duration post-discharge VTE prophylaxis |

## Population

Spyropoulos 2011: derivation in 15,156 hospitalized medical (non-surgical) patients from the IMPROVE registry across 12 countries. Outcome: clinically symptomatic VTE within 90 days, adjudicated.

## Validity

Adult hospitalized medical inpatients only. Companion to IMPROVE-Bleeding (Decousus 2011) for paired VTE-vs-bleeding risk evaluation; both scores share the IMPROVE cohort. Modest discrimination in external validation; ACCP CHEST 2018 / ASH 2018 treat the score as one input among several rather than a binary trigger. Not validated for surgical inpatients (use Caprini), obstetric patients, or pediatrics.

## Source quote

"A weighted scoring system based on seven baseline risk factors ... identified inpatients at high risk for symptomatic VTE." — Spyropoulos 2011 §Results.

## Renderer assertions

Verified locally:
- `META['improve-vte'].derivation` has every required field per `lib/derivation.js validate()` and exactly 7 components.
- Components sum equals `improveVte().score` at three boundary points (none -> 0; age>60 + ICU -> 2; all seven -> 12).

## Defects opened
None.
