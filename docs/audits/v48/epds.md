# v48 derivation provenance — EPDS (`epds`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4c
- Citation re-verified against: Cox JL, Holden JM, Sagovsky R. *Detection of postnatal depression. Development of the 10-item Edinburgh Postnatal Depression Scale.* Br J Psychiatry. 1987;150:782-786.

## Screener-renderer integration

EPDS uses `lib/screener.js renderScreener`. Component `inputKey`s are the item index as a string (`'0'`-`'9'`). See PHQ-9 audit (wave 48-3d) for the integration pattern.

## Components — verbatim source mapping

Ten items per Cox 1987 Appendix. Each scored 0-3 (over the prior 7 days). Some items are reverse-scored on the published form; the Sophie screener form normalizes to 0=best / 3=worst across all 10 items.

| Index | Question phrasing |
|---|---|
| 0 | Q1: I have been able to laugh and see the funny side of things |
| 1 | Q2: I have looked forward with enjoyment to things |
| 2 | Q3: I have blamed myself unnecessarily when things went wrong |
| 3 | Q4: I have been anxious or worried for no good reason |
| 4 | Q5: I have felt scared or panicky for no very good reason |
| 5 | Q6: Things have been getting on top of me |
| 6 | Q7: I have been so unhappy that I have had difficulty sleeping |
| 7 | Q8: I have felt sad or miserable |
| 8 | Q9: I have been so unhappy that I have been crying |
| 9 | Q10: The thought of harming myself has occurred to me |

## Bands — source mapping

| Range | Source label |
|---|---|
| 0-9 | low likelihood of depression |
| 10-12 | possible depression — consider follow-up |
| 13-30 | likely depression — clinical evaluation indicated |

## Population

Cox 1987: validation in 84 postnatal women in Edinburgh against psychiatric interview as reference standard. Subsequently validated extensively in pregnant and postpartum populations across languages and cultures. The Edinburgh Postnatal Depression Scale is the most widely-used perinatal depression screen.

## Validity

Pregnant and postpartum women (postnatal up to 1 year). The published cutoff is ≥10 for "possible" and ≥13 for "likely" depression. **Item 10 (self-harm) is a critical-action flag regardless of the aggregate**: any non-zero response should trigger immediate suicide-risk evaluation (C-SSRS is a separate Sophie tile). Validated in fathers / partners but with different cutoffs. NOT designed as a stand-alone diagnostic test.

## Source quote

"The validation study described in this paper has resulted in the development of a 10-item self-report measure which is acceptable to women and which has satisfactory sensitivity and specificity ... [in] the assessment of postnatal depression." — Cox 1987 §Abstract.

## Renderer assertions

Verified locally:
- `META.epds.derivation` has every required field per `lib/derivation.js validate()` and exactly 10 components.
- Components sum equals `scoreScreener()` total at two boundary points (max 30, worked example 7).
- Bands span 0-30 contiguously.

## Defects opened
None.
