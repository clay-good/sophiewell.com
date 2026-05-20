# v11 audit - ews-escalation

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: Royal College of Physicians. *National Early Warning Score (NEWS) 2: Standardising the assessment of acute-illness severity in the NHS.* RCP, London 2017. Trigger / response table: aggregate 0 -> min 12-hourly; 1-4 -> min 4-6 hourly (ward); single parameter 3 -> min 1-hourly + urgent ward team review; aggregate 5-6 -> urgent, 1-hourly, consider critical-care outreach; >=7 -> emergency critical-care team activation + continuous monitoring.

`lib/scoring-v4.js ewsEscalation()` accepts `{news2Total, vitalsTimestamp, singleParam3}` and returns `{news2Total, nextHours, nextDueIso, banner}`.

## Boundary examples added
- NEWS2 0 -> 12 hourly.
- NEWS2 3 (aggregate) -> 6 hourly.
- NEWS2 3 (single parameter 3) -> 1 hourly + urgent review banner.
- NEWS2 5 -> 1 hourly + critical-care outreach banner.
- NEWS2 8 -> continuous monitoring (0 h).
- nextDueIso computed from vitalsTimestamp.

## Cross-implementation differential
- Reference: RCP NEWS2 2017 trigger table.
- Sophie result: matches all five bands. PASS.

## Edge-input handling notes
- Missing news2Total throws.
- Missing vitalsTimestamp -> nextDueIso null (timer just shows cadence).

## A11y / keyboard notes
- Number input + datetime-local + checkbox; all labeled; aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
