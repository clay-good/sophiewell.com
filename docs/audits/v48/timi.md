# v48 derivation provenance — TIMI Risk Score for UA/NSTEMI (`timi`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-1b
- Citation re-verified against: Antman EM, Cohen M, Bernink PJ, McCabe CH, Horacek T, Papuchis G, Mautner B, Corbalan R, Radley D, Braunwald E. *The TIMI risk score for unstable angina/non-ST elevation MI: A method for prognostication and therapeutic decision making.* JAMA. 2000;284(7):835-842.

## Components — verbatim source mapping

Seven binary criteria from Antman 2000 Table 1.

| Component (this file) | Source phrasing (Antman 2000 Table 1) | Points |
|---|---|---|
| Age >= 65 | "Age ≥ 65 years" | 1 |
| >=3 risk factors for CAD | "≥ 3 risk factors for coronary artery disease" — includes hypertension, hypercholesterolemia, family history, diabetes, current smoking | 1 |
| Known CAD (stenosis >= 50%) | "Documented coronary artery disease at catheterization (≥ 50% stenosis)" | 1 |
| ASA use in past 7 days | "Aspirin use in the previous 7 days" | 1 |
| Severe angina (>=2 episodes in past 24 h) | "Severe anginal symptoms (≥ 2 anginal events in the previous 24 hours)" | 1 |
| ST deviation >= 0.5 mm on initial ECG | "ST-segment deviation ≥ 0.5 mm on admission electrocardiogram" | 1 |
| Elevated cardiac biomarkers | "Elevated serum cardiac biomarkers (CK-MB, troponin)" | 1 |

## Bands — verbatim source mapping

From Antman 2000 Table 3 (14-day composite of all-cause death, new or recurrent MI, or severe recurrent ischemia requiring urgent revascularization), pooled from TIMI 11B and ESSENCE:

| Score | 14-day composite event rate (source) | Sophie band label |
|---|---|---|
| 0-1 | 4.7% | low risk (~5%) |
| 2 | 8.3% | low risk (~5%) — Sophie collapses 0-2 to a single "low" band |
| 3 | 13.2% | intermediate risk (~13-20%) |
| 4 | 19.9% | intermediate risk (~13-20%) |
| 5 | 26.2% | high risk (~26-41%) |
| 6-7 | 40.9% | high risk (~26-41%) |

Sophie's three-band collapse follows the conventional bedside dichotomy used in the original derivation paper's Figure 2 (low / intermediate / high). The fine-grained per-score table is preserved in `META.timi.interpretation.bands` for the result-block annotation.

## Population

Derived from TIMI 11B (3910 patients with UA/NSTEMI) and ESSENCE (3171 patients) pooled cohorts. Inclusion criteria: ischemic discomfort at rest within the preceding 24 hours plus either ECG changes consistent with ischemia or elevated cardiac markers.

## Validity

Adults presenting to the ED with UA or NSTEMI as defined by the inclusion criteria. NOT validated for STEMI (separate TIMI STEMI score), for unstable angina without troponin available, or for chronic stable angina. The score's prognostic utility is for the 14-day composite endpoint; longer-term outcomes have different predictors.

## Source quote

"We constructed the TIMI risk score for unstable angina/non-ST elevation MI by assigning 1 point for the presence of each of seven characteristics... The score may be useful for both prognostication and clinical decision making about therapy." — Antman 2000 §Abstract.

## Renderer assertions

Verified locally:
- `META.timi.derivation` has every required field per `lib/derivation.js validate()`.
- Components sum equals `timi().score` at two boundary points (3 = intermediate, 7 = max).

## Defects opened
None.
