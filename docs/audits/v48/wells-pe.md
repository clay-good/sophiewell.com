# v48 derivation provenance — Wells Score for PE (`wells-pe`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-1a
- Citation re-verified against: Wells PS, Anderson DR, Rodger M, et al. *Derivation of a simple clinical model to categorize patients' probability of pulmonary embolism: increasing the model's utility with the SimpliRED D-dimer.* Thromb Haemost. 2000;83(3):416-420.

## Components — verbatim source mapping

The seven additive criteria written into `META['wells-pe'].derivation.components` are taken verbatim from Wells 2000 Table 2 ("Clinical model for the prediction of pulmonary embolism").

| Component (this file) | Source phrasing (Wells 2000 Table 2) | Points (source) | Points (Sophie) |
|---|---|---|---|
| Clinical signs and symptoms of DVT | "Clinical signs and symptoms of DVT" | 3.0 | 3.0 |
| PE is the most likely diagnosis | "Alternative diagnosis less likely than PE" | 3.0 | 3.0 |
| Heart rate > 100/min | "Heart rate > 100/min" | 1.5 | 1.5 |
| Immobilization (>=3 days) or surgery in previous 4 weeks | "Immobilization or surgery in the previous four weeks" | 1.5 | 1.5 |
| Previous PE or DVT | "Previous DVT or PE" | 1.5 | 1.5 |
| Hemoptysis | "Hemoptysis" | 1.0 | 1.0 |
| Malignancy (active treatment, palliative, or treated in last 6 months) | "Malignancy (on treatment, treated in the last 6 months, or palliative)" | 1.0 | 1.0 |

Note: the second criterion is labeled "PE is the most likely diagnosis" in the renderer to match the existing `lib/clinical.js` input key `peLikely` (already in shipped UI copy). The semantically equivalent source phrase is preserved in the audit row above. No point value diverges.

## Bands — verbatim source mapping

The two-tier dichotomization (`<=4` unlikely, `>4` likely) is from Wells's 2001 follow-up paper:
- Wells PS, Anderson DR, Rodger M, et al. "Excluding pulmonary embolism at the bedside without diagnostic imaging: management of patients with suspected pulmonary embolism presenting to the emergency department by using a simple clinical model and d-dimer." *Ann Intern Med.* 2001;135(2):98-107.

The original 2000 paper used three tiers (<2 Low, 2-6 Moderate, >6 High). `META['wells-pe'].interpretation.bands` retains the three-tier text for completeness; the derivation's `bands` array uses the two-tier model because that is what the renderer's terminal-band annotation surfaces today.

## Population (verbatim)

Wells 2000 §Methods: "We prospectively collected data on 1239 consecutive emergency department outpatients with clinically suspected pulmonary embolism at four Canadian centers."

## Validity (verbatim where possible)

Wells 2000 §Discussion: "Our model is intended for use in outpatients with clinically suspected pulmonary embolism." Subsequent validation in 2001 establishes the two-tier cutoff. The score has not been validated against newer simplified scoring frameworks (e.g., simplified Geneva, age-adjusted D-dimer) using identical inputs; pregnancy and inpatient cohorts are out of the derivation population.

## Renderer assertions

Verified locally:
- `META['wells-pe'].derivation` has every required field per `lib/derivation.js validate()`.
- Components sum equals `wellsPe()` total at three boundary points (0, 4.5, 12.5) — see `test/unit/derivation.test.js`.
- Bands cover the two-tier dichotomy.

## Defects opened
None.
