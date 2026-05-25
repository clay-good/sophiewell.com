# v48 derivation provenance — HAS-BLED (`hasbled`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-1b
- Citation re-verified against: Pisters R, Lane DA, Nieuwlaat R, de Vos CB, Crijns HJ, Lip GY. *A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation: the Euro Heart Survey.* Chest. 2010;138(5):1093-1100.

## Components — verbatim source mapping

The HAS-BLED mnemonic expands to nine 0/1 criteria (the A and D letters each contribute two items).

| Letter | Component (this file) | Source phrasing (Pisters 2010 Table 4) | Points |
|---|---|---|---|
| H | Uncontrolled hypertension (SBP > 160 mmHg) | "Hypertension — uncontrolled, > 160 mm Hg systolic" | 1 |
| A | Abnormal renal function | "Abnormal renal function (chronic dialysis, renal transplantation, or serum creatinine ≥ 200 µmol/L)" | 1 |
| A | Abnormal liver function | "Abnormal liver function (chronic hepatic disease or biochemical evidence of significant hepatic derangement, e.g., bilirubin > 2x upper limit of normal, AST/ALT/AP > 3x ULN)" | 1 |
| S | Prior stroke | "Stroke" | 1 |
| B | Bleeding history or predisposition | "Bleeding history or predisposition (anemia, previous bleeding, etc.)" | 1 |
| L | Labile INR (TTR < 60% for VKA patients) | "Labile INRs (unstable/high INRs or poor time in therapeutic range, e.g., <60%)" | 1 |
| E | Elderly (age > 65) | "Elderly (e.g., age > 65 years)" | 1 |
| D | Drugs predisposing to bleeding (e.g., NSAIDs) | "Drugs (concomitant use of antiplatelet agents or NSAIDs)" | 1 |
| D | Alcohol use >= 8 drinks/week | "Alcohol (≥ 8 drinks per week)" | 1 |

## Bands — verbatim source mapping

From Pisters 2010 Table 5, bleeds per 100 patient-years by score:

| Score | Bleeds per 100 patient-years (source) | Sophie band label |
|---|---|---|
| 0 | 1.13 | low risk |
| 1 | 1.02 | low risk |
| 2 | 1.88 | moderate risk |
| 3 | 3.74 | high risk |
| 4 | 8.70 | high risk |
| ≥ 5 | 12.50 | high risk |

The Sophie three-band collapse (0-1 low, 2 moderate, ≥3 high) is the conventional usage adopted by the 2020 ESC AF guideline §11.2.

## Population

Euro Heart Survey on AF — 3978 patients with non-valvular AF (Pisters 2010 §Methods).

## Validity

Adults with atrial fibrillation. HAS-BLED's intent (per the 2020 ESC AF guideline and per the original paper) is to *identify and flag modifiable bleeding risk factors* for review — uncontrolled BP, labile INR, concomitant antiplatelets/NSAIDs, heavy alcohol — not to withhold anticoagulation. A high HAS-BLED in a patient with CHA₂DS₂-VASc indicating anticoagulation is an argument for closer monitoring, not for withholding therapy.

## Source quote

"We have developed a new bleeding risk score (HAS-BLED) based on a real-world cohort of AF patients. This score is simple, easy to calculate at the bedside, has been internally validated in our AF population, and offers useful predictive value for major bleeding." — Pisters 2010 §Discussion.

## Renderer assertions

Verified locally:
- `META.hasbled.derivation` has every required field per `lib/derivation.js validate()`.
- Components sum equals `hasBled()` total at two boundary points (2, 4).
- The "A" and "D" letter rows each correctly contribute one point per criterion.

## Defects opened
None.
