# v48 derivation provenance — Khorana Cancer-VTE (`khorana`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4e
- Citation re-verified against: Khorana AA, Kuderer NM, Culakova E, Lyman GH, Francis CW. *Development and validation of a predictive model for chemotherapy-associated thrombosis.* Blood. 2008;111(10):4902-4907.

## Components — verbatim source mapping

Five criteria; range 0-6 per Khorana 2008 Table 2 (predictive model).

| # | Criterion | Levels | Points |
|---|---|---|---|
| 1 | Site of cancer | Stomach, pancreas | +2 |
| | | Lung, lymphoma, gynecologic, bladder, testicular | +1 |
| | | Other | 0 |
| 2 | Pre-chemotherapy platelet count >= 350 x10^9/L | — | +1 |
| 3 | Hemoglobin < 10 g/dL or ESA use | — | +1 |
| 4 | Pre-chemotherapy WBC count > 11 x10^9/L | — | +1 |
| 5 | BMI >= 35 kg/m^2 | — | +1 |

## Bands — source mapping (Khorana 2008 Table 3)

| Range | 2.5-month VTE risk |
|---|---|
| 0 | 0.3% (low) |
| 1-2 | 2.0% (intermediate) |
| >= 3 | 6.7% (high) |

## Population

Khorana 2008: derivation in 2701 ambulatory cancer patients starting a new chemotherapy regimen at the University of Rochester / Cleveland Clinic; prospective validation in a separate 1365-patient cohort. Outcome: symptomatic VTE within a median 2.5-month follow-up.

## Validity

Ambulatory adult cancer patients starting systemic chemotherapy. Most-validated outpatient cancer-VTE score; underpins ASCO and ITAC recommendations to consider thromboprophylaxis at scores >=2. Under-discriminates in some cancer types (notably lung); newer variants (PROTECHT, CONKO, ONKOTEV) add biomarkers or imaging. Not validated for inpatient cancer VTE, primary CNS tumors (which need separate consideration), or pediatric oncology.

## Source quote

"A risk model predictive of chemotherapy-associated VTE was developed in 2701 patients and validated in an independent group of 1365 patients." — Khorana 2008 §Results.

## Renderer assertions

Verified locally:
- `META.khorana.derivation` has every required field per `lib/derivation.js validate()` and exactly 5 components.
- Components sum equals `khorana().score` at three boundary points (other-site + no labs -> 0; high-site + one lab -> 2; very-high site + all four labs -> 6).
- The cancer-site callback returns 2 for `very-high`, 1 for `high`, 0 for `other`.

## Defects opened
None.
