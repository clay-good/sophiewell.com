# v48 derivation provenance — LIPS (`lips`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4i
- Citation re-verified against: Gajic O, Dabbagh O, Park PK, Adesanya A, Chang SY, Hou P, Anderson H 3rd, Hoth JJ, Mikkelsen ME, Gentile NT, Gong MN, Talmor D, Bajwa E, Watkins TR, Festic E, Yilmaz M, Iscimen R, Kaufman DA, Esper AM, Sadikot R, Douglas I, Sevransky J, Malinchoc M; USCIITG-LIPS. *Early identification of patients at risk of acute lung injury: evaluation of lung injury prediction score in a multicenter cohort study.* Am J Respir Crit Care Med. 2011;183(4):462-470.

## Components — verbatim source mapping

Fifteen weighted yes/no factors per Gajic 2011 Table 2; range -1 to +20. Diabetes is the only protective (negative-weighted) factor.

| # | Factor | Points |
|---|---|---|
| **Predisposing conditions** | | |
| 1 | Shock | +2 |
| 2 | Aspiration | +2 |
| 3 | Sepsis | +1 |
| 4 | Pneumonia | +1.5 |
| 5 | High-risk surgery | +1.5 |
| 6 | High-risk trauma | +2 |
| **Risk modifiers** | | |
| 7 | Alcohol abuse | +1 |
| 8 | Obesity (BMI > 30) | +1 |
| 9 | Hypoalbuminemia | +1 |
| 10 | Chemotherapy | +1 |
| 11 | FiO2 > 0.35 or O2 > 4 L/min | +2 |
| 12 | Tachypnea (RR > 30) | +1.5 |
| 13 | SpO2 < 95% | +1 |
| 14 | Acidosis (pH < 7.35) | +1.5 |
| 15 | Diabetes (PROTECTIVE) | -1 |

## Bands — source mapping (Gajic 2011 §Results)

| Range | Action |
|---|---|
| < 4 | Below the ALI / ARDS high-risk cutoff |
| >= 4 | High risk for ALI / ARDS development |

## Population

Gajic 2011: USCIITG-LIPS multicenter prospective cohort of 5584 adult patients admitted to 22 US hospitals via the ED or an OR with at least one ALI risk factor. Outcome: ALI development by 1994 American-European Consensus Conference criteria. Sensitivity ~69%, specificity ~78% at >= 4 cutoff.

## Validity

Adults presenting via ED or OR with at least one ALI / ARDS risk factor, scored within 6 hours of presentation. The diabetes -1 modifier reflects cohort observations of paradoxically lower ARDS incidence among diabetics; mechanism unsettled. Subsequent ALI/ARDS criteria updated to Berlin Definition (Ranieri 2012). Not validated for non-ED/OR admissions, pediatrics, or for ARDS prevention.

## Source quote

"The Lung Injury Prediction Score (LIPS) was derived from a multivariate model of patient predispositions to ALI ... A LIPS of 4 or more identified patients at increased risk." — Gajic 2011 §Results.

## Renderer assertions

Verified locally:
- `META.lips.derivation` has every required field per `lib/derivation.js validate()` and exactly 15 components.
- Components sum equals `lips().score` at multiple boundary points including the diabetes -1 modifier (diabetes alone -> -1; all positive + diabetes -> 19).

## Defects opened
None.
