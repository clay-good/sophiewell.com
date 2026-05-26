# v48 derivation provenance — Hendrich II Fall Risk (`hendrich-ii`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4a
- Citation re-verified against: Hendrich AL, Bender PS, Nyhuis A. *Validation of the Hendrich II Fall Risk Model: a large concurrent case/control study of hospitalized patients.* Appl Nurs Res. 2003;16(1):9-21.

## Components — verbatim source mapping

Eight weighted items per Hendrich 2003 Table 2. Range 0-16. High fall risk at ≥5.

| Item | Points |
|---|---|
| Confusion / disorientation / impulsivity | 4 |
| Symptomatic depression | 2 |
| Altered elimination | 1 |
| Dizziness / vertigo | 1 |
| Male sex | 1 |
| Prescribed antiepileptic | 2 |
| Prescribed benzodiazepine | 1 |
| Get-up-and-go: able / pushes-up / needs-help / unable | 0 / 1 / 3 / 4 |

The get-up-and-go callback maps the string-valued select directly: `able`→0, `pushes-up`→1, `needs-help`→3, `unable`→4.

## Bands — source mapping

| Range | Source label |
|---|---|
| < 5 | not high fall risk |
| ≥ 5 | high fall risk (sensitivity ~75%, specificity ~62%) |

## Population

Hendrich 2003: large concurrent case/control study in 355 falls and 780 matched controls across 8 medical-surgical units at a US tertiary hospital. Cutoff ≥5 is the validated high-risk threshold.

## Validity

Adult inpatients. Hendrich II is one of several fall-risk instruments (Morse, STRATIFY, Schmid — Morse Falls is a separate Sophie tile). Hendrich uniquely includes drug-class items (antiepileptics, benzodiazepines) that flag iatrogenic risk. The get-up-and-go test requires the patient to stand from a chair without assistance; bedfast patients are scored as "unable" (+4). Score guides preventive interventions, NOT a treatment plan.

## Source quote

"The Hendrich II Fall Risk Model can be administered in 1-2 minutes ... easy to learn and use ... a sensitivity of 74.9% and a specificity of 73.9% [in this validation cohort]." — Hendrich 2003 §Abstract / Discussion.

## Renderer assertions

Verified locally:
- `META['hendrich-ii'].derivation` has every required field per `lib/derivation.js validate()` and exactly 8 components.
- Components sum equals `hendrichII().score` at four boundary points (zero, cutoff 5 with `highRisk === true`, get-up-and-go="unable"→4, get-up-and-go="needs-help"→3).

## Defects opened
None.
