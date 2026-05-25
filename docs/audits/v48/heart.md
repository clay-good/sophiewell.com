# v48 derivation provenance — HEART Score (`heart`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-1b
- Citation re-verified against: Six AJ, Backus BE, Kelder JC. *Chest pain in the emergency room: value of the HEART score.* Neth Heart J. 2008;16(6):191-196. Validation: Backus BE, Six AJ, Kelder JC, et al. *A prospective validation of the HEART score for chest pain patients at the emergency department.* Int J Cardiol. 2013;168(3):2153-2158.

## Components — verbatim source mapping

Five components, each scored 0/1/2 from explicit anchor descriptions. Range 0-10.

| Letter | Component | Source levels (Six 2008 Table 1) |
|---|---|---|
| H | History | 0 = "Slightly suspicious"; 1 = "Moderately suspicious"; 2 = "Highly suspicious" |
| E | ECG | 0 = "Normal"; 1 = "Nonspecific repolarization disturbance"; 2 = "Significant ST deviation" |
| A | Age | 0 = "< 45 years"; 1 = "45-64 years"; 2 = "≥ 65 years" |
| R | Risk factors | 0 = "No known risk factors"; 1 = "1-2 risk factors"; 2 = "≥ 3 risk factors or history of atherosclerotic disease" |
| T | Troponin | 0 = "≤ normal limit"; 1 = "1-3× normal limit"; 2 = "> 3× normal limit" |

In `META.heart.derivation.components`, `points` is `(v) => Math.max(0, Math.min(2, Number(v) || 0))` — the value *is* the component's contribution, clamped to the [0,2] range. This mirrors the implementation in `lib/scoring-v4.js heart()`.

## Bands — verbatim source mapping

From Backus 2013 validation:

| Range | Source 6-week MACE rate | Sophie band label |
|---|---|---|
| 0-3 | 1.7% | low risk (suitable for early discharge) |
| 4-6 | 16.6% | moderate risk (admission for observation) |
| 7-10 | 50.1% | high risk (early invasive strategy) |

## Population

Derivation: 122 ED chest-pain patients in the Netherlands (Six 2008).
Validation: prospective multi-center cohort of 2440 patients across 10 Dutch EDs (Backus 2013).

## Validity

Adults presenting to the ED with chest pain. The "History" component is clinician gestalt at the bedside (not an algorithm); inter-rater agreement is the principal source of measurement variability. The score should not be used to dispose patients with a single negative troponin alone — serial troponins per institutional protocol are assumed. NOT validated for STEMI (those go directly to cath); NOT validated for non-cardiac chest pain workups (PE, aortic dissection, pneumothorax must be considered separately).

## Source quote

"The HEART score may serve as an aid to facilitate accurate diagnostic and therapeutic choices for individual patients with chest pain in the emergency department." — Six 2008 §Conclusion.

## Renderer assertions

Verified locally:
- `META.heart.derivation` has every required field per `lib/derivation.js validate()`.
- Components sum equals `heart().score` at three boundary points (3 low, 10 max, 7 with clamped out-of-range inputs).
- Clamping is verified by the test that submits values outside [0,2] and asserts the same clamped sum.

## Defects opened
None.
