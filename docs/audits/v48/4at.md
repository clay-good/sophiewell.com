# v48 derivation provenance — 4AT (`4at`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-2b
- Citation re-verified against: MacLullich AMJ, Shenkin SD, Goodacre S, et al. *The 4 "A"s Test for detecting delirium in acute medical patients (4AT): a diagnostic accuracy study.* Health Technol Assess. 2019;23(40):1-194.

## Components — verbatim source mapping

Four items from the 4AT scoring sheet (MacLullich 2019 Appendix). Two binary items each contribute 4 points; two 3-level items each contribute 0/1/2.

| Item | Source levels |
|---|---|
| Alertness (1A) | Normal → 0; clearly drowsy / agitated / aroused → 4 |
| AMT4 (1A): age, DOB, place, current year | 0 errors → 0; 1 error → 1; ≥2 errors / untestable → 2 |
| Attention (1A): months of the year backwards | Reaches July (≥7 months) → 0; starts but ≤6 months → 1; untestable → 2 |
| Acute change / fluctuating course (1A) | None → 0; present → 4 |

## Bands — verbatim source mapping

From MacLullich 2019 §Methods (4AT scoring sheet):

| Score | Source label |
|---|---|
| 0 | delirium or significant cognitive impairment unlikely |
| 1-3 | possible cognitive impairment (without delirium) |
| ≥ 4 | possible delirium ± cognitive impairment |

## Population

Diagnostic-accuracy validation in 785 acute-medical inpatients aged ≥65 across UK hospitals (MacLullich 2019 §Methods). Reference standard: clinical delirium assessment by trained psychiatry / geriatrics. Sensitivity 76%, specificity 94% at the ≥4 cutoff.

## Validity

Adults in acute medical / ED / inpatient settings. The 4AT is designed for rapid bedside use without specialist training (median admin time ~2 min). NOT intended as a stand-alone diagnostic test — a positive screen (≥4) should prompt formal delirium assessment. NOT validated in ICU patients (use CAM-ICU or ICDSC) or for tracking severity over time (the score is binary-pass / fail in design). The "untestable" rating on AMT4 / attention scores 2 by convention — this can elevate the score in patients with primary aphasia or sensory deficits unrelated to delirium.

## Source quote

"The 4AT is a brief delirium and cognitive impairment screening test developed for use in clinical practice. ... Pooled sensitivity 0.76 (95% CI 0.55 to 0.89) and specificity 0.94 (95% CI 0.87 to 0.97) at a score of >= 4." — MacLullich 2019 §Abstract.

## Renderer assertions

Verified locally:
- `META['4at'].derivation` has every required field per `lib/derivation.js validate()` and exactly 4 components.
- Components sum equals `fourAt()` total at four boundary points (zero, alert+acute=8 above cutoff, max 12, clamped AMT4=5 → 2).

## Defects opened
None.
