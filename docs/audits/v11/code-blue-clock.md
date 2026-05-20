# v11 audit - code-blue-clock

- Auditor: CG
- Date: 2026-05-19
- Citation re-verified against: American Heart Association. *2020 Guidelines for Cardiopulmonary Resuscitation and Emergency Cardiovascular Care: Adult Basic and Advanced Life Support.* Circulation. 2020;142(16_suppl_2):S366-S468. Cycle structure: 2-min rhythm checks; epinephrine 1 mg q3-5 min (give after second shock in shockable rhythms, else ASAP for non-shockable). ROSC capnography target ETCO2 sustained >10 mmHg, ideally >20.

`lib/scoring-v4.js codeBlueClock()` accepts `{codeStartTimestamp, lastRhythmCheck, lastEpi, lastShockJ, cycleCount, asOf}` and returns `{minutesFromStart, nextRhythmCheckIso, nextEpiIso, lastShockJ, cycleCount, banner}`.

## Boundary examples added
- lastRhythmCheck 12:06Z -> nextRhythmCheckIso 12:08Z.
- lastEpi 12:04Z -> nextEpiIso 12:08Z (4-min midpoint of q3-5).
- No lastRhythmCheck -> 2 min after code start.
- lastShockJ 200 / cycleCount 3 propagate to output.
- asOf 12:10Z -> minutesFromStart 10.
- Banner pins AHA 2020 cadence and ETCO2 ROSC target.

## Cross-implementation differential
- Reference: AHA 2020 ACLS cycle structure.
- Sophie result: 2-min and 4-min interval math matches. PASS.

## Edge-input handling notes
- Missing codeStartTimestamp throws.
- lastEpi omitted -> nextEpiIso null.

## A11y / keyboard notes
- Five labeled inputs (datetime-local + number); aria-live result region. `npm run test:a11y` clean.

## Defects opened
- none

## Status
- PASS
