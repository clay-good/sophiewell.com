# v48 derivation provenance — IMPROVE Bleeding (`improve-bleeding`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4f
- Citation re-verified against: Decousus H, Tapson VF, Bergmann JF, Chong BH, Froehlich JB, Kakkar AK, Merli GJ, Monreal M, Nakamura M, Pavanello R, Pini M, Piovella F, Spencer FA, Spyropoulos AC, Turpie AGG, Zotz RB, FitzGerald G, Anderson FA Jr. *Factors at admission associated with bleeding risk in medical patients: findings from the IMPROVE investigators.* Chest. 2011;139(1):69-79.

## Components — verbatim source mapping

Eleven admission factors with mixed boolean and banded weights per Decousus 2011 Table 2 (final multivariable model). Total range 0 to 30.5.

| # | Criterion | Points |
|---|---|---|
| 1 | Active gastroduodenal ulcer | +4.5 |
| 2 | Bleeding in 3 months prior to admission | +4 |
| 3 | Platelet count < 50 x10^9/L | +4 |
| 4 | Age: < 40 / 40-84 / >= 85 | 0 / +1.5 / +3.5 |
| 5 | Hepatic failure (INR > 1.5) | +2.5 |
| 6 | Renal: none / moderate (eGFR 30-59) / severe (eGFR < 30) | 0 / +1 / +2.5 |
| 7 | ICU / CCU admission | +2.5 |
| 8 | Central venous catheter | +2 |
| 9 | Active rheumatic disease | +2 |
| 10 | Active cancer | +2 |
| 11 | Male sex | +1 |

## Bands — source mapping (Decousus 2011 §Results)

| Range | Action |
|---|---|
| < 7 | Not high bleeding risk |
| >= 7 | High bleeding risk; consider mechanical over pharmacologic prophylaxis |

## Population

Decousus 2011: case-control analysis nested within the IMPROVE registry, an international observational cohort of 15,156 hospitalized medical (non-surgical) patients across 12 countries; bleeding outcomes adjudicated to ISTH major and clinically-relevant non-major criteria.

## Validity

Adult medical inpatients. Companion to IMPROVE-VTE (Spyropoulos 2011) — both scores derived from the same IMPROVE cohort. The >=7 cutoff identifies the top decile of bleeding risk; a high score favors mechanical over pharmacologic prophylaxis but is not an absolute contraindication to pharmacologic prophylaxis. Modest discrimination in external validation; ACCP CHEST 2018 / ASH 2018 treat the score as one input among several. Not validated for surgical, obstetric, or pediatric patients.

## Source quote

"Risk factors at admission independently associated with bleeding included active gastroduodenal ulcer, bleeding in the 3 months prior to admission, platelet count < 50 x 10^9/L, age, hepatic failure, renal failure, ICU/CCU stay, central venous catheter, rheumatic disease, active cancer, and male sex." — Decousus 2011 §Results.

## Renderer assertions

Verified locally:
- `META['improve-bleeding'].derivation` has every required field per `lib/derivation.js validate()` and exactly 11 components.
- Components sum equals `improveBleeding().score` at multiple boundary points including the age and renal banded callbacks (age >=85 -> 3.5; renal severe -> 2.5).
- Score crosses the cutoff at the right inputs (e.g., active ulcer + bleeding3mo = 8.5 -> high band).

## Defects opened
None.
