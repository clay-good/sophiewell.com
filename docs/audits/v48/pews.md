# v48 derivation provenance — PEWS (`pews`)

- Auditor: CG
- Date: 2026-05-26
- Wave: 48-4h
- Citation re-verified against: Monaghan A. *Detecting and managing deterioration in children.* Paediatr Nurs. 2005;17(1):32-35.

## Components — verbatim source mapping

Three subscales each scored 0-3 (Brighton variant); range 0-9.

| # | Subscale | Levels (0 / 1 / 2 / 3) |
|---|---|---|
| 1 | Behavior | playing/appropriate / sleeping / irritable / lethargic-confused-or-reduced-response |
| 2 | Cardiovascular | pink or CR 1-2 s / pale or CR 3 s / grey or CR 4 s + HR up 20 / grey-or-mottled + CR >=5 s + HR up 30 or bradycardia |
| 3 | Respiratory | WNL, no retractions / >10 above normal + accessory use, 30% FiO2 or 3 L/min / >20 above normal + retractions, 40% FiO2 or 6 L/min / >=5 below normal + sternal retractions + grunting, 50% FiO2 or 8+ L/min |

## Bands — source mapping (Monaghan 2005 escalation thresholds)

| Range | Action |
|---|---|
| 0-2 | Routine monitoring |
| 3 | q1h observations + bedside provider review |
| 4 | q30m observations + medical review |
| >= 5 | Urgent senior review (escalate) |

## Population

Monaghan 2005 (Brighton PEWS): operational tool developed at Brighton & Sussex University Hospitals NHS Trust for inpatient pediatric ward monitoring; subsequent multi-site validations include Akre 2010 and Parshuram 2009 (the separate Bedside PEWS 7-parameter variant).

## Validity

Pediatric inpatients in general-ward settings. Operational triage tool — cutoffs are escalation triggers, not statistically-derived mortality predictors. Many PEWS variants exist (Bedside PEWS, institution-specific). Sophie ships the Brighton Monaghan 2005 3-subscale form. Not validated for neonatal patients, pediatric ICU, or ED triage (use specialty tools).

## Source quote

"The Brighton paediatric early warning score consists of three components: behaviour, cardiovascular, and respiratory, each scored 0-3 with a total of 0-9." — Monaghan 2005 §Methods.

## Renderer assertions

Verified locally:
- `META.pews.derivation` has every required field per `lib/derivation.js validate()` and exactly 3 components.
- Components sum equals `pews().total` at multiple boundary points including the 0-3 clamp on out-of-range subscale inputs.

## Defects opened
None.
