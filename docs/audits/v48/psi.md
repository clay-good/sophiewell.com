# v48 derivation provenance — PSI / PORT (`psi`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-2c
- Citation re-verified against: Fine MJ, Auble TE, Yealy DM, Hanusa BH, Weissfeld LA, Singer DE, Coley CM, Marrie TJ, Kapoor WN. *A prediction rule to identify low-risk patients with community-acquired pneumonia.* NEJM. 1997;336(4):243-250.

## Components — verbatim source mapping

Twenty components from Fine 1997 Table 2 — demographics, comorbidities, exam findings, and lab values.

| Component | Source | Points |
|---|---|---|
| Age | "Age (years) — for males"; "Age (years) − 10 — for females" | callback: M=age, F=age−10 |
| Nursing-home resident | "Nursing home resident" | +10 |
| Neoplastic disease | "Neoplastic disease" | +30 |
| Liver disease | "Liver disease" | +20 |
| Congestive heart failure | "Congestive heart failure" | +10 |
| Cerebrovascular disease | "Cerebrovascular disease" | +10 |
| Renal disease | "Renal disease" | +10 |
| Altered mental status | "Altered mental status" | +20 |
| Respiratory rate ≥ 30/min | "Respiratory rate ≥ 30/min" | +20 |
| Systolic BP < 90 mmHg | "Systolic BP < 90 mm Hg" | +20 |
| Temperature < 35°C or ≥ 40°C | "Temperature < 35°C or ≥ 40°C" | callback: +15 if criterion met AND temp is provided |
| Heart rate ≥ 125/min | "Pulse ≥ 125/min" | +10 |
| Arterial pH < 7.35 | "Arterial pH < 7.35" | callback: +30 if provided and met |
| BUN ≥ 30 mg/dL | "BUN ≥ 30 mg/dL (11 mmol/L)" | callback: +20 if provided and met |
| Sodium < 130 mEq/L | "Sodium < 130 mmol/L" | callback: +20 if provided and met |
| Glucose ≥ 250 mg/dL | "Glucose ≥ 250 mg/dL (14 mmol/L)" | callback: +10 if provided and met |
| Hematocrit < 30% | "Hematocrit < 30%" | callback: +10 if provided and met |
| PaO2 < 60 mmHg | "Partial pressure of arterial oxygen < 60 mm Hg" | callback: +10 if provided and met |
| Pleural effusion | "Pleural effusion" | +10 |

Lab callbacks early-return 0 when the input is null, undefined, or empty string — matching `lib/scoring-v4.js psi()` which uses `if (x != null && condition)` for each optional lab.

## Bands — source mapping

| Score | Class | Source label |
|---|---|---|
| 0 (and age ≤ 50) | I | outpatient candidate (Sophie's bands array collapses Class I-II) |
| ≤ 70 | II | outpatient candidate |
| 71-90 | III | observation / short admission |
| 91-130 | IV | admit |
| > 130 | V | admit (high mortality; Sophie's tile flags as Class V advisory) |

Class I requires BOTH age ≤ 50 AND zero points; the Sophie `bands` array does NOT enforce the age gate (it groups Class I and II together as "outpatient candidate"). The result-block annotation from `psi()` DOES enforce the Class I age gate.

## Population

Derivation: 14,199 adult inpatients with CAP from the Medisgroups Comparative Hospital Database (Fine 1997 §Methods). Validation: 38,039 inpatients from Pennsylvania + the PORT cohort.

## Validity

Adults with community-acquired pneumonia. PSI is a site-of-care triage tool. NOT validated in immunocompromised hosts, hospital-acquired or ventilator-associated pneumonia, or pediatric pneumonia. The PaO2 component requires an arterial blood gas — in the Sophie tile, leaving the field blank (the default) correctly excludes the +10 contribution.

## Source quote

"We developed a prediction rule using data from 14,199 adult inpatients ... The rule assigns points based on age, the presence of coexisting illness, abnormal findings on physical examination, and abnormal laboratory findings. ... Risk classes are: Class I — algorithm-defined patients with no risk factors and age ≤ 50; Class II ≤ 70 points; Class III 71-90; Class IV 91-130; Class V > 130." — Fine 1997 §Abstract / Table 2.

## Renderer assertions

Verified locally:
- `META.psi.derivation` has every required field per `lib/derivation.js validate()` and 19 components (age + 18 risk factors / labs / exam findings).
- Components sum equals `psi()` total at four boundary points: male age 70 + RR≥30 = 90 (Class III), female age 70 with no other risk = 60 (Class II), male age 50 + BUN 35 = 70 (Class II boundary), male age 50 with all labs `null` = 50 (Class II, asserts the null-handling of every optional-lab callback).

## Defects opened
None.
