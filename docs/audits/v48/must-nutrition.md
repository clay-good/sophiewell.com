# v48 derivation provenance — MUST nutrition (`must-nutrition`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4g
- Citation re-verified against: BAPEN. *The "MUST" Explanatory Booklet.* British Association for Parenteral and Enteral Nutrition; 2003 (reprinted with minor revisions). Derived by the Malnutrition Advisory Group (MAG) of BAPEN.

## Components — verbatim source mapping

Three components per BAPEN 2003. Range 0-6.

| # | Component | Bands |
|---|---|---|
| 1 | BMI (kg/m^2) | >20: 0 / 18.5-20: 1 / <18.5: 2 |
| 2 | Unplanned weight loss in past 3-6 months | <5%: 0 / 5-10%: 1 / >10%: 2 |
| 3 | Acutely ill AND no nutritional intake for >5 days | yes: +2 / no: 0 |

## Bands — source mapping (BAPEN 2003 management guide)

| Range | Risk | Action |
|---|---|---|
| 0 | Low | Routine clinical care |
| 1 | Medium | Observe and document intake |
| >= 2 | High | Refer to dietitian / nutritional support team |

## Population

BAPEN 2003: consensus-built tool for use across hospital, community, and care-home adult populations; construct-validated against multiple anthropometric and clinical-outcome reference standards in the MUST Report (Elia 2003) including length of stay, mortality, and discharge destination.

## Validity

Adults across hospital, community, and care-home settings (widely used in the UK NHS). The booklet provides alternate measures (ulna length, knee height, mid-upper-arm circumference) when BMI cannot be obtained directly. Not validated for pediatrics (use STAMP/PYMS) or for active end-stage cancer cachexia (use PG-SGA).

## Source quote

"The MUST is a five-step screening tool to identify adults who are malnourished, at risk of malnutrition, or obese, and includes management guidelines that can be used to develop a care plan." — BAPEN 2003 §1.

## Renderer assertions

Verified locally:
- `META['must-nutrition'].derivation` has every required field per `lib/derivation.js validate()` and exactly 3 components.
- Components sum equals `mustNutrition().score` at multiple boundary points including the BMI three-level callback (BMI 17 -> 2; BMI 19 -> 1; BMI 25 -> 0) and the weight-loss callback (15% -> 2; 7% -> 1; 3% -> 0).

## Defects opened
None.
