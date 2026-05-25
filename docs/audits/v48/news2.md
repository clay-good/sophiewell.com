# v48 derivation provenance — NEWS2 (`news2`)

- Auditor: CG
- Date: 2026-05-25
- Wave: 48-1c
- Citation re-verified against: Royal College of Physicians. *National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS.* Updated report of a working party. London: RCP, December 2017.

## Components — verbatim source mapping

Seven per-parameter scores per RCP 2017 Table 1 (NEWS2 Score Chart). Each callback in `META.news2.derivation.components` mirrors a single row of the table.

| Component | Source row (RCP 2017 Table 1) | Callback shape |
|---|---|---|
| Respiratory rate | "Respiration rate (per minute)": ≤8 → 3; 9-11 → 1; 12-20 → 0; 21-24 → 2; ≥25 → 3 | banded threshold |
| SpO2 | Row 2 "SpO2 Scale 1": ≤91 → 3; 92-93 → 2; 94-95 → 1; ≥96 → 0. Row 3 "SpO2 Scale 2" (target 88-92%, e.g., chronic Type II respiratory failure): ≤83 → 3; 84-85 → 2; 86-87 → 1; 88-92 → 0; on air ≥93 → 0; on oxygen 93-94 → 1; 95-96 → 2; ≥97 → 3 | context-aware: reads `scale2` and `onO2` from the inputs object passed as the second callback argument |
| Air or oxygen | "Air or oxygen?": Air → 0; Oxygen → 2 | literal 2 when boolean `onO2` is true |
| Systolic BP | "Systolic blood pressure (mmHg)": ≤90 → 3; 91-100 → 2; 101-110 → 1; 111-219 → 0; ≥220 → 3 | banded threshold |
| Pulse | "Pulse (per minute)": ≤40 → 3; 41-50 → 1; 51-90 → 0; 91-110 → 1; 111-130 → 2; ≥131 → 3 | banded threshold |
| Consciousness | "Consciousness": A (Alert) → 0; any not-A (C, V, P, U) → 3. NEWS2's 2017 update replaced V with C (new Confusion) at the top of the ACVPU response. | string equality |
| Temperature | "Temperature (°C)": ≤35.0 → 3; 35.1-36.0 → 1; 36.1-38.0 → 0; 38.1-39.0 → 1; ≥39.1 → 2 | banded threshold |

The SpO2 row required passing the full inputs object to the `points` callback so the same component can consult `scale2` and `onO2`. The renderer's `scoreComponent` was updated in wave 48-1c to call `points(value, inputs)`; pre-existing single-arg callbacks remain backward compatible (they ignore the second argument).

## Bands — verbatim source mapping

From RCP 2017 Table 2 (Clinical-response trigger band):

| Aggregate score | Source label |
|---|---|
| 0 | low — minimum 12-hourly observations; continue routine monitoring |
| 1-4 | low-medium — minimum 4-6-hourly observations; registered nurse assesses whether escalation is required |
| (single parameter scoring 3) | medium — minimum 1-hourly observations; urgent review by clinician with competencies in acute illness |
| 5-6 | medium — minimum 1-hourly observations; urgent review |
| ≥ 7 | high — continuous monitoring; emergency assessment by critical-care team; usually transfer to higher-acuity area |

The Sophie `bands` array surfaces the aggregate stratification (0 / 1-4 / 5-6 / ≥7). The "single parameter scoring 3" trigger is documented in the formula text but not in the `bands` array because the renderer's bands logic operates on the aggregate; the live result block (computed by `lib/scoring-v4.js news2()`) handles the single-parameter rule independently.

## Population

The original NEWS (2012) was derived in a 35,585-admission cohort across UK acute hospitals. NEWS2 (RCP, December 2017) is the update introducing SpO2 Scale 2 and the ACVPU change (C for new Confusion in place of V).

## Validity

Adult acute-care inpatients. NOT validated in pregnancy, in children, in patients with spinal-cord injury affecting autonomic responses, or where any vital sign is itself the index condition being treated (e.g., palliative care). Scale 2 is intended only for patients with a documented target SpO2 of 88-92% (chronic Type II respiratory failure); using Scale 2 outside that group will systematically under-trigger escalation. A single parameter scoring 3 triggers urgent review regardless of aggregate.

## Source quote

"The Royal College of Physicians ... endorses the use of NEWS2 ... NEWS is calculated by assigning a score from 0-3 to six physiological measurements: respiration rate, oxygen saturation, systolic blood pressure, pulse rate, level of consciousness or new confusion, and temperature. Each of these has a normal range, with scores allocated to abnormal results. A weighting of 2 is added if a patient requires supplemental oxygen." — RCP 2017 §1.

## Renderer assertions

Verified locally:
- `META.news2.derivation` has every required field per `lib/derivation.js validate()`.
- Components sum equals `news2().score` at five boundary points: baseline (0), single-parameter trigger (3 via low RR), on-supplemental-O2 (+2), Scale 2 / on-O2 / SpO2 96 (4), multi-system high (19). The Scale 2 case verifies that the renderer's new `(value, inputs)` callback signature works.

## Defects opened
None.
