# v48 derivation provenance — LACE Index (`lace`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4g
- Citation re-verified against: van Walraven C, Dhalla IA, Bell C, Etchells E, Stiell IG, Zarnke K, Austin PC, Forster AJ. *Derivation and validation of an index to predict early death or unplanned readmission after discharge from hospital to the community.* CMAJ. 2010;182(6):551-557.

## Components — verbatim source mapping

Four components per van Walraven 2010 Table 3.

| # | Component | Bands |
|---|---|---|
| 1 | L — Length of stay (days) | <1: 0 / 1: 1 / 2: 2 / 3: 3 / 4-6: 4 / 7-13: 5 / >=14: 7 |
| 2 | A — Acute (non-elective) admission | yes: +3 / no: 0 |
| 3 | C — Charlson comorbidity score | 0: 0 / 1: 1 / 2: 2 / 3: 3 / >=4: 5 |
| 4 | E — ED visits in prior 6 months | 0: 0 / 1: 1 / 2: 2 / 3: 3 / >=4: 4 |

## Bands — source mapping (van Walraven 2010 Figure 2)

| Range | Risk band |
|---|---|
| 0-4 | low risk of 30-day death or unplanned readmission |
| 5-9 | moderate risk |
| >= 10 | high risk |

## Population

van Walraven 2010: derivation in 4812 adult medical and surgical inpatients across 11 Ontario hospitals; external validation on 1,000,000 administrative records. Outcome: composite 30-day all-cause death or unplanned any-hospital readmission.

## Validity

Adult inpatients discharged alive. LACE+ (Ottawa) extends LACE with patient age, sex, hospital teaching status, and additional covariates and outperforms LACE in some cohorts. ACP / SHM treat LACE as one signal among several. Not validated for obstetric, psychiatric, or pediatric admissions.

## Source quote

"The LACE index is a simple tool that can be calculated to predict the risk of death or unplanned readmission within 30 days." — van Walraven 2010 §Discussion.

## Renderer assertions

Verified locally:
- `META.lace.derivation` has every required field per `lib/derivation.js validate()` and exactly 4 components.
- Components sum equals `lace().score` at multiple boundary points including the LOS bands (LOS 14 -> 7), Charlson bands (Charlson 4 -> 5), and ED-visits cap (>=4 -> 4).

## Defects opened
None.
