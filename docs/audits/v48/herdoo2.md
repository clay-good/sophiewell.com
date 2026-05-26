# v48 derivation provenance — HERDOO2 (`herdoo2`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4f
- Citation re-verified against: Rodger MA, Le Gal G, Anderson DR, Schmidt J, Pernod G, Kahn SR, Righini M, Mismetti P, Kearon C, Meyer G, Elias A, Ramsay T, Ortel TL, Huisman MV, Kovacs MJ. *Validating the HERDOO2 rule to guide treatment duration for women with unprovoked venous thrombosis: multinational prospective cohort management study.* BMJ. 2017;356:j1065.

## Components — verbatim source mapping

Women only. Four yes/no criteria, each +1; range 0-4.

| # | Criterion | Points |
|---|---|---|
| 1 | Hyperpigmentation, Edema, or Redness in either leg (HER) | +1 |
| 2 | D-dimer >= 250 ug/L while still on anticoagulation (D) | +1 |
| 3 | Obesity: BMI >= 30 kg/m^2 (O) | +1 |
| 4 | Older: age >= 65 years (O2) | +1 |

## Bands — source mapping (Rodger 2017 §Results)

| Range | Action |
|---|---|
| 0-1 | Low recurrence risk; safe to discontinue anticoagulation |
| >= 2 | Continue anticoagulation |

## Population

Rodger 2017: multinational prospective management cohort of 2785 women with first unprovoked VTE who had completed 5-12 months of anticoagulation across 44 centres in 7 countries; D-dimer measured on anticoagulation. Outcome: 1-year symptomatic, adjudicated VTE recurrence after rule-guided cessation.

## Validity

Women only, first unprovoked or weakly provoked VTE after 5-12 months of anticoagulation. D-dimer must be measured on anticoagulation (this distinguishes HERDOO2 from DASH). Not validated in men, cancer-associated VTE, antiphospholipid syndrome, thrombophilia, recurrent VTE, or pediatrics.

## Source quote

"Women with a low HERDOO2 score (0 or 1) had a low risk of recurrent VTE if they discontinued anticoagulant therapy." — Rodger 2017 §Results.

## Renderer assertions

Verified locally:
- `META.herdoo2.derivation` has every required field per `lib/derivation.js validate()` and exactly 4 components.
- Components sum equals `herdoo2().score` at multiple boundary points (none -> 0; D-dimer alone -> 1; D-dimer + BMI -> 2; all four -> 4).

## Defects opened
None.
