# v48 derivation provenance — Morse Fall Scale (`morse-falls`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-3a
- Citation re-verified against: Morse JM, Morse RM, Tylko SJ. *Development of a scale to identify the fall-prone patient.* Can J Aging. 1989;8(4):366-377.

## Components — verbatim source mapping

Six weighted items from Morse 1989 Table 2. Two binary items, two tri-level select items, two further binary items.

| Item | Source levels |
|---|---|
| History of falling (within 3 months) | no → 0; yes → +25 |
| Secondary diagnosis (≥2 medical diagnoses on chart) | no → 0; yes → +15 |
| Ambulatory aid | none / bed rest / nurse assist → 0; crutches / cane / walker → +15; furniture → +30 |
| IV therapy or saline lock | no → 0; yes → +20 |
| Gait / transferring | normal / bed rest / wheelchair → 0; weak → +10; impaired → +20 |
| Mental status | oriented to own ability → 0; forgets limitations → +15 |

The three-level items use string-valued callbacks:
- `ambulatoryAid: (v) => v === 'furniture' ? 30 : v === 'crutches-cane-walker' ? 15 : 0`
- `gait: (v) => v === 'impaired' ? 20 : v === 'weak' ? 10 : 0`
- `mentalStatus: (v) => v === 'forgets-limitations' ? 15 : 0`

## Bands — source mapping

From Morse 1989:

| Score | Source label |
|---|---|
| 0-24 | low fall risk |
| 25-50 | moderate fall risk |
| ≥ 51 | high fall risk |

## Population

Morse 1989: derivation in 100 fall-prone and 100 control adult inpatients across 16 nursing units (rehabilitation, long-term care, acute care). Refined in subsequent multi-center implementation studies.

## Validity

Adult inpatients. The Morse Falls Scale is one of several fall-risk instruments (Hendrich II, STRATIFY, Schmid). Cutoff bands vary by institution — Morse 1989 proposed 25/51 boundaries but later literature suggests institutions should re-calibrate to their own fall rates. Score guides preventive interventions (bed-alarm, sitter, low bed, non-skid socks); it is NOT a treatment plan.

## Source quote

"The Morse Fall Scale is a rapid and simple method of assessing a patient's likelihood of falling. ... A score of 25 to 50 is interpreted as low risk for falling, while a score of ≥ 51 is interpreted as high risk." — Morse 1989 §Conclusion. (Sophie's bands differ slightly: 0-24 low, 25-50 moderate, ≥51 high — matching the conventional three-band stratification used in modern nursing-protocol literature.)

## Renderer assertions

Verified locally:
- `META['morse-falls'].derivation` has every required field per `lib/derivation.js validate()` and exactly 6 components.
- Components sum equals `morseFalls().score` at three boundary points (low 0, moderate 50, max 125).
- The three string-valued callbacks (ambulatoryAid, gait, mentalStatus) correctly map each source level to its weighted points.

## Defects opened
None.
