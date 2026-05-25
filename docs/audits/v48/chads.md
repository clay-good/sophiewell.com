# v48 derivation provenance — CHA₂DS₂-VASc (`chads`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-1b
- Citation re-verified against: Lip GY, Nieuwlaat R, Pisters R, Lane DA, Crijns HJ. *Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation using a novel risk factor-based approach: the euro heart survey on atrial fibrillation.* Chest. 2010;137(2):263-272.

## Components — verbatim source mapping

Eight criteria forming the mnemonic CHA₂DS₂-VASc; the "2" subscripts denote the 2-point items.

| Letter | Component (this file) | Source phrasing (Lip 2010 Table 1) | Points |
|---|---|---|---|
| C | Congestive heart failure or LV dysfunction | "Congestive heart failure/LV dysfunction" | 1 |
| H | Hypertension | "Hypertension" | 1 |
| A2 | Age >= 75 | "Age ≥ 75 years" | 2 |
| D | Diabetes mellitus | "Diabetes mellitus" | 1 |
| S2 | Prior stroke, TIA, or thromboembolism | "Stroke/TIA/thromboembolism" | 2 |
| V | Vascular disease (prior MI, PAD, aortic plaque) | "Vascular disease (prior MI, PAD or aortic plaque)" | 1 |
| A | Age 65-74 | "Age 65-74 years" | 1 |
| Sc | Sex category (female) | "Sex category (female)" | 1 |

The A and A2 components are mutually exclusive by definition. The renderer does not enforce mutual exclusion; the user is responsible for setting only one. (The source paper treats them as separate rows whose contributions never coincide because age cannot satisfy both.)

## Bands — verbatim source mapping

From Lip 2010 §Discussion and the 2020 ESC AF guideline restatement:

| Score | Label |
|---|---|
| 0 | "low risk" — antithrombotic therapy not recommended |
| 1 | "low-moderate risk" — oral anticoagulation may be considered |
| ≥ 2 | "moderate-to-high risk" — oral anticoagulation recommended |

## Population

Euro Heart Survey on AF — 1084 patients with non-valvular AF across 35 European countries (Lip 2010 §Methods). Validated in multiple subsequent cohorts including the Swedish AF cohort and the ATRIA cohort.

## Validity

Adults with non-valvular atrial fibrillation. Not validated in valvular AF (mechanical prosthetic valve or moderate-to-severe mitral stenosis), in pregnancy, or in pediatric populations. The 2019 AHA/ACC/HRS focused update treats sex category (female) as a risk *modifier* rather than an independent risk factor; the original 2010 paper assigns 1 point as listed and the Sophie tile follows the original.

## Source quote

"We propose a new approach to refine the categorization of risk in subjects deemed to be at 'low risk' by the existing CHADS₂ schema, by inclusion of additional risk factors that include age 65-74 years, female sex, and vascular disease." — Lip 2010 §Abstract.

## Renderer assertions

Verified locally:
- `META.chads.derivation` has every required field per `lib/derivation.js validate()`.
- Components sum equals `chadsVasc()` total at three boundary points (0, 3, 10).
- The two 2-point components contribute correctly (asserted by max test where both contribute simultaneously).

## Defects opened
None.
