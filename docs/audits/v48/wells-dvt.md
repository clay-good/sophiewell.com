# v48 derivation provenance — Wells Score for DVT (`wells-dvt`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-1b
- Citation re-verified against: Wells PS, Anderson DR, Bormanis J, et al. *Value of assessment of pretest probability of deep-vein thrombosis in clinical management.* Lancet. 1997;350(9094):1795-1798.

## Components — verbatim source mapping

Ten clinical criteria from Wells 1997 Table 2 ("Clinical model for predicting pretest probability for deep-vein thrombosis"): nine positive (1 point each) and one subtractive (−2 points) when an alternative diagnosis is at least as likely as DVT.

| Component (this file) | Source phrasing (Wells 1997 Table 2) | Points (source) | Points (Sophie) |
|---|---|---|---|
| Active cancer (treatment within 6 months, or palliative) | "Active cancer (treatment ongoing or within previous 6 months or palliative)" | +1 | +1 |
| Paralysis, paresis, or recent plaster immobilization of leg | "Paralysis, paresis, or recent plaster immobilization of the lower extremities" | +1 | +1 |
| Recently bedridden >=3 days, or major surgery within 12 weeks | "Recently bedridden for more than 3 days, or major surgery within 12 weeks requiring general or regional anesthesia" | +1 | +1 |
| Localized tenderness along distribution of deep venous system | "Localized tenderness along the distribution of the deep venous system" | +1 | +1 |
| Entire leg swollen | "Entire leg swollen" | +1 | +1 |
| Calf swelling >3 cm compared with asymptomatic side | "Calf swelling at least 3 cm larger than that on the asymptomatic side" | +1 | +1 |
| Pitting edema confined to symptomatic leg | "Pitting edema confined to the symptomatic leg" | +1 | +1 |
| Collateral superficial veins (non-varicose) | "Collateral superficial veins (non-varicose)" | +1 | +1 |
| Previously documented DVT | "Previously documented DVT" | +1 | +1 |
| Alternative diagnosis at least as likely as DVT | "Alternative diagnosis at least as likely as that of DVT" | −2 | −2 |

## Bands — verbatim source mapping

The three-tier model from Wells 1997 Table 3:

| Range | Source label |
|---|---|
| Score <= 0 | "low pretest probability (3%)" |
| Score 1-2 | "moderate pretest probability (17%)" |
| Score >= 3 | "high pretest probability (75%)" |

## Population

"593 consecutive outpatients presenting to the emergency departments of three tertiary-care hospitals in Canada with clinically suspected first-episode DVT." (Wells 1997 §Methods)

## Validity

Adult outpatients with clinically suspected first-episode DVT. Wells's 2003 NEJM paper introduced a simplified two-tier dichotomization (DVT likely / unlikely) that is a separate instrument; this Sophie tile implements the three-tier 1997 model only. Not validated for asymptomatic screening or for recurrent DVT.

## Source quote

"We developed a clinical model that could be used in conjunction with a simple non-invasive test, plethysmography or ultrasonography, to manage outpatients with suspected DVT... Our results show that pretest clinical probability assessment, used in combination with venous ultrasonography, can lead to safe and cost-effective management of patients with suspected DVT." — Wells 1997 §Abstract.

## Renderer assertions

Verified locally:
- `META['wells-dvt'].derivation` has every required field per `lib/derivation.js validate()`.
- Components sum equals `wellsDvt()` total at three boundary points including a case that exercises the −2 subtractive criterion — see `test/unit/derivation.test.js`.

## Defects opened
None.
